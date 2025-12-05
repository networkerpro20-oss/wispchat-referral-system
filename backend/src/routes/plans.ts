import express from 'express';
import plansController from '../controllers/plansController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Rutas públicas - Sin autenticación
 */
router.get('/', plansController.getActivePlans);

/**
 * Rutas protegidas - Admin
 */
router.get('/admin', authenticate, plansController.getAllPlans);
router.get('/admin/:id', authenticate, plansController.getPlan);
router.post('/admin', authenticate, plansController.createPlan);
router.patch('/admin/:id', authenticate, plansController.updatePlan);
router.delete('/admin/:id', authenticate, plansController.deletePlan);
router.post('/admin/reorder', authenticate, plansController.reorderPlans);
router.patch('/admin/:id/toggle', authenticate, plansController.toggleActive);

export default router;
