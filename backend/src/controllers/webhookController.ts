import { Request, Response } from 'express';
import { commissionService } from '../services/commissionService';
import { referralService } from '../services/referralService';
import { installationService } from '../services/installationService';

export class WebhookController {
  // Webhook para notificar pago recibido de WispChat
  async paymentReceived(req: Request, res: Response) {
    try {
      const {
        tenantId,
        clientId,
        wispHubClientId,
        amount,
        paymentDate,
        invoiceId,
      } = req.body;

      // Buscar instalación relacionada con este cliente
      const installations = await installationService.getAllInstallations(tenantId);
      const installation = installations.find(
        i => i.clientId === clientId || i.wispHubClientId === wispHubClientId
      );

      if (!installation || !installation.referral) {
        return res.status(404).json({
          success: false,
          message: 'No referral found for this client',
        });
      }

      const referralId = installation.referralId;

      // Obtener todas las comisiones mensuales ya generadas
      const existingCommissions = await commissionService.getCommissionsByReferral(referralId);
      const monthlyCommissions = existingCommissions.filter(c => c.type === 'MONTHLY');
      
      // Determinar número de pago (siguiente comisión mensual)
      const nextPaymentNumber = monthlyCommissions.length + 1;

      // Generar comisión mensual
      const commission = await commissionService.generateMonthlyCommission(
        referralId,
        nextPaymentNumber,
        new Date(paymentDate)
      );

      if (!commission) {
        return res.json({
          success: true,
          message: 'Payment received but no commission generated (limit reached)',
        });
      }

      res.json({
        success: true,
        data: commission,
        message: `Monthly commission #${nextPaymentNumber} generated successfully`,
      });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Webhook para notificar creación de cliente en WispChat
  async clientCreated(req: Request, res: Response) {
    try {
      const {
        tenantId,
        clientId,
        wispHubClientId,
        email,
      } = req.body;

      // Buscar referido por email
      const referrals = await referralService.getAllReferrals(tenantId, {
        search: email,
      });

      if (referrals.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No referral found for this email',
        });
      }

      const referral = referrals[0];

      // Actualizar instalación con IDs del cliente
      const installation = await installationService.getInstallationByReferralId(referral.id);

      if (installation) {
        await installationService.updateInstallation(installation.id, {
          clientId,
          wispHubClientId,
        });
      }

      res.json({
        success: true,
        message: 'Client linked to referral',
      });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const webhookController = new WebhookController();
