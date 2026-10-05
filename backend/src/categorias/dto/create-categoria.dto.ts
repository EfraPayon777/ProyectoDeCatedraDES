import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../common/transformers';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Aceite de Motor' })
  @Trim()
  @IsString({ message: 'El nombre de la categoría debe ser texto' })
  @IsNotEmpty({ message: 'El nombre de la categoría es requerido' })
  @MaxLength(100, { message: 'El nombre de la categoría no debe superar 100 caracteres' })
  nombre: string;
}
