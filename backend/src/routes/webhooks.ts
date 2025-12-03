import { Router } from 'express';
import { webhookController } from '../controllers/webhookController';

const router = Router();

// Webhooks públicos (protegidos por firma/secret en producción)
router.post('/payment-received', webhookController.paymentReceived);
router.post('/client-created', webhookController.clientCreated);

export default router;
