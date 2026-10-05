import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import api from '../services/api';
import { Permission } from './permissions';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('lubripoint_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('lubripoint_token');
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('lubripoint_token', newToken);
    localStorage.setItem('lubripoint_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('lubripoint_token');
    localStorage.removeItem('lubripoint_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('lubripoint_user', JSON.stringify(newUser));
    }
  };

  // El rol guardado en localStorage puede quedar desactualizado (p. ej. si un administrador cambia el rol).
  // Al iniciar la app se refresca el usuario desde el backend, que es la fuente de verdad.
  // Si el token ya no es válido, el interceptor 401 de services/api.ts cierra la sesión.
  useEffect(() => {
    if (!token) return;
    api
      .get('/auth/profile')
      .then((res) => {
        if (res.data) {
          setUser(res.data);
          localStorage.setItem('lubripoint_user', JSON.stringify(res.data));
        }
      })
      .catch(() => {
        /* 401 manejado por el interceptor; otros errores conservan el usuario en caché */
      });
  }, [token]);

  const hasPermission = useCallback(
    // Los permisos los define el backend (user.permisos). Sin permisos cargados → sin acceso.
    (permission: Permission) => !!user?.permisos?.includes(permission),
    [user?.permisos],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token && !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
