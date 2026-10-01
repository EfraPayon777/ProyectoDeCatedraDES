import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, FileText, Phone, Printer } from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';
import { Orden } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import dayjs from 'dayjs';

export const HistorialVentas: React.FC = () => {
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);

  const { data: ordenes, isLoading } = useQuery<Orden[]>({
    queryKey: ['ordenes-historial'],
    queryFn: async () => {
      const res = await api.get('/ordenes');
      return res.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Download Excel Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFB800]">Historial de Ventas</h1>
          <p className="text-xs sm:text-sm text-slate-400">Registro completo de transacciones</p>
        </div>

        <a
          href={`${API_BASE_URL}/reportes/exportar-ventas`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#00C897] hover:bg-[#00B084] text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center space-x-2 text-xs transition-colors shadow-lg cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Descargar Excel</span>
        </a>
      </div>

      {/* Main Table matching screenshot */}
      <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#1B2237] text-slate-400 uppercase tracking-wider border-b border-[#222D46]">
            <tr>
              <th className="py-3 px-4">ID VENTA</th>
              <th className="py-3 px-4">FECHA Y HORA</th>
              <th className="py-3 px-4">CLIENTE</th>
              <th className="py-3 px-4">TELÉFONO</th>
              <th className="py-3 px-4">TOTAL</th>
              <th className="py-3 px-4 text-center">COMPROBANTE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222D46]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">Cargando historial de ventas...</td>
              </tr>
            ) : ordenes && ordenes.length > 0 ? (
              ordenes.map((item) => (
                <tr key={item.id} className="hover:bg-[#1B2237]/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-[#FFB800]">{item.codigoOrden}</td>
                  <td className="py-4 px-4 text-slate-300">
                    {dayjs(item.fechaEmision).format('DD/MM/YYYY hh:mm A')}
                  </td>
                  <td className="py-4 px-4 font-semibold text-white">{item.clienteNombre}</td>
                  <td className="py-4 px-4 text-slate-400">
                    {item.clienteTelefono ? (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{item.clienteTelefono}</span>
                      </span>
                    ) : (
                      '---'
                    )}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-[#00C897] text-sm">
                    ${Number(item.total).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setSelectedOrden(item)}
                      className="bg-transparent hover:bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/40 font-semibold px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5 transition-colors cursor-pointer text-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Re-imprimir</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No hay ventas u órdenes registradas en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal orden={selectedOrden} onClose={() => setSelectedOrden(null)} />
    </div>
  );
};
