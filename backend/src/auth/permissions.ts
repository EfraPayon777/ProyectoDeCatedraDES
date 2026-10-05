import { UserRole } from '../entities/usuario.entity';

/**
 * Permisos del sistema. Cada rol es una agrupación de permisos (ROLE_PERMISOS) y cada endpoint
 * protegido declara el permiso que exige con @RequierePermisos(...). RolesGuard los valida.
 *
 * Solo se definen permisos que corresponden a endpoints reales:
 *   catalogo.*      → /repuestos y /categorias
 *   inventario.*    → /entradas y /reportes/exportar-inventario
 *   ordenes.*       → /ordenes
 *   usuarios.*      → /auth/register, /auth/admins, /auth/usuarios/:id/rol
 *   finanzas.view   → /reportes/dashboard, /reportes/piezas-mas-usadas, /reportes/exportar-ventas
 */
export enum Permiso {
  CATALOGO_VIEW = 'catalogo.view',
  CATALOGO_CREATE = 'catalogo.create',
  CATALOGO_EDIT = 'catalogo.edit',
  CATALOGO_DELETE = 'catalogo.delete',

  INVENTARIO_VIEW = 'inventario.view',
  INVENTARIO_CREATE = 'inventario.create',

  ORDENES_VIEW = 'ordenes.view',
  ORDENES_CREATE = 'ordenes.create',
  ORDENES_UPDATE = 'ordenes.update',

  USUARIOS_VIEW = 'usuarios.view',
  USUARIOS_CREATE = 'usuarios.create',
  USUARIOS_ROLES = 'usuarios.roles',

  FINANZAS_VIEW = 'finanzas.view',
}

export const ROLE_PERMISOS: Record<UserRole, Permiso[]> = {
  [UserRole.ADMIN]: Object.values(Permiso),
  [UserRole.JEFE_PISTA]: [
    Permiso.CATALOGO_VIEW,
    Permiso.CATALOGO_CREATE,
    Permiso.CATALOGO_EDIT,
    Permiso.CATALOGO_DELETE,
    Permiso.INVENTARIO_VIEW,
    Permiso.INVENTARIO_CREATE,
    Permiso.ORDENES_VIEW,
    Permiso.ORDENES_CREATE,
    Permiso.ORDENES_UPDATE,
    Permiso.FINANZAS_VIEW,
  ],
  [UserRole.MECANICO]: [Permiso.CATALOGO_VIEW, Permiso.ORDENES_VIEW, Permiso.ORDENES_UPDATE],
};

export const getPermisos = (rol: string | null | undefined): Permiso[] =>
  (rol && ROLE_PERMISOS[rol as UserRole]) || [];

export const tienePermisos = (rol: string | null | undefined, requeridos: Permiso[]): boolean => {
  const permisos = getPermisos(rol);
  return requeridos.every((p) => permisos.includes(p));
};
