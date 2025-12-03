import app from './app';
import { config } from './config';
import { prisma } from './config/database';

const startServer = async () => {
  try {
    // Verificar conexión a base de datos
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`🚀 WispChat Referral System running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Manejar señales de terminación
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
