import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Permission } from '../context/permissions';
import { MENSAJE_SIN_PERMISOS } from '../services/apiErrors';

export const AccessDenied: React.FC<{ message?: string }> = ({ message }) => (
  <div className="max-w-xl mx-auto px-4 py-16 text-center">
    <div className="w-14 h-14 mx-auto rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
      <ShieldOff className="w-7 h-7" />
    </div>
    <h1 className="text-lg font-bold text-white">Acceso denegado</h1>
    <p className="text-xs text-slate-400 mt-1.5">{message || MENSAJE_SIN_PERMISOS}</p>
    <Link
      to="/"
      className="inline-flex items-center space-x-1.5 mt-5 px-3.5 py-2 rounded-lg bg-[#182032] hover:bg-[#202b42] border border-slate-700/80 text-xs text-slate-200 font-medium transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>Volver al Dashboard</span>
    </Link>
  </div>
);

/** Guard de ruta: muestra "Acceso denegado" si el rol del usuario no tiene el permiso. */
export const RequirePermission: React.FC<{ permission: Permission; children: React.ReactElement }> = ({
  permission,
  children,
}) => {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? children : <AccessDenied />;
};

/**
 * Página de inicio según permisos: el Dashboard (métricas financieras) solo para finanzas.view;
 * el resto va al primer módulo disponible (p. ej. Mecánico → Órdenes).
 */
export const HomeRoute: React.FC<{ dashboard: React.ReactElement }> = ({ dashboard }) => {
  const { hasPermission } = useAuth();
  if (hasPermission('finanzas.view')) return dashboard;
  if (hasPermission('ordenes.view')) return <Navigate to="/historial" replace />;
  if (hasPermission('catalogo.view')) return <Navigate to="/inventario" replace />;
  return <Navigate to="/perfil" replace />;
};
