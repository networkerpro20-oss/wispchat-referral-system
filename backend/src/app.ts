import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Importar rutas
import referralRoutes from './routes/referrals';
import documentRoutes from './routes/documents';
import installationRoutes from './routes/installations';
import commissionRoutes from './routes/commissions';
import webhookRoutes from './routes/webhooks';
import leadRoutes from './routes/leads';

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : '*',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(config.uploadDir));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'WispChat Referral System API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/referrals', referralRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/installations', installationRoutes);
app.use('/api/v1/commissions', commissionRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/leads', leadRoutes); // Ruta pública para captura de leads

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default app;
