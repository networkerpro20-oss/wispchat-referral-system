import { prisma } from '../config/database';
import { DocumentType } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config';

export class DocumentService {
  // Crear registro de documento
  async createDocument(data: {
    referralId: string;
    type: DocumentType;
    filename: string;
    originalName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }) {
    const document = await prisma.document.create({
      data,
    });

    // Actualizar status del referido a DOCUMENTS_UPLOADED
    await prisma.referral.update({
      where: { id: data.referralId },
      data: {
        status: 'DOCUMENTS_UPLOADED',
      },
    });

    return document;
  }

  // Obtener documentos de un referido
  async getDocumentsByReferral(referralId: string) {
    return await prisma.document.findMany({
      where: { referralId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  // Obtener documento por ID
  async getDocumentById(id: string) {
    return await prisma.document.findUnique({
      where: { id },
    });
  }

  // Eliminar documento
  async deleteDocument(id: string) {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Eliminar archivo físico si es local
    if (!document.fileUrl.startsWith('http')) {
      const filePath = path.join(process.cwd(), document.fileUrl);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    // Eliminar registro de BD
    return await prisma.document.delete({
      where: { id },
    });
  }

  // Verificar si un referido tiene todos los documentos requeridos
  async hasRequiredDocuments(referralId: string) {
    const documents = await this.getDocumentsByReferral(referralId);
    
    const hasINE = documents.some(d => d.type === DocumentType.INE);
    const hasProofAddress = documents.some(d => d.type === DocumentType.PROOF_ADDRESS);

    return hasINE && hasProofAddress;
  }

  // Guardar archivo localmente
  async saveFile(file: Express.Multer.File, referralId: string, type: DocumentType) {
    const uploadDir = path.join(process.cwd(), config.uploadDir, referralId);
    
    // Crear directorio si no existe
    await fs.mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${type}_${timestamp}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Guardar archivo
    await fs.writeFile(filePath, file.buffer);

    // Retornar ruta relativa
    return {
      filename,
      fileUrl: path.join(config.uploadDir, referralId, filename),
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }
}

export const documentService = new DocumentService();
