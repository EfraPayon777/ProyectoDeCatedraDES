import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { UserRole } from '../../entities/usuario.entity';
import { normalizarRol } from './rol.transform';

export class UpdateRolDto {
  @ApiProperty({ enum: UserRole, example: UserRole.JEFE_PISTA })
  @Transform(normalizarRol)
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsEnum(UserRole, { message: `Rol de usuario inválido. Valores permitidos: ${Object.values(UserRole).join(', ')}` })
  rol: UserRole;
}
