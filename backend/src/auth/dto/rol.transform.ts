import { UserRole } from '../../entities/usuario.entity';

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Alias aceptados además del nombre exacto del rol (sin distinguir mayúsculas ni acentos). */
const ALIAS: Record<string, UserRole> = {
  admin: UserRole.ADMIN,
  administrador: UserRole.ADMIN,
  jefe_pista: UserRole.JEFE_PISTA,
  'jefe de pista': UserRole.JEFE_PISTA,
  mecanico: UserRole.MECANICO,
};

/** "mecanico" / "Mecánico" / "jefe_pista" → valor del enum. Valores desconocidos (p. ej. "Empleado") se dejan tal cual para que @IsEnum los rechace. */
export const normalizarRol = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  return ALIAS[sinAcentos(value)] ?? value;
};
