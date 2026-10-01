import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  FileSpreadsheet,
  PlusCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Image as ImageIcon,
  AlertTriangle,
  PackageCheck
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

  // Sincronizar parámetro URL si cambia
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

  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      await downloadExcelFile('/reportes/exportar-inventario', 'Lubripoint_Inventario.xlsx');
      Swal.fire({
        icon: 'success',
        title: 'Descarga Iniciada',
        text: 'El inventario se ha descargado exitosamente en formato Excel.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Descarga',
        text: 'No se pudo descargar el archivo Excel. Verifica tu sesión.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Conteo de estados
  const countAgotados = repuestos?.filter((i) => i.stockActual <= 0).length || 0;
  const countBajo = repuestos?.filter((i) => i.stockActual > 0 && i.stockActual <= i.stockMinimo).length || 0;
  const countNormal = repuestos?.filter((i) => i.stockActual > i.stockMinimo).length || 0;

  // Filtrado de items
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
      {/* Title Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFB800]">Inventario / Stock</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Consulta de existencias, control de umbrales mínimos y alertas automáticas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botón para Registrar Nuevo Producto */}
          <button
            onClick={() => {
              setSelectedRepuestoEdit(null);
              setIsProductoModalOpen(true);
            }}
            className="bg-[#FFB800] hover:bg-[#E6A600] text-slate-950 font-extrabold px-4 py-2 rounded-lg flex items-center space-x-2 text-xs transition-colors shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Producto</span>
          </button>

          {/* Botón para Descargar Excel con JWT autenticado */}
          <button
            onClick={handleDownloadExcel}
            disabled={isDownloading}
            className="bg-[#00C897] hover:bg-[#00B084] text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center space-x-2 text-xs transition-colors shadow-lg cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isDownloading ? 'Descargando...' : 'Descargar Inventario'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar y Pestañas Interactivas de Filtrado de Stock */}
      <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
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

        {/* Filtros Clicables Rápidos con Conteo de Alertas */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => cambiarFiltro('todos')}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              filtroStock === 'todos'
                ? 'bg-slate-200 text-slate-950 border-white'
                : 'bg-[#1B2237] text-slate-400 border-[#222D46] hover:text-white'
            }`}
          >
            Todos ({repuestos?.length || 0})
          </button>

          <button
            onClick={() => cambiarFiltro('normal')}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              filtroStock === 'normal'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-[#1B2237] text-emerald-400 border-[#222D46] hover:border-emerald-500/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Stock Normal ({countNormal})</span>
          </button>

          <button
            onClick={() => cambiarFiltro('bajo')}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              filtroStock === 'bajo'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-[#1B2237] text-amber-400 border-[#222D46] hover:border-amber-500/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Bajo Stock ({countBajo})</span>
          </button>

          <button
            onClick={() => cambiarFiltro('agotado')}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              filtroStock === 'agotado'
                ? 'bg-red-500 text-white border-red-400 font-bold'
                : 'bg-[#1B2237] text-red-400 border-[#222D46] hover:border-red-500/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span>Agotado ({countAgotados})</span>
          </button>
        </div>
      </div>

      {/* Banner explicativo si está filtrado por Bajo Stock */}
      {filtroStock === 'bajo' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Mostrando únicamente los <strong>{countBajo} repuestos</strong> que han alcanzado o caído por debajo de su umbral mínimo configurado.
            </span>
          </div>
          <button
            onClick={() => cambiarFiltro('todos')}
            className="text-xs underline text-amber-400 hover:text-amber-200 cursor-pointer"
          >
            Ver todos los repuestos
          </button>
        </div>
      )}

      {/* Table matching screenshot */}
      <div className="bg-[#141A29] border border-[#222D46] rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#1B2237] text-slate-400 border-b border-[#222D46]">
              <th className="py-3 px-4 font-semibold">FOTO</th>
              <th className="py-3 px-4 font-semibold">CÓDIGO</th>
              <th className="py-3 px-4 font-semibold">REPUESTO</th>
              <th className="py-3 px-4 font-semibold">DESCRIPCIÓN</th>
              <th className="py-3 px-4 font-semibold">PRECIO</th>
              <th className="py-3 px-4 font-semibold text-center">STOCK (ACTUAL / MÍN.)</th>
              <th className="py-3 px-4 font-semibold text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222D46]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Cargando inventario...
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
                        ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08]'
                        : isOut
                        ? 'bg-red-500/[0.04] hover:bg-red-500/[0.08]'
                        : 'hover:bg-[#1B2237]/50'
                    }`}
                  >
                    {/* Foto interactiva: Clic abre la vista previa en gran formato */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => setSelectedRepuestoPreview(item)}
                        className="relative group cursor-pointer inline-block"
                        title="Haz clic para ver foto en tamaño grande y ficha completa"
                      >
                        {item.imagenUrl ? (
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-[#222D46] group-hover:border-[#FFB800] transition-all group-hover:scale-105 shadow-md">
                            <img
                              src={item.imagenUrl}
                              alt={item.nombre}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-11 h-11 bg-[#1B2237] rounded-lg border border-[#222D46] group-hover:border-[#FFB800] flex items-center justify-center text-slate-500 group-hover:text-[#FFB800] transition-all">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-[#FFB800]">{item.codigo}</td>

                    {/* Nombre interactivo con clic para ver vista previa */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedRepuestoPreview(item)}
                        className="font-semibold text-white hover:text-[#FFB800] text-left transition-colors cursor-pointer flex items-center space-x-1.5 group"
                        title="Ver detalles completos de este producto"
                      >
                        <span>{item.nombre}</span>
                        <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#FFB800] transition-opacity" />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{item.descripcion || '---'}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">${Number(item.precioFinal).toFixed(2)}</td>

                    {/* Celda de Stock con Umbral Mínimo Explicativo */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`inline-block font-extrabold px-2.5 py-1 rounded-md text-xs border ${
                            isOut
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : isLow
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {item.stockActual} un.
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                          {isLow ? (
                            <span className="text-amber-400 font-bold flex items-center space-x-0.5">
                              <span>⚠️ Mín:</span>
                              <strong>{item.stockMinimo}</strong>
                            </span>
                          ) : isOut ? (
                            <span className="text-red-400 font-bold">Agotado</span>
                          ) : (
                            <span>Mín: {item.stockMinimo}</span>
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Botón Vista Previa / Ficha Detallada */}
                        <button
                          onClick={() => setSelectedRepuestoPreview(item)}
                          title="Vista Previa y Ficha Técnica"
                          className="p-1.5 bg-[#1B2237] hover:bg-purple-500/20 text-purple-400 rounded-md border border-[#222D46] transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Entrada de Stock */}
                        <button
                          onClick={() => setSelectedRepuestoEntrada(item)}
                          title="Entrada de Stock"
                          className="p-1.5 bg-[#1B2237] hover:bg-[#00C897]/20 text-[#00C897] rounded-md border border-[#222D46] transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {/* Editar Producto */}
                        <button
                          onClick={() => {
                            setSelectedRepuestoEdit(item);
                            setIsProductoModalOpen(true);
                          }}
                          title="Editar Repuesto"
                          className="p-1.5 bg-[#1B2237] hover:bg-blue-500/20 text-blue-400 rounded-md border border-[#222D46] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Eliminar Producto */}
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
                  No se encontraron productos con el filtro seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Entrada de Stock */}
      <EntradaModal
        repuesto={selectedRepuestoEntrada}
        onClose={() => setSelectedRepuestoEntrada(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['inventario-stock'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        }}
      />

      {/* Modal para Crear y Editar Producto */}
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

      {/* Modal para Vista Previa Interactiva del Producto */}
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
