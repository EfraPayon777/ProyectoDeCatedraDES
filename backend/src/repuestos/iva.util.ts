/**
 * Lógica de IVA del inventario.
 *
 * Tasa: 13% (IVA de El Salvador). Es la tasa que ya utilizaba el sistema:
 *  - frontend/src/components/ProductoModal.tsx  -> costoConIva = costoSinIva * 1.13
 *  - etiquetas "Costo con IVA (13%)" en la UI
 *  - datos semilla (65.00 -> 73.45, 18.00 -> 20.34, 5.50 -> 6.22, 22.00 -> 24.86)
 *
 * Los cálculos se hacen en centavos enteros para evitar errores de punto flotante
 * (p. ej. 5.50 * 1.13 = 6.2149999... en float, pero el valor correcto es 6.22).
 */
export const IVA_PORCENTAJE = 13;

const toCents = (value: number): number => Math.round(Number(value) * 100);
const fromCents = (cents: number): number => cents / 100;

const isPositive = (value: unknown): boolean =>
  value !== undefined && value !== null && !Number.isNaN(Number(value)) && Number(value) > 0;

/** Redondea un monto a 2 decimales (moneda). */
export function redondearMoneda(value: number): number {
  return fromCents(toCents(value));
}

/** Agrega IVA a un monto sin IVA. */
export function agregarIva(montoSinIva: number): number {
  return fromCents(Math.round((toCents(montoSinIva) * (100 + IVA_PORCENTAJE)) / 100));
}

/** Quita IVA a un monto con IVA. */
export function quitarIva(montoConIva: number): number {
  return fromCents(Math.round((toCents(montoConIva) * 100) / (100 + IVA_PORCENTAJE)));
}

/**
 * Resuelve costoSinIva / costoConIva. Un costo en 0, null o undefined se considera "no ingresado".
 *
 *  1. Ambos costos ingresados        -> se respetan tal cual (valores manuales).
 *  2. Solo costoSinIva               -> costoConIva = costoSinIva * 1.13
 *  3. Solo costoConIva               -> costoSinIva = costoConIva / 1.13
 *  4. Ninguno ingresado              -> se toma el precio de venta (PVP, que ya incluye IVA)
 *                                       como base: costoConIva = precioFinal,
 *                                       costoSinIva = precioFinal / 1.13
 */
export function resolverCostosIva(
  costoSinIva: number | null | undefined,
  costoConIva: number | null | undefined,
  precioFinal: number | null | undefined,
): { costoSinIva: number; costoConIva: number } {
  const tieneSinIva = isPositive(costoSinIva);
  const tieneConIva = isPositive(costoConIva);

  if (tieneSinIva && tieneConIva) {
    return { costoSinIva: redondearMoneda(costoSinIva), costoConIva: redondearMoneda(costoConIva) };
  }
  if (tieneSinIva) {
    return { costoSinIva: redondearMoneda(costoSinIva), costoConIva: agregarIva(costoSinIva) };
  }
  if (tieneConIva) {
    return { costoSinIva: quitarIva(costoConIva), costoConIva: redondearMoneda(costoConIva) };
  }
  if (isPositive(precioFinal)) {
    return { costoSinIva: quitarIva(precioFinal), costoConIva: redondearMoneda(precioFinal) };
  }
  return { costoSinIva: 0, costoConIva: 0 };
}
