import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../common/transformers';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Efrain Antonio', required: false })
  @Trim()
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre no debe superar 100 caracteres' })
  nombre?: string;

  @ApiProperty({ example: 'efrain@correo.com', required: false })
  @Trim()
  @IsOptional()
  @IsEmail({}, { message: 'Correo electrónico no válido' })
  @MaxLength(150, { message: 'El correo electrónico no debe superar 150 caracteres' })
  email?: string;

  @ApiProperty({ example: 'nueva_clave_123', required: false })
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  @MaxLength(72, { message: 'La contraseña no debe superar 72 caracteres' })
  password?: string;
}
