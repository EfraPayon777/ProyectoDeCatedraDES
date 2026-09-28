import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { Orden } from '../entities/orden.entity';
import { DetalleOrden } from '../entities/detalle-orden.entity';
import { Repuesto } from '../entities/repuesto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Orden, DetalleOrden, Repuesto])],
  controllers: [OrdenesController],
  providers: [OrdenesService],
  exports: [OrdenesService],
})
export class OrdenesModule {}
