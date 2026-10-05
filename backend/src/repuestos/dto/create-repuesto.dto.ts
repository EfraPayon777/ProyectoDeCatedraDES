import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Trim, TrimToUndefined, ToOptionalNumber } from '../../common/transformers';

// Límite de las columnas decimal(10,2)
const MAX_MONTO = 99999999.99;
const MAX_STOCK = 1000000;

export class CreateRepuestoDto {
  @ApiProperty({ example: 'LUB-32EE0' })
  @Trim()
  @IsString({ message: 'El código del repuesto debe ser texto' })
  @IsNotEmpty({ message: 'El código del repuesto es obligatorio' })
  @MaxLength(30, { message: 'El código del repuesto no debe superar 30 caracteres' })
  @Matches(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, {
    message: 'El código solo puede contener letras, números, guiones (-), guion bajo (_) y punto (.)',
  })
  codigo: string;

  @ApiProperty({ example: 'Aceite Sintético 5W-30' })
  @Trim()
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150, { message: 'El nombre no debe superar 150 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'Aceite para motor sintético de alto rendimiento' })
  @TrimToUndefined()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(1000, { message: 'La descripción no debe superar 1000 caracteres' })
  descripcion?: string;

  @ApiProperty({
    example: 65.0,
    required: false,
    description: 'Si se envía 0/null/vacío se calcula automáticamente con IVA 13%',
  })
  @ToOptionalNumber()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El costo sin IVA debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El costo sin IVA no puede ser negativo' })
  @Max(MAX_MONTO, { message: 'El costo sin IVA excede el monto máximo permitido' })
  costoSinIva?: number;

  @ApiProperty({
    example: 73.45,
    required: false,
    description: 'Si se envía 0/null/vacío se calcula automáticamente con IVA 13%',
  })
  @ToOptionalNumber()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El costo con IVA debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El costo con IVA no puede ser negativo' })
  @Max(MAX_MONTO, { message: 'El costo con IVA excede el monto máximo permitido' })
  costoConIva?: number;

  @ApiProperty({ example: 85.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio de venta debe ser un número con máximo 2 decimales' })
  @Min(0.01, { message: 'El precio de venta debe ser mayor a 0' })
  @Max(MAX_MONTO, { message: 'El precio de venta excede el monto máximo permitido' })
  precioFinal: number;

  @ApiProperty({ example: 10, default: 0 })
  @Type(() => Number)
  @IsInt({ message: 'El stock actual debe ser un número entero' })
  @Min(0, { message: 'El stock actual no puede ser negativo' })
  @Max(MAX_STOCK, { message: `El stock actual no puede superar ${MAX_STOCK}` })
  stockActual: number;

  @ApiProperty({ example: 5, default: 5 })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'El stock mínimo debe ser un número entero' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  @Max(MAX_STOCK, { message: `El stock mínimo no puede superar ${MAX_STOCK}` })
  stockMinimo?: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'La categoría es obligatoria y debe ser un ID válido' })
  @Min(1, { message: 'La categoría es obligatoria y debe ser un ID válido' })
  categoriaId: number;

  // Puede ser URL de Cloudinary o data URI base64 (fallback del frontend), por eso no se valida como URL.
  @ApiProperty({ example: 'https://cloudinary.com/img.jpg', required: false })
  @TrimToUndefined()
  @IsOptional()
  @IsString({ message: 'La imagen debe ser una URL o cadena válida' })
  imagenUrl?: string;
}
