import { Request, Response } from 'express';
import { commissionService } from '../services/commissionService';
import { wispHubService } from '../services/wispHubService';
import { installationService } from '../services/installationService';

export class CommissionController {
  // Obtener todas las comisiones de un tenant
  async getAllCommissions(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const { status, referralId } = req.query;

      const commissions = await commissionService.getAllCommissions(tenantId, {
        status: status as any,
        referralId: referralId as string,
      });

      res.json({
        success: true,
        data: commissions,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Verificar manualmente si cliente pagó y generar comisión
  async checkPaymentAndGenerateCommission(req: Request, res: Response) {
    try {
      const { installationId } = req.params;

      // Obtener instalación
      const installation = await installationService.getInstallationById(installationId);

      if (!installation || !installation.wispHubClientId) {
        return res.status(404).json({
          success: false,
          message: 'Installation not found or missing WispHub client ID',
        });
      }

      // Verificar si el cliente pagó
      const hasPaid = await wispHubService.clientHasPaid(installation.wispHubClientId);

      if (!hasPaid) {
        return res.json({
          success: false,
          message: 'Client has pending invoices',
        });
      }

      // Obtener comisiones existentes
      const existingCommissions = await commissionService.getCommissionsByReferral(
        installation.referralId
      );
      const monthlyCommissions = existingCommissions.filter(c => c.type === 'MONTHLY');
      
      // Verificar si ya alcanzó el límite (6 pagos)
      if (monthlyCommissions.length >= 6) {
        return res.json({
          success: false,
          message: 'Commission limit reached (6 monthly payments)',
        });
      }

      // Generar comisión mensual
      const nextPaymentNumber = monthlyCommissions.length + 1;
      const commission = await commissionService.generateMonthlyCommission(
        installation.referralId,
        nextPaymentNumber,
        new Date()
      );

      res.json({
        success: true,
        data: commission,
        message: `Monthly commission #${nextPaymentNumber} generated`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Aplicar comisión a cuenta del cliente (EARNED → APPLIED)
  async applyCommission(req: Request, res: Response) {
    try {
      const { commissionId } = req.params;
      const { appliedToInvoice } = req.body;

      const commission = await commissionService.applyCommission(
        commissionId,
        appliedToInvoice
      );

      res.json({
        success: true,
        data: commission,
        message: 'Commission applied successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Editar comisión manualmente (admin)
  async updateCommission(req: Request, res: Response) {
    try {
      const { commissionId } = req.params;
      const { amount, status, notes } = req.body;

      const commission = await commissionService.updateCommission(commissionId, {
        amount,
        status,
        notes,
      });

      res.json({
        success: true,
        data: commission,
        message: 'Commission updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener resumen de comisiones pendientes por aplicar
  async getPendingBalance(req: Request, res: Response) {
    try {
      const { tenantId, referrerId } = req.params;

      const commissions = await commissionService.getAllCommissions(tenantId, {
        status: 'EARNED',
        referralId: referrerId,
      });

      const totalPending = commissions.reduce((sum, c) => sum + c.amount, 0);

      res.json({
        success: true,
        data: {
          totalCommissions: commissions.length,
          totalAmount: totalPending,
          commissions,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Eliminar comisión (admin)
  async deleteCommission(req: Request, res: Response) {
    try {
      const { commissionId } = req.params;

      await commissionService.deleteCommission(commissionId);

      res.json({
        success: true,
        message: 'Commission deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const commissionController = new CommissionController();

  // Obtener comisiones del cliente actual
  async getMyCommissions(req: any, res: any) {
    try {
      const clientId = req.user.clientId;
      const commissions = await commissionService.getCommissionsByClient(clientId);
      res.json({ success: true, data: commissions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Obtener resumen de comisiones
  async getCommissionsSummary(req: any, res: any) {
    try {
      const clientId = req.user.clientId;
      const summary = await commissionService.getCommissionsSummary(clientId);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Generar comisión por instalación (admin)
  async generateInstallationCommission(req: any, res: any) {
    try {
      const { referralId } = req.body;
      const commission = await commissionService.generateInstallationCommission(referralId);
      res.json({ success: true, data: commission });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Generar comisión mensual (admin)
  async generateMonthlyCommission(req: any, res: any) {
    try {
      const { referralId, paymentNumber, paymentDate } = req.body;
      const commission = await commissionService.generateMonthlyCommission(
        referralId,
        paymentNumber,
        new Date(paymentDate)
      );
      res.json({ success: true, data: commission });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Aplicar comisión a factura
  async applyToInvoice(req: any, res: any) {
    try {
      const { id } = req.params;
      const { invoiceId } = req.body;
      const commission = await commissionService.applyCommission(id, invoiceId);
      res.json({ success: true, data: commission });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Cancelar comisión
  async cancelCommission(req: any, res: any) {
    try {
      const { id } = req.params;
      const commission = await commissionService.updateCommission(id, {
        status: 'CANCELLED' as any,
      });
      res.json({ success: true, data: commission });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const commissionController = new CommissionController();
