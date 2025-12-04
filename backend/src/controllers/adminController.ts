import { Request, Response } from 'express';
import commissionService from '../services/commissionService';
import clientService from '../services/clientService';
import leadService from '../services/leadService';
import invoiceService from '../services/invoiceService';
import prisma from '../lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configuración de multer para uploads de CSV
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/invoices');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `invoices-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.mimetype === 'text/csv' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .txt o .csv'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

class AdminController {
  /**
   * Middleware de multer para upload
   */
  uploadMiddleware = upload.single('file');

  /**
   * Dashboard: resumen general
   * GET /api/admin/dashboard
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const [
        totalClients,
        totalLeads,
        pendingLeads,
        installedLeads,
        activeCommissions,
        earnedCommissions,
        totalEarned,
        totalActive,
        totalApplied,
      ] = await Promise.all([
        prisma.client.count({ where: { active: true } }),
        prisma.referral.count(),
        prisma.referral.count({ where: { status: 'PENDING' } }),
        prisma.referral.count({ where: { status: 'INSTALLED' } }),
        prisma.commission.count({ where: { status: 'ACTIVE' } }),
        prisma.commission.count({ where: { status: 'EARNED' } }),
        prisma.commission.aggregate({
          _sum: { amount: true },
        }),
        prisma.commission.aggregate({
          where: { status: 'ACTIVE' },
          _sum: { amount: true },
        }),
        prisma.commission.aggregate({
          where: { status: 'APPLIED' },
          _sum: { amount: true },
        }),
      ]);

      res.json({
        success: true,
        data: {
          clients: { total: totalClients },
          leads: {
            total: totalLeads,
            pending: pendingLeads,
            installed: installedLeads,
          },
          commissions: {
            active: activeCommissions,
            earned: earnedCommissions,
            totalEarned: Number(totalEarned._sum.amount) || 0,
            totalActive: Number(totalActive._sum.amount) || 0,
            totalApplied: Number(totalApplied._sum.amount) || 0,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Listar leads con filtros
   * GET /api/admin/leads
   */
  async listLeads(req: Request, res: Response) {
    try {
      const { status, page, limit } = req.query;

      const result = await leadService.list({
        status: status as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Actualizar estado de lead
   * PUT /api/admin/leads/:id/status
   */
  async updateLeadStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notas } = req.body;

      const referral = await leadService.updateStatus(id, status, { notas });

      res.json({
        success: true,
        data: referral,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Subir CSV de facturas
   * POST /api/admin/invoices/upload
   */
  async uploadInvoicesCSV(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No se subió ningún archivo' },
        });
      }

      const { periodStart, periodEnd, uploadedBy } = req.body;

      if (!periodStart || !periodEnd || !uploadedBy) {
        return res.status(400).json({
          success: false,
          error: { message: 'Faltan campos requeridos: periodStart, periodEnd, uploadedBy' },
        });
      }

      const result = await invoiceService.processCSV({
        filePath: req.file.path,
        fileName: req.file.originalname,
        uploadedBy,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Listar uploads de CSV
   * GET /api/admin/invoices/uploads
   */
  async listInvoiceUploads(req: Request, res: Response) {
    try {
      const { processed, page, limit } = req.query;

      const result = await invoiceService.listUploads({
        processed: processed === 'true' ? true : processed === 'false' ? false : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Ver detalles de un upload específico
   * GET /api/admin/invoices/uploads/:id
   */
  async getUploadDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const upload = await invoiceService.getUploadDetails(id);

      if (!upload) {
        return res.status(404).json({
          success: false,
          error: { message: 'Upload no encontrado' },
        });
      }

      res.json({ success: true, data: upload });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Reprocesar un upload (para corregir errores)
   * POST /api/admin/invoices/uploads/:id/reprocess
   */
  async reprocessUpload(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await invoiceService.reprocessUpload(id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Listar comisiones pendientes de aplicar
   * GET /api/admin/commissions/active
   */
  async getActiveCommissions(req: Request, res: Response) {
    try {
      const commissions = await prisma.commission.findMany({
        where: { status: 'ACTIVE' },
        include: {
          client: {
            select: {
              id: true,
              nombre: true,
              email: true,
              wispChatClientId: true,
            },
          },
          referral: {
            select: {
              id: true,
              nombre: true,
              wispChatClientId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: commissions });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Aplicar comisión a factura del cliente
   * POST /api/admin/commissions/:id/apply
   */
  async applyCommission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { wispChatInvoiceId, invoiceMonth, invoiceAmount, appliedBy, amount, notas } = req.body;

      if (!wispChatInvoiceId || !invoiceMonth || !invoiceAmount || !appliedBy) {
        return res.status(400).json({
          success: false,
          error: { message: 'Faltan campos requeridos' },
        });
      }

      const application = await commissionService.applyToInvoice({
        commissionId: id,
        wispChatInvoiceId,
        invoiceMonth,
        invoiceAmount: parseFloat(invoiceAmount),
        appliedBy,
        amount: amount ? parseFloat(amount) : parseFloat(invoiceAmount),
        notas,
      });

      res.json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Cancelar comisión
   * POST /api/admin/commissions/:id/cancel
   */
  async cancelCommission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const commission = await commissionService.cancelCommission(id, reason);

      res.json({
        success: true,
        data: commission,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message },
      });
    }
  }
}

export default new AdminController();
