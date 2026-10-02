import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, FileText, Phone, Printer } from 'lucide-react';
import api, { downloadExcelFile } from '../services/api';
import { Orden } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

export const HistorialVentas: React.FC = () => {
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: ordenes, isLoading } = useQuery<Orden[]>({
    queryKey: ['ordenes-historial'],
    queryFn: async () => {
      const res = await api.get('/ordenes');
      return res.data;
    },
  });

  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      await downloadExcelFile('/reportes/exportar-ventas', 'Lubripoint_Historial_Ventas.xlsx');
      Swal.fire({
        icon: 'success',
        title: 'Exportación completada',
        text: 'El historial de órdenes se descargó correctamente en formato Excel.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error de exportación',
        text: 'No se pudo generar el reporte de ventas.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Historial de Órdenes y Ventas</h1>
          <p className="text-xs text-slate-400 mt-0.5">Auditoría de transacciones, detalle de clientes y re-impresión de comprobantes</p>
        </div>

        <button
          onClick={handleDownloadExcel}
          disabled={isDownloading}
          className="bg-[#182032] hover:bg-[#202b42] text-slate-200 border border-slate-700/80 font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>{isDownloading ? 'Generando...' : 'Exportar a Excel'}</span>
        </button>
      </div>

      <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#182032] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 font-semibold">Código Orden</th>
              <th className="py-3 px-4 font-semibold">Fecha y Hora</th>
              <th className="py-3 px-4 font-semibold">Cliente</th>
              <th className="py-3 px-4 font-semibold">Teléfono</th>
              <th className="py-3 px-4 font-semibold text-right">Monto Total</th>
              <th className="py-3 px-4 font-semibold text-center">Comprobante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Cargando historial de órdenes...
                </td>
              </tr>
            ) : ordenes && ordenes.length > 0 ? (
              ordenes.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-amber-400">{item.codigoOrden}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {dayjs(item.fechaEmision).format('DD/MM/YYYY hh:mm A')}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-100">{item.clienteNombre}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {item.clienteTelefono ? (
                      <span className="flex items-center space-x-1 text-[11px] font-mono">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{item.clienteTelefono}</span>
                      </span>
                    ) : (
                      '---'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-100">
                    ${Number(item.total).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedOrden(item)}
                      className="bg-[#182032] hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-medium px-2.5 py-1.5 rounded-md inline-flex items-center space-x-1.5 transition-colors cursor-pointer text-xs"
                      title="Ver o imprimir comprobante fiscal"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Comprobante</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No se registran órdenes emitidas en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ReceiptModal orden={selectedOrden} onClose={() => setSelectedOrden(null)} />
    </div>
  );
};
