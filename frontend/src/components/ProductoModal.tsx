import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Upload, PackagePlus, Edit2, AlertCircle, Sparkles } from 'lucide-react';
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

  // Estados del formulario
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

  // Obtener categorías
  const { data: categorias } = useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias');
      return res.data;
    },
    enabled: isOpen,
  });

  // Cargar datos si es edición o limpiar si es nuevo
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

  // Manejo de cálculo automático de IVA
  const handleCostoSinIvaChange = (val: string) => {
    const num = parseFloat(val);
    setCostoSinIva(val === '' ? '' : num);
    if (!isNaN(num) && num > 0) {
      setCostoConIva(parseFloat((num * 1.13).toFixed(2)));
    } else {
      setCostoConIva('');
    }
  };

  const handleGenerarCodigo = () => {
    const randomCode = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    setCodigo(randomCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo Requerido', text: 'El nombre del repuesto es obligatorio.' });
      return;
    }

    if (!categoriaId) {
      Swal.fire({ icon: 'warning', title: 'Campo Requerido', text: 'Debes seleccionar una categoría.' });
      return;
    }

    if (precio === '' || Number(precio) <= 0) {
      Swal.fire({ icon: 'warning', title: 'Campo Requerido', text: 'El precio de venta debe ser mayor a 0.' });
      return;
    }

    try {
      setIsSubmitting(true);

      let finalImageUrl = currentImageUrl;

      // Si seleccionó archivo nuevo, subir a Cloudinary
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        try {
          const uploadRes = await api.post('/repuestos/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadRes.data?.url) {
            finalImageUrl = uploadRes.data.url;
          }
        } catch (uploadErr) {
          console.warn('Fallo upload a Cloudinary, continuando sin imagen nueva:', uploadErr);
        }
      }

      // Código final
      const finalCodigo = codigo.trim() || `REP-${Math.floor(1000 + Math.random() * 9000)}`;

      const cSinIva = costoSinIva !== '' ? Number(costoSinIva) : Number(precio) * 0.7;
      const cConIva = costoConIva !== '' ? Number(costoConIva) : cSinIva * 1.13;

      const payload = {
        codigo: finalCodigo,
        nombre: nombre.trim(),
        categoriaId: Number(categoriaId),
        precioFinal: Number(Number(precio).toFixed(2)),
        costoSinIva: Number(Number(cSinIva).toFixed(2)),
        costoConIva: Number(Number(cConIva).toFixed(2)),
        stockActual: Number(stockActual || 0),
        stockMinimo: Number(stockMinimo || 5),
        descripcion: descripcion.trim(),
        imagenUrl: finalImageUrl || null,
      };

      if (isEditing && repuestoToEdit) {
        await api.put(`/repuestos/${repuestoToEdit.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Repuesto Actualizado',
          text: `"${nombre}" fue modificado correctamente.`,
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        await api.post('/repuestos', payload);
        Swal.fire({
          icon: 'success',
          title: 'Repuesto Registrado',
          text: `"${nombre}" fue agregado al inventario.`,
          timer: 1800,
          showConfirmButton: false,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al guardar repuesto:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al procesar',
        text: err.response?.data?.message || 'Ocurrió un error al guardar el repuesto en el catálogo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0D111D] border border-[#222D46] rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222D46]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-xl text-[#FFB800]">
              {isEditing ? <Edit2 className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                {isEditing ? 'Editar Producto / Repuesto' : 'Registrar Nuevo Producto'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? `Modificando existencias y datos de ${repuestoToEdit?.codigo}`
                  : 'Ingresa los datos para incorporar el artículo al inventario general'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1B2237] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Código */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Código / SKU</span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleGenerarCodigo}
                    className="text-[11px] text-[#FFB800] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-generar</span>
                  </button>
                )}
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej. REP-1029"
                className="w-full bg-[#1B2237] border border-[#222D46] focus:border-[#FFB800] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors uppercase font-mono"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoría <span className="text-red-400">*</span>
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full bg-[#1B2237] border border-[#222D46] focus:border-[#FFB800] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
              >
                <option value="">-- Seleccionar Categoría --</option>
                {categorias?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nombre del Producto */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre del Repuesto / Insumo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Aceite Sintético 5W-30 Full Sintético"
              required
              className="w-full bg-[#1B2237] border border-[#222D46] focus:border-[#FFB800] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
            />
          </div>

          {/* Precios y Costos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Precio de Venta ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                required
                className="w-full bg-[#1B2237] border border-[#222D46] focus:border-[#FFB800] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Costo sin IVA ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costoSinIva}
                onChange={(e) => handleCostoSinIvaChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#1B2237] border border-[#222D46] focus:border-[#FFB800] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Costo con IVA (13%) ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costoConIva}
                onChange={(e) => setCostoConIva(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                className="w-full bg-[#1B2237] border border-[#222D46] focus:border-[#FFB800] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Stock Actual y Stock Mínimo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stock {isEditing ? 'Actual' : 'Inicial'} (Unidades)
              </label>
              <input
                type="number"
                min="0"
                value={stockActual}
                onChange={(e) => setStockActual(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="0"
                className="w-full bg-[#1B2237] border border-[#222D46] focus:border-[#FFB800] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Stock Mínimo (Alerta)</span>
                <span className="text-[11px] text-amber-400">Umbral de aviso</span>
              </label>
              <input
                type="number"
                min="1"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="5"
                className="w-full bg-[#1B2237] border border-[#222D46] focus:border-[#FFB800] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción o Compatibilidad (Opcional)
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Especificaciones técnicas, compatibilidad de vehículos o notas del taller..."
              className="w-full bg-[#1B2237] border border-[#222D46] focus:border-[#FFB800] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
            />
          </div>

          {/* Imagen (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Imagen del Producto (Opcional)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex-1 flex items-center justify-center space-x-2 bg-[#1B2237] hover:bg-[#26314D] border border-dashed border-[#222D46] hover:border-[#FFB800] rounded-xl py-3 px-4 cursor-pointer transition-colors text-xs text-slate-400">
                <Upload className="w-4 h-4 text-[#FFB800]" />
                <span>{selectedFile ? selectedFile.name : 'Subir foto o comprobante visual'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {(selectedFile || currentImageUrl) && (
                <div className="w-12 h-12 rounded-lg border border-[#222D46] bg-[#1B2237] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : currentImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-[#222D46] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[#222D46] hover:bg-[#1B2237] text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#00C897] hover:bg-[#00B084] text-slate-950 text-sm font-extrabold shadow-lg transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : isEditing ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              ) : (
                <>
                  <PackagePlus className="w-4 h-4" />
                  <span>Registrar Producto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
