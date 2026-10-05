import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TrimToUndefined } from '../../common/transformers';
import { EstadoOrden } from '../../entities/orden.entity';

export const ESTADOS_ACTUALIZABLES = [EstadoOrden.PENDIENTE, EstadoOrden.COMPLETADA];

export class UpdateOrdenDto {
  @ApiProperty({ enum: ESTADOS_ACTUALIZABLES, required: false, example: EstadoOrden.COMPLETADA })
  @IsOptional()
  @IsIn(ESTADOS_ACTUALIZABLES, { message: `El estado debe ser uno de: ${ESTADOS_ACTUALIZABLES.join(', ')}` })
  estado?: EstadoOrden;

  @ApiProperty({ required: false, example: 'Se cambió aceite y filtro; se revisaron frenos delanteros.' })
  @TrimToUndefined()
  @IsOptional()
  @IsString({ message: 'El detalle del trabajo debe ser texto' })
  @MaxLength(1000, { message: 'El detalle del trabajo no debe superar 1000 caracteres' })
  descripcionFalla?: string;
}
