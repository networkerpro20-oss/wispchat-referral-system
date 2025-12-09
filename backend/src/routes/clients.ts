import { Router } from 'express';
import clientController from '../controllers/clientController';

const router = Router();

/**
 * POST /api/client/register
 * Registrar cliente desde WispChat (auto-registro)
 */
router.post('/register', clientController.registerClient);

/**
 * GET /api/clients/:wispHubId
 * Obtener información del cliente
 */
router.get('/:wispHubId', clientController.getClientInfo);

/**
 * GET /api/clients/:wispHubId/referrals
 * Obtener referidos del cliente
 */
router.get('/:wispHubId/referrals', clientController.getClientReferrals);

/**
 * GET /api/clients/:wispHubId/commissions
 * Obtener comisiones del cliente
 */
router.get('/:wispHubId/commissions', clientController.getClientCommissions);

/**
 * GET /api/clients/:wispHubId/summary
 * Obtener resumen completo del cliente
 */
router.get('/:wispHubId/summary', clientController.getClientSummary);

/**
 * GET /api/clients/:wispHubId/applications
 * Obtener historial de aplicaciones
 */
router.get('/:wispHubId/applications', clientController.getApplicationHistory);

export default router;
