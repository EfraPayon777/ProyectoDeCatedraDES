import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThanOrEqual } from 'typeorm';
import { Repuesto } from '../entities/repuesto.entity';
import { Categoria } from '../entities/categoria.entity';
import { DetalleOrden } from '../entities/detalle-orden.entity';
import { resolverCostosIva } from './iva.util';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';

@Injectable()
export class RepuestosService {
  constructor(
    @InjectRepository(Repuesto)
    private repuestoRepository: Repository<Repuesto>,
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  private async validarCategoria(categoriaId: number): Promise<void> {
    const existe = await this.categoriaRepository.findOne({ where: { id: categoriaId } });
    if (!existe) {
      throw new NotFoundException(`Categoría con ID ${categoriaId} no encontrada`);
    }
  }

  async findAll(search?: string, categoriaId?: number): Promise<Repuesto[]> {
    const query = this.repuestoRepository.createQueryBuilder('repuesto')
      .leftJoinAndSelect('repuesto.categoria', 'categoria');

    if (search && search.trim() !== '') {
      query.andWhere(
        // LOWER(...) para que la búsqueda no distinga mayúsculas también en PostgreSQL (LIKE es sensible allí; en SQLite no).
        '(LOWER(repuesto.nombre) LIKE :search OR LOWER(repuesto.codigo) LIKE :search OR LOWER(repuesto.descripcion) LIKE :search)',
        { search: `%${search.trim().toLowerCase()}%` },
      );
    }

    if (categoriaId) {
      query.andWhere('repuesto.categoriaId = :categoriaId', { categoriaId });
    }

    query.orderBy('repuesto.id', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<Repuesto> {
    const repuesto = await this.repuestoRepository.findOne({
      where: { id },
      relations: ['categoria'],
    });
    if (!repuesto) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }
    return repuesto;
  }

  async findLowStock(): Promise<Repuesto[]> {
    return this.repuestoRepository.createQueryBuilder('repuesto')
      .leftJoinAndSelect('repuesto.categoria', 'categoria')
      .where('repuesto.stockActual <= repuesto.stockMinimo')
      .orderBy('repuesto.stockActual', 'ASC')
      .getMany();
  }

  async create(createDto: CreateRepuestoDto): Promise<Repuesto> {
    const existing = await this.repuestoRepository.findOne({ where: { codigo: createDto.codigo } });
    if (existing) {
      throw new ConflictException(`Ya existe un repuesto registrado con el código ${createDto.codigo}`);
    }

    await this.validarCategoria(createDto.categoriaId);

    const costos = resolverCostosIva(createDto.costoSinIva, createDto.costoConIva, createDto.precioFinal);
    const nuevo = this.repuestoRepository.create({ ...createDto, ...costos });
    return this.repuestoRepository.save(nuevo);
  }

  async update(id: number, updateDto: UpdateRepuestoDto): Promise<Repuesto> {
    const repuesto = await this.findOne(id);

    if (updateDto.codigo !== undefined && updateDto.codigo !== repuesto.codigo) {
      const existing = await this.repuestoRepository.findOne({ where: { codigo: updateDto.codigo } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Ya existe un repuesto registrado con el código ${updateDto.codigo}`);
      }
    }

    if (updateDto.categoriaId !== undefined && updateDto.categoriaId !== repuesto.categoriaId) {
      await this.validarCategoria(updateDto.categoriaId);
    }

    // Costos: si solo se envía uno de los dos, el otro se recalcula a partir de él (no se conserva
    // el valor anterior, que quedaría inconsistente). Si no se envía ninguno, se parte de los actuales.
    const sinIva = updateDto.costoSinIva ?? (updateDto.costoConIva !== undefined ? null : repuesto.costoSinIva);
    const conIva = updateDto.costoConIva ?? (updateDto.costoSinIva !== undefined ? null : repuesto.costoConIva);
    const precio = updateDto.precioFinal ?? repuesto.precioFinal;

    Object.assign(repuesto, updateDto, resolverCostosIva(sinIva, conIva, precio));
    // categoria es eager: si cambia el ID, se descarta la relación cargada para que TypeORM use categoriaId
    if (updateDto.categoriaId !== undefined) {
      repuesto.categoria = undefined;
    }
    await this.repuestoRepository.save(repuesto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const repuesto = await this.findOne(id);

    // Un repuesto usado en órdenes no se puede borrar (FK con ON DELETE RESTRICT): se responde 409, no 500.
    const usos = await this.repuestoRepository.manager.count(DetalleOrden, { where: { repuestoId: id } });
    if (usos > 0) {
      throw new ConflictException(this.mensajeEnUso(repuesto, usos));
    }

    try {
      await this.repuestoRepository.remove(repuesto);
    } catch (err: any) {
      // Respaldo por si otra referencia aparece entre la verificación y el borrado.
      // PostgreSQL: 23503 foreign_key_violation · SQLite: SQLITE_CONSTRAINT (FOREIGN KEY)
      const esFk = err?.code === '23503' || /FOREIGN KEY/i.test(String(err?.message ?? ''));
      if (esFk) {
        throw new ConflictException(this.mensajeEnUso(repuesto));
      }
      throw err;
    }
  }

  private mensajeEnUso(repuesto: Repuesto, usos?: number): string {
    const detalle = usos ? ` en ${usos} ${usos === 1 ? 'línea de orden' : 'líneas de órdenes'}` : ' en órdenes de trabajo';
    return `No se puede eliminar el repuesto "${repuesto.nombre}" (${repuesto.codigo}) porque está registrado${detalle}. Se conserva para mantener el historial de ventas.`;
  }

  async seedDefaults() {
    const count = await this.repuestoRepository.count();
    if (count === 0) {
      const items = [
        {
          codigo: 'LUB-32EE0',
          nombre: 'Aceite Sintético 5W-30',
          descripcion: 'Aceite para motor sintético de alto rendimiento (1 Galón)',
          costoSinIva: 65.00,
          costoConIva: 73.45,
          precioFinal: 85.00,
          stockActual: 9,
          stockMinimo: 5,
          categoriaId: 1,
        },
        {
          codigo: 'LUB-TEST01',
          nombre: 'Aceite Sintético 10W-30',
          descripcion: 'Aceite de alto rendimiento para alto kilometraje',
          costoSinIva: 18.00,
          costoConIva: 20.34,
          precioFinal: 25.50,
          stockActual: 41,
          stockMinimo: 10,
          categoriaId: 1,
        },
        {
          codigo: 'FLT-001',
          nombre: 'Filtro de Aceite PH6607',
          descripcion: 'Filtro para motor universal blindado',
          costoSinIva: 5.50,
          costoConIva: 6.22,
          precioFinal: 9.99,
          stockActual: 3,
          stockMinimo: 10,
          categoriaId: 5,
        },
        {
          codigo: 'FRN-002',
          nombre: 'Pastillas de Freno Delanteras Toyota',
          descripcion: 'Pastillas de cerámica para Toyota Corolla/Yaris',
          costoSinIva: 22.00,
          costoConIva: 24.86,
          precioFinal: 35.00,
          stockActual: 15,
          stockMinimo: 4,
          categoriaId: 3,
        }
      ];

      for (const item of items) {
        await this.repuestoRepository.save(this.repuestoRepository.create(item));
      }
      console.log('✅ Repuestos por defecto sembrados correctamente');
    }
  }
}
