import { Request, Response } from 'express';
import { referralService } from '../services/referralService';
import { ReferralStatus } from '@prisma/client';

export class ReferralController {
  // Obtener configuración
  async getSettings(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const settings = await referralService.getSettings(tenantId);

      res.json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Actualizar configuración (Admin)
  async updateSettings(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const settings = await referralService.updateSettings(tenantId, req.body);

      res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Crear nuevo referido
  async createReferral(req: Request, res: Response) {
    try {
      const { tenantId, id: userId } = req.user!;
      
      const referral = await referralService.createReferral({
        tenantId,
        referrerId: userId,
        referrerName: req.body.referrerName,
        referrerEmail: req.user!.email,
        referrerPhone: req.body.referrerPhone,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        notes: req.body.notes,
      });

      res.status(201).json({
        success: true,
        data: referral,
        message: 'Referral created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener referido por ID
  async getReferralById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const referral = await referralService.getReferralById(id);

      if (!referral) {
        return res.status(404).json({
          success: false,
          message: 'Referral not found',
        });
      }

      res.json({
        success: true,
        data: referral,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener referido por shareUrl (público)
  async getReferralByShareUrl(req: Request, res: Response) {
    try {
      const { shareUrl } = req.params;
      
      // Registrar click
      await referralService.trackClick(shareUrl);
      
      const referral = await referralService.getReferralByShareUrl(shareUrl);

      if (!referral) {
        return res.status(404).json({
          success: false,
          message: 'Referral link not found',
        });
      }

      res.json({
        success: true,
        data: referral,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener mis referidos
  async getMyReferrals(req: Request, res: Response) {
    try {
      const { tenantId, id: userId } = req.user!;
      const referrals = await referralService.getMyReferrals(tenantId, userId);

      res.json({
        success: true,
        data: referrals,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener mis estadísticas
  async getMyStats(req: Request, res: Response) {
    try {
      const { tenantId, id: userId } = req.user!;
      const stats = await referralService.getMyStats(tenantId, userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener URL de compartir
  async getShareUrl(req: Request, res: Response) {
    try {
      const { tenantId, id: userId } = req.user!;
      
      // Crear referido temporal para obtener URL
      const referral = await referralService.createReferral({
        tenantId,
        referrerId: userId,
        referrerName: req.body.name || req.user!.email,
        referrerEmail: req.user!.email,
        referrerPhone: req.body.phone,
        name: 'Pendiente',
        email: 'pendiente@temp.com',
        phone: '0000000000',
        address: 'Pendiente',
      });

      const shareUrl = `${req.protocol}://${req.get('host')}/register/${referral.shareUrl}`;

      res.json({
        success: true,
        data: {
          shareUrl,
          shortCode: referral.shareUrl,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener todos los referidos (Admin)
  async getAllReferrals(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { status, search } = req.query;

      const referrals = await referralService.getAllReferrals(tenantId, {
        status: status as ReferralStatus,
        search: search as string,
      });

      res.json({
        success: true,
        data: referrals,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Actualizar status (Admin)
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const referral = await referralService.updateStatus(id, status, rejectionReason);

      res.json({
        success: true,
        data: referral,
        message: 'Status updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const referralController = new ReferralController();
