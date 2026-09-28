import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThanOrEqual } from 'typeorm';
import { Repuesto } from '../entities/repuesto.entity';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';

@Injectable()
export class RepuestosService {
  constructor(
    @InjectRepository(Repuesto)
    private repuestoRepository: Repository<Repuesto>,
  ) {}

  async findAll(search?: string, categoriaId?: number): Promise<Repuesto[]> {
    const query = this.repuestoRepository.createQueryBuilder('repuesto')
      .leftJoinAndSelect('repuesto.categoria', 'categoria');

    if (search && search.trim() !== '') {
      query.andWhere(
        '(repuesto.nombre LIKE :search OR repuesto.codigo LIKE :search OR repuesto.descripcion LIKE :search)',
        { search: `%${search}%` },
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

    const nuevo = this.repuestoRepository.create(createDto);
    return this.repuestoRepository.save(nuevo);
  }

  async update(id: number, updateDto: UpdateRepuestoDto): Promise<Repuesto> {
    const repuesto = await this.findOne(id);
    Object.assign(repuesto, updateDto);
    return this.repuestoRepository.save(repuesto);
  }

  async remove(id: number): Promise<void> {
    const repuesto = await this.findOne(id);
    await this.repuestoRepository.remove(repuesto);
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
