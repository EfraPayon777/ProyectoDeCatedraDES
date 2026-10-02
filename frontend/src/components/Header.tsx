import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  History,
  Boxes,
  Tag,
  UserCheck,
  LogOut,
  Wrench,
  User
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Punto de Venta', path: '/nueva-venta', icon: ShoppingCart, highlight: true },
    { label: 'Historial', path: '/historial', icon: History },
    { label: 'Inventario', path: '/inventario', icon: Boxes },
    { label: 'Categorías', path: '/categorias', icon: Tag },
    { label: 'Equipo y Perfil', path: '/perfil', icon: UserCheck },
  ];

  return (
    <header className="w-full bg-[#0f1422] border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <Link to="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>LUBRIPOINT</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Taller
                </span>
              </Link>
              <p className="text-[11px] text-slate-400 hidden sm:block">Control de Inventario y Operaciones</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user && (
              <div className="hidden md:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px]">
                  {user.nombre?.charAt(0) || <User className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left">
                  <span className="text-slate-200 font-semibold block leading-tight">{user.nombre}</span>
                  <span className="text-[10px] text-amber-400 font-medium capitalize">{user.rol?.toLowerCase()}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0b0f17] border-t border-slate-800/60 px-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-1.5 text-xs font-medium scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.highlight) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition-all shrink-0 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
