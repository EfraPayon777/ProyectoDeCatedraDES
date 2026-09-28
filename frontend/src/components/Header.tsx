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
  Home,
  BookOpen
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
    { label: 'Resumen', path: '/', icon: LayoutDashboard },
    { label: 'NUEVA VENTA', path: '/nueva-venta', icon: ShoppingCart, highlight: true },
    { label: 'Historial Ventas', path: '/historial', icon: History },
    { label: 'Inventario', path: '/inventario', icon: Boxes },
    { label: 'Categorías', path: '/categorias', icon: Tag },
    { label: 'Mi Perfil & Admins', path: '/perfil', icon: UserCheck },
  ];

  return (
    <header className="w-full bg-[#0D111D] border-b border-[#222D46] shadow-xl">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wrench className="w-7 h-7 text-[#FFB800]" />
          <span className="text-2xl font-extrabold tracking-wider text-[#FFB800] uppercase font-['Plus_Jakarta_Sans']">
            LUBRIPOINT
          </span>
        </div>

        <div className="flex items-center space-x-6 text-sm font-medium text-slate-300">
          <Link to="/" className="flex items-center space-x-1 hover:text-[#FFB800] transition-colors">
            <Home className="w-4 h-4 text-purple-400" />
            <span>Inicio</span>
          </Link>
          <Link to="/inventario" className="flex items-center space-x-1 hover:text-[#FFB800] transition-colors">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Catálogo</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-purple-400" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-[#141A29] border-t border-[#222D46]/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-start space-x-2 sm:space-x-4 overflow-x-auto text-xs sm:text-sm font-medium">
          <span className="text-slate-400 font-bold uppercase tracking-wider px-2 border-r border-[#222D46] hidden md:inline">
            | PANEL:
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.highlight) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold text-emerald-400 border border-emerald-500/30 transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'hover:bg-emerald-500/10 hover:text-emerald-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-[#FFB800] bg-[#1B2237] font-bold border-b-2 border-[#FFB800]'
                    : 'text-slate-300 hover:text-white hover:bg-[#1B2237]/60'
                }`}
              >
                <Icon className="w-4 h-4 text-purple-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
