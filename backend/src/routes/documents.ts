import { Router } from 'express';
import { documentController } from '../controllers/documentController';
import { upload } from '../middleware/upload';

const router = Router();

// Todas las rutas públicas (para permitir a referidos externos subir documentos)
router.post('/:referralId/upload', upload.single('file'), documentController.uploadDocument);
router.get('/:referralId', documentController.getDocuments);
router.delete('/:id', documentController.deleteDocument);

export default router;
