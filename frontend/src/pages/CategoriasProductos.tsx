import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Tag, Plus, Edit2, Trash2, Boxes, ArrowRight, FolderPlus } from 'lucide-react';
import api from '../services/api';
import { Categoria } from '../types';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { showApiError } from '../services/apiErrors';
import { validarTexto } from '../utils/validators';

const MAX_NOMBRE_CATEGORIA = 100;
const validarNombreCategoria = (value: string) =>
  validarTexto(value, 'El nombre de la categoría', MAX_NOMBRE_CATEGORIA);

export const CategoriasProductos: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const puedeCrear = hasPermission('catalogo.create');
  const puedeEditar = hasPermission('catalogo.edit');
  const puedeEliminar = hasPermission('catalogo.delete');
  const puedeGestionar = puedeCrear; // formulario "Registrar Nueva Categoría"

  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [errorNombre, setErrorNombre] = useState<string | undefined>();
  const [filtro, setFiltro] = useState('');

  const { data: categorias, isLoading } = useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias');
      return res.data;
    },
  });

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
        title: 'Categoría creada',
        text: 'La categoría fue registrada satisfactoriamente.',
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err: any) => {
      showApiError(err, 'Error de registro', 'No se pudo crear la categoría.');
    },
  });

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
        title: 'Categoría actualizada',
        text: 'Los cambios fueron guardados.',
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err: any) => {
      showApiError(err, 'Error de actualización', 'No se pudo modificar la categoría.');
    },
  });

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
        title: 'Categoría eliminada',
        timer: 1400,
        showConfirmButton: false,
      });
    },
    onError: (err: any) => {
      showApiError(err, 'Operación restringida', 'La categoría contiene repuestos vinculados.');
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validarNombreCategoria(nuevaCategoria);
    setErrorNombre(error);
    if (error) return;
    createCatMutation.mutate(nuevaCategoria);
  };

  const handleEditCategory = (cat: Categoria) => {
    Swal.fire({
      title: 'Editar Categoría',
      text: 'Ingrese la nueva denominación:',
      input: 'text',
      inputValue: cat.nombre,
      inputAttributes: { maxlength: String(MAX_NOMBRE_CATEGORIA) },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#334155',
      inputValidator: (value) => validarNombreCategoria(value || '') ?? null,
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        updateCatMutation.mutate({ id: cat.id, nombre: result.value });
      }
    });
  };

  const handleDeleteCategory = (id: number, nombreCat: string) => {
    Swal.fire({
      title: '¿Confirmar eliminación?',
      text: `Se eliminará la clasificación "${nombreCat}". Asegúrese de que no tenga repuestos activos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#334155',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Clasificación de Repuestos y Categorías</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organización del catálogo para búsquedas rápidas en ventas e inventario
          </p>
        </div>

        <Link
          to="/inventario"
          className="bg-[#182032] hover:bg-[#202b42] text-slate-200 border border-slate-700/80 font-medium px-3.5 py-2 rounded-lg flex items-center space-x-2 text-xs shadow-sm transition-all"
        >
          <Boxes className="w-4 h-4 text-amber-400" />
          <span>Ir al Catálogo de Inventario</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {puedeGestionar && (
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <div className="flex items-center space-x-2 text-slate-200 pb-2 border-b border-slate-800">
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold">Registrar Nueva Categoría</h2>
          </div>
          <p className="text-xs text-slate-400">
            Agrupe insumos por familia técnica (por ejemplo: Aceites de Motor, Filtros, Sistema de Frenos).
          </p>

          <form onSubmit={handleCreateCategory} noValidate className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre de la categoría *
              </label>
              <input
                type="text"
                placeholder="Ej. Baterías y Encendido"
                value={nuevaCategoria}
                onChange={(e) => {
                  setNuevaCategoria(e.target.value);
                  setErrorNombre(undefined);
                }}
                maxLength={MAX_NOMBRE_CATEGORIA}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
              {errorNombre && <p className="mt-1 text-[10px] text-rose-400">{errorNombre}</p>}
            </div>

            <button
              type="submit"
              disabled={createCatMutation.isPending || !nuevaCategoria.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{createCatMutation.isPending ? 'Guardando...' : 'Agregar Categoría'}</span>
            </button>
          </form>
        </div>
        )}

        <div className={`${puedeGestionar ? 'lg:col-span-2' : 'lg:col-span-3'} bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Categorías Registradas</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  {categorias?.length || 0}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Gestione las clasificaciones activas del taller
              </p>
            </div>

            <input
              type="text"
              placeholder="Buscar categoría..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full sm:w-52 bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#182032] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3.5 w-16">ID</th>
                  <th className="py-2.5 px-3.5">Nombre</th>
                  {(puedeEditar || puedeEliminar) && <th className="py-2.5 px-3.5 text-right w-36">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={puedeEditar || puedeEliminar ? 3 : 2} className="py-8 text-center text-slate-500">
                      Cargando clasificaciones...
                    </td>
                  </tr>
                ) : categoriasFiltradas && categoriasFiltradas.length > 0 ? (
                  categoriasFiltradas.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-slate-400">#{cat.id}</td>
                      <td className="py-2.5 px-3.5 font-medium text-slate-100">{cat.nombre}</td>
                      {(puedeEditar || puedeEliminar) && (
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {puedeEditar && (
                          <button
                            onClick={() => handleEditCategory(cat)}
                            title="Editar denominación"
                            className="p-1.5 bg-[#182032] hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 rounded border border-slate-700/80 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          )}

                          {puedeEliminar && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.nombre)}
                            title="Eliminar categoría"
                            className="p-1.5 bg-[#182032] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded border border-slate-700/80 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          )}
                        </div>
                      </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={puedeEditar || puedeEliminar ? 3 : 2} className="py-6 text-center text-slate-500">
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
