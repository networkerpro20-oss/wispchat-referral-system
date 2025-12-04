import axios from 'axios';

/**
 * Cliente para integración con WispHub
 * Lee datos de clientes y facturas
 */
class WispHubService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.WISPHUB_API_URL || 'https://wispchat-backend.onrender.com';
    this.apiKey = process.env.WISPHUB_API_KEY || '';
  }

  /**
   * Verificar si existe un cliente en WispHub
   */
  async clientExists(clientNumber: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/crm/wisphub/clients/${clientNumber}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Domain': 'easyaccessnet.com',
          },
        }
      );
      return response.status === 200 && response.data?.data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener datos del cliente desde WispHub
   */
  async getClient(clientNumber: string): Promise<any | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/crm/wisphub/clients/${clientNumber}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Domain': 'easyaccessnet.com',
          },
        }
      );
      return response.data?.data || null;
    } catch (error) {
      console.error('Error getting WispHub client:', error);
      return null;
    }
  }

  /**
   * Obtener facturas del cliente
   */
  async getClientInvoices(clientNumber: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/crm/wisphub/clients/${clientNumber}/invoices`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Domain': 'easyaccessnet.com',
          },
        }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error('Error getting WispHub invoices:', error);
      return [];
    }
  }

  /**
   * Verificar si el cliente pagó su factura del mes
   */
  async didClientPayThisMonth(clientNumber: string, month: string): Promise<boolean> {
    try {
      const invoices = await this.getClientInvoices(clientNumber);
      
      // Buscar factura del mes especificado que esté pagada
      const monthInvoice = invoices.find((inv: any) => {
        const invoiceDate = new Date(inv.date);
        const targetMonth = new Date(month);
        return (
          invoiceDate.getMonth() === targetMonth.getMonth() &&
          invoiceDate.getFullYear() === targetMonth.getFullYear() &&
          inv.status === 'paid'
        );
      });

      return !!monthInvoice;
    } catch (error) {
      console.error('Error checking payment:', error);
      return false;
    }
  }

  /**
   * Obtener estado del cliente (activo, suspendido, cancelado)
   */
  async getClientStatus(clientNumber: string): Promise<'active' | 'suspended' | 'cancelled'> {
    try {
      const client = await this.getClient(clientNumber);
      if (!client) return 'cancelled';
      
      // Mapear el estado de WispHub al nuestro
      const status = client.status?.toLowerCase();
      if (status === 'active' || status === 'activo') return 'active';
      if (status === 'suspended' || status === 'suspendido') return 'suspended';
      return 'cancelled';
    } catch (error) {
      console.error('Error getting client status:', error);
      return 'cancelled';
    }
  }

  /**
   * Listar todos los clientes activos de Easy Access
   */
  async listActiveClients(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/crm/wisphub/clients`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Domain': 'easyaccessnet.com',
          },
          params: {
            status: 'active',
            limit: 1000,
          },
        }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error('Error listing WispHub clients:', error);
      return [];
    }
  }
}

export default new WispHubService();
