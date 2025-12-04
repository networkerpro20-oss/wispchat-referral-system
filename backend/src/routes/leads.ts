import { Router } from 'express';
import leadController from '../controllers/leadController';

const router = Router();

/**
 * POST /api/leads/register
 * Registrar un nuevo lead desde el formulario público
 */
router.post('/register', leadController.registerLead);

/**
 * GET /api/leads/:id
 * Obtener lead por ID
 */
router.get('/:id', leadController.getLead);

/**
 * GET /api/leads
 * Listar leads con filtros
 */
router.get('/', leadController.listLeads);

/**
 * PUT /api/leads/:id/status
 * Actualizar estado del lead
 */
router.put('/:id/status', leadController.updateStatus);

/**
 * POST /api/leads/:id/notes
 * Agregar nota al lead
 */
router.post('/:id/notes', leadController.addNote);

export default router;
