import { Transform } from 'class-transformer';

/**
 * Elimina espacios al inicio/fin de un string antes de validar.
 * Evita que valores como "   " pasen @IsNotEmpty().
 */
export const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/**
 * Trim + convierte strings vacíos en undefined, para que @IsOptional()
 * trate "" igual que un campo no enviado (el frontend envía "" en campos opcionales).
 */
export const TrimToUndefined = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  });

/**
 * Convierte "", null o undefined en undefined y cualquier otro valor en Number.
 * Usado en campos numéricos opcionales (costos) que pueden calcularse en backend.
 */
export const ToOptionalNumber = () =>
  Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return Number(value);
  });
