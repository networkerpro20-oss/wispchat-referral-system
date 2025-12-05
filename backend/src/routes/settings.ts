import express from 'express';
import settingsController from '../controllers/settingsController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Rutas públicas - Sin autenticación
 */
router.get('/', settingsController.getPublicSettings);

/**
 * Rutas protegidas - Admin
 */
router.get('/admin', authenticate, settingsController.getSettings);
router.patch('/admin', authenticate, settingsController.updateSettings);

export default router;
