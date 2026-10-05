import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { RequirePermission, HomeRoute } from './components/RequirePermission';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NuevaVenta } from './pages/NuevaVenta';
import { CategoriasProductos } from './pages/CategoriasProductos';
import { HistorialVentas } from './pages/HistorialVentas';
import { Inventario } from './pages/Inventario';
import { PerfilEquipo } from './pages/PerfilEquipo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<HomeRoute dashboard={<Dashboard />} />} />
          <Route
            path="/nueva-venta"
            element={
              <RequirePermission permission="ordenes.create">
                <NuevaVenta />
              </RequirePermission>
            }
          />
          <Route
            path="/categorias"
            element={
              <RequirePermission permission="catalogo.view">
                <CategoriasProductos />
              </RequirePermission>
            }
          />
          <Route
            path="/historial"
            element={
              <RequirePermission permission="ordenes.view">
                <HistorialVentas />
              </RequirePermission>
            }
          />
          <Route
            path="/inventario"
            element={
              <RequirePermission permission="catalogo.view">
                <Inventario />
              </RequirePermission>
            }
          />
          <Route path="/perfil" element={<PerfilEquipo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
