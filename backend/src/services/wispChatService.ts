import axios, { AxiosInstance } from 'axios';
import prisma from '../lib/prisma';

interface WispChatAuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

interface WispChatClient {
  id: string;
  clientNumber: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
}

interface WispChatClientsResponse {
  success: boolean;
  data: WispChatClient[];
}

class WispChatService {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private tenantDomain: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.baseUrl = process.env.WISPCHAT_API_URL || 'https://wispchat-backend.onrender.com';
    this.tenantDomain = process.env.WISPCHAT_TENANT_DOMAIN || 'easyaccessnet.com';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Domain': this.tenantDomain,
      },
    });
  }

  /**
   * Obtener token de autenticación (cachea por 1 hora)
   */
  private async getAuthToken(): Promise<string> {
    // Si tenemos token válido, usarlo
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    // Obtener credenciales de Settings
    const settings = await prisma.settings.findFirst();
    if (!settings?.wispChatAdminEmail || !settings?.wispChatAdminPassword) {
      throw new Error('Credenciales de WispChat no configuradas en Settings');
    }

    try {
      const response = await this.axiosInstance.post<WispChatAuthResponse>('/api/v1/auth/login', {
        email: settings.wispChatAdminEmail,
        password: settings.wispChatAdminPassword,
      });

      if (!response.data.success || !response.data.data.token) {
        throw new Error('Login fallido en WispChat');
      }

      this.token = response.data.data.token;
      // Token válido por 1 hora
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      return this.token;
    } catch (error: any) {
      console.error('❌ Error obteniendo token de WispChat:', error.message);
      throw new Error(`Falló autenticación con WispChat: ${error.message}`);
    }
  }

  /**
   * Verificar si un email/teléfono existe como cliente en WispChat
   */
  async findClientByEmailOrPhone(email?: string, phone?: string): Promise<WispChatClient | null> {
    if (!email && !phone) {
      return null;
    }

    try {
      const token = await this.getAuthToken();

      // Buscar por email
      if (email) {
        const response = await this.axiosInstance.get<WispChatClientsResponse>(
          '/api/v1/crm/clients',
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { email, limit: 1 },
          }
        );

        if (response.data.success && response.data.data.length > 0) {
          return response.data.data[0];
        }
      }

      // Buscar por teléfono si no se encontró por email
      if (phone) {
        const response = await this.axiosInstance.get<WispChatClientsResponse>(
          '/api/v1/crm/clients',
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { phone, limit: 1 },
          }
        );

        if (response.data.success && response.data.data.length > 0) {
          return response.data.data[0];
        }
      }

      return null;
    } catch (error: any) {
      console.error('❌ Error buscando cliente en WispChat:', error.message);
      return null;
    }
  }

  /**
   * Obtener datos completos de un cliente por ID
   */
  async getClientById(clientId: string): Promise<WispChatClient | null> {
    try {
      const token = await this.getAuthToken();

      const response = await this.axiosInstance.get<{ success: boolean; data: WispChatClient }>(
        `/api/v1/crm/clients/${clientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error(`❌ Error obteniendo cliente ${clientId} de WispChat:`, error.message);
      return null;
    }
  }

  /**
   * Verificar si un cliente tiene pagos activos
   */
  async isClientActive(clientId: string): Promise<boolean> {
    try {
      const client = await this.getClientById(clientId);
      return client?.status === 'active';
    } catch (error) {
      return false;
    }
  }
}

export default new WispChatService();
