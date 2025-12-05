'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRouter() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    routeToDashboard();
  }, []);

  const routeToDashboard = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        // No hay token, quedarse en la landing
        router.push('/');
        return;
      }

      // Decodificar token para ver el role
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role || payload.rol;

      if (userRole === 'admin') {
        // Es admin, ir al dashboard admin
        router.push('/admin/dashboard');
      } else {
        // Es cliente, verificar si está registrado
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-backend.onrender.com/api/v1';
        const response = await fetch(`${API_URL}/referrals/check`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.data.registered) {
            // Ya registrado, ir a dashboard cliente
            router.push('/cliente/dashboard');
          } else if (data.data.eligible) {
            // Elegible pero no registrado, auto-registrar
            await autoRegister(token);
          } else {
            // No elegible
            setError('No eres elegible para el programa de referidos');
            setLoading(false);
          }
        } else {
          throw new Error('Error al verificar registro');
        }
      }
    } catch (err: any) {
      console.error('Error en router:', err);
      setError('Error al cargar dashboard. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  const autoRegister = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-backend.onrender.com/api/v1';
      const response = await fetch(`${API_URL}/referrals/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Registro exitoso, ir a dashboard cliente
        router.push('/cliente/dashboard');
      } else {
        throw new Error('Error al registrar');
      }
    } catch (err) {
      console.error('Error auto-registro:', err);
      setError('Error al registrarse. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando tu dashboard...</p>
      </div>
    </div>
  );
}
