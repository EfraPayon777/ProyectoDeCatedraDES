import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Orden } from '../entities/orden.entity';
import { DetalleOrden } from '../entities/detalle-orden.entity';
import { Repuesto } from '../entities/repuesto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Orden, DetalleOrden, Repuesto])],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
