import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { UserRole } from '../../entities/usuario.entity';
import { Trim } from '../../common/transformers';
import { normalizarRol } from './rol.transform';

export class RegisterUserDto {
  @ApiProperty({ example: 'Efrain Antonio' })
  @Trim()
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no debe superar 100 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'efrain@correo.com' })
  @Trim()
  @IsEmail({}, { message: 'Correo electrónico no válido' })
  @MaxLength(150, { message: 'El correo electrónico no debe superar 150 caracteres' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  @MaxLength(72, { message: 'La contraseña no debe superar 72 caracteres' })
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MECANICO, description: 'Obligatorio: Administrador, Jefe de Pista o Mecánico' })
  @Transform(normalizarRol)
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsEnum(UserRole, { message: `Rol de usuario inválido. Valores permitidos: ${Object.values(UserRole).join(', ')}` })
  rol: UserRole;
}
