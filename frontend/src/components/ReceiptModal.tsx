import React from 'react';
import { Orden } from '../types';
import { X, Printer, Wrench } from 'lucide-react';
import dayjs from 'dayjs';

interface ReceiptModalProps {
  orden: Orden | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ orden, onClose }) => {
  if (!orden) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-[#111726] border border-slate-800 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md bg-[#182032] border border-slate-700/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5 border-b border-slate-800 pb-4">
          <div className="flex justify-center items-center space-x-2 text-amber-400 mb-1">
            <Wrench className="w-5 h-5" />
            <h2 className="text-xl font-bold tracking-tight text-white">LUBRIPOINT</h2>
          </div>
          <p className="text-xs text-slate-400">Centro de Mantenimiento Automotriz y Lubricación</p>
          <p className="text-[11px] text-slate-500 font-mono">NIT: 0614-280926-101-5 | San Salvador, El Salvador</p>
          <div className="mt-2.5 bg-[#182032] py-1 px-3 rounded-md inline-block border border-slate-800">
            <span className="text-xs font-mono font-bold text-amber-400">COMPROBANTE {orden.codigoOrden}</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs mb-4 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Fecha y Hora:</span>
            <span className="font-mono text-slate-200">{dayjs(orden.fechaEmision).format('DD/MM/YYYY hh:mm A')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Cliente:</span>
            <span className="font-semibold text-slate-100">{orden.clienteNombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Teléfono:</span>
            <span className="font-mono">{orden.clienteTelefono || '---'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Vehículo:</span>
            <span className="font-mono">{orden.marca} {orden.modelo} ({orden.placa})</span>
          </div>
          {orden.descripcionFalla && (
            <div className="flex justify-between">
              <span className="text-slate-400">Detalle:</span>
              <span className="text-slate-300 truncate max-w-[200px]">{orden.descripcionFalla}</span>
            </div>
          )}
        </div>

        <div className="border border-slate-800 rounded-lg overflow-hidden mb-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#182032] text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2 px-3">Artículo</th>
                <th className="py-2 px-3 text-center">Cant.</th>
                <th className="py-2 px-3 text-right">P. Unit</th>
                <th className="py-2 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orden.detalles?.map((det, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-medium text-slate-200">
                    {det.repuesto?.nombre || `Repuesto #${det.repuestoId}`}
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-slate-300">{det.cantidad}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">${Number(det.precioUnitario).toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-100">${Number(det.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-1.5 text-xs text-slate-300 mb-5 border-t border-slate-800 pt-3 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Subtotal:</span>
            <span>${Number(orden.subtotal).toFixed(2)}</span>
          </div>
          {Number(orden.descuento) > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>Descuento:</span>
              <span>-${Number(orden.descuento).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-slate-800">
            <span>TOTAL FACTURA:</span>
            <span className="text-base text-amber-400">${Number(orden.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comprobante</span>
          </button>
          <button
            onClick={onClose}
            className="bg-[#182032] hover:bg-[#202b42] text-slate-300 font-medium py-2 px-4 rounded-lg border border-slate-700/80 transition-colors cursor-pointer text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
