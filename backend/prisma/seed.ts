import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear configuración inicial
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      installationAmount: new Decimal(500.00),
      monthlyAmount: new Decimal(50.00),
      monthsToEarn: 6,
      wispHubUrl: 'https://wispchat-backend.onrender.com',
      notificationEmail: 'admin@easyaccessnet.com',
    },
  });

  console.log('✅ Settings created:', settings);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
