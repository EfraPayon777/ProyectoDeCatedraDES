import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Tag, Plus, Edit2, Trash2, Boxes, ArrowRight, Layers, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Categoria } from '../types';
import Swal from 'sweetalert2';

export const CategoriasProductos: React.FC = () => {
  const queryClient = useQueryClient();

  // Estado para Categoría
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [filtro, setFiltro] = useState('');

  // Consultas
  const { data: categorias, isLoading } = useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias');
      return res.data;
    },
  });

  // Mutación crear categoría
  const createCatMutation = useMutation({
    mutationFn: async (nombre: string) => {
      const res = await api.post('/categorias', { nombre: nombre.trim() });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setNuevaCategoria('');
      Swal.fire({
        icon: 'success',
        title: 'Categoría Creada',
        text: 'La categoría fue registrada exitosamente.',
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear',
        text: err.response?.data?.message || 'No se pudo crear la categoría.',
      });
    },
  });

  // Mutación editar categoría
  const updateCatMutation = useMutation({
    mutationFn: async ({ id, nombre }: { id: number; nombre: string }) => {
      const res = await api.put(`/categorias/${id}`, { nombre: nombre.trim() });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['repuestos-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['inventario-stock'] });
      Swal.fire({
        icon: 'success',
        title: 'Categoría Actualizada',
        text: 'El nombre de la categoría fue modificado con éxito.',
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: err.response?.data?.message || 'No se pudo actualizar la categoría.',
      });
    },
  });

  // Mutación eliminar categoría
  const deleteCatMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categorias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['repuestos-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['inventario-stock'] });
      Swal.fire({
        icon: 'success',
        title: 'Categoría Eliminada',
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'No se puede eliminar',
        text: err.response?.data?.message || 'La categoría tiene repuestos asociados.',
      });
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;
    createCatMutation.mutate(nuevaCategoria);
  };

  const handleEditCategory = (cat: Categoria) => {
    Swal.fire({
      title: 'Editar Categoría',
      text: 'Modifica el nombre de la categoría:',
      input: 'text',
      inputValue: cat.nombre,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00C897',
      cancelButtonColor: '#1B2237',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'El nombre de la categoría no puede estar vacío.';
        }
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        updateCatMutation.mutate({ id: cat.id, nombre: result.value });
      }
    });
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

  const categoriasFiltradas = categorias?.filter((c) =>
    c.nombre.toLowerCase().includes(filtro.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFB800] flex items-center space-x-2">
            <Tag className="w-7 h-7" />
            <span>Gestión de Categorías</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Administra, edita y organiza las clasificaciones del catálogo del taller
          </p>
        </div>

        {/* Acceso directo a Inventario para registrar repuestos */}
        <Link
          to="/inventario"
          className="bg-[#1B2237] hover:bg-[#26314D] border border-[#222D46] hover:border-[#FFB800] text-slate-200 font-bold px-4 py-2 rounded-lg flex items-center space-x-2 text-xs transition-colors shadow-lg"
        >
          <Boxes className="w-4 h-4 text-[#FFB800]" />
          <span>Gestionar Productos en Inventario</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Agregar Categoría (Col 1) */}
        <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl space-y-5 h-fit">
          <div className="flex items-center space-x-2 text-[#00C897]">
            <Layers className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">Nueva Categoría</h2>
          </div>
          <p className="text-xs text-slate-400">
            Crea una nueva clasificación para agrupar aceites, filtros, repuestos o herramientas.
          </p>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de la Categoría <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Baterías, Amortiguadores..."
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C897] transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createCatMutation.isPending || !nuevaCategoria.trim()}
              className="w-full bg-[#00C897] hover:bg-[#00B084] text-slate-950 font-bold px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-sm shadow-lg disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{createCatMutation.isPending ? 'Creando...' : 'Crear Categoría'}</span>
            </button>
          </form>

          {/* Tips Card */}
          <div className="p-4 bg-[#1B2237]/60 border border-[#222D46] rounded-xl space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5 text-[#FFB800] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Organización del Taller</span>
            </div>
            <p>
              Las categorías permiten a los mecánicos y jefes de pista filtrar piezas rápidamente en el punto de venta y catálogo.
            </p>
          </div>
        </div>

        {/* Tabla y Listado de Categorías (Col 2 & 3) */}
        <div className="lg:col-span-2 bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Listado de Categorías</span>
                <span className="text-xs bg-[#1B2237] text-[#FFB800] px-2 py-0.5 rounded-full border border-[#222D46]">
                  {categorias?.length || 0} registradas
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Edita o elimina las categorías existentes según la operativa
              </p>
            </div>

            {/* Buscador de Categorías */}
            <input
              type="text"
              placeholder="Filtrar categorías..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full sm:w-56 bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800]"
            />
          </div>

          {/* Tabla de Categorías con Editar y Eliminar */}
          <div className="overflow-x-auto border border-[#222D46] rounded-lg">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-[#1B2237] text-slate-400 uppercase tracking-wider border-b border-[#222D46]">
                <tr>
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">NOMBRE DE LA CATEGORÍA</th>
                  <th className="py-3 px-4 text-right w-44">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222D46]">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      Cargando categorías...
                    </td>
                  </tr>
                ) : categoriasFiltradas && categoriasFiltradas.length > 0 ? (
                  categoriasFiltradas.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#1B2237]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#FFB800]">#{cat.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{cat.nombre}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Botón Editar Categoría */}
                          <button
                            onClick={() => handleEditCategory(cat)}
                            title="Editar nombre de la categoría"
                            className="bg-transparent hover:bg-blue-500/10 text-blue-400 border border-blue-500/40 hover:border-blue-400 font-semibold px-2.5 py-1 rounded-md flex items-center space-x-1 transition-colors cursor-pointer text-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          {/* Botón Eliminar Categoría */}
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.nombre)}
                            title="Eliminar categoría"
                            className="bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/40 hover:border-red-400 font-semibold px-2.5 py-1 rounded-md flex items-center space-x-1 transition-colors cursor-pointer text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No se encontraron categorías registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
