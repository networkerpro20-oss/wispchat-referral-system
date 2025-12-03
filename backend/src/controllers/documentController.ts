import { Request, Response } from 'express';
import { documentService } from '../services/documentService';
import { DocumentType } from '@prisma/client';

export class DocumentController {
  // Subir documento
  async uploadDocument(req: Request, res: Response) {
    try {
      const { referralId } = req.params;
      const { type } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided',
        });
      }

      // Guardar archivo
      const fileData = await documentService.saveFile(file, referralId, type as DocumentType);

      // Crear registro en BD
      const document = await documentService.createDocument({
        referralId,
        type: type as DocumentType,
        filename: fileData.filename,
        originalName: file.originalname,
        fileUrl: fileData.fileUrl,
        fileSize: fileData.fileSize,
        mimeType: fileData.mimeType,
      });

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploaded successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Obtener documentos de un referido
  async getDocuments(req: Request, res: Response) {
    try {
      const { referralId } = req.params;
      const documents = await documentService.getDocumentsByReferral(referralId);

      res.json({
        success: true,
        data: documents,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Eliminar documento
  async deleteDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await documentService.deleteDocument(id);

      res.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const documentController = new DocumentController();
