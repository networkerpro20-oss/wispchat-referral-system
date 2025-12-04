import prisma from '../lib/prisma';
import { Client } from '@prisma/client';

/**
 * Servicio para manejar clientes referidores
 * Los clientes se sincronizan desde WispHub
 */
class ClientService {
  /**
   * Crear o actualizar un cliente desde WispHub
   */
  async syncFromWispHub(data: {
    wispHubClientId: string;
    nombre: string;
    email: string;
    telefono?: string;
  }): Promise<Client> {
    // Generar código único de referido
    const referralCode = this.generateReferralCode(data.wispHubClientId);
    const shareUrl = `/easyaccess/${referralCode}`;

    return await prisma.client.upsert({
      where: { wispHubClientId: data.wispHubClientId },
      update: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
      },
      create: {
        wispHubClientId: data.wispHubClientId,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        referralCode,
        shareUrl,
        active: true,
      },
    });
  }

  /**
   * Obtener cliente por ID de WispHub
   */
  async getByWispHubId(wispHubClientId: string): Promise<Client | null> {
    return await prisma.client.findUnique({
      where: { wispHubClientId },
      include: {
        referrals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        commissions: {
          where: { status: 'EARNED' },
        },
      },
    });
  }

  /**
   * Obtener cliente por código de referido
   */
  async getByReferralCode(referralCode: string): Promise<Client | null> {
    return await prisma.client.findUnique({
      where: { referralCode },
    });
  }

  /**
   * Obtener estadísticas del cliente
   */
  async getClientStats(clientId: string) {
    const [totalReferrals, referralsByStatus, commissionStats] = await Promise.all([
      prisma.referral.count({
        where: { clientId },
      }),
      prisma.referral.groupBy({
        by: ['status'],
        where: { clientId },
        _count: true,
      }),
      prisma.commission.aggregate({
        where: { clientId },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalEarned = await prisma.commission.aggregate({
      where: { clientId, status: { in: ['EARNED', 'APPLIED'] } },
      _sum: { amount: true },
    });

    const totalApplied = await prisma.commissionApplication.aggregate({
      where: {
        commission: { clientId },
      },
      _sum: { amount: true },
    });

    return {
      totalReferrals,
      referralsByStatus: referralsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      totalEarned: Number(totalEarned._sum.amount || 0),
      totalApplied: Number(totalApplied._sum.amount || 0),
      pendingBalance: Number(totalEarned._sum.amount || 0) - Number(totalApplied._sum.amount || 0),
    };
  }

  /**
   * Listar todos los clientes activos
   */
  async listActive(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              referrals: true,
              commissions: true,
            },
          },
        },
      }),
      prisma.client.count({ where: { active: true } }),
    ]);

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Actualizar estadísticas del cliente
   */
  async updateStats(clientId: string) {
    const stats = await this.getClientStats(clientId);

    await prisma.client.update({
      where: { id: clientId },
      data: {
        totalReferrals: stats.totalReferrals,
        totalEarned: stats.totalEarned,
        totalApplied: stats.totalApplied,
      },
    });
  }

  /**
   * Generar código único de referido
   */
  private generateReferralCode(wispHubClientId: string): string {
    // Formato: EASY-XXXXX
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `EASY-${randomNum}`;
  }
}

export default new ClientService();
