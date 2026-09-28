import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, Trash2, PackagePlus, Upload } from 'lucide-react';
import api from '../services/api';
import { Categoria } from '../types';
import Swal from 'sweetalert2';

export const CategoriasProductos: React.FC = () => {
  const queryClient = useQueryClient();

  // Estado para Categoría
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  // Estado para Registrar Producto
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [costoSinIva, setCostoSinIva] = useState<number | ''>('');
  const [costoConIva, setCostoConIva] = useState<number | ''>('');
  const [stockInicial, setStockInicial] = useState<number | ''>('');
  const [stockMinimo, setStockMinimo] = useState<number | ''>(5);
  const [descripcion, setDescripcion] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Consultas
  const { data: categorias } = useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias');
      return res.data;
    },
  });

  // Mutación crear categoría
  const createCatMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/categorias', { nombre: nuevaCategoria });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setNuevaCategoria('');
      Swal.fire({ icon: 'success', title: 'Categoría Creada', timer: 1500, showConfirmButton: false });
    },
    onError: (err: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo crear la categoría' });
    },
  });

  // Mutación eliminar categoría
  const deleteCatMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categorias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      Swal.fire({ icon: 'success', title: 'Categoría Eliminada', timer: 1500, showConfirmButton: false });
    },
  });

  // Mutación crear producto
  const createProductMutation = useMutation({
    mutationFn: async () => {
      let imagenUrl = '';
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await api.post('/repuestos/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imagenUrl = uploadRes.data.url;
      }

      // Auto-generar código si está vacío (ej. LUB-8219)
      const finalCodigo = codigo.trim() || `LUB-${Math.floor(10000 + Math.random() * 90000)}`;

      const cSinIva = costoSinIva ? Number(costoSinIva) : Number(precio) * 0.75;
      const cConIva = costoConIva ? Number(costoConIva) : cSinIva * 1.13;

      const payload = {
        codigo: finalCodigo,
        nombre,
        categoriaId: Number(categoriaId),
        precioFinal: Number(precio),
        costoSinIva: Number(cSinIva.toFixed(2)),
        costoConIva: Number(cConIva.toFixed(2)),
        stockActual: Number(stockInicial || 0),
        stockMinimo: Number(stockMinimo || 5),
        descripcion,
        imagenUrl,
      };

      const res = await api.post('/repuestos', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });

      Swal.fire({
        icon: 'success',
        title: 'Producto Guardado',
        text: 'El repuesto ha sido registrado correctamente en el catálogo.',
        timer: 1500,
        showConfirmButton: false,
      });

      // Reset form
      setCodigo('');
      setNombre('');
      setCategoriaId('');
      setPrecio('');
      setCostoSinIva('');
      setCostoConIva('');
      setStockInicial('');
      setStockMinimo(5);
      setDescripcion('');
      setSelectedFile(null);
    },
    onError: (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar producto',
        text: err.response?.data?.message || 'Error en los datos suministrados',
      });
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;
    createCatMutation.mutate();
  };

  const handleDeleteCategory = (id: number, nombreCat: string) => {
    Swal.fire({
      title: '¿Eliminar Categoría?',
      text: `¿Seguro que deseas eliminar "${nombreCat}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#1B2237',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCatMutation.mutate(id);
      }
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !categoriaId || !precio) {
      Swal.fire({ icon: 'warning', title: 'Campos Obligatorios', text: 'Nombre, Categoría y Precio son obligatorios.' });
      return;
    }
    createProductMutation.mutate();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Categorías Section */}
      <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#FFB800] flex items-center space-x-2">
            <Tag className="w-5 h-5" />
            <span>Gestión de Categorías</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Organiza los tipos de productos del taller</p>
        </div>

        {/* Create Category Bar matching screenshot */}
        <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ej: Aceites, Llantas..."
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            className="flex-1 bg-[#1B2237] border border-[#26314D] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C897]"
            required
          />
          <button
            type="submit"
            disabled={createCatMutation.isPending}
            className="bg-[#00C897] hover:bg-[#00B084] text-slate-950 font-bold px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar</span>
          </button>
        </form>

        {/* Categories Table matching screenshot */}
        <div className="overflow-x-auto border border-[#222D46] rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1B2237] text-slate-400 uppercase tracking-wider border-b border-[#222D46]">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">NOMBRE DE LA CATEGORÍA</th>
                <th className="py-3 px-4 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222D46]">
              {categorias && categorias.length > 0 ? (
                categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#1B2237]/40">
                    <td className="py-3 px-4 font-bold text-[#FFB800]">#{cat.id}</td>
                    <td className="py-3 px-4 font-semibold text-white">{cat.nombre}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.nombre)}
                        className="bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/40 font-semibold px-3 py-1 rounded-md flex items-center space-x-1 ml-auto transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">
                    No hay categorías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Registrar Nuevo Producto Section matching screenshot */}
      <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-2 text-[#FFB800]">
          <PackagePlus className="w-6 h-6" />
          <h2 className="text-xl font-bold">Registrar Nuevo Producto</h2>
        </div>

        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Código (Opcional):</label>
              <input
                type="text"
                placeholder="Ej: LUB-10W30"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre del Producto *:</label>
              <input
                type="text"
                placeholder="Ej: Aceite 10W30"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoría *:</label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(Number(e.target.value))}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                required
              >
                <option value="">-- Seleccionar --</option>
                {categorias?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Precio Venta ($) *:</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(parseFloat(e.target.value) || '')}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Costo sin IVA ($):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Calculado auto..."
                value={costoSinIva}
                onChange={(e) => setCostoSinIva(parseFloat(e.target.value) || '')}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Costo con IVA ($):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Calculado auto..."
                value={costoConIva}
                onChange={(e) => setCostoConIva(parseFloat(e.target.value) || '')}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stock Inicial:</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={stockInicial}
                onChange={(e) => setStockInicial(parseInt(e.target.value) || '')}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stock Mínimo (Alerta):</label>
              <input
                type="number"
                min="1"
                placeholder="5"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(parseInt(e.target.value) || '')}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Descripción del Producto:</label>
              <textarea
                placeholder="Detalles del producto..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Imagen del Producto (Cloudinary):</label>
              <div className="bg-[#1B2237] border border-[#26314D] rounded-lg p-3 flex flex-col justify-center items-center h-[88px] text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="text-slate-300 text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#141A29] file:text-[#00C897] hover:file:bg-[#26314D]"
                />
                <p className="text-[10px] text-slate-500 mt-1">Formata: JPG, PNG, WEBP</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={createProductMutation.isPending}
            className="w-full bg-[#00C897] hover:bg-[#00B084] text-slate-950 font-extrabold text-sm py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-lg"
          >
            <Upload className="w-4 h-4" />
            <span>{createProductMutation.isPending ? 'GUARDANDO PRODUCTO...' : 'GUARDAR PRODUCTO'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
