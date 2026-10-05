import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UserPlus, Users, Save, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User as UserType, UserRole } from '../types';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { DESCRIPCION_ROL, ROLES_ASIGNABLES, esRolVigente } from '../context/permissions';
import { showApiError } from '../services/apiErrors';
import { EMAIL_REGEX, FieldErrors, hasErrors, validarTexto } from '../utils/validators';
import { usePageTitle } from '../utils/usePageTitle';

type CampoUsuario = 'nombre' | 'email' | 'password' | 'rol';

const validarUsuario = (
  data: { nombre: string; email: string; password: string; rol?: string },
  passwordObligatoria: boolean,
): FieldErrors<CampoUsuario> => {
  const e: FieldErrors<CampoUsuario> = {};
  e.nombre = validarTexto(data.nombre, 'El nombre', 100);
  const email = data.email.trim();
  if (!email) e.email = 'El correo electrónico es obligatorio.';
  else if (email.length > 150) e.email = 'El correo electrónico no debe superar 150 caracteres.';
  else if (!EMAIL_REGEX.test(email)) e.email = 'El correo electrónico no es válido.';
  if (data.password || passwordObligatoria) {
    if (!data.password) e.password = 'La contraseña es obligatoria.';
    else if (data.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres.';
    else if (data.password.length > 72) e.password = 'La contraseña no debe superar 72 caracteres.';
  }
  if (data.rol !== undefined && !ROLES_ASIGNABLES.includes(data.rol as UserRole)) e.rol = 'Seleccione un rol válido.';
  return e;
};

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-[10px] text-rose-400">{message}</p> : null;

const rolBadgeClass = (rol: string) =>
  rol === 'Administrador'
    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    : rol === 'Jefe de Pista'
    ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
    : rol === 'Mecánico'
    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    : 'bg-rose-500/10 text-rose-300 border-rose-500/30';

export const PerfilEquipo: React.FC = () => {
  const { user, updateUser, hasPermission } = useAuth();
  const puedeVerEquipo = hasPermission('usuarios.view');
  usePageTitle(puedeVerEquipo ? 'Equipo y Perfil' : 'Mi Perfil');
  const puedeCrearUsuarios = hasPermission('usuarios.create');
  const puedeAsignarRoles = hasPermission('usuarios.roles');
  const sinPermisos = !user?.permisos || user.permisos.length === 0;
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  const [newAdminNombre, setNewAdminNombre] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newUserRol, setNewUserRol] = useState<UserRole>('Mecánico');
  const [profileErrors, setProfileErrors] = useState<FieldErrors<CampoUsuario>>({});
  const [newUserErrors, setNewUserErrors] = useState<FieldErrors<CampoUsuario>>({});

  const { data: adminList } = useQuery<UserType[]>({
    queryKey: ['admins-team'],
    queryFn: async () => {
      const res = await api.get('/auth/admins');
      return res.data;
    },
    enabled: puedeVerEquipo,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/auth/profile', {
        nombre: nombre.trim(),
        email: email.trim(),
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
      showApiError(err, 'Error', 'No se pudo actualizar la información');
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/register', {
        nombre: newAdminNombre.trim(),
        email: newAdminEmail.trim(),
        password: newAdminPassword,
        rol: newUserRol,
      });
      return res.data;
    },
    onSuccess: (data: UserType) => {
      queryClient.invalidateQueries({ queryKey: ['admins-team'] });
      setNewAdminNombre('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewUserRol('Mecánico');
      setNewUserErrors({});
      Swal.fire({
        icon: 'success',
        title: 'Usuario registrado',
        text: `${data?.nombre ?? 'El usuario'} fue creado con el rol ${data?.rol ?? newUserRol}.`,
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (err: any) => {
      showApiError(err, 'Error de registro', 'Verifique los datos ingresados');
    },
  });

  const cambiarRolMutation = useMutation({
    mutationFn: async ({ id, rol }: { id: number; rol: UserRole }) => {
      const res = await api.patch(`/auth/usuarios/${id}/rol`, { rol });
      return res.data as UserType;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admins-team'] });
      Swal.fire({
        icon: 'success',
        title: 'Rol actualizado',
        text: `${data.nombre} ahora tiene el rol ${data.rol}.`,
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['admins-team'] });
      showApiError(err, 'No se pudo cambiar el rol', 'Verifique el rol seleccionado.');
    },
  });

  const handleCambiarRol = (item: UserType, rol: UserRole) => {
    if (rol === item.rol) return;
    Swal.fire({
      title: '¿Cambiar rol?',
      text: `${item.nombre}: ${item.rol} → ${rol}. Sus permisos cambiarán de inmediato.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#334155',
    }).then((r) => {
      if (r.isConfirmed) cambiarRolMutation.mutate({ id: item.id, rol });
      else queryClient.invalidateQueries({ queryKey: ['admins-team'] });
    });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validarUsuario({ nombre, email, password }, false);
    setProfileErrors(errs);
    if (hasErrors(errs)) return;
    updateProfileMutation.mutate();
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validarUsuario(
      { nombre: newAdminNombre, email: newAdminEmail, password: newAdminPassword, rol: newUserRol },
      true,
    );
    setNewUserErrors(errs);
    if (hasErrors(errs)) return;
    createAdminMutation.mutate();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-2 border-b border-slate-800/60">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Configuración de Cuenta y Personal</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {puedeVerEquipo
            ? 'Gestión del perfil personal y control de accesos administrativos'
            : 'Gestión de su perfil personal'}
        </p>
      </div>

      {sinPermisos && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Su cuenta tiene el rol <strong>{user?.rol}</strong>, que ya no está vigente, y no tiene permisos asignados.
            Solicite a un Administrador que le asigne uno de los roles: Administrador, Jefe de Pista o Mecánico.
          </span>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-6${puedeCrearUsuarios ? ' lg:grid-cols-2' : ''}`}>
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-200 pb-2 border-b border-slate-800">
            <User className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold">Mi Información Personal</h2>
          </div>

          <form onSubmit={handleUpdateProfile} noValidate className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nombre Completo:</label>
              <input
                type="text"
                value={nombre}
                maxLength={100}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
              <FieldError message={profileErrors.nombre} />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Correo Electrónico:</label>
              <input
                type="email"
                value={email}
                maxLength={150}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
              <FieldError message={profileErrors.email} />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Nueva Contraseña (Opcional):</label>
              <input
                type="password"
                placeholder="Dejar en blanco para mantener la actual"
                value={password}
                maxLength={72}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
              <FieldError message={profileErrors.password} />
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

        {puedeCrearUsuarios && (
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-200 pb-2 border-b border-slate-800">
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold">Registrar Nuevo Usuario</h2>
          </div>

          <form onSubmit={handleCreateAdmin} noValidate className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nombre Completo:</label>
              <input
                type="text"
                placeholder="Ej. Roberto Méndez"
                value={newAdminNombre}
                maxLength={100}
                onChange={(e) => setNewAdminNombre(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
              <FieldError message={newUserErrors.nombre} />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Correo Electrónico:</label>
              <input
                type="email"
                placeholder="usuario@taller.com"
                value={newAdminEmail}
                maxLength={150}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
              <FieldError message={newUserErrors.email} />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Contraseña Inicial:</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newAdminPassword}
                maxLength={72}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
              <FieldError message={newUserErrors.password} />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Rol:</label>
              <select
                value={newUserRol}
                onChange={(e) => setNewUserRol(e.target.value as UserRole)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                {ROLES_ASIGNABLES.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-slate-500">{DESCRIPCION_ROL[newUserRol]}</p>
              <FieldError message={newUserErrors.rol} />
            </div>

            <button
              type="submit"
              disabled={createAdminMutation.isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-xs shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{createAdminMutation.isPending ? 'Registrando...' : 'Registrar Usuario'}</span>
            </button>
          </form>
        </div>
        )}
      </div>

      {puedeVerEquipo && (
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-white pb-1">
          <Users className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold">Personal Registrado</h2>
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
                        <div className="flex items-center justify-center gap-1.5">
                          {isSelf && (
                            <span className="bg-amber-500/15 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-500/30">
                              Sesión Activa
                            </span>
                          )}
                          {puedeAsignarRoles && !isSelf ? (
                            <select
                              aria-label={`Rol de ${item.nombre}`}
                              value={esRolVigente(item.rol) ? item.rol : ''}
                              disabled={cambiarRolMutation.isPending}
                              onChange={(e) => handleCambiarRol(item, e.target.value as UserRole)}
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium border bg-[#182032] focus:outline-none ${rolBadgeClass(item.rol)}`}
                            >
                              {!esRolVigente(item.rol) && <option value="">{item.rol} (sin acceso) — asignar…</option>}
                              {ROLES_ASIGNABLES.map((rol) => (
                                <option key={rol} value={rol}>
                                  {rol}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`font-medium px-2 py-0.5 rounded text-[10px] border ${rolBadgeClass(item.rol)}`}>
                              {item.rol}
                              {!esRolVigente(item.rol) && ' (sin acceso)'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No se registran usuarios adicionales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};
