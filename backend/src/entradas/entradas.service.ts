import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EntradaInventario } from '../entities/entrada-inventario.entity';
import { Repuesto } from '../entities/repuesto.entity';
import { CreateEntradaDto } from './dto/create-entrada.dto';

@Injectable()
export class EntradasService {
  constructor(
    @InjectRepository(EntradaInventario)
    private entradaRepository: Repository<EntradaInventario>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<EntradaInventario[]> {
    return this.entradaRepository.find({
      relations: ['repuesto'],
      order: { id: 'DESC' },
    });
  }

  async create(createDto: CreateEntradaDto): Promise<EntradaInventario> {
    // Transacción atómica con TypeORM DataSource QueryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repuesto = await queryRunner.manager.findOne(Repuesto, {
        where: { id: createDto.repuestoId },
      });

      if (!repuesto) {
        throw new NotFoundException(`Repuesto con ID ${createDto.repuestoId} no encontrado`);
      }

      // Incrementar stock atómicamente
      repuesto.stockActual = Number(repuesto.stockActual) + Number(createDto.cantidad);
      await queryRunner.manager.save(repuesto);

      // Crear registro de entrada
      const nuevaEntrada = queryRunner.manager.create(EntradaInventario, {
        repuestoId: createDto.repuestoId,
        cantidad: createDto.cantidad,
        proveedor: createDto.proveedor,
        costoAdquisicion: createDto.costoAdquisicion,
        fechaIngreso: createDto.fechaIngreso || new Date(),
      });

      const guardado = await queryRunner.manager.save(nuevaEntrada);

      await queryRunner.commitTransaction();
      return guardado;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
