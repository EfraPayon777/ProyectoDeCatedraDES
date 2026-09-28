import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/usuario.entity';

export class RegisterUserDto {
  @ApiProperty({ example: 'Efrain Antonio' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({ example: 'efrain@correo.com' })
  @IsEmail({}, { message: 'Correo electrónico no válido' })
  email: string;

  @ApiProperty({ example: '123456' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.ADMIN })
  @IsEnum(UserRole, { message: 'Rol de usuario inválido' })
  @IsOptional()
  rol?: UserRole;
}
