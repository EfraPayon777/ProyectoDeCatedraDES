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

  // Mi Perfil Form
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  // Nuevo Admin Form
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
      Swal.fire({ icon: 'success', title: 'Perfil Actualizado', timer: 1500, showConfirmButton: false });
    },
    onError: (err: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo actualizar el perfil' });
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
      Swal.fire({ icon: 'success', title: 'Administrador Creado', text: 'El nuevo administrador fue creado con éxito.', timer: 1500, showConfirmButton: false });
    },
    onError: (err: any) => {
      Swal.fire({ icon: 'error', title: 'Error al registrar admin', text: err.response?.data?.message || 'Revisa los datos ingresados' });
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminNombre || !newAdminEmail || !newAdminPassword) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Todos los campos son requeridos para el nuevo admin.' });
      return;
    }
    createAdminMutation.mutate();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFB800]">Configuración y Equipo</h1>
        <p className="text-xs sm:text-sm text-slate-400">Gestiona tu cuenta y los accesos al sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Editar Mi Perfil matching screenshot */}
        <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-[#FFB800]">
            <User className="w-5 h-5" />
            <h2 className="text-lg font-bold">Editar Mi Perfil</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre Completo:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FFB800]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FFB800]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nueva Contraseña (Opcional):</label>
              <input
                type="password"
                placeholder="Dejar en blanco para no cambiar"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FFB800]"
              />
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full bg-[#1B2237] hover:bg-[#26314D] text-[#FFB800] border border-[#FFB800]/40 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{updateProfileMutation.isPending ? 'Guardando...' : 'Actualizar Mis Datos'}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Crear Nuevo Admin matching screenshot */}
        <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-[#00C897]">
            <UserPlus className="w-5 h-5" />
            <h2 className="text-lg font-bold">Crear Nuevo Admin</h2>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre del Nuevo Admin:</label>
              <input
                type="text"
                placeholder="Ej: Socio Gerente"
                value={newAdminNombre}
                onChange={(e) => setNewAdminNombre(e.target.value)}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Correo de Acceso:</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contraseña:</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createAdminMutation.isPending}
              className="w-full bg-[#00C897] hover:bg-[#00B084] text-slate-950 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{createAdminMutation.isPending ? 'Registrando...' : 'Registrar Administrador'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Card 3: Equipo de Administradores matching screenshot */}
      <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-white">
          <Users className="w-5 h-5 text-[#FFB800]" />
          <h2 className="text-lg font-bold">Equipo de Administradores</h2>
        </div>

        <div className="overflow-x-auto border border-[#222D46] rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1B2237] text-slate-400 uppercase tracking-wider border-b border-[#222D46]">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">NOMBRE</th>
                <th className="py-3 px-4">EMAIL</th>
                <th className="py-3 px-4">FECHA REGISTRO</th>
                <th className="py-3 px-4 text-center">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222D46]">
              {adminList && adminList.length > 0 ? (
                adminList.map((item) => {
                  const isSelf = item.id === user?.id;

                  return (
                    <tr key={item.id} className="hover:bg-[#1B2237]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#FFB800]">#{item.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{item.nombre}</td>
                      <td className="py-3 px-4 text-slate-300">{item.email}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {dayjs(item.fechaRegistro).format('DD/MM/YYYY')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isSelf ? (
                          <span className="bg-[#00C897]/20 text-[#00C897] font-bold px-2.5 py-0.5 rounded text-[10px] border border-[#00C897]/40">
                            TÚ
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-400 font-semibold px-2.5 py-0.5 rounded text-[10px] border border-slate-700">
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
                    No se encontraron administradores registrados.
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
