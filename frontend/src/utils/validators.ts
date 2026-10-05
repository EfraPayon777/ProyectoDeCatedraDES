/**
 * Validaciones de formularios. Replican las reglas de los DTOs del backend
 * (class-validator) para dar retroalimentación inmediata; el backend sigue siendo la autoridad final.
 */

/** "El nombre" → "obligatorio"; "La existencia" → "obligatoria". */
const obligatorioDe = (etiqueta: string) => (/^la\s/i.test(etiqueta) ? 'obligatoria' : 'obligatorio');

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export const MAX_MONTO = 99999999.99; // columnas decimal(10,2)
export const MAX_STOCK = 1000000;

// Placa: ver utils/placa.ts (prefijos oficiales de El Salvador).
export { PLACA_MAX_LENGTH, normalizarPlaca, validarPlaca } from './placa';

export const TELEFONO_REGEX = /^(\+503[\s-]?)?\d{4}[\s-]?\d{4}$/;

export const CODIGO_REPUESTO_REGEX = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Texto obligatorio con longitud máxima (los espacios solos cuentan como vacío). */
export const validarTexto = (
  value: string,
  etiqueta: string,
  maxLength: number,
  obligatorio = true,
): string | undefined => {
  const v = value.trim();
  if (!v) return obligatorio ? `${etiqueta} es ${obligatorioDe(etiqueta)}.` : undefined;
  if (v.length > maxLength) return `${etiqueta} no debe superar ${maxLength} caracteres.`;
  return undefined;
};

const decimales = (n: number): number => {
  const s = String(n);
  return s.includes('.') ? s.split('.')[1].length : 0;
};

interface OpcionesNumero {
  obligatorio?: boolean;
  entero?: boolean;
  min?: number;
  minExclusivo?: boolean;
  max?: number;
  maxDecimales?: number;
}

/** Valida un campo numérico que puede venir como '' (vacío) desde un <input type="number">. */
export const validarNumero = (
  value: number | string | '' | null | undefined,
  etiqueta: string,
  { obligatorio = true, entero = false, min = 0, minExclusivo = false, max, maxDecimales = 2 }: OpcionesNumero = {},
): string | undefined => {
  if (value === '' || value === null || value === undefined) {
    return obligatorio ? `${etiqueta} es ${obligatorioDe(etiqueta)}.` : undefined;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return `${etiqueta} debe ser un número válido.`;
  if (entero && !Number.isInteger(n)) return `${etiqueta} debe ser un número entero.`;
  if (minExclusivo ? n <= min : n < min) {
    return minExclusivo ? `${etiqueta} debe ser mayor a ${min}.` : `${etiqueta} debe ser mayor o igual a ${min}.`;
  }
  if (max !== undefined && n > max) return `${etiqueta} no puede superar ${max}.`;
  if (!entero && decimales(n) > maxDecimales) return `${etiqueta} admite máximo ${maxDecimales} decimales.`;
  return undefined;
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const hasErrors = (errors: FieldErrors): boolean => Object.values(errors).some(Boolean);
