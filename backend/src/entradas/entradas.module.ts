import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntradasService } from './entradas.service';
import { EntradasController } from './entradas.controller';
import { EntradaInventario } from '../entities/entrada-inventario.entity';
import { Repuesto } from '../entities/repuesto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EntradaInventario, Repuesto])],
  controllers: [EntradasController],
  providers: [EntradasService],
  exports: [EntradasService],
})
export class EntradasModule {}
