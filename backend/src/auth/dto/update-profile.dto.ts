import { IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Efrain Antonio', required: false })
  @IsOptional()
  nombre?: string;

  @ApiProperty({ example: 'efrain@correo.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Correo electrónico no válido' })
  email?: string;

  @ApiProperty({ example: 'nueva_clave_123', required: false })
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password?: string;
}
