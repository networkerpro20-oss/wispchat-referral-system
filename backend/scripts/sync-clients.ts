import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const WISPHUB_API_URL = process.env.WISPHUB_API_URL || 'https://wispchat-backend.onrender.com';

interface WispHubClient {
  id: string;
  numero: string;
  nombre: string;
  email: string;
  telefono?: string;
  status: string;
}

/**
 * Sincronizar clientes desde WispHub
 */
async function syncClients() {
  console.log('🔄 Iniciando sincronización de clientes desde WispHub...');

  try {
    // Obtener clientes activos de Easy Access desde WispHub
    const response = await axios.get(
      `${WISPHUB_API_URL}/api/v1/crm/wisphub/clients`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Domain': 'easyaccessnet.com',
        },
        params: {
          status: 'active',
          limit: 1000,
        },
      }
    );

    const wispHubClients: WispHubClient[] = response.data?.data || [];
    console.log(`📊 Encontrados ${wispHubClients.length} clientes en WispHub`);

    let synced = 0;
    let errors = 0;

    for (const wispClient of wispHubClients) {
      try {
        // Generar código único de referido
        const referralCode = generateReferralCode();
        const shareUrl = `/easyaccess/${referralCode}`;

        // Upsert cliente
        await prisma.client.upsert({
          where: { wispHubClientId: wispClient.numero || wispClient.id },
          update: {
            nombre: wispClient.nombre,
            email: wispClient.email,
            telefono: wispClient.telefono,
          },
          create: {
            wispHubClientId: wispClient.numero || wispClient.id,
            nombre: wispClient.nombre,
            email: wispClient.email,
            telefono: wispClient.telefono,
            referralCode,
            shareUrl,
            active: true,
          },
        });

        synced++;
        if (synced % 10 === 0) {
          console.log(`  ⏳ Sincronizados ${synced}/${wispHubClients.length}...`);
        }
      } catch (error: any) {
        errors++;
        console.error(`  ❌ Error sincronizando cliente ${wispClient.numero}:`, error.message);
      }
    }

    console.log('\n✅ Sincronización completada:');
    console.log(`  - Clientes sincronizados: ${synced}`);
    console.log(`  - Errores: ${errors}`);

    // Mostrar estadísticas
    const totalClients = await prisma.client.count();
    const activeClients = await prisma.client.count({ where: { active: true } });
    
    console.log('\n📊 Estadísticas:');
    console.log(`  - Total de clientes en sistema: ${totalClients}`);
    console.log(`  - Clientes activos: ${activeClients}`);

  } catch (error: any) {
    console.error('❌ Error en sincronización:', error.message);
    throw error;
  }
}

/**
 * Generar código único de referido
 */
function generateReferralCode(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `EASY-${randomNum}`;
}

// Ejecutar
syncClients()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
