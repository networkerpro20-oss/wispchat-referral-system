import { prisma } from '../config/database';
import { CommissionType, CommissionStatus } from '@prisma/client';

export class CommissionService {
  // Generar comisión por instalación
  async generateInstallationCommission(referralId: string) {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { installation: true },
    });

    if (!referral || !referral.installation) {
      throw new Error('Referral or installation not found');
    }

    if (referral.installation.status !== 'COMPLETED') {
      throw new Error('Installation not completed');
    }

    const settings = await prisma.referralSettings.findUnique({
      where: { tenantId: referral.tenantId },
    });

    if (!settings) {
      throw new Error('Referral settings not found');
    }

    // Verificar si ya existe comisión de instalación
    const existing = await prisma.commission.findFirst({
      where: {
        referralId,
        type: CommissionType.INSTALLATION,
      },
    });

    if (existing) {
      return existing;
    }

    // Crear comisión de instalación
    return await prisma.commission.create({
      data: {
        referralId,
        type: CommissionType.INSTALLATION,
        amount: settings.installationCommission,
        status: CommissionStatus.EARNED,
      },
    });
  }

  // Generar comisión mensual
  async generateMonthlyCommission(referralId: string, paymentNumber: number, paymentDate: Date) {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral) {
      throw new Error('Referral not found');
    }

    const settings = await prisma.referralSettings.findUnique({
      where: { tenantId: referral.tenantId },
    });

    if (!settings) {
      throw new Error('Referral settings not found');
    }

    // Verificar si el número de pago está dentro del límite
    if (paymentNumber > settings.commissionMonths) {
      console.log(`Payment ${paymentNumber} exceeds commission months limit (${settings.commissionMonths})`);
      return null;
    }

    // Verificar si ya existe comisión para este pago
    const existing = await prisma.commission.findFirst({
      where: {
        referralId,
        type: CommissionType.MONTHLY,
        paymentNumber,
      },
    });

    if (existing) {
      return existing;
    }

    // Crear comisión mensual
    return await prisma.commission.create({
      data: {
        referralId,
        type: CommissionType.MONTHLY,
        amount: settings.monthlyCommission,
        paymentNumber,
        paymentDate,
        status: CommissionStatus.EARNED,
      },
    });
  }

  // Obtener comisiones de un referidor
  async getMyCommissions(referrerId: string, tenantId: string) {
    return await prisma.commission.findMany({
      where: {
        referral: {
          referrerId,
          tenantId,
        },
      },
      include: {
        referral: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Aplicar comisión a factura
  async applyToInvoice(commissionId: string, invoiceId: string, appliedAmount?: number) {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status !== CommissionStatus.EARNED) {
      throw new Error('Commission not in EARNED status');
    }

    return await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: CommissionStatus.APPLIED,
        appliedToInvoice: true,
        invoiceId,
        appliedAmount: appliedAmount || commission.amount,
        appliedDate: new Date(),
      },
    });
  }

  // Cancelar comisión
  async cancelCommission(commissionId: string, reason: string) {
    return await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: CommissionStatus.CANCELLED,
        notes: reason,
      },
    });
  }

  // Obtener todas las comisiones (Admin)
  async getAllCommissions(tenantId: string, filters?: {
    status?: CommissionStatus;
    type?: CommissionType;
    referralId?: string;
  }) {
    const where: any = {
      referral: { tenantId },
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.referralId) {
      where.referralId = filters.referralId;
    }

    return await prisma.commission.findMany({
      where,
      include: {
        referral: {
          select: {
            name: true,
            email: true,
            referrerName: true,
            referrerEmail: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener resumen de comisiones
  async getCommissionsSummary(tenantId: string) {
    const commissions = await prisma.commission.findMany({
      where: {
        referral: { tenantId },
      },
    });

    const totalGenerated = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalEarned = commissions
      .filter(c => c.status === 'EARNED' || c.status === 'APPLIED' || c.status === 'PAID')
      .reduce((sum, c) => sum + Number(c.amount), 0);
    const totalApplied = commissions
      .filter(c => c.status === 'APPLIED')
      .reduce((sum, c) => sum + Number(c.appliedAmount || c.amount), 0);
    const totalPending = commissions
      .filter(c => c.status === 'PENDING' || c.status === 'EARNED')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      totalGenerated,
      totalEarned,
      totalApplied,
      totalPending,
      byType: {
        installation: commissions.filter(c => c.type === 'INSTALLATION').length,
        monthly: commissions.filter(c => c.type === 'MONTHLY').length,
      },
      byStatus: {
        pending: commissions.filter(c => c.status === 'PENDING').length,
        earned: commissions.filter(c => c.status === 'EARNED').length,
        applied: commissions.filter(c => c.status === 'APPLIED').length,
        cancelled: commissions.filter(c => c.status === 'CANCELLED').length,
      },
    };
  }

  // Aplicar comisión (cambiar a APPLIED) - NUEVO
  async applyCommission(commissionId: string, appliedToInvoice?: string) {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status !== CommissionStatus.EARNED) {
      throw new Error('Commission must be EARNED to apply');
    }

    return await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: CommissionStatus.APPLIED,
        appliedDate: new Date(),
        appliedToInvoice,
      },
    });
  }

  // Actualizar comisión - NUEVO
  async updateCommission(commissionId: string, data: {
    amount?: number;
    status?: CommissionStatus;
    notes?: string;
  }) {
    return await prisma.commission.update({
      where: { id: commissionId },
      data,
    });
  }

  // Eliminar comisión - NUEVO
  async deleteCommission(commissionId: string) {
    return await prisma.commission.delete({
      where: { id: commissionId },
    });
  }
}

export const commissionService = new CommissionService();

  // Método faltante: getCommissionsByReferral
  async getCommissionsByReferral(referralId: string) {
    return await prisma.commission.findMany({
      where: { referralId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener comisiones por cliente
  async getCommissionsByClient(clientId: string) {
    return await prisma.commission.findMany({
      where: {
        referral: {
          clientId,
        },
      },
      include: {
        referral: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener resumen de comisiones
  async getCommissionsSummary(clientId: string) {
    const commissions = await this.getCommissionsByClient(clientId);
    
    const total = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    const earned = commissions.filter(c => c.status === 'EARNED').reduce((sum, c) => sum + Number(c.amount), 0);
    const applied = commissions.filter(c => c.status === 'APPLIED').reduce((sum, c) => sum + Number(c.amount), 0);
    const pending = commissions.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      total,
      earned,
      applied,
      pending,
      count: commissions.length,
    };
  }

  // Aplicar comisión
  async applyCommission(commissionId: string, appliedToInvoice?: string) {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status !== 'EARNED') {
      throw new Error('Commission must be EARNED to apply');
    }

    return await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'APPLIED',
        appliedDate: new Date(),
        appliedToInvoice,
      },
    });
  }

  // Actualizar comisión
  async updateCommission(commissionId: string, data: any) {
    return await prisma.commission.update({
      where: { id: commissionId },
      data,
    });
  }
}

export const commissionService = new CommissionService();
