/**
 * Configuración centralizada de API
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com';

/**
 * Obtener URL base de la API
 * Asegura que siempre termine con /api
 */
export const getApiUrl = (): string => {
  let base = BASE_URL.replace(/\/+$/, ''); // Quitar slash final
  if (!base.endsWith('/api')) {
    base = `${base}/api`;
  }
  return base;
};

/**
 * URL base de la API
 */
export const API_URL = getApiUrl();

/**
 * Helper para hacer fetch con auth
 */
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('referral_auth_token') 
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
  });
};

export default API_URL;
