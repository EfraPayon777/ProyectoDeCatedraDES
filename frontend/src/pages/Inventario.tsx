import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  FileSpreadsheet,
  PlusCircle,
  Edit2,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import api from '../services/api';
import { Repuesto } from '../types';
import { EntradaModal } from '../components/EntradaModal';
import Swal from 'sweetalert2';

export const Inventario: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedRepuestoEntrada, setSelectedRepuestoEntrada] = useState<Repuesto | null>(null);

  const { data: repuestos, isLoading } = useQuery<Repuesto[]>({
    queryKey: ['inventario-stock', search],
    queryFn: async () => {
      const res = await api.get('/repuestos', { params: { search } });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/repuestos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario-stock'] });
      Swal.fire({ icon: 'success', title: 'Repuesto Eliminado', timer: 1500, showConfirmButton: false });
    },
    onError: (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text: err.response?.data?.message || 'El repuesto está asociado a órdenes existentes.',
      });
    },
  });

  const handleDelete = (item: Repuesto) => {
    Swal.fire({
      title: '¿Eliminar Repuesto?',
      text: `¿Seguro que deseas eliminar "${item.nombre}" (${item.codigo}) del catálogo?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#1B2237',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(item.id);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFB800]">Inventario / Stock</h1>
          <p className="text-xs sm:text-sm text-slate-400">Consulta de existencias en tiempo real e identificadores visuales</p>
        </div>

        <a
          href="http://localhost:3000/api/reportes/exportar-inventario"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#00C897] hover:bg-[#00B084] text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center space-x-2 text-xs transition-colors shadow-lg cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Descargar Inventario</span>
        </a>
      </div>

      {/* Search Bar matching screenshot */}
      <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg pl-3 pr-10 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800]"
          />
          <button className="absolute right-1 top-1 bottom-1 bg-[#141A29] hover:bg-[#26314D] px-2.5 rounded text-[#FFB800] cursor-pointer">
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>Stock Normal</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span>Bajo Stock</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
            <span>Agotado</span>
          </span>
        </div>
      </div>

      {/* Main Stock Table matching screenshot */}
      <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#1B2237] text-slate-400 uppercase tracking-wider border-b border-[#222D46]">
            <tr>
              <th className="py-3 px-4">IMG</th>
              <th className="py-3 px-4">CÓDIGO</th>
              <th className="py-3 px-4">PRODUCTO</th>
              <th className="py-3 px-4">DESCRIPCIÓN</th>
              <th className="py-3 px-4">PRECIO</th>
              <th className="py-3 px-4 text-center">STOCK</th>
              <th className="py-3 px-4 text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222D46]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">Cargando inventario de repuestos...</td>
              </tr>
            ) : repuestos && repuestos.length > 0 ? (
              repuestos.map((item) => {
                const isOut = item.stockActual <= 0;
                const isLow = item.stockActual <= item.stockMinimo;

                return (
                  <tr key={item.id} className="hover:bg-[#1B2237]/40 transition-colors">
                    <td className="py-3 px-4">
                      {item.imagenUrl ? (
                        <img
                          src={item.imagenUrl}
                          alt={item.nombre}
                          className="w-10 h-10 object-cover rounded-lg border border-[#222D46]"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#1B2237] rounded-lg border border-[#222D46] flex items-center justify-center text-slate-500">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#FFB800]">{item.codigo}</td>
                    <td className="py-3 px-4 font-semibold text-white">{item.nombre}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{item.descripcion || '---'}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">${Number(item.precioFinal).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block font-extrabold px-2.5 py-1 rounded-md text-xs border ${
                          isOut
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : isLow
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {item.stockActual} un.
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedRepuestoEntrada(item)}
                          title="Entrada de Stock"
                          className="p-1.5 bg-[#1B2237] hover:bg-[#00C897]/20 text-[#00C897] rounded-md border border-[#222D46] transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Eliminar Repuesto"
                          className="p-1.5 bg-[#1B2237] hover:bg-red-500/20 text-red-400 rounded-md border border-[#222D46] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No se encontraron productos en el inventario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Entrada Modal */}
      <EntradaModal
        repuesto={selectedRepuestoEntrada}
        onClose={() => setSelectedRepuestoEntrada(null)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['inventario-stock'] })}
      />
    </div>
  );
};
