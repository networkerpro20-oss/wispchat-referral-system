'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * Página de autenticación SSO
 * Recibe token de WispChat y valida con backend
 * Si válido: guarda en localStorage y redirige a /admin
 */

export default function AdminAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'validating' | 'success' | 'error'>('validating');
  const [message, setMessage] = useState('Validando credenciales...');

  useEffect(() => {
    const validateToken = async () => {
      try {
        // 1. Obtener token de la URL
        const token = searchParams?.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Token no proporcionado');
          return;
        }

        // 2. Validar token con backend
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('🔍 Validando token con:', API_URL);
        console.log('🔑 Token:', token?.substring(0, 50) + '...');
        
        const fullUrl = `${API_URL}/api/admin/dashboard`;
        console.log('📡 URL completa:', fullUrl);
        
        const response = await fetch(fullUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (response.ok && data.success) {
          // 3. Token válido - guardar en localStorage
          localStorage.setItem('referral_auth_token', token);
          localStorage.setItem('referral_auth_user', JSON.stringify({
            email: data.userEmail || 'admin',
            role: data.userRole || 'admin',
            validated: true,
            timestamp: Date.now()
          }));

          setStatus('success');
          setMessage('Autenticación exitosa. Redirigiendo...');

          // 4. Redirigir a admin dashboard después de 1 segundo
          setTimeout(() => {
            router.push('/admin/invoices');
          }, 1000);

        } else {
          // Token inválido
          setStatus('error');
          const errorMsg = data.message || data.error?.message || 'Token inválido o expirado';
          setMessage(`${errorMsg} (Status: ${response.status})`);
          console.error('Auth failed:', { status: response.status, data, API_URL });
        }

      } catch (error: any) {
        console.error('Error validando token:', error);
        setStatus('error');
        setMessage(`Error: ${error.message || 'Error de conexión'}`);
      }
    };

    validateToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🎁</div>
            <h1 className="text-2xl font-bold text-gray-800">
              Programa de Referidos
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Easy Access
            </p>
          </div>

          {/* Status */}
          <div className="text-center">
            {status === 'validating' && (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                <p className="text-gray-600">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <p className="text-green-600 font-semibold">{message}</p>
                <div className="text-sm text-gray-500">
                  Un momento por favor...
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                <p className="text-red-600 font-semibold">{message}</p>
                <button
                  onClick={() => window.close()}
                  className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cerrar ventana
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Autenticación segura mediante WispChat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
