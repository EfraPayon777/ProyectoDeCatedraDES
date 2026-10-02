import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UserPlus, Users, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User as UserType } from '../types';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

export const PerfilEquipo: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  const [newAdminNombre, setNewAdminNombre] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const { data: adminList } = useQuery<UserType[]>({
    queryKey: ['admins-team'],
    queryFn: async () => {
      const res = await api.get('/auth/admins');
      return res.data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/auth/profile', {
        nombre,
        email,
        password: password ? password : undefined,
      });
      return res.data;
    },
    onSuccess: (data) => {
      updateUser(data);
      setPassword('');
      Swal.fire({ icon: 'success', title: 'Perfil actualizado', timer: 1500, showConfirmButton: false });
    },
    onError: (err: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo actualizar la información' });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/register', {
        nombre: newAdminNombre,
        email: newAdminEmail,
        password: newAdminPassword,
        rol: 'Administrador',
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins-team'] });
      setNewAdminNombre('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      Swal.fire({
        icon: 'success',
        title: 'Usuario registrado',
        text: 'El nuevo administrador fue creado satisfactoriamente.',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error de registro',
        text: err.response?.data?.message || 'Verifique los datos ingresados'
      });
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminNombre || !newAdminEmail || !newAdminPassword) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Todos los campos son obligatorios.' });
      return;
    }
    createAdminMutation.mutate();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-2 border-b border-slate-800/60">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Configuración de Cuenta y Personal</h1>
        <p className="text-xs text-slate-400 mt-0.5">Gestión del perfil personal y control de accesos administrativos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-200 pb-2 border-b border-slate-800">
            <User className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold">Mi Información Personal</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nombre Completo:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Correo Electrónico:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Nueva Contraseña (Opcional):</label>
              <input
                type="password"
                placeholder="Dejar en blanco para mantener la actual"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full bg-[#182032] hover:bg-[#202b42] text-amber-400 border border-amber-500/40 font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios de Perfil'}</span>
            </button>
          </form>
        </div>

        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-200 pb-2 border-b border-slate-800">
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold">Registrar Nuevo Administrador</h2>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nombre Completo:</label>
              <input
                type="text"
                placeholder="Ej. Roberto Méndez"
                value={newAdminNombre}
                onChange={(e) => setNewAdminNombre(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Correo Electrónico:</label>
              <input
                type="email"
                placeholder="usuario@taller.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Contraseña Inicial:</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createAdminMutation.isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-xs shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{createAdminMutation.isPending ? 'Registrando...' : 'Registrar Administrador'}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-white pb-1">
          <Users className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold">Personal con Permisos de Administración</h2>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#182032] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3.5 w-16">ID</th>
                <th className="py-2.5 px-3.5">Nombre</th>
                <th className="py-2.5 px-3.5">Correo</th>
                <th className="py-2.5 px-3.5">Fecha Alta</th>
                <th className="py-2.5 px-3.5 text-center">Estado / Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {adminList && adminList.length > 0 ? (
                adminList.map((item) => {
                  const isSelf = item.id === user?.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-slate-400">#{item.id}</td>
                      <td className="py-2.5 px-3.5 font-medium text-white">{item.nombre}</td>
                      <td className="py-2.5 px-3.5 text-slate-300 font-mono text-[11px]">{item.email}</td>
                      <td className="py-2.5 px-3.5 text-slate-400 font-mono text-[11px]">
                        {dayjs(item.fechaRegistro).format('DD/MM/YYYY')}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        {isSelf ? (
                          <span className="bg-amber-500/15 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-500/30">
                            Sesión Activa
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-300 font-medium px-2 py-0.5 rounded text-[10px] border border-slate-700">
                            Admin
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No se registran administradores adicionales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
