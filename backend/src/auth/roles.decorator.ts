import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/usuario.entity';
import { Permiso } from './permissions';

export const ROLES_KEY = 'roles';
/** @deprecated Usar @RequierePermisos(). Se conserva por compatibilidad; RolesGuard aún lo evalúa. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISOS_KEY = 'permisos';
/** Exige que el rol del usuario autenticado incluya TODOS los permisos indicados. Usar junto a JwtAuthGuard + RolesGuard. */
export const RequierePermisos = (...permisos: Permiso[]) => SetMetadata(PERMISOS_KEY, permisos);
