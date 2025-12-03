import { Router } from 'express';
import { commissionController } from '../controllers/commissionController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Cliente
router.get('/my-commissions', commissionController.getMyCommissions);

// Admin
router.get('/', requireAdmin, commissionController.getAllCommissions);
router.get('/summary', requireAdmin, commissionController.getCommissionsSummary);
router.post('/:referralId/installation', requireAdmin, commissionController.generateInstallationCommission);
router.post('/:referralId/monthly', requireAdmin, commissionController.generateMonthlyCommission);
router.post('/:id/apply', requireAdmin, commissionController.applyToInvoice);
router.post('/:id/cancel', requireAdmin, commissionController.cancelCommission);

export default router;
