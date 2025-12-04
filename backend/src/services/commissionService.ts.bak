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

  // Obtener comisiones de un referido
  async getCommissionsByReferral(referralId: string) {
    return await prisma.commission.findMany({
      where: { referralId },
      orderBy: [
        { type: 'asc' },
        { paymentNumber: 'asc' },
      ],
    });
  }

  // Obtener comisiones de un cliente referidor
  async getMyCommissions(tenantId: string, referrerId: string) {
    const referrals = await prisma.referral.findMany({
      where: { tenantId, referrerId },
      select: { id: true },
    });

    const referralIds = referrals.map(r => r.id);

    return await prisma.commission.findMany({
      where: {
        referralId: { in: referralIds },
      },
      include: {
        referral: {
          select: {
            name: true,
            email: true,
            status: true,
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
}

export const commissionService = new CommissionService();
