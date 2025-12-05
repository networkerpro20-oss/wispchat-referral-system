'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function ClientAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'validating' | 'registering' | 'success' | 'error'>('validating');
  const [message, setMessage] = useState('Validando credenciales...');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebugInfo(prev => [...prev, msg]);
  };

  useEffect(() => {
    const validateAndRegister = async () => {
      try {
        addDebug('🚀 Iniciando validación...');
        
        // 1. Obtener token de la URL
        const token = searchParams?.get('token');
        addDebug(`📝 Token recibido: ${token ? 'SÍ (' + token.substring(0, 30) + '...)' : 'NO'}`);

        if (!token) {
          setStatus('error');
          setMessage('Token no proporcionado en la URL');
          addDebug('❌ No hay token en la URL');
          return;
        }

        // 2. Guardar token en localStorage
        localStorage.setItem('accessToken', token);
        addDebug('💾 Token guardado en localStorage');

        // 3. Verificar API URL - DEBE apuntar al backend de WispChat
        const API_URL = 'https://wispchat-backend.onrender.com/api/v1';
        addDebug(`🌐 API_URL (WispChat backend): ${API_URL}`);
        
        const checkUrl = `${API_URL}/referrals/check`;
        addDebug(`📡 Llamando a: ${checkUrl}`);

        const checkResponse = await fetch(checkUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        addDebug(`📊 Status response: ${checkResponse.status} ${checkResponse.statusText}`);

        if (!checkResponse.ok) {
          const errorText = await checkResponse.text();
          addDebug(`❌ Error response: ${errorText}`);
          throw new Error(`Error ${checkResponse.status}: ${errorText}`);
        }

        const checkData = await checkResponse.json();
        addDebug(`✅ Verificación exitosa: ${JSON.stringify(checkData)}`);

        if (checkData.data.registered) {
          // Ya está registrado, ir directo al dashboard
          setStatus('success');
          setMessage('¡Bienvenido de nuevo! Redirigiendo a tu dashboard...');
          addDebug('✨ Usuario ya registrado, redirigiendo...');

          setTimeout(() => {
            router.push('/cliente/dashboard');
          }, 1500);

        } else if (checkData.data.eligible) {
          // Elegible pero no registrado, auto-registrar
          setStatus('registering');
          setMessage('Registrándote en el programa de referidos...');
          addDebug('📝 Usuario elegible, registrando...');

          const API_URL = 'https://wispchat-backend.onrender.com/api/v1';
          const registerUrl = `${API_URL}/referrals/register`;
          addDebug(`📡 Registrando en: ${registerUrl}`);

          const registerResponse = await fetch(registerUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          addDebug(`📊 Register status: ${registerResponse.status}`);

          if (!registerResponse.ok) {
            const errorData = await registerResponse.json();
            addDebug(`❌ Error al registrar: ${JSON.stringify(errorData)}`);
            throw new Error(errorData.error?.message || 'Error al registrar');
          }

          const registerData = await registerResponse.json();
          addDebug(`✅ Registro exitoso: ${JSON.stringify(registerData)}`);

          setStatus('success');
          setMessage('¡Registro exitoso! Generando tu código de referido...');

          setTimeout(() => {
            router.push('/cliente/dashboard');
          }, 2000);

        } else {
          // No elegible
          addDebug(`⚠️ Usuario no elegible: ${checkData.data.reason}`);
          setStatus('error');
          setMessage(checkData.data.reason || 'No eres elegible para el programa de referidos');
        }

      } catch (error: any) {
        console.error('❌ Error en auth:', error);
        addDebug(`❌ ERROR: ${error.message}`);
        setStatus('error');
        setMessage(error.message || 'Error de conexión');
      }
    };

    validateAndRegister();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 mb-4">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎁</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Promociona y Gana
            </h1>
            <p className="text-sm text-gray-500">
              Programa de Referidos Easy Access
            </p>
          </div>

          {/* Status */}
          <div className="text-center">
            {status === 'validating' && (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto" />
                <p className="text-gray-600 font-medium">{message}</p>
                <p className="text-sm text-gray-400">Verificando tu elegibilidad...</p>
              </div>
            )}

            {status === 'registering' && (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto" />
                <p className="text-emerald-600 font-semibold">{message}</p>
                <div className="bg-emerald-50 rounded-lg p-4 text-sm text-emerald-700">
                  <p className="font-medium mb-2">📝 Creando tu cuenta de referidos</p>
                  <p className="text-xs">Esto solo toma unos segundos...</p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="w-20 h-20 text-green-600 mx-auto animate-bounce" />
                <p className="text-green-600 font-bold text-xl">{message}</p>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-700 text-sm font-medium mb-2">
                    ✅ Todo listo
                  </p>
                  <p className="text-green-600 text-xs">
                    Accediendo a tu panel de referidos...
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                <p className="text-red-600 font-semibold">{message}</p>
                <div className="bg-red-50 rounded-lg p-4 text-sm text-red-700">
                  <p className="font-medium mb-2">⚠️ No se pudo completar la autenticación</p>
                  <p className="text-xs">Por favor, intenta de nuevo desde WispChat</p>
                </div>
                <button
                  onClick={() => window.close()}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Cerrar ventana
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              🔒 Autenticación segura mediante WispChat
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Programa de referidos Easy Access NewTelecom
            </p>
          </div>
        </div>

        {/* Debug Panel */}
        {debugInfo.length > 0 && (
          <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold">🔍 Debug Console</span>
              <button
                onClick={() => setDebugInfo([])}
                className="text-gray-400 hover:text-white text-xs"
              >
                Limpiar
              </button>
            </div>
            {debugInfo.map((info, idx) => (
              <div key={idx} className="py-1 border-b border-gray-800">
                <span className="text-gray-500">[{idx + 1}]</span> {info}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ClientAuthContent />
    </Suspense>
  );
}
