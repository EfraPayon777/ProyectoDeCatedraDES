/**
 * Convierte un valor monetario de la API a número sin transformar null/undefined en 0.
 * (PostgreSQL devuelve los decimal como string, SQLite como number.)
 */
export const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Formatea moneda ($0.00). Un valor ausente se muestra como "—" en lugar de un $0.00 engañoso. */
export const formatMoney = (value: unknown, empty = '—'): string => {
  const n = toNumberOrNull(value);
  return n === null ? empty : `$${n.toFixed(2)}`;
};
