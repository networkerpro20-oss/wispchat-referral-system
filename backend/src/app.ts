import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Importar rutas
import clientRoutes from './routes/clients';
import leadRoutes from './routes/leads';
import adminRoutes from './routes/admin';
import settingsRoutes from './routes/settings';
import plansRoutes from './routes/plans';

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
    message: 'Easy Access Referral System API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/clients', clientRoutes);      // Rutas para clientes
app.use('/api/client', clientRoutes);       // Ruta singular para registro desde WispChat
app.use('/api/leads', leadRoutes);          // Rutas para leads (público)
app.use('/api/admin', adminRoutes);         // Rutas para admin
app.use('/api/settings', settingsRoutes);   // Settings (público + admin)
app.use('/api/plans', plansRoutes);         // Plans (público + admin)

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
