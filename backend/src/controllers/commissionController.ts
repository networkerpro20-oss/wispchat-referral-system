import { Request, Response } from 'express';
import { commissionService } from '../services/commissionService';
import { CommissionType, CommissionStatus } from '@prisma/client';

export class CommissionController {
  // Obtener mis comisiones
  async getMyCommissions(req: Request, res: Response) {
    try {
      const { tenantId, id: userId } = req.user!;
      const commissions = await commissionService.getMyCommissions(tenantId, userId);

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

  // Generar comisión por instalación (Admin/Webhook)
  async generateInstallationCommission(req: Request, res: Response) {
    try {
      const { referralId } = req.params;
      const commission = await commissionService.generateInstallationCommission(referralId);

      res.status(201).json({
        success: true,
        data: commission,
        message: 'Installation commission generated',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Generar comisión mensual (Webhook)
  async generateMonthlyCommission(req: Request, res: Response) {
    try {
      const { referralId } = req.params;
      const { paymentNumber, paymentDate } = req.body;

      const commission = await commissionService.generateMonthlyCommission(
        referralId,
        paymentNumber,
        new Date(paymentDate)
      );

      if (!commission) {
        return res.status(400).json({
          success: false,
          message: 'Commission not generated (payment number exceeds limit)',
        });
      }

      res.status(201).json({
        success: true,
        data: commission,
        message: 'Monthly commission generated',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Aplicar comisión a factura (Admin)
  async applyToInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { invoiceId, appliedAmount } = req.body;

      const commission = await commissionService.applyToInvoice(id, invoiceId, appliedAmount);

      res.json({
        success: true,
        data: commission,
        message: 'Commission applied to invoice',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cancelar comisión (Admin)
  async cancelCommission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const commission = await commissionService.cancelCommission(id, reason);

      res.json({
        success: true,
        data: commission,
        message: 'Commission cancelled',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener todas las comisiones (Admin)
  async getAllCommissions(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { status, type } = req.query;

      const commissions = await commissionService.getAllCommissions(tenantId, {
        status: status as CommissionStatus,
        type: type as CommissionType,
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

  // Obtener resumen de comisiones (Admin)
  async getCommissionsSummary(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const summary = await commissionService.getCommissionsSummary(tenantId);

      res.json({
        success: true,
        data: summary,
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
