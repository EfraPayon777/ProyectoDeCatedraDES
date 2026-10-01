import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  FileSpreadsheet,
  PlusCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Image as ImageIcon,
  AlertCircle,
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
  const [search, setSearch] = useState('');
  const [selectedRepuestoEntrada, setSelectedRepuestoEntrada] = useState<Repuesto | null>(null);
  const [selectedRepuestoEdit, setSelectedRepuestoEdit] = useState<Repuesto | null>(null);
  const [selectedRepuestoPreview, setSelectedRepuestoPreview] = useState<Repuesto | null>(null);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFB800]">Inventario / Stock</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Consulta de existencias, vista previa con fotos en detalle y gestión de repuestos
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
              <th className="py-3 px-4 font-semibold text-center">STOCK</th>
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
            ) : repuestos && repuestos.length > 0 ? (
              repuestos.map((item) => {
                const isOut = item.stockActual <= 0;
                const isLow = item.stockActual > 0 && item.stockActual <= item.stockMinimo;

                return (
                  <tr key={item.id} className="hover:bg-[#1B2237]/50 transition-colors">
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
                  No se encontraron productos en el inventario.
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
