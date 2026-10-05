import Swal from 'sweetalert2';

export const MENSAJE_SIN_PERMISOS = 'No tienes permisos para realizar esta acción.';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

/**
 * Extrae los mensajes de error de una respuesta de la API (NestJS).
 *  - 400: `message` puede ser un string o un arreglo de mensajes de class-validator.
 *  - 401: lo maneja el interceptor de services/api.ts (cierra sesión y redirige al login).
 *  - 403: mensaje estándar de falta de permisos.
 *  - 5xx: mensaje contextual (fallback) de la pantalla.
 */
export const getApiErrorMessages = (err: any, fallback: string): string[] => {
  const status: number | undefined = err?.response?.status;
  if (!err?.response) return ['No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.'];
  if (status === 403) return [MENSAJE_SIN_PERMISOS];
  if (status === 401) {
    const msg = err.response.data?.message;
    return [typeof msg === 'string' && msg ? msg : 'Tu sesión expiró. Inicia sesión nuevamente.'];
  }
  // Errores internos (5xx): no se muestra "Internal server error", sino el mensaje contextual de la pantalla.
  if (status !== undefined && status >= 500) return [fallback];
  const message = err.response.data?.message;
  if (Array.isArray(message) && message.length > 0) {
    // "detalles.0.La cantidad..." → "Línea 1: La cantidad..."
    return message.map((m: string) => String(m).replace(/^detalles\.(\d+)\./, (_, i) => `Línea ${Number(i) + 1}: `));
  }
  if (typeof message === 'string' && message) return [message];
  return [fallback];
};

export const getApiErrorMessage = (err: any, fallback: string): string => getApiErrorMessages(err, fallback).join(' ');

/** Muestra el error de la API con SweetAlert2 (estilo usado en todo el proyecto). */
export const showApiError = (err: any, title: string, fallback: string) => {
  const status: number | undefined = err?.response?.status;
  const mensajes = getApiErrorMessages(err, fallback);
  return Swal.fire({
    icon: status === 403 ? 'warning' : 'error',
    title: status === 403 ? 'Acceso denegado' : title,
    html:
      mensajes.length > 1
        ? `<ul style="text-align:left;margin:0;padding-left:1.1rem;list-style:disc">${mensajes
            .map((m) => `<li>${escapeHtml(m)}</li>`)
            .join('')}</ul>`
        : escapeHtml(mensajes[0]),
  });
};
