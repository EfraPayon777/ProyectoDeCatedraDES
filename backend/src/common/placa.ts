import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Regla de placas de El Salvador.
 *
 * FORMATO → se valida.   DUPLICIDAD → se permite.
 * La placa NO es única: una misma placa aparece en muchas órdenes/comprobantes (visitas en distintas fechas).
 *
 * Mantener sincronizado con frontend/src/utils/placa.ts.
 */
export const PREFIJOS_PLACA: Record<string, string> = {
  P: 'Particular',
  C: 'Camión',
  M: 'Motocicleta',
  A: 'Alquiler',
  AB: 'Autobús',
  MB: 'Microbús',
  T: 'Trailer',
  F: 'Furgoneta',
  RE: 'Remolque',
  O: 'Oficial',
  N: 'Nacional',
  E: 'Ejército',
  PNC: 'Policía Nacional Civil',
  D: 'Discapacitados',
  V: 'Vendedor',
  PR: 'Provisional',
  CC: 'Cuerpo Consular',
  CD: 'Cuerpo Diplomático',
  MI: 'Misión Internacional',
};

export const PLACA_MAX_LENGTH = 12;

// Prefijos más largos primero para que la alternancia no corte "PNC" como "P".
const PREFIJOS_REGEX = Object.keys(PREFIJOS_PLACA)
  .sort((a, b) => b.length - a.length)
  .join('|');

/**
 * PREFIJO-IDENTIFICADOR
 *  - PREFIJO: uno de la lista oficial, seguido obligatoriamente de "-".
 *  - IDENTIFICADOR: 1 o 2 segmentos alfanuméricos separados por un guion (P-117022, P-79-7DA),
 *    de 3 a 7 caracteres alfanuméricos en total y con al menos un dígito.
 *  - Longitud total máxima: 12 caracteres.
 */
export const PLACA_REGEX = new RegExp(
  `^(?:${PREFIJOS_REGEX})-(?=(?:[A-Z0-9]-?){3,7}$)(?=[A-Z0-9-]*\\d)[A-Z0-9]+(?:-[A-Z0-9]+)?$`,
);

export const MENSAJE_PLACA_INVALIDA = 'La placa ingresada no tiene un formato válido (ej: P-117022 o P-79-7DA).';

/** Normalización: sin espacios al inicio/fin y en mayúsculas. No altera la estructura (P-79-7DA se conserva). */
export const normalizarPlaca = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

/** Devuelve el motivo por el que la placa es inválida, o null si es válida. Espera la placa ya normalizada. */
export function motivoPlacaInvalida(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return 'La placa del vehículo es requerida.';
  const placa = value;
  if (/\s/.test(placa)) return 'La placa no puede contener espacios (ej: P-117022).';
  if (/[^A-Z0-9-]/.test(placa)) return 'La placa contiene caracteres no permitidos. Solo se admiten letras, números y guiones.';
  if (placa.length > PLACA_MAX_LENGTH) return `La placa no debe superar ${PLACA_MAX_LENGTH} caracteres.`;

  const guion = placa.indexOf('-');
  const prefijo = guion === -1 ? placa.match(/^[A-Z]*/)?.[0] ?? '' : placa.slice(0, guion);
  if (!prefijo || !/^[A-Z]+$/.test(prefijo)) {
    return `La placa debe iniciar con un prefijo válido: ${Object.keys(PREFIJOS_PLACA).join(', ')}.`;
  }
  if (guion === -1) {
    return PREFIJOS_PLACA[prefijo] !== undefined
      ? 'Separe el prefijo del número con un guion (ej: P-117022).'
      : `El prefijo "${prefijo}" no es válido. Prefijos permitidos: ${Object.keys(PREFIJOS_PLACA).join(', ')}.`;
  }
  if (PREFIJOS_PLACA[prefijo] === undefined) {
    return `El prefijo "${prefijo}" no es válido. Prefijos permitidos: ${Object.keys(PREFIJOS_PLACA).join(', ')}.`;
  }
  if (placa.slice(guion + 1).replace(/-/g, '') === '') {
    return 'Falta el número de placa después del prefijo (ej: P-117022).';
  }
  if (!PLACA_REGEX.test(placa)) return MENSAJE_PLACA_INVALIDA;
  return null;
}

/** Decorador class-validator: valida formato y prefijo de la placa. NO valida unicidad (no debe hacerlo). */
export function IsPlacaSV(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPlacaSV',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => motivoPlacaInvalida(value) === null,
        defaultMessage: (args: ValidationArguments) => motivoPlacaInvalida(args.value) ?? MENSAJE_PLACA_INVALIDA,
      },
    });
  };
}
