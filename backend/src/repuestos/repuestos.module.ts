import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepuestosService } from './repuestos.service';
import { RepuestosController } from './repuestos.controller';
import { Repuesto } from '../entities/repuesto.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Repuesto])],
  controllers: [RepuestosController],
  providers: [RepuestosService, CloudinaryService],
  exports: [RepuestosService],
})
export class RepuestosModule {}
