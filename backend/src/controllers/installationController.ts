import { Request, Response } from 'express';
import { installationService } from '../services/installationService';
import { InstallationStatus } from '@prisma/client';

export class InstallationController {
  // Crear instalación
  async createInstallation(req: Request, res: Response) {
    try {
      const { referralId } = req.params;
      const installation = await installationService.createInstallation(referralId, req.body);

      res.status(201).json({
        success: true,
        data: installation,
        message: 'Installation created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener instalación
  async getInstallation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const installation = await installationService.getInstallationById(id);

      if (!installation) {
        return res.status(404).json({
          success: false,
          message: 'Installation not found',
        });
      }

      res.json({
        success: true,
        data: installation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Agendar instalación
  async scheduleInstallation(req: Request, res: Response) {
    try {
      const { referralId } = req.params;
      const { scheduledDate, notes } = req.body;

      const installation = await installationService.scheduleInstallation(
        referralId,
        new Date(scheduledDate),
        notes
      );

      res.json({
        success: true,
        data: installation,
        message: 'Installation scheduled successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Completar instalación
  async completeInstallation(req: Request, res: Response) {
    try {
      const { referralId } = req.params;
      const installation = await installationService.completeInstallation(referralId, req.body);

      res.json({
        success: true,
        data: installation,
        message: 'Installation completed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cancelar instalación
  async cancelInstallation(req: Request, res: Response) {
    try {
      const { referralId } = req.params;
      const { reason } = req.body;

      const installation = await installationService.cancelInstallation(referralId, reason);

      res.json({
        success: true,
        data: installation,
        message: 'Installation cancelled',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener todas las instalaciones (Admin)
  async getAllInstallations(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { status } = req.query;

      const installations = await installationService.getAllInstallations(tenantId, {
        status: status as InstallationStatus,
      });

      res.json({
        success: true,
        data: installations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener instalaciones pendientes
  async getPendingInstallations(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const installations = await installationService.getPendingInstallations(tenantId);

      res.json({
        success: true,
        data: installations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const installationController = new InstallationController();
