import { Router } from 'express';
import adminController from '../controllers/adminController';

const router = Router();

/**
 * GET /api/admin/dashboard
 * Dashboard con métricas generales
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * GET /api/admin/clients
 * Listar todos los clientes
 */
router.get('/clients', adminController.listClients);

/**
 * POST /api/admin/clients/sync
 * Sincronizar cliente desde WispHub
 */
router.post('/clients/sync', adminController.syncClient);

/**
 * GET /api/admin/commissions/pending
 * Listar comisiones pendientes de aplicar
 */
router.get('/commissions/pending', adminController.getPendingCommissions);

/**
 * POST /api/admin/commissions/:id/apply
 * Aplicar comisión a factura
 */
router.post('/commissions/:id/apply', adminController.applyCommission);

/**
 * POST /api/admin/commissions/:id/cancel
 * Cancelar comisión
 */
router.post('/commissions/:id/cancel', adminController.cancelCommission);

/**
 * POST /api/admin/commissions/generate-monthly
 * Generar comisión mensual manualmente
 */
router.post('/commissions/generate-monthly', adminController.generateMonthlyCommission);

/**
 * GET /api/admin/wisphub/clients/:clientId
 * Verificar cliente en WispHub
 */
router.get('/wisphub/clients/:clientId', adminController.checkWispHubClient);

export default router;
