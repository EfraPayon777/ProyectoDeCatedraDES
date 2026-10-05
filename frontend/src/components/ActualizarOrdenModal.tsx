import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ClipboardCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';
import { Orden } from '../types';
import { showApiError } from '../services/apiErrors';
import { useAuth } from '../context/AuthContext';
import { AccessDenied } from './RequirePermission';

/** Estados que el backend permite actualizar (PATCH /ordenes/:id). CANCELADA no aplica: implicaría devolver stock. */
const ESTADOS: { value: string; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente / En proceso' },
  { value: 'COMPLETADA', label: 'Completada' },
];

interface Props {
  orden: Orden | null;
  onClose: () => void;
}

/** Actualización operativa de una orden (permiso ordenes.update): estado y detalle del trabajo realizado. */
export const ActualizarOrdenModal: React.FC<Props> = ({ orden, onClose }) => {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState('COMPLETADA');
  const [detalle, setDetalle] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (orden) {
      setEstado(ESTADOS.some((e) => e.value === orden.estado) ? orden.estado : 'COMPLETADA');
      setDetalle(orden.descripcionFalla || '');
      setError(undefined);
    }
  }, [orden?.id]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/ordenes/${orden!.id}`, { estado, descripcionFalla: detalle.trim() || undefined });
      return res.data as Orden;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-historial'] });
      Swal.fire({
        icon: 'success',
        title: 'Orden actualizada',
        text: `${data.codigoOrden} quedó en estado ${data.estado}.`,
        timer: 1600,
        showConfirmButton: false,
      });
      onClose();
    },
    onError: (err: any) => showApiError(err, 'No se pudo actualizar la orden', 'Verifique los datos ingresados.'),
  });

  if (!orden) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (detalle.trim().length > 1000) {
      setError('El detalle del trabajo no debe superar 1000 caracteres.');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#111726] border border-slate-800 rounded-xl shadow-xl p-5 text-slate-100">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded">
          <X className="w-4 h-4" />
        </button>
        {!hasPermission('ordenes.update') ? (
          <AccessDenied />
        ) : (
          <>
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold">Actualizar Orden {orden.codigoOrden}</h2>
                <p className="text-[11px] text-slate-400">
                  {orden.marca} {orden.modelo} ({orden.placa}) · {orden.clienteNombre}
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Estado de la orden</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Detalle del trabajo realizado</label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={detalle}
                  onChange={(e) => {
                    setDetalle(e.target.value);
                    setError(undefined);
                  }}
                  placeholder="Ej: Cambio de aceite y filtro realizado; frenos revisados."
                  className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
                {error && <p className="mt-1 text-[10px] text-rose-400">{error}</p>}
                <p className="mt-1 text-[10px] text-slate-500">No modifica montos, repuestos ni existencias.</p>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg border border-slate-700 hover:bg-slate-700/60 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold disabled:opacity-50"
                >
                  {mutation.isPending ? 'Guardando...' : 'Guardar Actualización'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
