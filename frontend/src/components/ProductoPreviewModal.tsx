import React from 'react';
import {
  X,
  Tag,
  Boxes,
  AlertTriangle,
  FileText,
  PlusCircle,
  Edit2,
  Image as ImageIcon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Repuesto } from '../types';
import api from '../services/api';
import { formatMoney, toNumberOrNull } from '../utils/format';

interface ProductoPreviewModalProps {
  repuesto: Repuesto | null;
  onClose: () => void;
  onEdit?: (repuesto: Repuesto) => void;
  onAddStock?: (repuesto: Repuesto) => void;
}

export const ProductoPreviewModal: React.FC<ProductoPreviewModalProps> = ({
  repuesto: repuestoInicial,
  onClose,
  onEdit,
  onAddStock,
}) => {
  const { data: detalle } = useQuery<Repuesto>({
    queryKey: ['repuesto', repuestoInicial?.id],
    queryFn: async () => {
      const res = await api.get(`/repuestos/${repuestoInicial!.id}`);
      return res.data;
    },
    enabled: !!repuestoInicial?.id,
    placeholderData: repuestoInicial ?? undefined,
    staleTime: 0,
  });

  const repuesto = detalle ?? repuestoInicial;
  if (!repuesto) return null;

  const isOut = repuesto.stockActual <= 0;
  const isLow = repuesto.stockActual > 0 && repuesto.stockActual <= repuesto.stockMinimo;

  const precio = toNumberOrNull(repuesto.precioFinal);
  const costoConIva = toNumberOrNull(repuesto.costoConIva);
  const costoSinIva = toNumberOrNull(repuesto.costoSinIva);
  const ganancia = precio !== null && costoConIva !== null ? precio - costoConIva : null;
  const margenPorcentaje =
    ganancia !== null && costoConIva !== null && costoConIva > 0 ? ((ganancia / costoConIva) * 100).toFixed(1) : null;

  const stockRatio = repuesto.stockMinimo > 0
    ? Math.min(100, Math.round((repuesto.stockActual / (repuesto.stockMinimo * 2)) * 100))
    : Math.min(100, repuesto.stockActual * 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#111726] border border-slate-800 rounded-xl shadow-xl overflow-hidden text-slate-100 my-6">
        <div className="bg-[#182032] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400">
              {repuesto.codigo}
            </span>
            {repuesto.categoria && (
              <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs flex items-center space-x-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>{repuesto.categoria.nombre}</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="space-y-3">
              <div className="w-full aspect-square max-h-64 bg-[#182032] border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                {repuesto.imagenUrl ? (
                  <img
                    src={repuesto.imagenUrl}
                    alt={repuesto.nombre}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-1.5 p-4 text-center">
                    <ImageIcon className="w-10 h-10 text-slate-600" />
                    <span className="text-xs text-slate-400 font-medium">Sin imagen adjunta</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#182032] border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 flex items-center space-x-1">
                    <Boxes className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nivel de Existencias</span>
                  </span>
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded text-[10px] border ${
                      isOut
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : isLow
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isOut ? 'AGOTADO' : isLow ? 'BAJO STOCK' : 'NORMAL'}
                  </span>
                </div>

                <div className="w-full bg-[#111726] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(5, stockRatio)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                  <span>Actual: <strong className="text-slate-200">{repuesto.stockActual}</strong> un.</span>
                  <span>Mínimo: <strong className="text-amber-400">{repuesto.stockMinimo}</strong> un.</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {repuesto.nombre}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  SKU de control: <span className="font-mono text-amber-400">{repuesto.codigo}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-300 flex items-center space-x-1">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span>Descripción y notas técnicas:</span>
                </span>
                <div className="p-3 bg-[#182032] border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
                  {repuesto.descripcion && repuesto.descripcion.trim() ? (
                    <p className="whitespace-pre-line">{repuesto.descripcion}</p>
                  ) : (
                    <p className="text-slate-500 italic">No se especificó una descripción técnica.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-[#182032] border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">Precio de Venta</span>
                  <div className="text-lg font-bold text-slate-100 font-mono">
                    {formatMoney(precio)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">PVP con IVA</span>
                </div>

                <div className="p-2.5 bg-[#182032] border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">Margen Comercial</span>
                  <div className={`text-base font-bold font-mono ${ganancia === null ? 'text-slate-400' : ganancia >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {ganancia === null ? '—' : `${ganancia >= 0 ? '+' : '-'}${formatMoney(Math.abs(ganancia))}`}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {margenPorcentaje === null ? 'Sin costo registrado' : `${Number(margenPorcentaje) >= 0 ? '+' : ''}${margenPorcentaje}% s/costo`}
                  </span>
                </div>

                <div className="p-2 bg-[#182032]/60 border border-slate-800/80 rounded-lg text-xs">
                  <span className="text-slate-400 block text-[10px]">Costo sin IVA</span>
                  <span className="font-mono font-semibold text-slate-300">{formatMoney(costoSinIva)}</span>
                </div>

                <div className="p-2 bg-[#182032]/60 border border-slate-800/80 rounded-lg text-xs">
                  <span className="text-slate-400 block text-[10px]">Costo con IVA (13%)</span>
                  <span className="font-mono font-semibold text-slate-300">{formatMoney(costoConIva)}</span>
                </div>
              </div>

              {isLow && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center space-x-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    El stock actual ({repuesto.stockActual} un.) se encuentra en o por debajo del umbral mínimo ({repuesto.stockMinimo} un.).
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#182032] px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-700/80 hover:bg-slate-700/60 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>

          <div className="flex items-center space-x-2">
            {onAddStock && (
              <button
                onClick={() => {
                  onClose();
                  onAddStock(repuesto);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#111726] hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-all flex items-center space-x-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Entrada de Stock</span>
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(repuesto);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Repuesto</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
