import React, { useState } from 'react';
import { Repuesto } from '../types';
import { X, PlusCircle, PackagePlus } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';

interface EntradaModalProps {
  repuesto: Repuesto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EntradaModal: React.FC<EntradaModalProps> = ({ repuesto, onClose, onSuccess }) => {
  const [cantidad, setCantidad] = useState<number>(1);
  const [proveedor, setProveedor] = useState<string>('Distribuidora LubriPoint');
  const [costoAdquisicion, setCostoAdquisicion] = useState<number>(repuesto ? Number(repuesto.costoSinIva) : 0);
  const [loading, setLoading] = useState<boolean>(false);

  if (!repuesto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cantidad <= 0) {
      Swal.fire({ icon: 'warning', title: 'Cantidad no válida', text: 'La cantidad a ingresar debe ser mayor a 0.' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/entradas', {
        repuestoId: repuesto.id,
        cantidad: Number(cantidad),
        proveedor,
        costoAdquisicion: Number(costoAdquisicion),
      });

      Swal.fire({
        icon: 'success',
        title: 'Entrada registrada',
        text: `Se agregaron ${cantidad} unidades al inventario de "${repuesto.nombre}".`,
        timer: 1800,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error en la entrada',
        text: err.response?.data?.message || 'No fue posible registrar la recepción de mercadería.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-[#111726] border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md bg-[#182032] border border-slate-700/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-slate-100 mb-4 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <PackagePlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold">Registrar Entrada de Stock</h2>
            <p className="text-[11px] text-slate-400">Recepción de mercadería para incrementar existencias</p>
          </div>
        </div>

        <div className="bg-[#182032] p-3 rounded-lg border border-slate-800 mb-4 text-xs space-y-1">
          <span className="font-mono text-[10px] text-amber-400 font-semibold block">{repuesto.codigo}</span>
          <p className="font-medium text-slate-100">{repuesto.nombre}</p>
          <p className="text-slate-400">
            Existencia actual: <span className="font-mono font-bold text-slate-200">{repuesto.stockActual} unidades</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Cantidad de unidades recibidas *</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
              className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Proveedor / Distribuidor *</label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Costo Unitario de Adquisición ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={costoAdquisicion}
              onChange={(e) => setCostoAdquisicion(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div className="pt-2 flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer text-xs disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Confirmar Recepción'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#182032] text-slate-300 hover:bg-[#202b42] font-medium py-2 px-3 rounded-lg border border-slate-700/80 transition-colors cursor-pointer text-xs"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
