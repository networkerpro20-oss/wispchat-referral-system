import { Router } from 'express';
import adminController from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * TODAS las rutas de admin requieren autenticación
 * Se aplica el middleware a todas las rutas del router
 */
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Dashboard con métricas generales
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * GET /api/admin/leads
 * Listar leads (referidos)
 */
router.get('/leads', adminController.listLeads);

/**
 * PUT /api/admin/leads/:id/status
 * Actualizar estado de lead
 */
router.put('/leads/:id/status', adminController.updateLeadStatus);

/**
 * POST /api/admin/invoices/upload
 * Subir CSV de facturas (días 7 y 21)
 */
router.post('/invoices/upload', adminController.uploadMiddleware, adminController.uploadInvoicesCSV);

/**
 * GET /api/admin/invoices/uploads
 * Listar uploads de CSV
 */
router.get('/invoices/uploads', adminController.listInvoiceUploads);

/**
 * GET /api/admin/invoices/uploads/:id
 * Ver detalles de un upload específico
 */
router.get('/invoices/uploads/:id', adminController.getUploadDetails);

/**
 * POST /api/admin/invoices/uploads/:id/reprocess
 * Reprocesar un upload
 */
router.post('/invoices/uploads/:id/reprocess', adminController.reprocessUpload);

/**
 * GET /api/admin/commissions/active
 * Listar comisiones ACTIVE (listas para aplicar)
 */
router.get('/commissions/active', adminController.getActiveCommissions);

/**
 * POST /api/admin/commissions/:id/apply
 * Aplicar comisión a factura del cliente
 */
router.post('/commissions/:id/apply', adminController.applyCommission);

/**
 * POST /api/admin/commissions/:id/cancel
 * Cancelar comisión
 */
router.post('/commissions/:id/cancel', adminController.cancelCommission);

export default router;
