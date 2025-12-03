import { Router } from 'express';
import { installationController } from '../controllers/installationController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación y admin
router.use(authenticate, requireAdmin);

router.get('/', installationController.getAllInstallations);
router.get('/pending', installationController.getPendingInstallations);
router.get('/:id', installationController.getInstallation);
router.post('/:referralId', installationController.createInstallation);
router.put('/:referralId/schedule', installationController.scheduleInstallation);
router.post('/:referralId/complete', installationController.completeInstallation);
router.post('/:referralId/cancel', installationController.cancelInstallation);

export default router;
