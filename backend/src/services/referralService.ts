import { prisma } from '../config/database';
import { nanoid } from 'nanoid';
import { ReferralStatus } from '@prisma/client';

export class ReferralService {
  // Obtener configuración del tenant
  async getSettings(tenantId: string) {
    let settings = await prisma.referralSettings.findUnique({
      where: { tenantId },
    });

    // Si no existe, crear configuración por defecto
    if (!settings) {
      settings = await prisma.referralSettings.create({
        data: {
          tenantId,
          tenantDomain: `tenant-${tenantId}`,
          installationCommission: 500.00,
          monthlyCommission: 50.00,
          commissionMonths: 6,
        },
      });
    }

    return settings;
  }

  // Actualizar configuración
  async updateSettings(tenantId: string, data: any) {
    return await prisma.referralSettings.upsert({
      where: { tenantId },
      update: data,
      create: {
        tenantId,
        tenantDomain: data.tenantDomain || `tenant-${tenantId}`,
        ...data,
      },
    });
  }

  // Crear nuevo referido
  async createReferral(data: {
    tenantId: string;
    referrerId: string;
    referrerName: string;
    referrerEmail: string;
    referrerPhone?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    notes?: string;
  }) {
    const shareUrl = nanoid(10); // Genera ID único de 10 caracteres

    return await prisma.referral.create({
      data: {
        ...data,
        shareUrl,
        status: ReferralStatus.PENDING,
      },
    });
  }

  // Obtener referido por ID
  async getReferralById(id: string) {
    return await prisma.referral.findUnique({
      where: { id },
      include: {
        documents: true,
        installation: true,
        commissions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // Obtener referido por shareUrl
  async getReferralByShareUrl(shareUrl: string) {
    return await prisma.referral.findUnique({
      where: { shareUrl },
      include: {
        documents: true,
        installation: true,
      },
    });
  }

  // Registrar click en shareUrl
  async trackClick(shareUrl: string) {
    return await prisma.referral.update({
      where: { shareUrl },
      data: {
        clickCount: { increment: 1 },
        lastClickAt: new Date(),
      },
    });
  }

  // Obtener referidos de un cliente
  async getMyReferrals(tenantId: string, referrerId: string) {
    return await prisma.referral.findMany({
      where: {
        tenantId,
        referrerId,
      },
      include: {
        documents: true,
        installation: true,
        commissions: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener todos los referidos (Admin)
  async getAllReferrals(tenantId: string, filters?: {
    status?: ReferralStatus;
    search?: string;
  }) {
    const where: any = { tenantId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { referrerName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.referral.findMany({
      where,
      include: {
        documents: true,
        installation: true,
        commissions: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Actualizar status del referido
  async updateStatus(id: string, status: ReferralStatus, rejectionReason?: string) {
    return await prisma.referral.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === ReferralStatus.REJECTED ? rejectionReason : null,
      },
    });
  }

  // Obtener estadísticas del cliente
  async getMyStats(tenantId: string, referrerId: string) {
    const referrals = await prisma.referral.findMany({
      where: { tenantId, referrerId },
      include: {
        commissions: true,
        installation: true,
      },
    });

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === ReferralStatus.INSTALLED).length;
    const pendingStatuses: ReferralStatus[] = [
      ReferralStatus.PENDING, 
      ReferralStatus.DOCUMENTS_UPLOADED, 
      ReferralStatus.IN_REVIEW
    ];
    const pendingReferrals = referrals.filter(r => pendingStatuses.includes(r.status)).length;

    const commissions = referrals.flatMap(r => r.commissions);
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
      totalReferrals,
      activeReferrals,
      pendingReferrals,
      totalEarned,
      totalApplied,
      totalPending,
    };
  }
}

export const referralService = new ReferralService();
