import React from 'react';
import {
  X,
  Tag,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  FileText,
  PlusCircle,
  Edit2,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { Repuesto } from '../types';

interface ProductoPreviewModalProps {
  repuesto: Repuesto | null;
  onClose: () => void;
  onEdit?: (repuesto: Repuesto) => void;
  onAddStock?: (repuesto: Repuesto) => void;
}

export const ProductoPreviewModal: React.FC<ProductoPreviewModalProps> = ({
  repuesto,
  onClose,
  onEdit,
  onAddStock,
}) => {
  if (!repuesto) return null;

  const isOut = repuesto.stockActual <= 0;
  const isLow = repuesto.stockActual > 0 && repuesto.stockActual <= repuesto.stockMinimo;

  const precio = Number(repuesto.precioFinal || 0);
  const costoConIva = Number(repuesto.costoConIva || 0);
  const costoSinIva = Number(repuesto.costoSinIva || 0);
  const ganancia = precio - costoConIva;
  const margenPorcentaje = costoConIva > 0 ? ((ganancia / costoConIva) * 100).toFixed(1) : '0';

  // Porcentaje para la barra de stock (relativo al stock mínimo o tope de 20)
  const stockRatio = repuesto.stockMinimo > 0
    ? Math.min(100, Math.round((repuesto.stockActual / (repuesto.stockMinimo * 2)) * 100))
    : Math.min(100, repuesto.stockActual * 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0D111D] border border-[#222D46] rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Header con gradiente sutil */}
        <div className="bg-gradient-to-r from-[#141A29] to-[#1B2237] px-6 py-4 border-b border-[#222D46] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 bg-[#FFB800]/15 border border-[#FFB800]/30 rounded-lg text-[#FFB800] font-mono font-bold text-sm tracking-wider flex items-center space-x-1.5">
              <span>{repuesto.codigo}</span>
            </div>
            {repuesto.categoria && (
              <span className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-semibold flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>{repuesto.categoria.nombre}</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#222D46] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Columna Izquierda: Foto en Gran Formato */}
            <div className="space-y-4">
              <div className="relative w-full aspect-square max-h-80 bg-[#141A29] border border-[#222D46] rounded-2xl overflow-hidden flex items-center justify-center group shadow-inner">
                {repuesto.imagenUrl ? (
                  <>
                    <img
                      src={repuesto.imagenUrl}
                      alt={repuesto.nombre}
                      className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-[11px] text-slate-300 px-2 py-1 rounded-md border border-white/10 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-[#FFB800]" />
                      <span>Fotografía del producto</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-2 p-6 text-center">
                    <div className="p-4 bg-[#1B2237] rounded-2xl border border-[#222D46]">
                      <ImageIcon className="w-12 h-12 text-slate-600" />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Sin imagen adjunta</span>
                    <span className="text-[11px] text-slate-500">Puedes cargar una fotografía haciendo clic en "Editar"</span>
                  </div>
                )}
              </div>

              {/* Estado de Inventario / Barra de Alerta */}
              <div className="p-4 bg-[#141A29] border border-[#222D46] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Boxes className="w-4 h-4 text-[#FFB800]" />
                    <span>Disponibilidad en Taller</span>
                  </span>
                  <span
                    className={`font-extrabold px-2 py-0.5 rounded text-xs border ${
                      isOut
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : isLow
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isOut ? 'AGOTADO' : isLow ? 'BAJO STOCK' : 'EN STOCK'}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-[#1B2237] h-2.5 rounded-full overflow-hidden border border-[#222D46]">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isOut
                        ? 'bg-red-500'
                        : isLow
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(5, stockRatio)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  <span>Existencias: <strong className="text-white text-xs">{repuesto.stockActual}</strong> un.</span>
                  <span>Mínimo para alerta: <strong className="text-amber-400">{repuesto.stockMinimo}</strong> un.</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Información Detallada, Costos y Precios */}
            <div className="space-y-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {repuesto.nombre}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Código de control: <span className="font-mono text-[#FFB800]">{repuesto.codigo}</span>
                </p>
              </div>

              {/* Descripción / Ficha */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-[#00C897]" />
                  <span>Descripción y Especificaciones:</span>
                </span>
                <div className="p-3.5 bg-[#141A29] border border-[#222D46] rounded-xl text-xs sm:text-sm text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                  {repuesto.descripcion && repuesto.descripcion.trim() ? (
                    <p className="whitespace-pre-line">{repuesto.descripcion}</p>
                  ) : (
                    <p className="text-slate-500 italic">No se ha registrado una descripción detallada para este artículo.</p>
                  )}
                </div>
              </div>

              {/* Tarjetas Financieras */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#141A29] border border-[#222D46] rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Precio de Venta</span>
                  <div className="text-2xl font-black text-[#FFB800]">
                    ${precio.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">PVP al cliente final</span>
                </div>

                <div className="p-3.5 bg-[#141A29] border border-[#222D46] rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Margen Estimado</span>
                  <div className={`text-xl font-bold ${ganancia >= 0 ? 'text-[#00C897]' : 'text-red-400'}`}>
                    +${ganancia.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">+{margenPorcentaje}% sobre costo</span>
                </div>

                <div className="p-3 bg-[#141A29]/70 border border-[#222D46] rounded-xl text-xs space-y-0.5">
                  <span className="text-slate-400 block text-[11px]">Costo sin IVA</span>
                  <span className="font-bold text-slate-200">${costoSinIva.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-[#141A29]/70 border border-[#222D46] rounded-xl text-xs space-y-0.5">
                  <span className="text-slate-400 block text-[11px]">Costo con IVA (13%)</span>
                  <span className="font-bold text-slate-200">${costoConIva.toFixed(2)}</span>
                </div>
              </div>

              {/* Alerta inteligente en caja */}
              {isLow && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-2.5 text-xs text-amber-300">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
                  <span>
                    <strong>Atención:</strong> Las existencias ({repuesto.stockActual} un.) están en el umbral crítico. Se recomienda registrar una entrada de stock.
                  </span>
                </div>
              )}
              {isOut && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2.5 text-xs text-red-300">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
                  <span>
                    <strong>Sin existencias:</strong> No es posible facturar este producto hasta registrar una nueva compra de reabastecimiento.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con Acciones Rápidas */}
        <div className="bg-[#141A29] px-6 py-4 border-t border-[#222D46] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#222D46] hover:bg-[#1B2237] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar Vista Previa
          </button>

          <div className="flex items-center space-x-2.5">
            {onAddStock && (
              <button
                onClick={() => {
                  onClose();
                  onAddStock(repuesto);
                }}
                className="px-4 py-2 rounded-xl bg-[#1B2237] hover:bg-[#00C897]/20 border border-[#222D46] hover:border-[#00C897] text-[#00C897] text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Entrada de Stock</span>
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(repuesto);
                }}
                className="px-4 py-2 rounded-xl bg-[#FFB800] hover:bg-[#E6A600] text-slate-950 text-xs font-extrabold shadow-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar Producto</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
