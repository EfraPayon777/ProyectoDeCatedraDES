import React, { useState } from 'react';
import { Repuesto } from '../types';
import { X, PlusCircle } from 'lucide-react';
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
      Swal.fire({ icon: 'error', title: 'Error', text: 'La cantidad debe ser mayor a 0' });
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
        title: 'Entrada Registrada',
        text: `Se incrementó el stock de "${repuesto.nombre}" en ${cantidad} unidades.`,
        timer: 2000,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar entrada',
        text: err.response?.data?.message || 'Error de conexión',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#141A29] border border-[#222D46] rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#1B2237]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-[#00C897] mb-4">
          <PlusCircle className="w-6 h-6" />
          <h2 className="text-xl font-bold">Registrar Entrada de Stock</h2>
        </div>

        <div className="bg-[#1B2237] p-3 rounded-lg border border-[#222D46] mb-4">
          <p className="text-xs text-slate-400">Producto a Incrementar:</p>
          <p className="text-sm font-bold text-[#FFB800]">{repuesto.nombre} ({repuesto.codigo})</p>
          <p className="text-xs text-slate-300 mt-1">Stock Actual: <span className="font-bold text-emerald-400">{repuesto.stockActual} un.</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad a Ingresar:</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
              className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Proveedor:</label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Costo Unitario de Adquisición ($):</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={costoAdquisicion}
              onChange={(e) => setCostoAdquisicion(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
              required
            />
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#00C897] hover:bg-[#00B084] text-slate-950 font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              {loading ? 'Guardando...' : 'Confirmar Ingreso'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#1B2237] text-slate-300 hover:bg-[#26314D] font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
