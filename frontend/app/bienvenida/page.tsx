'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Gift, TrendingUp, Users, DollarSign, Loader2, CheckCircle } from 'lucide-react';

export default function BienvenidaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('No se proporcionó token de autenticación');
      setLoading(false);
      return;
    }

    validateAndCheck(token);
  }, [searchParams]);

  const validateAndCheck = async (token: string) => {
    try {
      // Validar token y extraer información del usuario
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserName(payload.nombre || 'Cliente');
      setUserEmail(payload.email || '');

      // Guardar token en localStorage
      localStorage.setItem('accessToken', token);

      // Verificar si ya está registrado
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-backend.onrender.com/api/v1';
      const checkResponse = await fetch(`${API_URL}/referrals/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        
        if (checkData.data.registered) {
          // Ya está registrado, ir directo al dashboard
          setIsRegistered(true);
          setTimeout(() => {
            router.push('/cliente/dashboard');
          }, 1500);
        } else {
          // No registrado, mostrar pantalla de bienvenida
          setLoading(false);
        }
      } else {
        throw new Error('Error al verificar registro');
      }
    } catch (err: any) {
      console.error('Error en validación:', err);
      setError('Error al validar la sesión. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No hay token de sesión');

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-backend.onrender.com/api/v1';
      const response = await fetch(`${API_URL}/referrals/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Registro exitoso, redirigir al dashboard
        setTimeout(() => {
          router.push('/cliente/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al registrar');
      }
    } catch (err: any) {
      console.error('Error al registrar:', err);
      setError(err.message || 'Error al procesar el registro');
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando tu información...</p>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Ya estás registrado!</h2>
          <p className="text-gray-600">Redirigiendo a tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={() => window.close()}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-6">
            <Gift className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            ¡Bienvenido, {userName}! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Únete a nuestro programa de referidos y empieza a ganar
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">$500</h3>
            <p className="text-gray-600">Por cada instalación exitosa</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">$50/mes</h3>
            <p className="text-gray-600">Durante 6 meses por cada referido activo</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">$800</h3>
            <p className="text-gray-600">Total por referido (instalación + 6 meses)</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">¿Cómo funciona?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Obtén tu código único</h3>
                <p className="text-gray-600">Te asignaremos un código de referido personalizado que podrás compartir</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Comparte con amigos y conocidos</h3>
                <p className="text-gray-600">Envía tu enlace a personas que puedan estar interesadas en nuestros servicios</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Gana comisiones automáticamente</h3>
                <p className="text-gray-600">Cuando se instale el servicio y mantenga su suscripción, recibirás tus comisiones</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={handleRegister}
            disabled={registering}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registering ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Gift className="w-6 h-6" />
                Generar Mi Enlace de Referido
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Al continuar, aceptas participar en el programa de referidos
          </p>
        </div>
      </div>
    </div>
  );
}
