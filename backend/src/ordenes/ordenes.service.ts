import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Orden, EstadoOrden } from '../entities/orden.entity';
import { DetalleOrden } from '../entities/detalle-orden.entity';
import { Repuesto } from '../entities/repuesto.entity';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Orden[]> {
    return this.ordenRepository.find({
      relations: ['detalles', 'detalles.repuesto', 'mecanico'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Orden> {
    const orden = await this.ordenRepository.findOne({
      where: { id },
      relations: ['detalles', 'detalles.repuesto', 'mecanico'],
    });
    if (!orden) {
      throw new NotFoundException(`Orden #${id} no encontrada`);
    }
    return orden;
  }

  async update(id: number, updateDto: UpdateOrdenDto): Promise<Orden> {
    await this.findOne(id); // 404 si no existe
    const cambios: Partial<Orden> = {};
    if (updateDto.estado !== undefined) cambios.estado = updateDto.estado;
    if (updateDto.descripcionFalla !== undefined) cambios.descripcionFalla = updateDto.descripcionFalla;
    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('Indique el estado o el detalle del trabajo a actualizar');
    }
    // update() directo: no toca detalles, montos ni stock (la relación detalles es cascade).
    await this.ordenRepository.update(id, cambios);
    return this.findOne(id);
  }

  async create(createDto: CreateOrdenDto, userId?: number): Promise<Orden> {
    if (!createDto.detalles || createDto.detalles.length === 0) {
      throw new BadRequestException('La orden debe incluir al menos un repuesto o servicio');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Generar código correlativo de orden (ej #000001)
      const count = await queryRunner.manager.count(Orden);
      const codigoOrden = `#${String(count + 1).padStart(6, '0')}`;

      // 2. Procesar detalles y verificar stock disponible
      let subtotalTotal = 0;
      const detallesEntities: DetalleOrden[] = [];

      for (const item of createDto.detalles) {
        const repuesto = await queryRunner.manager.findOne(Repuesto, {
          where: { id: item.repuestoId },
        });

        if (!repuesto) {
          throw new NotFoundException(`Repuesto con ID ${item.repuestoId} no existe`);
        }

        if (repuesto.stockActual < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para el repuesto "${repuesto.nombre}". Disponible: ${repuesto.stockActual}, Solicitado: ${item.cantidad}`,
          );
        }

        const precio = item.precioUnitario !== undefined ? Number(item.precioUnitario) : Number(repuesto.precioFinal);
        const itemSubtotal = precio * item.cantidad;
        subtotalTotal += itemSubtotal;

        // Descontar stock del repuesto (Salida)
        repuesto.stockActual -= item.cantidad;
        await queryRunner.manager.save(repuesto);

        const detalle = queryRunner.manager.create(DetalleOrden, {
          repuestoId: repuesto.id,
          cantidad: item.cantidad,
          precioUnitario: precio,
          subtotal: itemSubtotal,
        });

        detallesEntities.push(detalle);
      }

      const descuento = Number(createDto.descuento || 0);
      if (Math.round(descuento * 100) > Math.round(subtotalTotal * 100)) {
        throw new BadRequestException(
          `El descuento ($${descuento.toFixed(2)}) no puede ser mayor al subtotal de la orden ($${subtotalTotal.toFixed(2)})`,
        );
      }
      const totalFinal = Math.max(0, subtotalTotal - descuento);

      // 3. Crear y guardar Orden
      const nuevaOrden = queryRunner.manager.create(Orden, {
        codigoOrden,
        placa: createDto.placa,
        marca: createDto.marca,
        modelo: createDto.modelo,
        clienteNombre: createDto.clienteNombre,
        clienteTelefono: createDto.clienteTelefono || '',
        descripcionFalla: createDto.descripcionFalla || '',
        subtotal: subtotalTotal,
        descuento: descuento,
        total: totalFinal,
        estado: EstadoOrden.COMPLETADA,
        mecanicoId: userId || null,
        detalles: detallesEntities,
      });

      const ordenGuardada = await queryRunner.manager.save(nuevaOrden);

      await queryRunner.commitTransaction();

      return this.findOne(ordenGuardada.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async seedDefaults() {
    const count = await this.ordenRepository.count();
    if (count === 0) {
      const ordersData = [
        {
          codigoOrden: '#000001',
          placa: 'P-123456',
          marca: 'Toyota',
          modelo: 'Corolla 2018',
          clienteNombre: 'Efrain Antonio',
          clienteTelefono: '77889900',
          descripcionFalla: 'Mantenimiento preventivo 50,000 km',
          subtotal: 155.50,
          descuento: 0,
          total: 155.50,
        },
        {
          codigoOrden: '#000002',
          placa: 'P-987654',
          marca: 'Honda',
          modelo: 'Civic 2021',
          clienteNombre: 'Efrain Antonio',
          clienteTelefono: '77889900',
          descripcionFalla: 'Cambio de aceite sintético y pastillas',
          subtotal: 452.50,
          descuento: 0,
          total: 452.50,
        },
        {
          codigoOrden: '#000003',
          placa: 'P-112233',
          marca: 'Nissan',
          modelo: 'Sentra 2019',
          clienteNombre: 'Juan Perez',
          clienteTelefono: '80057881',
          descripcionFalla: 'Revisión general de motor',
          subtotal: 220.50,
          descuento: 0,
          total: 220.50,
        },
        {
          codigoOrden: '#000004',
          placa: 'P-445566',
          marca: 'Hyundai',
          modelo: 'Elantra 2022',
          clienteNombre: 'payin',
          clienteTelefono: '59069767',
          descripcionFalla: 'Cambio de filtros y lubricación',
          subtotal: 350.50,
          descuento: 0,
          total: 350.50,
        },
        {
          codigoOrden: '#000005',
          placa: 'P-778899',
          marca: 'Kia',
          modelo: 'Forte 2020',
          clienteNombre: 'pijin',
          clienteTelefono: '22232443',
          descripcionFalla: 'Alineación y cambio de aceite',
          subtotal: 136.00,
          descuento: 0,
          total: 136.00,
        },
      ];

      for (const item of ordersData) {
        await this.ordenRepository.save(this.ordenRepository.create({
          ...item,
          estado: EstadoOrden.COMPLETADA,
        }));
      }
      console.log('✅ Órdenes por defecto sembradas correctamente');
    }
  }
}
