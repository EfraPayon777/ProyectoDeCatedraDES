import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Aceite de Motor' })
  @IsNotEmpty({ message: 'El nombre de la categoría es requerido' })
  @IsString()
  nombre: string;
}
