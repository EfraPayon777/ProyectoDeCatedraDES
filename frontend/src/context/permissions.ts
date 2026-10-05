import { UserRole } from '../types';

/**
 * Permisos de la interfaz. Son los mismos identificadores que define el backend
 * (backend/src/auth/permissions.ts). La matriz rol → permisos vive SOLO en el backend:
 * el usuario autenticado trae sus permisos en `user.permisos` (login y GET /auth/profile).
 */
export type Permission =
  | 'catalogo.view'
  | 'catalogo.create'
  | 'catalogo.edit'
  | 'catalogo.delete'
  | 'inventario.view'
  | 'inventario.create'
  | 'ordenes.view'
  | 'ordenes.create'
  | 'ordenes.update'
  | 'usuarios.view'
  | 'usuarios.create'
  | 'usuarios.roles'
  | 'finanzas.view';

/** Roles vigentes que se pueden asignar (mismos valores que el enum UserRole del backend). */
export const ROLES_ASIGNABLES: UserRole[] = ['Administrador', 'Jefe de Pista', 'Mecánico'];

export const DESCRIPCION_ROL: Record<UserRole, string> = {
  Administrador: 'Acceso completo: catálogo, inventario, órdenes, usuarios y métricas financieras.',
  'Jefe de Pista': 'Operación y supervisión: catálogo, inventario, órdenes y consulta de métricas. Sin gestión de usuarios.',
  'Mecánico': 'Operación de órdenes (consulta y actualización) y consulta del catálogo.',
};

export const esRolVigente = (rol: string | undefined | null): rol is UserRole =>
  !!rol && (ROLES_ASIGNABLES as string[]).includes(rol);
