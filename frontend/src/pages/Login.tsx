import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Wrench } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';

export const Login: React.FC = () => {
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
        title: '¡Bienvenido a Lubripoint!',
        text: `Sesión iniciada como ${res.data.user.nombre}`,
        timer: 1500,
        showConfirmButton: false,
      });
      navigate('/');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Autenticación',
        text: err.response?.data?.message || 'Credenciales incorrectas. Verifique correo y contraseña.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none -top-20 -left-20"></div>
      <div className="absolute w-[500px] h-[500px] bg-[#00C897]/5 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20"></div>

      {/* Main Login Card matching screenshot */}
      <div className="bg-[#141A29] border border-[#222D46] rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10 backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-full mb-3 text-[#FFB800]">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#FFB800] tracking-wider uppercase">LUBRIPOINT</h1>
          <p className="text-xs text-slate-400 mt-1">Bienvenido de nuevo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#FFB800]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@gmail.com"
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#FFB800] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#FFB800]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#FFB800] transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFB800] hover:bg-[#E0A200] text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer font-['Plus_Jakarta_Sans']"
          >
            <span>{loading ? 'INGRESANDO...' : 'INGRESAR'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          <span>¿No tienes cuenta? </span>
          <span className="text-[#FFB800] font-semibold cursor-pointer hover:underline">Regístrate aquí</span>
        </div>
      </div>
    </div>
  );
};
