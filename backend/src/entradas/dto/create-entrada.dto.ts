import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Trim, TrimToUndefined } from '../../common/transformers';

export class CreateEntradaDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'El repuesto es obligatorio y debe ser un ID válido' })
  @Min(1, { message: 'El repuesto es obligatorio y debe ser un ID válido' })
  repuestoId: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Max(100000, { message: 'La cantidad no puede superar 100000 unidades por entrada' })
  cantidad: number;

  @ApiProperty({ example: 'Distribuidora LubeMax' })
  @Trim()
  @IsString({ message: 'El proveedor debe ser texto' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio' })
  @MaxLength(150, { message: 'El proveedor no debe superar 150 caracteres' })
  proveedor: string;

  @ApiProperty({ example: 62.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El costo de adquisición debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El costo de adquisición no puede ser negativo' })
  @Max(99999999.99, { message: 'El costo de adquisición excede el monto máximo permitido' })
  costoAdquisicion: number;

  @ApiProperty({ example: '2026-09-28T07:00:00.000Z', required: false })
  @TrimToUndefined()
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de ingreso no es una fecha válida' })
  fechaIngreso?: Date;
}
