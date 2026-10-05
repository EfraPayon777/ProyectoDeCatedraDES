import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingDown,
  FileCheck,
  AlertTriangle,
  PlusCircle,
  Boxes,
  FileSpreadsheet,
  ArrowUpRight
} from 'lucide-react';
import api, { downloadExcelFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardSummary } from '../types';
import Swal from 'sweetalert2';
import { usePageTitle } from '../utils/usePageTitle';

export const Dashboard: React.FC = () => {
  usePageTitle('Dashboard');
  const { hasPermission } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await api.get('/reportes/dashboard');
      return res.data;
    },
  });

  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      await downloadExcelFile('/reportes/exportar-inventario', 'Lubripoint_Inventario.xlsx');
      Swal.fire({
        icon: 'success',
        title: 'Descarga completada',
        text: 'El reporte de existencias se descargó correctamente en formato Excel.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error de exportación',
        text: 'No se pudo generar el archivo de inventario. Verifique su conexión.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const { data: piezasTop } = useQuery({
    queryKey: ['piezas-mas-usadas'],
    queryFn: async () => {
      const res = await api.get('/reportes/piezas-mas-usadas');
      return res.data;
    },
  });

  const { data: repuestosAlertas } = useQuery<any[]>({
    queryKey: ['repuestos-alertas-dashboard'],
    queryFn: async () => {
      const res = await api.get('/repuestos/alertas-stock');
      return res.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Panel de Control Operativo</h1>
          <p className="text-xs text-slate-400 mt-0.5">Indicadores financieros, existencias críticas y volumen de taller</p>
        </div>
        <div className="flex items-center space-x-2.5">
          {hasPermission('ordenes.create') && (
          <Link
            to="/nueva-venta"
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold px-3.5 py-2 rounded-lg flex items-center space-x-2 text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Emitir Orden / Venta</span>
          </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Facturado</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono mt-1">
                ${isLoading ? '...' : summary?.totalFacturado?.toFixed(2)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Ventas de repuestos y servicios</p>
        </div>

        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Descuentos Otorgados</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono mt-1">
                ${isLoading ? '...' : summary?.totalDescuentos?.toFixed(2)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Margen bonificado a clientes</p>
        </div>

        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Órdenes Realizadas</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono mt-1">
                {isLoading ? '...' : summary?.totalOrdenes}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Comprobantes emitidos en el período</p>
        </div>

        <Link
          to="/inventario?filtro=bajo"
          className="bg-[#111726] hover:bg-[#161f33] border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 shadow-sm transition-all block group"
          title="Ver repuestos bajo el stock mínimo"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                Alertas Bajo Stock
              </p>
              <h3 className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {isLoading ? '...' : summary?.repuestosBajoStock}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 group-hover:text-slate-400 flex items-center justify-between">
            <span>Existencias en o bajo el umbral</span>
            <span className="font-semibold text-amber-400">Revisar →</span>
          </p>
        </Link>
      </div>

      {summary && summary.repuestosBajoStock > 0 && (
        <div className="bg-[#181a24] border border-amber-500/30 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                  Atención requerida en inventario
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                    {summary.repuestosBajoStock} {summary.repuestosBajoStock === 1 ? 'artículo' : 'artículos'}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Repuestos con existencias iguales o inferiores a su umbral de reabastecimiento:
                </p>
              </div>
            </div>
            <Link
              to="/inventario?filtro=bajo"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-md flex items-center space-x-1 shrink-0 self-end sm:self-center transition-colors"
            >
              <span>Ver en inventario</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {repuestosAlertas && repuestosAlertas.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              {repuestosAlertas.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-[#111726] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-mono text-[10px] text-amber-400 font-semibold block">{item.codigo}</span>
                    <span className="text-slate-200 font-medium truncate block">{item.nombre}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-amber-400 font-bold font-mono block">{item.stockActual} un.</span>
                    <span className="text-[10px] text-slate-500 block">Mín: {item.stockMinimo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Operaciones Rápidas</h3>
          <div className="space-y-2.5">
            {hasPermission('ordenes.create') && (
            <Link
              to="/nueva-venta"
              className="w-full bg-[#182032] hover:bg-[#202b42] border border-slate-800 rounded-lg p-3 flex items-center justify-between text-slate-200 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-xs text-slate-100">Nueva Venta / Orden</p>
                  <p className="text-[11px] text-slate-400">Salida de repuestos con comprobante</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </Link>
            )}

            <Link
              to="/inventario"
              className="w-full bg-[#182032] hover:bg-[#202b42] border border-slate-800 rounded-lg p-3 flex items-center justify-between text-slate-200 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-xs text-slate-100">Catálogo de Repuestos</p>
                  <p className="text-[11px] text-slate-400">Control de stock y precios</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </Link>

            {hasPermission('inventario.view') && (
            <button
              onClick={handleDownloadExcel}
              disabled={isDownloading}
              className="w-full bg-[#182032] hover:bg-[#202b42] border border-slate-800 rounded-lg p-3 flex items-center justify-between text-slate-200 transition-all group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-xs text-slate-100">
                    {isDownloading ? 'Generando archivo...' : 'Exportar Inventario Excel'}
                  </p>
                  <p className="text-[11px] text-slate-400">Descarga del catálogo en formato .xlsx</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#111726] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Artículos con Mayor Rotación</h3>
            <span className="text-[11px] text-slate-500">Histórico de órdenes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#182032] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Repuesto</th>
                  <th className="py-2.5 px-3 text-center">Unidades</th>
                  <th className="py-2.5 px-3 text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {piezasTop && piezasTop.length > 0 ? (
                  piezasTop.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-amber-400">{item.codigo}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{item.nombre}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-300">
                        {item.totalCantidad} un.
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-100">
                        ${Number(item.totalRecaudado || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                      No se registran transacciones suficientes para generar el listado de rotación.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
