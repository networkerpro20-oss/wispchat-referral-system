'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Detectar si viene token en la URL
    const token = searchParams.get('token');
    
    if (token) {
      // Guardar token en localStorage
      localStorage.setItem('accessToken', token);
      console.log('Token SSO guardado correctamente');
      
      // Limpiar URL (quitar el token por seguridad)
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  return null; // Este componente no renderiza nada
}
