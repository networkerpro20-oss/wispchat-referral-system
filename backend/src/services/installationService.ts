import { prisma } from '../config/database';
import { InstallationStatus } from '@prisma/client';
import { commissionService } from './commissionService';

export class InstallationService {
  // Crear registro de instalación
  async createInstallation(referralId: string, data?: {
    scheduledDate?: Date;
    installerNotes?: string;
  }) {
    return await prisma.installation.create({
      data: {
        referralId,
        status: InstallationStatus.PENDING,
        scheduledDate: data?.scheduledDate,
        installerNotes: data?.installerNotes,
      },
    });
  }

  // Obtener instalación por ID
  async getInstallationById(id: string) {
    return await prisma.installation.findUnique({
      where: { id },
      include: {
        referral: {
          include: {
            documents: true,
          },
        },
      },
    });
  }

  // Obtener instalación por referralId
  async getInstallationByReferralId(referralId: string) {
    return await prisma.installation.findUnique({
      where: { referralId },
      include: {
        referral: true,
      },
    });
  }

  // Actualizar instalación
  async updateInstallation(id: string, data: {
    status?: InstallationStatus;
    scheduledDate?: Date;
    installedDate?: Date;
    installedBy?: string;
    installerNotes?: string;
    clientId?: string;
    wispHubClientId?: string;
  }) {
    return await prisma.installation.update({
      where: { id },
      data,
    });
  }

  // Agendar instalación
  async scheduleInstallation(referralId: string, scheduledDate: Date, notes?: string) {
    const installation = await prisma.installation.findUnique({
      where: { referralId },
    });

    if (!installation) {
      // Crear si no existe
      return await this.createInstallation(referralId, {
        scheduledDate,
        installerNotes: notes,
      });
    }

    // Actualizar existing
    return await prisma.installation.update({
      where: { referralId },
      data: {
        status: InstallationStatus.SCHEDULED,
        scheduledDate,
        installerNotes: notes,
      },
    });
  }

  // Marcar instalación como completada
  async completeInstallation(referralId: string, data: {
    installedBy: string;
    installerNotes?: string;
    clientId?: string;
    wispHubClientId?: string;
  }) {
    const installation = await prisma.installation.update({
      where: { referralId },
      data: {
        status: InstallationStatus.COMPLETED,
        installedDate: new Date(),
        installedBy: data.installedBy,
        installerNotes: data.installerNotes,
        clientId: data.clientId,
        wispHubClientId: data.wispHubClientId,
      },
    });

    // Actualizar status del referido
    await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'INSTALLED',
      },
    });

    // Generar comisión de instalación automáticamente
    try {
      await commissionService.generateInstallationCommission(referralId);
    } catch (error) {
      console.error('Error generating installation commission:', error);
    }

    return installation;
  }

  // Cancelar instalación
  async cancelInstallation(referralId: string, reason: string) {
    const installation = await prisma.installation.update({
      where: { referralId },
      data: {
        status: InstallationStatus.CANCELLED,
        installerNotes: reason,
      },
    });

    // Actualizar status del referido
    await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'CANCELLED',
      },
    });

    return installation;
  }

  // Obtener todas las instalaciones (Admin)
  async getAllInstallations(tenantId: string, filters?: {
    status?: InstallationStatus;
  }) {
    const where: any = {
      referral: { tenantId },
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    return await prisma.installation.findMany({
      where,
      include: {
        referral: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            referrerName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener instalaciones pendientes
  async getPendingInstallations(tenantId: string) {
    return await this.getAllInstallations(tenantId, {
      status: InstallationStatus.PENDING,
    });
  }

  // Obtener instalaciones agendadas
  async getScheduledInstallations(tenantId: string) {
    return await this.getAllInstallations(tenantId, {
      status: InstallationStatus.SCHEDULED,
    });
  }
}

export const installationService = new InstallationService();
