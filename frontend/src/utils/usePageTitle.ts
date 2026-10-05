import { useEffect } from 'react';

const APP = 'Lubripoint';

export const usePageTitle = (titulo?: string) => {
  useEffect(() => {
    document.title = titulo ? `${titulo} · ${APP}` : `${APP} · Gestión de Taller e Inventario`;
  }, [titulo]);
};
