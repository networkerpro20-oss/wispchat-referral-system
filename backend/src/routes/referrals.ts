import { Router } from 'express';
import { referralController } from '../controllers/referralController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.get('/share/:shareUrl', referralController.getReferralByShareUrl);

// Rutas autenticadas
router.use(authenticate);

// Cliente
router.get('/my-referrals', referralController.getMyReferrals);
router.get('/my-stats', referralController.getMyStats);
router.post('/create', referralController.createReferral);
router.post('/share-url', referralController.getShareUrl);
router.get('/:id', referralController.getReferralById);

// Admin
router.get('/', requireAdmin, referralController.getAllReferrals);
router.put('/:id/status', requireAdmin, referralController.updateStatus);

// Settings (Admin)
router.get('/settings/config', requireAdmin, referralController.getSettings);
router.put('/settings/config', requireAdmin, referralController.updateSettings);

export default router;
