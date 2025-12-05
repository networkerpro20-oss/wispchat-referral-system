import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de configuración...\n');

  // ============================================================
  // 1. ACTUALIZAR/CREAR SETTINGS
  // ============================================================
  console.log('📝 Configurando Settings...');
  
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {
      installationAmount: 200.00, // ← CORREGIDO de 500 a 200
      monthlyAmount: 50.00,
      monthsToEarn: 6,
      currency: 'MXN',
      promoActive: false,
      // Valores de contacto iniciales
      whatsappNumber: '5215512345678',
      whatsappMessage: '¡Hola! Me interesa contratar Easy Access 🌐',
      telegramUser: '@easyaccesssoporte',
      supportEmail: 'soporte@easyaccessnet.com',
      phoneNumber: '551234567',
      supportHours: 'Lunes a Viernes 9am - 6pm',
      // Video
      videoEnabled: false,
      videoUrl: null,
      videoTitle: 'Conoce Easy Access',
    },
    create: {
      id: 'default',
      installationAmount: 200.00,
      monthlyAmount: 50.00,
      monthsToEarn: 6,
      currency: 'MXN',
      promoActive: false,
      whatsappNumber: '5215512345678',
      whatsappMessage: '¡Hola! Me interesa contratar Easy Access 🌐',
      telegramUser: '@easyaccesssoporte',
      supportEmail: 'soporte@easyaccessnet.com',
      phoneNumber: '551234567',
      supportHours: 'Lunes a Viernes 9am - 6pm',
      videoEnabled: false,
      wispChatUrl: 'https://wispchat-backend.onrender.com',
      wispChatTenantDomain: 'easyaccessnet.com',
    },
  });
  
  console.log('✅ Settings configurado:');
  console.log(`   - Comisión Instalación: $${settings.installationAmount} ${settings.currency}`);
  console.log(`   - Comisión Mensual: $${settings.monthlyAmount} ${settings.currency}`);
  console.log(`   - Meses: ${settings.monthsToEarn}`);
  console.log(`   - WhatsApp: ${settings.whatsappNumber}\n`);

  // ============================================================
  // 2. CREAR PAQUETES DE INTERNET
  // ============================================================
  console.log('📦 Creando paquetes de internet...');

  const plans = [
    {
      slug: 'basico',
      name: 'Básico',
      speed: '20 Mbps',
      speedDownload: 20,
      speedUpload: 10,
      price: 299,
      currency: 'MXN',
      priceLabel: 'al mes',
      popular: false,
      features: [
        'Ideal para navegación',
        '2-3 dispositivos',
        'Streaming SD',
        'Redes sociales',
        'Correo electrónico'
      ],
      maxDevices: '2-3 dispositivos',
      recommendedFor: 'Uso básico individual',
      order: 1,
      active: true
    },
    {
      slug: 'hogar',
      name: 'Hogar',
      speed: '50 Mbps',
      speedDownload: 50,
      speedUpload: 25,
      price: 449,
      currency: 'MXN',
      priceLabel: 'al mes',
      popular: true,
      badge: 'Más Vendido',
      features: [
        'Perfecto para familias',
        '4-6 dispositivos',
        'Streaming HD',
        'Gaming casual',
        'Videollamadas',
        'Home office'
      ],
      maxDevices: '4-6 dispositivos',
      recommendedFor: 'Familias y trabajo remoto',
      order: 2,
      active: true
    },
    {
      slug: 'premium',
      name: 'Premium',
      speed: '100 Mbps',
      speedDownload: 100,
      speedUpload: 50,
      price: 599,
      currency: 'MXN',
      priceLabel: 'al mes',
      popular: false,
      badge: 'Máxima Velocidad',
      features: [
        'Máxima velocidad',
        '8+ dispositivos',
        'Streaming 4K',
        'Gaming profesional',
        'Smart home',
        'Múltiples usuarios'
      ],
      maxDevices: '8+ dispositivos',
      recommendedFor: 'Usuarios exigentes',
      order: 3,
      active: true
    }
  ];

  for (const plan of plans) {
    const created = await prisma.internetPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan
    });
    console.log(`✅ Plan "${created.name}" - $${created.price} ${created.currency} - ${created.speed}`);
  }

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   - Comisión Instalación: $200 (CORREGIDO)`);
  console.log(`   - Comisión Mensual: $50 x 6 meses`);
  console.log(`   - Paquetes creados: 3 (Básico, Hogar, Premium)`);
  console.log(`   - Contacto configurado: WhatsApp, Telegram, Email\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
