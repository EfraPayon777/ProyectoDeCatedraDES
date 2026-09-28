import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEntradaDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  repuestoId: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;

  @ApiProperty({ example: 'Distribuidora LubeMax' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio' })
  @IsString()
  proveedor: string;

  @ApiProperty({ example: 62.50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costoAdquisicion: number;

  @ApiProperty({ example: '2026-09-28T07:00:00.000Z', required: false })
  @IsOptional()
  fechaIngreso?: Date;
}
