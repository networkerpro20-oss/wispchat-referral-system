/**
 * Configuración centralizada de API
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com';

/**
 * Obtener URL base de la API (sin /api al final)
 * Las rutas deben incluir /api si es necesario
 */
export const getBaseUrl = (): string => {
  let base = BASE_URL.replace(/\/+$/, ''); // Quitar slash final
  // Quitar /api si está presente para evitar duplicación
  base = base.replace(/\/api$/, '');
  return base;
};

/**
 * URL base de la API (incluye /api)
 */
export const API_URL = `${getBaseUrl()}/api`;

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
