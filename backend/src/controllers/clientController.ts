import { Request, Response } from 'express';
import clientService from '../services/clientService';
import commissionService from '../services/commissionService';
import leadService from '../services/leadService';

/**
 * Controlador para clientes referidores
 */
class ClientController {
  /**
   * Obtener información del cliente por número de WispHub
   * GET /api/clients/:wispHubId
   */
  async getClientInfo(req: Request, res: Response) {
    try {
      const { wispHubId } = req.params;

      const client = await clientService.getByWispChatId(wispHubId);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }

      return res.json({
        success: true,
        data: client,
      });
    } catch (error: any) {
      console.error('Error getting client info:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Obtener referidos del cliente
   * GET /api/clients/:wispHubId/referrals
   */
  async getClientReferrals(req: Request, res: Response) {
    try {
      const { wispHubId } = req.params;

      const client = await clientService.getByWispChatId(wispHubId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }

      const referrals = await leadService.getClientReferrals(client.id);

      return res.json({
        success: true,
        data: referrals,
      });
    } catch (error: any) {
      console.error('Error getting client referrals:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Obtener comisiones del cliente
   * GET /api/clients/:wispHubId/commissions
   */
  async getClientCommissions(req: Request, res: Response) {
    try {
      const { wispHubId } = req.params;
      const { status, type } = req.query;

      const client = await clientService.getByWispChatId(wispHubId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }

      const filters: any = {};
      if (status) filters.status = status;
      if (type) filters.type = type;

      const commissions = await commissionService.getClientCommissions(
        client.id,
        filters
      );

      return res.json({
        success: true,
        data: commissions,
      });
    } catch (error: any) {
      console.error('Error getting client commissions:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Obtener resumen de comisiones del cliente
   * GET /api/clients/:wispHubId/summary
   */
  async getClientSummary(req: Request, res: Response) {
    try {
      const { wispHubId } = req.params;

      const client = await clientService.getByWispChatId(wispHubId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }

      const [stats, summary] = await Promise.all([
        clientService.getClientStats(client.id),
        commissionService.getClientSummary(client.id),
      ]);

      return res.json({
        success: true,
        data: {
          client: {
            wispChatClientId: client.wispChatClientId,
            nombre: client.nombre,
            email: client.email,
            referralCode: client.referralCode,
            shareUrl: `${process.env.FRONTEND_URL}${client.shareUrl}`,
          },
          stats,
          summary,
        },
      });
    } catch (error: any) {
      console.error('Error getting client summary:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Obtener historial de aplicaciones
   * GET /api/clients/:wispHubId/applications
   */
  async getApplicationHistory(req: Request, res: Response) {
    try {
      const { wispHubId } = req.params;

      const client = await clientService.getByWispChatId(wispHubId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }

      const history = await commissionService.getClientApplicationHistory(client.id);

      return res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Error getting application history:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new ClientController();
