import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepuestosService } from './repuestos.service';
import { RepuestosController } from './repuestos.controller';
import { Repuesto } from '../entities/repuesto.entity';
import { Categoria } from '../entities/categoria.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Repuesto, Categoria])],
  controllers: [RepuestosController],
  providers: [RepuestosService, CloudinaryService],
  exports: [RepuestosService],
})
export class RepuestosModule {}
