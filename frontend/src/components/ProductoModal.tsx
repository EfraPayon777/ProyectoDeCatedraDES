import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Upload, PackagePlus, Edit2, Sparkles, Info } from 'lucide-react';
import api from '../services/api';
import { Repuesto, Categoria } from '../types';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { AccessDenied } from './RequirePermission';
import { showApiError } from '../services/apiErrors';
import { formatMoney } from '../utils/format';
import {
  CODIGO_REPUESTO_REGEX,
  FieldErrors,
  MAX_MONTO,
  MAX_STOCK,
  hasErrors,
  validarNumero,
  validarTexto,
} from '../utils/validators';

type CampoProducto =
  | 'codigo'
  | 'nombre'
  | 'categoriaId'
  | 'precio'
  | 'costoSinIva'
  | 'costoConIva'
  | 'stockActual'
  | 'stockMinimo'
  | 'descripcion';

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-[10px] text-rose-400">{message}</p> : null;

const inputClass = (error?: string) =>
  `w-full bg-[#182032] border rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 ${
    error
      ? 'border-rose-500/70 focus:ring-rose-500/30 focus:border-rose-500'
      : 'border-slate-700/80 focus:ring-amber-500/30 focus:border-amber-500'
  }`;

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  repuestoToEdit?: Repuesto | null;
  onSuccess: (saved?: Repuesto) => void;
}

export const ProductoModal: React.FC<ProductoModalProps> = ({
  isOpen,
  onClose,
  repuestoToEdit,
  onSuccess,
}) => {
  const isEditing = Boolean(repuestoToEdit);
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

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
  const [errors, setErrors] = useState<FieldErrors<CampoProducto>>({});
  const [sinIvaTouched, setSinIvaTouched] = useState(false);
  const [conIvaTouched, setConIvaTouched] = useState(false);

  const { data: categorias } = useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias');
      return res.data;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    setErrors({});
    setSinIvaTouched(false);
    setConIvaTouched(false);
    if (repuestoToEdit) {
      setCodigo(repuestoToEdit.codigo || '');
      setNombre(repuestoToEdit.nombre || '');
      setCategoriaId(repuestoToEdit.categoriaId || (repuestoToEdit.categoria?.id ?? ''));
      setCostoSinIva(repuestoToEdit.costoSinIva !== null && repuestoToEdit.costoSinIva !== undefined ? Number(repuestoToEdit.costoSinIva) : '');
      setCostoConIva(repuestoToEdit.costoConIva !== null && repuestoToEdit.costoConIva !== undefined ? Number(repuestoToEdit.costoConIva) : '');
      setPrecio(repuestoToEdit.precioFinal !== null && repuestoToEdit.precioFinal !== undefined ? Number(repuestoToEdit.precioFinal) : '');
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

  if (!hasPermission(isEditing ? 'catalogo.edit' : 'catalogo.create')) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="relative w-full max-w-md bg-[#111726] border border-slate-800 rounded-xl shadow-xl text-slate-100">
          <button onClick={onClose} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
          <AccessDenied />
        </div>
      </div>
    );
  }

  const clearError = (campo: CampoProducto) => setErrors((prev) => ({ ...prev, [campo]: undefined }));

  const handleCostoSinIvaChange = (val: string) => {
    setCostoSinIva(val === '' ? '' : parseFloat(val));
    setSinIvaTouched(true);
    if (!conIvaTouched) setCostoConIva('');
    clearError('costoSinIva');
  };

  const handleCostoConIvaChange = (val: string) => {
    setCostoConIva(val === '' ? '' : parseFloat(val));
    setConIvaTouched(true);
    if (!sinIvaTouched) setCostoSinIva('');
    clearError('costoConIva');
  };

  const validar = (): FieldErrors<CampoProducto> => {
    const e: FieldErrors<CampoProducto> = {};
    const cod = codigo.trim();
    if (!cod) e.codigo = 'El código es obligatorio (puede usar "Auto").';
    else if (cod.length > 30) e.codigo = 'El código no debe superar 30 caracteres.';
    else if (!CODIGO_REPUESTO_REGEX.test(cod)) e.codigo = 'El código solo admite letras, números, guion (-), guion bajo (_) y punto (.).';
    e.nombre = validarTexto(nombre, 'El nombre', 150);
    if (!categoriaId) e.categoriaId = 'Seleccione una categoría.';
    e.precio = validarNumero(precio, 'El precio de venta', { min: 0, minExclusivo: true, max: MAX_MONTO });
    e.costoSinIva = validarNumero(costoSinIva, 'El costo sin IVA', { obligatorio: false, max: MAX_MONTO });
    e.costoConIva = validarNumero(costoConIva, 'El costo con IVA', { obligatorio: false, max: MAX_MONTO });
    e.stockActual = validarNumero(stockActual, 'La existencia', { entero: true, max: MAX_STOCK });
    e.stockMinimo = validarNumero(stockMinimo, 'El stock mínimo', { obligatorio: false, entero: true, max: MAX_STOCK });
    e.descripcion = validarTexto(descripcion, 'La descripción', 1000, false);
    return e;
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
    setErrors((prev) => ({ ...prev, codigo: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validar();
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
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
        codigo: codigo.trim(),
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

      const res =
        isEditing && repuestoToEdit
          ? await api.put<Repuesto>(`/repuestos/${repuestoToEdit.id}`, payload)
          : await api.post<Repuesto>('/repuestos', payload);
      const saved = res.data;

      if (saved?.id) {
        queryClient.setQueryData(['repuesto', saved.id], saved);
      }
      Swal.fire({
        icon: 'success',
        title: isEditing ? 'Repuesto actualizado' : 'Repuesto registrado',
        html: `"${saved?.nombre ?? nombre.trim()}" ${isEditing ? 'fue modificado correctamente' : 'fue incorporado al catálogo'}.<br/>
          <span style="font-size:12px;opacity:.8">Costo sin IVA: ${formatMoney(saved?.costoSinIva)} · Costo con IVA: ${formatMoney(saved?.costoConIva)}</span>`,
        timer: 2600,
        showConfirmButton: false,
      });

      onSuccess(saved);
      onClose();
    } catch (err: any) {
      showApiError(err, 'Error al guardar', 'No se pudo guardar el repuesto en el catálogo.');
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

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-300">Código SKU *</label>
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
                onChange={(e) => {
                  setCodigo(e.target.value.toUpperCase());
                  clearError('codigo');
                }}
                placeholder="REP-XXXX"
                maxLength={30}
                className={`${inputClass(errors.codigo)} font-mono uppercase`}
              />
              <FieldError message={errors.codigo} />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Categoría *
              </label>
              <select
                value={categoriaId}
                onChange={(e) => {
                  setCategoriaId(e.target.value ? Number(e.target.value) : '');
                  clearError('categoriaId');
                }}
                required
                className={inputClass(errors.categoriaId)}
              >
                <option value="">-- Seleccionar --</option>
                {categorias?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <FieldError message={errors.categoriaId} />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Nombre o Denominación del Repuesto *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                clearError('nombre');
              }}
              placeholder="Ej. Aceite Sintético 5W-30 (1 Galón)"
              required
              maxLength={150}
              className={inputClass(errors.nombre)}
            />
            <FieldError message={errors.nombre} />
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
                onChange={(e) => {
                  setPrecio(e.target.value === '' ? '' : parseFloat(e.target.value));
                  clearError('precio');
                }}
                placeholder="0.00"
                required
                className={`${inputClass(errors.precio)} font-mono font-bold`}
              />
              <FieldError message={errors.precio} />
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
                placeholder="Auto"
                className={`${inputClass(errors.costoSinIva)} font-mono`}
              />
              <FieldError message={errors.costoSinIva} />
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
                onChange={(e) => handleCostoConIvaChange(e.target.value)}
                placeholder="Auto"
                className={`${inputClass(errors.costoConIva)} font-mono`}
              />
              <FieldError message={errors.costoConIva} />
            </div>
          </div>
          <p className="flex items-start gap-1.5 text-[10px] text-slate-400 -mt-1">
            <Info className="w-3 h-3 shrink-0 mt-px text-amber-400" />
            <span>
              Puede ingresar uno de los costos (o ninguno): el sistema calcula el otro automáticamente con IVA 13% al
              guardar. Si deja ambos vacíos, se toma el precio de venta como base.
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Existencias {isEditing ? 'Actuales' : 'Iniciales'}
              </label>
              <input
                type="number"
                min="0"
                value={stockActual}
                step="1"
                onChange={(e) => {
                  setStockActual(e.target.value === '' ? '' : Number(e.target.value));
                  clearError('stockActual');
                }}
                placeholder="0"
                className={`${inputClass(errors.stockActual)} font-mono`}
              />
              <FieldError message={errors.stockActual} />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Stock Mínimo (Umbral de Alerta)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stockMinimo}
                onChange={(e) => {
                  setStockMinimo(e.target.value === '' ? '' : Number(e.target.value));
                  clearError('stockMinimo');
                }}
                placeholder="5"
                className={`${inputClass(errors.stockMinimo)} font-mono`}
              />
              <FieldError message={errors.stockMinimo} />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Descripción o Compatibilidad
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                clearError('descripcion');
              }}
              placeholder="Especificaciones o compatibilidad vehicular..."
              maxLength={1000}
              className={inputClass(errors.descripcion)}
            />
            <FieldError message={errors.descripcion} />
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
