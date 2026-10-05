import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISOS_KEY, ROLES_KEY } from './roles.decorator';
import { UserRole } from '../entities/usuario.entity';
import { Permiso, getPermisos } from './permissions';

/**
 * Guard único de autorización del proyecto.
 *  - @RequierePermisos(...): valida los permisos del rol (matriz en permissions.ts).
 *  - @Roles(...): soporte heredado por nombre de rol.
 * El usuario lo carga JwtStrategy desde la BD en cada request, por lo que un cambio de rol aplica de inmediato.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    const requiredPermisos = this.reflector.getAllAndOverride<Permiso[]>(PERMISOS_KEY, targets) ?? [];
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, targets) ?? [];

    if (requiredPermisos.length === 0 && requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.rol) {
      throw new ForbiddenException('Acceso denegado: Usuario sin rol asignado');
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.rol)) {
      throw new ForbiddenException(`Acceso denegado: Se requiere rol ${requiredRoles.join(' o ')}`);
    }

    if (requiredPermisos.length > 0) {
      const permisos = getPermisos(user.rol);
      const faltantes = requiredPermisos.filter((p) => !permisos.includes(p));
      if (faltantes.length > 0) {
        throw new ForbiddenException(
          `Acceso denegado: su rol (${user.rol}) no tiene el permiso requerido (${faltantes.join(', ')})`,
        );
      }
    }
    return true;
  }
}
