import prisma from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Auto-registro de cliente desde WispChat
 * Llamado cuando el usuario presiona "Promociona y Gana" en /chat
 */
async function autoRegisterFromWispChat(data: {
  wispChatClientId: string;
  wispChatUserId?: string;
  nombre: string;
  email: string;
  telefono?: string;
}) {
  // Verificar si ya existe
  const existing = await prisma.client.findUnique({
    where: { wispChatClientId: data.wispChatClientId },
  });

  if (existing) {
    return existing;
  }

  // Generar código único EASY-XXXXX
  const codigo = await generateUniqueCode();
  const shareUrl = `${process.env.FRONTEND_URL || 'https://referidos.wispchat.net'}/easyaccess/${codigo}`;

  // Crear cliente
  const client = await prisma.client.create({
    data: {
      wispChatClientId: data.wispChatClientId,
      wispChatUserId: data.wispChatUserId,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      referralCode: codigo,
      shareUrl,
    },
  });

  console.log(`✅ Cliente auto-registrado: ${client.nombre} (${codigo})`);
  return client;
}

/**
 * Generar código único EASY-XXXXX
 */
async function generateUniqueCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 dígitos
    const codigo = `EASY-${randomNum}`;

    // Verificar que no exista
    const exists = await prisma.client.findUnique({
      where: { referralCode: codigo },
    });

    if (!exists) {
      return codigo;
    }

    attempts++;
  }

  throw new Error('No se pudo generar código único después de 10 intentos');
}

/**
 * Obtener cliente por wispChatClientId
 */
async function getByWispChatId(wispChatClientId: string) {
  const client = await prisma.client.findUnique({
    where: { wispChatClientId },
    include: {
      referrals: {
        orderBy: { createdAt: 'desc' },
      },
      commissions: {
        include: {
          referral: true,
          applications: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!client) {
    throw new Error('Cliente no encontrado');
  }

  return client;
}

/**
 * Obtener cliente por código de referido
 */
async function getByReferralCode(codigo: string) {
  const client = await prisma.client.findUnique({
    where: { referralCode: codigo },
  });

  if (!client) {
    throw new Error('Código de referido no válido');
  }

  return client;
}

/**
 * Obtener estadísticas del cliente
 */
async function getClientStats(clientId: string) {
  const [client, commissions] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        referrals: {
          select: {
            status: true,
          },
        },
      },
    }),
    prisma.commission.findMany({
      where: { clientId },
      include: {
        applications: true,
      },
    }),
  ]);

  if (!client) {
    throw new Error('Cliente no encontrado');
  }

  // Calcular totales
  const totalEarned = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
  
  const totalApplied = commissions.reduce((sum, c) => {
    const applied = c.applications.reduce((appSum, app) => appSum + Number(app.amount), 0);
    return sum + applied;
  }, 0);

  const pendingBalance = totalEarned - totalApplied;

  // Contar referidos por estado
  const referralsByStatus = {
    pending: client.referrals.filter((r) => r.status === 'PENDING').length,
    contacted: client.referrals.filter((r) => r.status === 'CONTACTED').length,
    installed: client.referrals.filter((r) => r.status === 'INSTALLED').length,
    rejected: client.referrals.filter((r) => r.status === 'REJECTED').length,
  };

  return {
    totalReferrals: client.totalReferrals,
    referralsByStatus,
    totalEarned,
    totalApplied,
    pendingBalance,
  };
}

/**
 * Actualizar contadores del cliente
 */
async function updateStats(clientId: string) {
  const stats = await getClientStats(clientId);

  await prisma.client.update({
    where: { id: clientId },
    data: {
      totalReferrals: stats.totalReferrals,
      totalEarned: new Decimal(stats.totalEarned),
      totalApplied: new Decimal(stats.totalApplied),
    },
  });
}

export default {
  autoRegisterFromWispChat,
  generateUniqueCode,
  getByWispChatId,
  getByReferralCode,
  getClientStats,
  updateStats,
};
