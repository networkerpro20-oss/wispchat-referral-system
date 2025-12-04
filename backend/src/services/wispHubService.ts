import axios from 'axios';

class WispHubService {
  private wispHubApiUrl: string;
  private wispHubApiKey: string;
  private tenantDomain: string;

  constructor() {
    this.wispHubApiUrl = process.env.WISPHUB_API_URL || 'https://wispchat-backend.onrender.com';
    this.wispHubApiKey = process.env.WISPHUB_API_KEY || '';
    this.tenantDomain = process.env.TENANT_DOMAIN || 'wispchat.net';
  }

  /**
   * Verificar si un cliente tiene facturas pendientes en WispHub
   * @param wispHubClientId ID del cliente en WispHub
   * @returns true si NO tiene facturas pendientes (ya pagó)
   */
  async clientHasPaid(wispHubClientId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.wispHubApiUrl}/api/v1/crm/wisphub/clients/${wispHubClientId}/invoices`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Domain': this.tenantDomain,
          },
        }
      );

      if (!response.data.success) {
        console.error(`[WispHub] Error getting invoices for ${wispHubClientId}`);
        return false;
      }

      const invoices = response.data.data || [];
      
      // Filtrar facturas pendientes
      const pendingInvoices = invoices.filter((inv: any) => 
        inv.estado === 'pendiente' || inv.estado === 'pending'
      );

      // Si NO tiene facturas pendientes = Ya pagó
      const hasPaid = pendingInvoices.length === 0;

      console.log(`[WispHub] Client ${wispHubClientId}: ${hasPaid ? 'PAID' : 'PENDING'} (${pendingInvoices.length} invoices pending)`);

      return hasPaid;
    } catch (error: any) {
      console.error(`[WispHub] Error checking payment for ${wispHubClientId}:`, error.message);
      return false;
    }
  }

  /**
   * Verificar si un cliente existe en WispHub
   * @param wispHubClientId ID del cliente en WispHub
   * @returns true si existe
   */
  async clientExists(wispHubClientId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.wispHubApiUrl}/api/v1/crm/wisphub/clients/${wispHubClientId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Domain': this.tenantDomain,
          },
        }
      );

      return response.data.success && response.data.data;
    } catch (error: any) {
      console.error(`[WispHub] Error checking client ${wispHubClientId}:`, error.message);
      return false;
    }
  }

  /**
   * Aplicar descuento a la próxima factura del cliente
   * @param wispHubClientId ID del cliente
   * @param amount Monto del descuento
   * @param description Descripción del descuento
   */
  async applyDiscount(
    wispHubClientId: string,
    amount: number,
    description: string
  ): Promise<boolean> {
    try {
      // TODO: Implementar endpoint en WispChat backend para aplicar descuentos
      // Por ahora, solo loguear
      console.log(`[WispHub] Apply discount to ${wispHubClientId}: $${amount} - ${description}`);
      return true;
    } catch (error: any) {
      console.error(`[WispHub] Error applying discount:`, error.message);
      return false;
    }
  }
}

export const wispHubService = new WispHubService();
