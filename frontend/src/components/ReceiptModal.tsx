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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#141A29] border border-[#222D46] rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#1B2237]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 border-b border-[#222D46] pb-4">
          <div className="flex justify-center items-center space-x-2 text-[#FFB800] mb-1">
            <Wrench className="w-6 h-6" />
            <h2 className="text-2xl font-extrabold tracking-wider">LUBRIPOINT</h2>
          </div>
          <p className="text-xs text-slate-400">Taller Mecánico & Centro de Lubricación</p>
          <p className="text-xs text-slate-400">NIT: 0614-280926-101-5 | Tel: (503) 2223-2443</p>
          <div className="mt-3 bg-[#1B2237] py-1 px-3 rounded inline-block">
            <span className="text-sm font-bold text-[#FFB800]">COMPROBANTE DE VENTA {orden.codigoOrden}</span>
          </div>
        </div>

        <div className="space-y-2 text-xs mb-4 text-slate-300">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Fecha y Hora:</span>
            <span>{dayjs(orden.fechaEmision).format('DD/MM/YYYY hh:mm A')}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Cliente:</span>
            <span className="font-bold text-white">{orden.clienteNombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Teléfono:</span>
            <span>{orden.clienteTelefono || '---'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Vehículo:</span>
            <span>{orden.marca} {orden.modelo} ({orden.placa})</span>
          </div>
          {orden.descripcionFalla && (
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400">Detalle / Falla:</span>
              <span className="italic text-slate-300 truncate max-w-[200px]">{orden.descripcionFalla}</span>
            </div>
          )}
        </div>

        {/* Tabla de Detalle */}
        <div className="border border-[#222D46] rounded-lg overflow-hidden mb-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1B2237] text-slate-400 border-b border-[#222D46]">
              <tr>
                <th className="py-2 px-3">Item</th>
                <th className="py-2 px-3 text-center">Cant.</th>
                <th className="py-2 px-3 text-right">P. Unit</th>
                <th className="py-2 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222D46]">
              {orden.detalles?.map((det, idx) => (
                <tr key={idx} className="hover:bg-[#1B2237]/40">
                  <td className="py-2 px-3 font-medium text-slate-200">
                    {det.repuesto?.nombre || `Repuesto #${det.repuestoId}`}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-300">{det.cantidad}</td>
                  <td className="py-2 px-3 text-right text-slate-300">${Number(det.precioUnitario).toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">${Number(det.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="space-y-1.5 text-xs text-slate-300 mb-6 border-t border-[#222D46] pt-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${Number(orden.subtotal).toFixed(2)}</span>
          </div>
          {Number(orden.descuento) > 0 && (
            <div className="flex justify-between text-red-400">
              <span>Descuento:</span>
              <span>-${Number(orden.descuento).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-[#FFB800] pt-1 border-t border-[#222D46]">
            <span>TOTAL A PAGAR:</span>
            <span>${Number(orden.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#FFB800] hover:bg-[#E0A200] text-slate-950 font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comprobante</span>
          </button>
          <button
            onClick={onClose}
            className="bg-[#1B2237] hover:bg-[#26314D] text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
