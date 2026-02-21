/**
 * API client para llamadas autenticadas del admin
 */

import { API_URL } from './apiConfig';

/**
 * Obtener token de autenticación
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('referral_auth_token');
}

/**
 * Fetch autenticado
 */
async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No autenticado');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si es 401, limpiar auth y recargar
  if (response.status === 401) {
    localStorage.removeItem('referral_auth_token');
    localStorage.removeItem('referral_auth_user');
    window.location.href = '/admin';
    throw new Error('Sesión expirada');
  }

  return response;
}

/**
 * API methods
 */
export const adminApi = {
  /**
   * GET /admin/dashboard
   */
  async getDashboard() {
    const response = await authenticatedFetch('/admin/dashboard');
    return response.json();
  },

  /**
   * GET /admin/leads
   */
  async getLeads() {
    const response = await authenticatedFetch('/admin/leads');
    return response.json();
  },

  /**
   * PUT /admin/leads/:id/status
   */
  async updateLeadStatus(leadId: string, status: string) {
    const response = await authenticatedFetch(`/admin/leads/${leadId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  /**
   * POST /admin/invoices/upload
   */
  async uploadInvoices(formData: FormData) {
    const token = getAuthToken();
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_URL}/admin/invoices/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // No Content-Type header for FormData
    });

    if (response.status === 401) {
      localStorage.removeItem('referral_auth_token');
      localStorage.removeItem('referral_auth_user');
      window.location.href = '/admin';
      throw new Error('Sesión expirada');
    }

    return response.json();
  },

  /**
   * GET /admin/invoices/uploads
   */
  async getUploads() {
    const response = await authenticatedFetch('/admin/invoices/uploads');
    return response.json();
  },

  /**
   * GET /admin/invoices/uploads/:id
   */
  async getUploadDetails(uploadId: string) {
    const response = await authenticatedFetch(`/admin/invoices/uploads/${uploadId}`);
    return response.json();
  },

  /**
   * POST /admin/invoices/uploads/:id/reprocess
   */
  async reprocessUpload(uploadId: string) {
    const response = await authenticatedFetch(`/admin/invoices/uploads/${uploadId}/reprocess`, {
      method: 'POST',
    });
    return response.json();
  },

  /**
   * GET /admin/commissions
   * Listar todas las comisiones (con filtros opcionales)
   */
  async getCommissions(filters?: { status?: string; type?: string; clientId?: string; page?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.page) params.append('page', String(filters.page));
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await authenticatedFetch(`/admin/commissions${query}`);
    return response.json();
  },

  /**
   * GET /admin/commissions/active
   */
  async getActiveCommissions() {
    const response = await authenticatedFetch('/admin/commissions/active');
    return response.json();
  },

  /**
   * POST /admin/commissions/:id/apply
   * Aplica comisión a factura del cliente - requiere datos de la factura
   */
  async applyCommission(
    commissionId: string,
    data: {
      wispChatInvoiceId: string;
      invoiceMonth: string;
      invoiceAmount: number;
      appliedBy: string;
      amount?: number;
      notas?: string;
    }
  ) {
    const response = await authenticatedFetch(`/admin/commissions/${commissionId}/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * POST /admin/commissions/:id/cancel
   */
  async cancelCommission(commissionId: string, reason: string) {
    const response = await authenticatedFetch(`/admin/commissions/${commissionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },

  /**
   * POST /admin/commissions/generate/installation
   * Genera comisión de instalación manualmente para un referido INSTALLED
   */
  async generateInstallationCommission(referralId: string) {
    const response = await authenticatedFetch('/admin/commissions/generate/installation', {
      method: 'POST',
      body: JSON.stringify({ referralId }),
    });
    return response.json();
  },

  /**
   * POST /admin/commissions/generate/monthly
   * Genera comisión mensual manualmente
   */
  async generateMonthlyCommission(referralId: string, monthNumber: number, monthDate: string) {
    const response = await authenticatedFetch('/admin/commissions/generate/monthly', {
      method: 'POST',
      body: JSON.stringify({ referralId, monthNumber, monthDate }),
    });
    return response.json();
  },

  /**
   * POST /admin/clients/:id/activate-commissions
   * Activa comisiones EARNED → ACTIVE cuando el cliente paga
   */
  async activateClientCommissions(clientId: string) {
    const response = await authenticatedFetch(`/admin/clients/${clientId}/activate-commissions`, {
      method: 'POST',
    });
    return response.json();
  },
};

export default adminApi;
