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
 * GET /api/admin/dashboard-extended
 * Dashboard extendido con más métricas y datos
 */
router.get('/dashboard-extended', adminController.getDashboardExtended);

/**
 * GET /api/admin/clients-with-referrals
 * Listar clientes con sus referidos anidados
 */
router.get('/clients-with-referrals', adminController.getClientsWithReferrals);

/**
 * GET /api/admin/leads/:id
 * Ver detalle de un lead específico
 */
router.get('/leads/:id', adminController.getLeadDetail);

/**
 * POST /api/admin/leads/:id/note
 * Agregar nota a un lead
 */
router.post('/leads/:id/note', adminController.addLeadNote);

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
 * POST /api/admin/clients/upload
 * Subir CSV de clientes (EAClientes) para importar/actualizar
 */
router.post('/clients/upload', adminController.uploadMiddleware, adminController.uploadClientsCSV);

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
 * GET /api/admin/commissions
 * Listar todas las comisiones con filtros opcionales (?status=ACTIVE&type=MONTHLY&clientId=...)
 */
router.get('/commissions', adminController.getAllCommissions);

/**
 * POST /api/admin/commissions/generate/installation
 * Generar comisión de instalación manualmente para un referido
 * Body: { referralId }
 */
router.post('/commissions/generate/installation', adminController.generateInstallationCommission);

/**
 * POST /api/admin/commissions/generate/monthly
 * Generar comisión mensual manualmente para un referido
 * Body: { referralId, monthNumber, monthDate }
 */
router.post('/commissions/generate/monthly', adminController.generateMonthlyCommission);

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

/**
 * POST /api/admin/clients/:id/activate-commissions
 * Activar comisiones EARNED → ACTIVE para un cliente (cuando pone su pago al día)
 */
router.post('/clients/:id/activate-commissions', adminController.activateClientCommissions);

/**
 * POST /api/admin/wispchat/test
 * Probar conexión con WispChat API
 */
router.post('/wispchat/test', adminController.testWispChatConnection);

export default router;
