import { Request, Response } from 'express';
import commissionService from '../services/commissionService';
import clientService from '../services/clientService';
import leadService from '../services/leadService';
import wispHubService from '../services/wispHubService';
import prisma from '../lib/prisma';

/**
 * Controlador para panel de administración
 */
class AdminController {
  /**
   * Dashboard: resumen general
   * GET /api/admin/dashboard
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const [
        totalClients,
        totalLeads,
        pendingLeads,
        installedLeads,
        pendingCommissions,
        totalEarned,
        totalApplied,
      ] = await Promise.all([
        prisma.client.count({ where: { active: true } }),
        prisma.referral.count(),
        prisma.referral.count({ where: { status: 'PENDING' } }),
        prisma.referral.count({ where: { status: 'INSTALLED' } }),
        prisma.commission.count({ where: { status: 'EARNED' } }),
        prisma.commission.aggregate({
          where: { status: { in: ['EARNED', 'APPLIED'] } },
          _sum: { amount: true },
        }),
        prisma.commissionApplication.aggregate({
          _sum: { amount: true },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          clients: {
            total: totalClients,
          },
          leads: {
            total: totalLeads,
            pending: pendingLeads,
            installed: installedLeads,
          },
          commissions: {
            pending: pendingCommissions,
            totalEarned: Number(totalEarned._sum.amount || 0),
            totalApplied: Number(totalApplied._sum.amount || 0),
            pendingAmount: Number(totalEarned._sum.amount || 0) - Number(totalApplied._sum.amount || 0),
          },
        },
      });
    } catch (error: any) {
      console.error('Error getting dashboard:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Listar todos los clientes
   * GET /api/admin/clients
   */
  async listClients(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;

      const result = await clientService.listActive(
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 50
      );

      return res.json({
        success: true,
        data: result.clients,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Error listing clients:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Sincronizar cliente desde WispHub
   * POST /api/admin/clients/sync
   */
  async syncClient(req: Request, res: Response) {
    try {
      const { wispHubClientId } = req.body;

      if (!wispHubClientId) {
        return res.status(400).json({
          success: false,
          message: 'El campo wispHubClientId es requerido',
        });
      }

      // Obtener datos desde WispHub
      const wispHubClient = await wispHubService.getClient(wispHubClientId);

      if (!wispHubClient) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado en WispHub',
        });
      }

      // Sincronizar en nuestro sistema
      const client = await clientService.syncFromWispHub({
        wispHubClientId,
        nombre: wispHubClient.name || wispHubClient.nombre,
        email: wispHubClient.email,
        telefono: wispHubClient.phone || wispHubClient.telefono,
      });

      return res.json({
        success: true,
        message: 'Cliente sincronizado correctamente',
        data: client,
      });
    } catch (error: any) {
      console.error('Error syncing client:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Listar comisiones pendientes
   * GET /api/admin/commissions/pending
   */
  async getPendingCommissions(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;

      const result = await commissionService.getPendingCommissions(
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 50
      );

      return res.json({
        success: true,
        data: result.commissions,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Error getting pending commissions:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Aplicar comisión a factura
   * POST /api/admin/commissions/:id/apply
   */
  async applyCommission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        amount,
        wispHubInvoiceId,
        invoiceMonth,
        invoiceAmount,
        appliedBy,
        notas,
      } = req.body;

      // Validar campos requeridos
      if (!amount || !wispHubInvoiceId || !invoiceMonth || !invoiceAmount || !appliedBy) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos',
        });
      }

      const application = await commissionService.applyToInvoice({
        commissionId: id,
        amount: parseFloat(amount),
        wispHubInvoiceId,
        invoiceMonth,
        invoiceAmount: parseFloat(invoiceAmount),
        appliedBy,
        notas,
      });

      return res.json({
        success: true,
        message: 'Comisión aplicada correctamente',
        data: application,
      });
    } catch (error: any) {
      console.error('Error applying commission:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Cancelar comisión
   * POST /api/admin/commissions/:id/cancel
   */
  async cancelCommission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'El campo reason es requerido',
        });
      }

      const commission = await commissionService.cancelCommission(id, reason);

      return res.json({
        success: true,
        message: 'Comisión cancelada correctamente',
        data: commission,
      });
    } catch (error: any) {
      console.error('Error cancelling commission:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Generar comisión mensual manualmente
   * POST /api/admin/commissions/generate-monthly
   */
  async generateMonthlyCommission(req: Request, res: Response) {
    try {
      const { referralId, monthNumber, monthDate } = req.body;

      if (!referralId || !monthNumber || !monthDate) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: referralId, monthNumber, monthDate',
        });
      }

      const commission = await commissionService.generateMonthlyCommission(
        referralId,
        parseInt(monthNumber),
        new Date(monthDate)
      );

      return res.json({
        success: true,
        message: 'Comisión mensual generada correctamente',
        data: commission,
      });
    } catch (error: any) {
      console.error('Error generating monthly commission:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Verificar cliente en WispHub
   * GET /api/admin/wisphub/clients/:clientId
   */
  async checkWispHubClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;

      const exists = await wispHubService.clientExists(clientId);

      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado en WispHub',
        });
      }

      const client = await wispHubService.getClient(clientId);

      return res.json({
        success: true,
        data: client,
      });
    } catch (error: any) {
      console.error('Error checking WispHub client:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new AdminController();
