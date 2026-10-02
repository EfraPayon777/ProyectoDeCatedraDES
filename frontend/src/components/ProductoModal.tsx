import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Upload, PackagePlus, Edit2, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Repuesto, Categoria } from '../types';
import Swal from 'sweetalert2';

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  repuestoToEdit?: Repuesto | null;
  onSuccess: () => void;
}

export const ProductoModal: React.FC<ProductoModalProps> = ({
  isOpen,
  onClose,
  repuestoToEdit,
  onSuccess,
}) => {
  const isEditing = Boolean(repuestoToEdit);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [costoSinIva, setCostoSinIva] = useState<number | ''>('');
  const [costoConIva, setCostoConIva] = useState<number | ''>('');
  const [stockActual, setStockActual] = useState<number | ''>('');
  const [stockMinimo, setStockMinimo] = useState<number | ''>(5);
  const [descripcion, setDescripcion] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categorias } = useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias');
      return res.data;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (repuestoToEdit) {
      setCodigo(repuestoToEdit.codigo || '');
      setNombre(repuestoToEdit.nombre || '');
      setCategoriaId(repuestoToEdit.categoriaId || (repuestoToEdit.categoria?.id ?? ''));
      setPrecio(repuestoToEdit.precioFinal ?? '');
      setCostoSinIva(repuestoToEdit.costoSinIva ?? '');
      setCostoConIva(repuestoToEdit.costoConIva ?? '');
      setStockActual(repuestoToEdit.stockActual ?? 0);
      setStockMinimo(repuestoToEdit.stockMinimo ?? 5);
      setDescripcion(repuestoToEdit.descripcion || '');
      setCurrentImageUrl(repuestoToEdit.imagenUrl || '');
      setSelectedFile(null);
    } else {
      setCodigo('');
      setNombre('');
      setCategoriaId('');
      setPrecio('');
      setCostoSinIva('');
      setCostoConIva('');
      setStockActual(0);
      setStockMinimo(5);
      setDescripcion('');
      setCurrentImageUrl('');
      setSelectedFile(null);
    }
  }, [repuestoToEdit, isOpen]);

  if (!isOpen) return null;

  const handleCostoSinIvaChange = (val: string) => {
    const num = parseFloat(val);
    setCostoSinIva(val === '' ? '' : num);
    if (!isNaN(num) && num > 0) {
      setCostoConIva(parseFloat((num * 1.13).toFixed(2)));
    } else {
      setCostoConIva('');
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/') || file.size < 150 * 1024) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 900;
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressed);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.75,
          );
        };
      };
    });
  };

  const handleGenerarCodigo = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setCodigo(`REP-${randomNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Ingrese el nombre del repuesto.' });
      return;
    }
    if (!categoriaId) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Seleccione una categoría.' });
      return;
    }
    if (precio === '' || Number(precio) <= 0) {
      Swal.fire({ icon: 'warning', title: 'Precio no válido', text: 'El precio de venta debe ser mayor a 0.' });
      return;
    }

    setIsSubmitting(true);
    try {
      let imagenUrl = currentImageUrl;

      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          const uploadRes = await api.post('/repuestos/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadRes.data && uploadRes.data.url) {
            imagenUrl = uploadRes.data.url;
          }
        } catch {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
          imagenUrl = base64;
        }
      }

      const payload = {
        codigo: codigo.trim() || undefined,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        precioFinal: Number(precio),
        costoSinIva: costoSinIva !== '' ? Number(costoSinIva) : 0,
        costoConIva: costoConIva !== '' ? Number(costoConIva) : 0,
        stockActual: stockActual !== '' ? Number(stockActual) : 0,
        stockMinimo: stockMinimo !== '' ? Number(stockMinimo) : 5,
        categoriaId: Number(categoriaId),
        imagenUrl: imagenUrl || undefined,
      };

      if (isEditing && repuestoToEdit) {
        await api.put(`/repuestos/${repuestoToEdit.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Repuesto actualizado',
          text: `"${nombre}" fue modificado correctamente.`,
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        await api.post('/repuestos', payload);
        Swal.fire({
          icon: 'success',
          title: 'Repuesto registrado',
          text: `"${nombre}" fue incorporado al catálogo.`,
          timer: 1600,
          showConfirmButton: false,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err.response?.data?.message || 'No se pudo guardar el repuesto en el catálogo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#111726] border border-slate-800 rounded-xl shadow-xl p-5 sm:p-6 my-6 text-slate-100">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {isEditing ? <Edit2 className="w-4 h-4" /> : <PackagePlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Modificar Repuesto' : 'Registrar Nuevo Repuesto'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEditing ? `Editando ficha de SKU: ${repuestoToEdit?.codigo}` : 'Complete la información para añadirlo al inventario'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-300">Código SKU</label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleGenerarCodigo}
                    className="text-[10px] text-amber-400 hover:underline flex items-center space-x-0.5 cursor-pointer font-medium"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="REP-XXXX"
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Categoría *
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                <option value="">-- Seleccionar --</option>
                {categorias?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Nombre o Denominación del Repuesto *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Aceite Sintético 5W-30 (1 Galón)"
              required
              className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Precio de Venta ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                required
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Costo sin IVA ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costoSinIva}
                onChange={(e) => handleCostoSinIvaChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Costo con IVA (13%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costoConIva}
                onChange={(e) => setCostoConIva(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Existencias {isEditing ? 'Actuales' : 'Iniciales'}
              </label>
              <input
                type="number"
                min="0"
                value={stockActual}
                onChange={(e) => setStockActual(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="0"
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Stock Mínimo (Umbral de Alerta)
              </label>
              <input
                type="number"
                min="1"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="5"
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Descripción o Compatibilidad
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Especificaciones o compatibilidad vehicular..."
              className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Fotografía del Repuesto
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex-1 flex items-center justify-center space-x-2 bg-[#182032] hover:bg-[#202b42] border border-dashed border-slate-700 hover:border-amber-500 rounded-lg py-2.5 px-3 cursor-pointer transition-colors text-slate-400">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedFile ? selectedFile.name : 'Adjuntar fotografía'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const compressed = await compressImage(file);
                      setSelectedFile(compressed);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {(selectedFile || currentImageUrl) && (
                <div className="w-10 h-10 rounded border border-slate-700 bg-[#182032] overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : currentImageUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-lg border border-slate-700 hover:bg-slate-700/60 text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : isEditing ? (
                <>
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Guardar Modificaciones</span>
                </>
              ) : (
                <>
                  <PackagePlus className="w-3.5 h-3.5" />
                  <span>Registrar Repuesto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
