import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, FileText, Phone, Printer, ClipboardCheck } from 'lucide-react';
import api, { downloadExcelFile } from '../services/api';
import { Orden } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import { ActualizarOrdenModal } from '../components/ActualizarOrdenModal';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { usePageTitle } from '../utils/usePageTitle';

export const HistorialVentas: React.FC = () => {
  usePageTitle('Órdenes');
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [ordenActualizar, setOrdenActualizar] = useState<Orden | null>(null);
  const { hasPermission } = useAuth();
  const puedeActualizar = hasPermission('ordenes.update');
  const puedeVerFinanzas = hasPermission('finanzas.view'); 
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Órdenes de Trabajo e Historial</h1>
          <p className="text-xs text-slate-400 mt-0.5">Auditoría de transacciones, detalle de clientes y re-impresión de comprobantes</p>
        </div>

        {puedeVerFinanzas && (
        <button
          onClick={handleDownloadExcel}
          disabled={isDownloading}
          className="bg-[#182032] hover:bg-[#202b42] text-slate-200 border border-slate-700/80 font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>{isDownloading ? 'Generando...' : 'Exportar a Excel'}</span>
        </button>
        )}
      </div>

      <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#182032] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 font-semibold">Código Orden</th>
              <th className="py-3 px-4 font-semibold">Fecha y Hora</th>
              <th className="py-3 px-4 font-semibold">Cliente</th>
              <th className="py-3 px-4 font-semibold">Teléfono</th>
              <th className="py-3 px-4 font-semibold text-center">Estado</th>
              <th className="py-3 px-4 font-semibold text-right">Monto Total</th>
              <th className="py-3 px-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
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
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        item.estado === 'PENDIENTE'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : item.estado === 'CANCELADA'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-100">
                    ${Number(item.total).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                    {puedeActualizar && (
                      <button
                        onClick={() => setOrdenActualizar(item)}
                        className="bg-[#182032] hover:bg-sky-500/20 text-sky-300 border border-slate-700 font-medium px-2.5 py-1.5 rounded-md inline-flex items-center space-x-1.5 transition-colors cursor-pointer text-xs"
                        title="Actualizar estado y detalle del trabajo"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Actualizar</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrden(item)}
                      className="bg-[#182032] hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-medium px-2.5 py-1.5 rounded-md inline-flex items-center space-x-1.5 transition-colors cursor-pointer text-xs"
                      title="Ver o imprimir comprobante fiscal"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Comprobante</span>
                    </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No se registran órdenes emitidas en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ReceiptModal orden={selectedOrden} onClose={() => setSelectedOrden(null)} />
      <ActualizarOrdenModal orden={ordenActualizar} onClose={() => setOrdenActualizar(null)} />
    </div>
  );
};
