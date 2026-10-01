import React from 'react';
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
import api, { API_BASE_URL } from '../services/api';
import { DashboardSummary } from '../types';

export const Dashboard: React.FC = () => {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await api.get('/reportes/dashboard');
      return res.data;
    },
  });

  const { data: piezasTop } = useQuery({
    queryKey: ['piezas-mas-usadas'],
    queryFn: async () => {
      const res = await api.get('/reportes/piezas-mas-usadas');
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

        <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alertas Bajo Stock</p>
              <h3 className="text-2xl font-extrabold text-red-400 mt-2">
                {isLoading ? '...' : summary?.repuestosBajoStock}
              </h3>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Items ≤ Umbral mínimo de stock</p>
        </div>
      </div>

      {/* Low Stock Banner Alert */}
      {summary && summary.repuestosBajoStock > 0 && (
        <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-red-200 shadow-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Alerta Inteligente de Reabastecimiento</h4>
              <p className="text-xs text-red-300/80">
                Hay {summary.repuestosBajoStock} repuestos con stock por debajo o igual al umbral mínimo parametrizado.
              </p>
            </div>
          </div>
          <Link
            to="/inventario"
            className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
          >
            Revisar Inventario
          </Link>
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

          <a
            href={`${API_BASE_URL}/reportes/exportar-inventario`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#1B2237] hover:bg-[#26314D] border border-[#222D46] rounded-xl p-4 flex items-center justify-between text-slate-200 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Descargar Excel Inventario</p>
                <p className="text-xs text-slate-400">Exportar catálogo completo</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-[#FFB800] transition-colors" />
          </a>
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
