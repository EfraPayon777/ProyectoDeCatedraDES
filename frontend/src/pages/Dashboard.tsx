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
import { DashboardSummary } from '../types';
import Swal from 'sweetalert2';

export const Dashboard: React.FC = () => {
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
        title: 'Descarga Iniciada',
        text: 'El inventario se ha descargado correctamente en formato Excel.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Descarga',
        text: 'No se pudo descargar el reporte de inventario.',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#FFB800]">Dashboard General</h1>
          <p className="text-xs sm:text-sm text-slate-400">Resumen financiero, métricas de inventario y accesos rápidos</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/nueva-venta"
            className="bg-[#00C897] hover:bg-[#00B084] text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Venta</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Facturado</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-2">
                ${isLoading ? '...' : summary?.totalFacturado?.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Suma total de órdenes procesadas</p>
        </div>

        <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Descuentos</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-2">
                ${isLoading ? '...' : summary?.totalDescuentos?.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Descuentos aplicados en órdenes</p>
        </div>

        <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Órdenes Emitidas</p>
              <h3 className="text-2xl font-extrabold text-[#FFB800] mt-2">
                {isLoading ? '...' : summary?.totalOrdenes}
              </h3>
            </div>
            <div className="p-3 bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-xl text-[#FFB800]">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Ventas y servicios completados</p>
        </div>

        <Link
          to="/inventario?filtro=bajo"
          className="bg-[#141A29] hover:bg-[#182033] border border-[#222D46] hover:border-red-500/40 rounded-xl p-6 shadow-xl relative overflow-hidden transition-all group cursor-pointer block"
          title="Ver repuestos bajo stock en Inventario"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-red-400 transition-colors">Alertas Bajo Stock</p>
              <h3 className="text-2xl font-extrabold text-red-400 mt-2">
                {isLoading ? '...' : summary?.repuestosBajoStock}
              </h3>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 group-hover:text-slate-400">Items ≤ Umbral mínimo de stock →</p>
        </Link>
      </div>

      {/* Low Stock Banner Alert con desglose directo de productos */}
      {summary && summary.repuestosBajoStock > 0 && (
        <div className="bg-gradient-to-r from-red-950/50 via-[#141A29] to-[#141A29] border border-red-500/50 rounded-xl p-5 shadow-2xl space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-red-200 flex items-center gap-2">
                  Alerta Inteligente de Reabastecimiento
                  <span className="text-[11px] bg-red-500/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-mono">
                    {summary.repuestosBajoStock} {summary.repuestosBajoStock === 1 ? 'ítem crítico' : 'ítems críticos'}
                  </span>
                </h4>
                <p className="text-xs text-red-300/80 mt-0.5">
                  Productos cuyo stock actual es menor o igual al umbral mínimo de seguridad parametrizado:
                </p>
              </div>
            </div>
            <Link
              to="/inventario?filtro=bajo"
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg whitespace-nowrap transition-all shadow-md hover:shadow-red-500/20 flex items-center space-x-1.5 shrink-0 self-end sm:self-center"
            >
              <span>Ver en Inventario</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Desglose de repuestos bajo stock */}
          {repuestosAlertas && repuestosAlertas.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-red-500/20">
              {repuestosAlertas.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-[#1B2237]/80 border border-red-500/30 rounded-lg p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-mono text-[10px] text-amber-400 font-bold block">{item.codigo}</span>
                    <span className="text-slate-200 font-medium truncate block">{item.nombre}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-red-400 font-bold block">{item.stockActual} un.</span>
                    <span className="text-[10px] text-slate-400 block">Mín: {item.stockMinimo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Middle Section: Fast Access & Top Consumed Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-lg text-white mb-2">Accesos Rápidos</h3>
          <Link
            to="/nueva-venta"
            className="w-full bg-[#1B2237] hover:bg-[#26314D] border border-[#222D46] rounded-xl p-4 flex items-center justify-between text-slate-200 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Nueva Venta / Factura</p>
                <p className="text-xs text-slate-400">Registrar salida de repuestos</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-[#FFB800] transition-colors" />
          </Link>

          <Link
            to="/inventario"
            className="w-full bg-[#1B2237] hover:bg-[#26314D] border border-[#222D46] rounded-xl p-4 flex items-center justify-between text-slate-200 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#FFB800]/20 rounded-lg text-[#FFB800]">
                <Boxes className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Consulta de Stock</p>
                <p className="text-xs text-slate-400">Verificar existencias y precios</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-[#FFB800] transition-colors" />
          </Link>

          <button
            onClick={handleDownloadExcel}
            disabled={isDownloading}
            className="w-full bg-[#1B2237] hover:bg-[#26314D] border border-[#222D46] rounded-xl p-4 flex items-center justify-between text-slate-200 transition-all group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">
                  {isDownloading ? 'Descargando Excel...' : 'Descargar Excel Inventario'}
                </p>
                <p className="text-xs text-slate-400">Exportar catálogo completo</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-[#FFB800] transition-colors" />
          </button>
        </div>

        {/* Top Used Parts */}
        <div className="lg:col-span-2 bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl">
          <h3 className="font-bold text-lg text-white mb-4">Piezas Más Utilizadas en Reparaciones</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1B2237] text-slate-400 uppercase tracking-wider border-b border-[#222D46]">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Repuesto</th>
                  <th className="py-3 px-4 text-center">Unidades Vendidas</th>
                  <th className="py-3 px-4 text-right">Recaudación Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222D46]">
                {piezasTop && piezasTop.length > 0 ? (
                  piezasTop.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#1B2237]/40">
                      <td className="py-3 px-4 font-bold text-[#FFB800]">{item.codigo}</td>
                      <td className="py-3 px-4 font-semibold text-slate-100">{item.nombre}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-400">{item.totalCantidad} un.</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-200">
                        ${Number(item.totalRecaudado || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Aún no hay suficientes órdenes registradas para calcular las piezas más utilizadas.
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
