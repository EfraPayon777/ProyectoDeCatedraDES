import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Wrench, ShieldCheck, KeyRound } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';
import { showApiError } from '../services/apiErrors';
import { usePageTitle } from '../utils/usePageTitle';

export const Login: React.FC = () => {
  usePageTitle('Iniciar sesión');
  const [email, setEmail] = useState('lubripointsv@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.user);
      Swal.fire({
        icon: 'success',
        title: 'Acceso autorizado',
        text: `Bienvenido al sistema, ${res.data.user.nombre}`,
        timer: 1400,
        showConfirmButton: false,
      });
      navigate('/');
    } catch (err: any) {
      showApiError(err, 'Error de acceso', 'Credenciales no válidas. Verifique correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('lubripointsv@gmail.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-800">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>LUBRIPOINT</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  v1.0
                </span>
              </h1>
              <p className="text-xs text-slate-400">Sistema de Gestión de Taller e Inventario</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo institucional o usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@taller.com"
                  className="w-full bg-[#182032] border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Contraseña de acceso
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#182032] border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer text-sm disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Validando credenciales...' : 'Ingresar al sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Acceso de evaluación:
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-amber-400 hover:underline cursor-pointer font-medium"
              >
                Autocompletar
              </button>
            </div>
            <div className="bg-[#182032] border border-slate-800 rounded-md p-2.5 text-[11px] font-mono text-slate-300 space-y-0.5">
              <div><span className="text-slate-500">Email:</span> lubripointsv@gmail.com</div>
              <div><span className="text-slate-500">Clave:</span> admin123</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Acceso restringido para personal autorizado</span>
        </div>
      </div>
    </div>
  );
};
