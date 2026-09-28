import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRepuestoDto {
  @ApiProperty({ example: 'LUB-32EE0' })
  @IsNotEmpty({ message: 'El código del repuesto es obligatorio' })
  @IsString()
  codigo: string;

  @ApiProperty({ example: 'Aceite Sintético 5W-30' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Aceite para motor sintético de alto rendimiento' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 65.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costoSinIva: number;

  @ApiProperty({ example: 73.45 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costoConIva: number;

  @ApiProperty({ example: 85.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioFinal: number;

  @ApiProperty({ example: 10, default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockActual: number;

  @ApiProperty({ example: 5, default: 5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockMinimo?: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  categoriaId: number;

  @ApiProperty({ example: 'https://cloudinary.com/img.jpg', required: false })
  @IsOptional()
  @IsString()
  imagenUrl?: string;
}
