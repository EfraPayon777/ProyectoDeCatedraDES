import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DetalleOrdenDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  repuestoId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 85.00, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioUnitario?: number;
}

export class CreateOrdenDto {
  @ApiProperty({ example: 'P-452132' })
  @IsNotEmpty({ message: 'La placa del vehículo es requerida' })
  @IsString()
  placa: string;

  @ApiProperty({ example: 'Toyota' })
  @IsNotEmpty({ message: 'La marca es requerida' })
  @IsString()
  marca: string;

  @ApiProperty({ example: 'Corolla 2020' })
  @IsNotEmpty({ message: 'El modelo es requerido' })
  @IsString()
  modelo: string;

  @ApiProperty({ example: 'Efrain Antonio' })
  @IsNotEmpty({ message: 'El nombre del cliente es obligatorio' })
  @IsString()
  clienteNombre: string;

  @ApiProperty({ example: '22232443', required: false })
  @IsOptional()
  @IsString()
  clienteTelefono?: string;

  @ApiProperty({ example: 'Cambio de aceite y revisión de frenos delanteros', required: false })
  @IsOptional()
  @IsString()
  descripcionFalla?: string;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  descuento?: number;

  @ApiProperty({ type: [DetalleOrdenDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleOrdenDto)
  detalles: DetalleOrdenDto[];
}
