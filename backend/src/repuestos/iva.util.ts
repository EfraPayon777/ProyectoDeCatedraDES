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
