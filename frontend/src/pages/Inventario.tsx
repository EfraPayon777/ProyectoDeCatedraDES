import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  FileSpreadsheet,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Image as ImageIcon,
  AlertTriangle,
  PlusCircle
} from 'lucide-react';
import api, { downloadExcelFile } from '../services/api';
import { Repuesto } from '../types';
import { EntradaModal } from '../components/EntradaModal';
import { ProductoModal } from '../components/ProductoModal';
import { ProductoPreviewModal } from '../components/ProductoPreviewModal';
import Swal from 'sweetalert2';

export const Inventario: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [filtroStock, setFiltroStock] = useState<'todos' | 'normal' | 'bajo' | 'agotado'>(
    (searchParams.get('filtro') as any) || 'todos'
  );

  const [selectedRepuestoEntrada, setSelectedRepuestoEntrada] = useState<Repuesto | null>(null);
  const [selectedRepuestoEdit, setSelectedRepuestoEdit] = useState<Repuesto | null>(null);
  const [selectedRepuestoPreview, setSelectedRepuestoPreview] = useState<Repuesto | null>(null);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const param = searchParams.get('filtro');
    if (param && ['todos', 'normal', 'bajo', 'agotado'].includes(param)) {
      setFiltroStock(param as any);
    }
  }, [searchParams]);

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
      queryClient.invalidateQueries({ queryKey: ['repuestos-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      Swal.fire({ icon: 'success', title: 'Repuesto eliminado', timer: 1400, showConfirmButton: false });
    },
    onError: (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Operación no permitida',
        text: err.response?.data?.message || 'El repuesto se encuentra asociado a órdenes de trabajo existentes.',
      });
    },
  });

  const handleDelete = (item: Repuesto) => {
    Swal.fire({
      title: '¿Confirmar eliminación?',
      text: `Se eliminará "${item.nombre}" (${item.codigo}) del catálogo. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(item.id);
      }
    });
  };

  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      await downloadExcelFile('/reportes/exportar-inventario', 'Lubripoint_Inventario.xlsx');
      Swal.fire({
        icon: 'success',
        title: 'Exportación completada',
        text: 'El inventario se descargó correctamente en formato Excel.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error de exportación',
        text: 'No se pudo generar el archivo Excel.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const countAgotados = repuestos?.filter((i) => i.stockActual <= 0).length || 0;
  const countBajo = repuestos?.filter((i) => i.stockActual > 0 && i.stockActual <= i.stockMinimo).length || 0;
  const countNormal = repuestos?.filter((i) => i.stockActual > i.stockMinimo).length || 0;

  const repuestosFiltrados = repuestos?.filter((item) => {
    if (filtroStock === 'agotado') return item.stockActual <= 0;
    if (filtroStock === 'bajo') return item.stockActual > 0 && item.stockActual <= item.stockMinimo;
    if (filtroStock === 'normal') return item.stockActual > item.stockMinimo;
    return true;
  });

  const cambiarFiltro = (nuevoFiltro: 'todos' | 'normal' | 'bajo' | 'agotado') => {
    setFiltroStock(nuevoFiltro);
    if (nuevoFiltro === 'todos') {
      searchParams.delete('filtro');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ filtro: nuevoFiltro });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Inventario y Existencias</h1>
          <p className="text-xs text-slate-400 mt-0.5">Control de artículos, umbrales de reabastecimiento y entradas de almacén</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedRepuestoEdit(null);
              setIsProductoModalOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Repuesto</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={isDownloading}
            className="bg-[#182032] hover:bg-[#202b42] text-slate-200 border border-slate-700/80 font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{isDownloading ? 'Generando...' : 'Exportar Excel'}</span>
          </button>
        </div>
      </div>

      <div className="bg-[#111726] border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por código SKU o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#182032] border border-slate-700/80 rounded-lg pl-3 pr-9 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          <span className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => cambiarFiltro('todos')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
              filtroStock === 'todos'
                ? 'bg-slate-200 text-slate-950 border-white font-semibold'
                : 'bg-[#182032] text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Todos ({repuestos?.length || 0})
          </button>

          <button
            onClick={() => cambiarFiltro('normal')}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              filtroStock === 'normal'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold'
                : 'bg-[#182032] text-slate-400 border-slate-800 hover:text-emerald-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Stock Normal ({countNormal})</span>
          </button>

          <button
            onClick={() => cambiarFiltro('bajo')}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              filtroStock === 'bajo'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                : 'bg-[#182032] text-slate-400 border-slate-800 hover:text-amber-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Bajo Stock ({countBajo})</span>
          </button>

          <button
            onClick={() => cambiarFiltro('agotado')}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              filtroStock === 'agotado'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold'
                : 'bg-[#182032] text-slate-400 border-slate-800 hover:text-rose-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Agotado ({countAgotados})</span>
          </button>
        </div>
      </div>

      {filtroStock === 'bajo' && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Filtrando <strong>{countBajo} repuestos</strong> que alcanzaron o están por debajo de su umbral mínimo configurado.
            </span>
          </div>
          <button
            onClick={() => cambiarFiltro('todos')}
            className="text-xs underline text-amber-400 hover:text-amber-200 cursor-pointer"
          >
            Mostrar todos
          </button>
        </div>
      )}

      <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#182032] text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3.5 font-semibold">Foto</th>
              <th className="py-3 px-3.5 font-semibold">Código</th>
              <th className="py-3 px-3.5 font-semibold">Repuesto</th>
              <th className="py-3 px-3.5 font-semibold">Descripción</th>
              <th className="py-3 px-3.5 font-semibold">Precio Venta</th>
              <th className="py-3 px-3.5 font-semibold text-center">Existencias / Umbral</th>
              <th className="py-3 px-3.5 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Cargando catálogo...
                </td>
              </tr>
            ) : repuestosFiltrados && repuestosFiltrados.length > 0 ? (
              repuestosFiltrados.map((item) => {
                const isOut = item.stockActual <= 0;
                const isLow = item.stockActual > 0 && item.stockActual <= item.stockMinimo;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isLow
                        ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]'
                        : isOut
                        ? 'bg-rose-500/[0.03] hover:bg-rose-500/[0.06]'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-3.5">
                      <div
                        onClick={() => setSelectedRepuestoPreview(item)}
                        className="relative group cursor-pointer inline-block"
                        title="Ver ficha técnica"
                      >
                        {item.imagenUrl ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 group-hover:border-amber-500 transition-all">
                            <img
                              src={item.imagenUrl}
                              alt={item.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-[#182032] rounded-lg border border-slate-700/80 group-hover:border-amber-500 flex items-center justify-center text-slate-500 group-hover:text-amber-400 transition-all">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 font-mono font-medium text-amber-400">{item.codigo}</td>

                    <td className="py-2.5 px-3.5">
                      <button
                        onClick={() => setSelectedRepuestoPreview(item)}
                        className="font-medium text-slate-100 hover:text-amber-400 text-left transition-colors cursor-pointer flex items-center space-x-1"
                        title="Ver detalles de repuesto"
                      >
                        <span>{item.nombre}</span>
                        <Eye className="w-3 h-3 text-slate-500 hover:text-amber-400" />
                      </button>
                    </td>

                    <td className="py-2.5 px-3.5 text-slate-400 max-w-xs truncate">{item.descripcion || '---'}</td>
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-100">${Number(item.precioFinal).toFixed(2)}</td>

                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs border ${
                            isOut
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : isLow
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {item.stockActual} un.
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                          {isLow ? (
                            <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Mín: {item.stockMinimo}</span>
                            </span>
                          ) : isOut ? (
                            <span className="text-rose-400 font-semibold">Agotado</span>
                          ) : (
                            <span>Mín: {item.stockMinimo}</span>
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedRepuestoPreview(item)}
                          title="Ficha técnica"
                          className="p-1.5 bg-[#182032] hover:bg-slate-700/80 text-slate-300 hover:text-white rounded border border-slate-700/80 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setSelectedRepuestoEntrada(item)}
                          title="Entrada de mercadería"
                          className="p-1.5 bg-[#182032] hover:bg-emerald-500/20 text-emerald-400 rounded border border-slate-700/80 transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRepuestoEdit(item);
                            setIsProductoModalOpen(true);
                          }}
                          title="Editar información"
                          className="p-1.5 bg-[#182032] hover:bg-amber-500/20 text-amber-400 rounded border border-slate-700/80 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          title="Eliminar del catálogo"
                          className="p-1.5 bg-[#182032] hover:bg-rose-500/20 text-rose-400 rounded border border-slate-700/80 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No se encontraron productos con el filtro seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EntradaModal
        repuesto={selectedRepuestoEntrada}
        onClose={() => setSelectedRepuestoEntrada(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['inventario-stock'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        }}
      />

      <ProductoModal
        isOpen={isProductoModalOpen}
        onClose={() => {
          setIsProductoModalOpen(false);
          setSelectedRepuestoEdit(null);
        }}
        repuestoToEdit={selectedRepuestoEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['inventario-stock'] });
          queryClient.invalidateQueries({ queryKey: ['repuestos-catalog'] });
          queryClient.invalidateQueries({ queryKey: ['repuestos'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        }}
      />

      <ProductoPreviewModal
        repuesto={selectedRepuestoPreview}
        onClose={() => setSelectedRepuestoPreview(null)}
        onEdit={(repuesto) => {
          setSelectedRepuestoEdit(repuesto);
          setIsProductoModalOpen(true);
        }}
        onAddStock={(repuesto) => {
          setSelectedRepuestoEntrada(repuesto);
        }}
      />
    </div>
  );
};
