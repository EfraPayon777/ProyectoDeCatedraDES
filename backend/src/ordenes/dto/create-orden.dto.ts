import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Trim, TrimToUndefined } from '../../common/transformers';
import { IsPlacaSV, normalizarPlaca } from '../../common/placa';


export class DetalleOrdenDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Cada detalle debe indicar un repuesto válido' })
  @Min(1, { message: 'Cada detalle debe indicar un repuesto válido' })
  repuestoId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad de cada repuesto debe ser un número entero' })
  @Min(1, { message: 'La cantidad de cada repuesto debe ser al menos 1' })
  @Max(10000, { message: 'La cantidad de cada repuesto no puede superar 10000' })
  cantidad: number;

  @ApiProperty({ example: 85.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio unitario debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  @Max(99999999.99, { message: 'El precio unitario excede el monto máximo permitido' })
  precioUnitario?: number;
}

export class CreateOrdenDto {
  @ApiProperty({
    example: 'P-117022',
    description:
      'Placa de El Salvador: prefijo permitido (P, C, M, A, AB, MB, T, F, RE, O, N, E, PNC, D, V, PR, CC, CD, MI), ' +
      'guion e identificador (ej: P-117022, PNC-123456, P-79-7DA). Se normaliza a mayúsculas. NO es única: ' +
      'la misma placa puede usarse en cualquier cantidad de órdenes.',
  })
  @Transform(({ value }) => normalizarPlaca(value))
  @IsString({ message: 'La placa del vehículo debe ser texto' })
  @IsPlacaSV() // incluye "requerida"; sin @IsNotEmpty para no duplicar el mensaje
  placa: string;

  @ApiProperty({ example: 'Toyota' })
  @Trim()
  @IsString({ message: 'La marca debe ser texto' })
  @IsNotEmpty({ message: 'La marca es requerida' })
  @MaxLength(50, { message: 'La marca no debe superar 50 caracteres' })
  marca: string;

  @ApiProperty({ example: 'Corolla 2020' })
  @Trim()
  @IsString({ message: 'El modelo debe ser texto' })
  @IsNotEmpty({ message: 'El modelo es requerido' })
  @MaxLength(80, { message: 'El modelo no debe superar 80 caracteres' })
  modelo: string;

  @ApiProperty({ example: 'Efrain Antonio' })
  @Trim()
  @IsString({ message: 'El nombre del cliente debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del cliente es obligatorio' })
  @MaxLength(120, { message: 'El nombre del cliente no debe superar 120 caracteres' })
  clienteNombre: string;

  @ApiProperty({ example: '22232443', required: false })
  @TrimToUndefined()
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @Matches(/^(\+503[\s-]?)?\d{4}[\s-]?\d{4}$/, {
    message: 'Teléfono inválido. Debe tener 8 dígitos (ej: 7788-9900), opcionalmente con +503',
  })
  clienteTelefono?: string;

  @ApiProperty({ example: 'Cambio de aceite y revisión de frenos delanteros', required: false })
  @TrimToUndefined()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(1000, { message: 'La descripción no debe superar 1000 caracteres' })
  descripcionFalla?: string;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El descuento debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El descuento no puede ser negativo' })
  descuento?: number;

  @ApiProperty({ type: [DetalleOrdenDto] })
  @IsArray({ message: 'Los detalles de la orden deben ser una lista' })
  @ArrayMinSize(1, { message: 'La orden debe incluir al menos un repuesto o servicio' })
  @ArrayMaxSize(100, { message: 'La orden no puede incluir más de 100 líneas' })
  @ValidateNested({ each: true })
  @Type(() => DetalleOrdenDto)
  detalles: DetalleOrdenDto[];
}
