import prisma from '../lib/prisma';
import { Commission, CommissionStatus, CommissionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import clientService from './clientService';

/**
 * Servicio para manejar comisiones
 */
class CommissionService {
  /**
   * Generar comisión de instalación
   */
  async generateInstallationCommission(referralId: string): Promise<Commission> {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { client: true },
    });

    if (!referral) throw new Error('Referido no encontrado');
    if (referral.status !== 'INSTALLED') {
      throw new Error('El referido debe estar instalado');
    }

    // Verificar que no exista ya
    const existing = await prisma.commission.findFirst({
      where: {
        referralId,
        type: 'INSTALLATION',
      },
    });

    if (existing) {
      throw new Error('Ya existe una comisión de instalación para este referido');
    }

    const settings = await prisma.settings.findFirst();
    const amount = settings?.installationAmount || new Decimal(500);

    const commission = await prisma.commission.create({
      data: {
        clientId: referral.clientId,
        referralId,
        type: 'INSTALLATION',
        amount,
        status: 'EARNED',
      },
    });

    await clientService.updateStats(referral.clientId);

    return commission;
  }

  /**
   * Generar comisión mensual
   */
  async generateMonthlyCommission(
    referralId: string,
    monthNumber: number,
    monthDate: Date
  ): Promise<Commission> {
    if (monthNumber < 1 || monthNumber > 6) {
      throw new Error('El número de mes debe estar entre 1 y 6');
    }

    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral) throw new Error('Referido no encontrado');
    if (referral.status !== 'INSTALLED') {
      throw new Error('El referido debe estar instalado');
    }

    // Verificar que no exista ya este mes
    const existing = await prisma.commission.findFirst({
      where: {
        referralId,
        type: 'MONTHLY',
        monthNumber,
      },
    });

    if (existing) {
      throw new Error(`Ya existe una comisión para el mes ${monthNumber}`);
    }

    const settings = await prisma.settings.findFirst();
    const amount = settings?.monthlyAmount || new Decimal(50);

    const commission = await prisma.commission.create({
      data: {
        clientId: referral.clientId,
        referralId,
        type: 'MONTHLY',
        amount,
        monthNumber,
        monthDate,
        status: 'EARNED',
      },
    });

    await clientService.updateStats(referral.clientId);

    return commission;
  }

  /**
   * Obtener comisiones del cliente
   */
  async getClientCommissions(clientId: string, filters?: {
    status?: CommissionStatus;
    type?: CommissionType;
  }) {
    const where: any = { clientId };
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    return await prisma.commission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        referral: {
          select: {
            nombre: true,
            telefono: true,
            status: true,
          },
        },
        applications: {
          select: {
            amount: true,
            appliedAt: true,
            invoiceMonth: true,
          },
        },
      },
    });
  }

  /**
   * Obtener comisiones pendientes de aplicar
   */
  async getPendingCommissions(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where: { status: 'EARNED' },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          client: {
            select: {
              wispChatClientId: true,
              nombre: true,
              email: true,
            },
          },
          referral: {
            select: {
              nombre: true,
              telefono: true,
            },
          },
        },
      }),
      prisma.commission.count({ where: { status: 'EARNED' } }),
    ]);

    return {
      commissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Aplicar comisión a factura
   */
  async applyToInvoice(data: {
    commissionId: string;
    amount: number;
    wispChatInvoiceId: string;
    invoiceMonth: string;
    invoiceAmount: number;
    appliedBy: string;
    notas?: string;
  }) {
    const commission = await prisma.commission.findUnique({
      where: { id: data.commissionId },
      include: {
        applications: true,
      },
    });

    if (!commission) throw new Error('Comisión no encontrada');

    // Calcular cuánto se ha aplicado ya
    const totalApplied = commission.applications.reduce(
      (sum, app) => sum + Number(app.amount),
      0
    );

    const remaining = Number(commission.amount) - totalApplied;

    if (data.amount > remaining) {
      throw new Error(`Solo quedan $${remaining.toFixed(2)} disponibles para aplicar`);
    }

    // Crear la aplicación
    const application = await prisma.commissionApplication.create({
      data: {
        commissionId: data.commissionId,
        amount: new Decimal(data.amount),
        wispChatInvoiceId: data.wispChatInvoiceId,
        invoiceMonth: data.invoiceMonth,
        invoiceAmount: new Decimal(data.invoiceAmount),
        appliedBy: data.appliedBy,
        notas: data.notas,
      },
    });

    // Si se aplicó todo, marcar como APPLIED
    const newTotalApplied = totalApplied + data.amount;
    if (newTotalApplied >= Number(commission.amount)) {
      await prisma.commission.update({
        where: { id: data.commissionId },
        data: { status: 'APPLIED' },
      });
    }

    // Actualizar stats del cliente
    await clientService.updateStats(commission.clientId);

    return application;
  }

  /**
   * Cancelar comisión
   */
  async cancelCommission(commissionId: string, reason: string): Promise<Commission> {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      include: { applications: true },
    });

    if (!commission) throw new Error('Comisión no encontrada');

    if (commission.applications.length > 0) {
      throw new Error('No se puede cancelar una comisión que ya tiene aplicaciones');
    }

    const updated = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'CANCELLED',
        notas: `Cancelada: ${reason}`,
      },
    });

    await clientService.updateStats(commission.clientId);

    return updated;
  }

  /**
   * Resumen de comisiones por cliente
   */
  async getClientSummary(clientId: string) {
    const [earned, applied, cancelled] = await Promise.all([
      prisma.commission.aggregate({
        where: { clientId, status: { in: ['EARNED', 'APPLIED'] } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.commissionApplication.aggregate({
        where: { commission: { clientId } },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { clientId, status: 'CANCELLED' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalEarned = Number(earned._sum.amount || 0);
    const totalApplied = Number(applied._sum.amount || 0);

    return {
      totalEarned,
      totalApplied,
      pendingBalance: totalEarned - totalApplied,
      totalCommissions: earned._count,
      cancelledCommissions: cancelled._count,
    };
  }

  /**
   * Historial de aplicaciones del cliente
   */
  async getClientApplicationHistory(clientId: string) {
    return await prisma.commissionApplication.findMany({
      where: {
        commission: { clientId },
      },
      orderBy: { appliedAt: 'desc' },
      include: {
        commission: {
          select: {
            type: true,
            amount: true,
            referral: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });
  }
}

export default new CommissionService();
