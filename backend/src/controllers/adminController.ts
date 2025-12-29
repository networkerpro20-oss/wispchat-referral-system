import { Request, Response } from 'express';
import commissionService from '../services/commissionService';
import clientService from '../services/clientService';
import leadService from '../services/leadService';
import invoiceService from '../services/invoiceService';
import clientImportService from '../services/clientImportService';
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
   * Dashboard extendido con más métricas
   * GET /api/admin/dashboard-extended
   */
  async getDashboardExtended(req: Request, res: Response) {
    try {
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const [
        totalClients,
        clientsWithReferrals,
        clientsPaymentCurrent,
        clientsPaymentOverdue,
        totalLeads,
        pendingLeads,
        contactedLeads,
        installedLeads,
        rejectedLeads,
        leadsThisMonth,
        leadsLastMonth,
        totalCommissions,
        earnedCommissions,
        activeCommissions,
        appliedCommissions,
        cancelledCommissions,
        totalAmount,
        activeAmount,
        appliedAmount,
        recentLeads,
        topReferrers,
      ] = await Promise.all([
        // Clientes
        prisma.client.count({ where: { active: true } }),
        prisma.client.count({ where: { active: true, totalReferrals: { gt: 0 } } }),
        prisma.client.count({ where: { active: true, isPaymentCurrent: true } }),
        prisma.client.count({ where: { active: true, isPaymentCurrent: false } }),
        // Leads
        prisma.referral.count(),
        prisma.referral.count({ where: { status: 'PENDING' } }),
        prisma.referral.count({ where: { status: 'CONTACTED' } }),
        prisma.referral.count({ where: { status: 'INSTALLED' } }),
        prisma.referral.count({ where: { status: 'REJECTED' } }),
        prisma.referral.count({ where: { createdAt: { gte: firstDayThisMonth } } }),
        prisma.referral.count({ 
          where: { 
            createdAt: { gte: firstDayLastMonth, lte: lastDayLastMonth } 
          } 
        }),
        // Comisiones
        prisma.commission.count(),
        prisma.commission.count({ where: { status: 'EARNED' } }),
        prisma.commission.count({ where: { status: 'ACTIVE' } }),
        prisma.commission.count({ where: { status: 'APPLIED' } }),
        prisma.commission.count({ where: { status: 'CANCELLED' } }),
        prisma.commission.aggregate({ _sum: { amount: true } }),
        prisma.commission.aggregate({ where: { status: 'ACTIVE' }, _sum: { amount: true } }),
        prisma.commission.aggregate({ where: { status: 'APPLIED' }, _sum: { amount: true } }),
        // Leads recientes
        prisma.referral.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            client: { select: { nombre: true } }
          }
        }),
        // Top referidores
        prisma.client.findMany({
          where: { totalReferrals: { gt: 0 } },
          orderBy: { totalReferrals: 'desc' },
          take: 5,
          select: {
            id: true,
            nombre: true,
            referralCode: true,
            totalReferrals: true,
            totalEarned: true
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          clients: {
            total: totalClients,
            withReferrals: clientsWithReferrals,
            paymentCurrent: clientsPaymentCurrent,
            paymentOverdue: clientsPaymentOverdue,
          },
          leads: {
            total: totalLeads,
            pending: pendingLeads,
            contacted: contactedLeads,
            installed: installedLeads,
            rejected: rejectedLeads,
            thisMonth: leadsThisMonth,
            lastMonth: leadsLastMonth,
          },
          commissions: {
            total: totalCommissions,
            earned: earnedCommissions,
            active: activeCommissions,
            applied: appliedCommissions,
            cancelled: cancelledCommissions,
            totalAmount: Number(totalAmount._sum.amount) || 0,
            activeAmount: Number(activeAmount._sum.amount) || 0,
            appliedAmount: Number(appliedAmount._sum.amount) || 0,
          },
          recentLeads: recentLeads.map(lead => ({
            id: lead.id,
            nombre: lead.nombre,
            telefono: lead.telefono,
            status: lead.status,
            createdAt: lead.createdAt,
            clientName: lead.client.nombre
          })),
          topReferrers: topReferrers.map(ref => ({
            id: ref.id,
            nombre: ref.nombre,
            referralCode: ref.referralCode,
            totalReferrals: ref.totalReferrals,
            totalEarned: Number(ref.totalEarned)
          }))
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
   * Listar clientes con sus referidos
   * GET /api/admin/clients-with-referrals
   */
  async getClientsWithReferrals(req: Request, res: Response) {
    try {
      const clients = await prisma.client.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        include: {
          referrals: {
            orderBy: { createdAt: 'desc' },
            include: {
              commissions: {
                select: {
                  type: true,
                  amount: true,
                  status: true,
                }
              }
            }
          }
        }
      });

      res.json({
        success: true,
        data: clients.map(client => ({
          id: client.id,
          wispChatClientId: client.wispChatClientId,
          nombre: client.nombre,
          email: client.email,
          telefono: client.telefono,
          referralCode: client.referralCode,
          shareUrl: client.shareUrl,
          isPaymentCurrent: client.isPaymentCurrent,
          lastInvoiceStatus: client.lastInvoiceStatus,
          totalReferrals: client.totalReferrals,
          totalEarned: Number(client.totalEarned),
          totalActive: Number(client.totalActive),
          totalApplied: Number(client.totalApplied),
          active: client.active,
          createdAt: client.createdAt,
          referrals: client.referrals.map(ref => ({
            id: ref.id,
            nombre: ref.nombre,
            telefono: ref.telefono,
            email: ref.email,
            direccion: ref.direccion,
            status: ref.status,
            fechaContacto: ref.fechaContacto,
            fechaInstalacion: ref.fechaInstalacion,
            createdAt: ref.createdAt,
            commissions: ref.commissions.map(comm => ({
              type: comm.type,
              amount: Number(comm.amount),
              status: comm.status
            }))
          }))
        }))
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Ver detalle de un lead
   * GET /api/admin/leads/:id
   */
  async getLeadDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const lead = await prisma.referral.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              nombre: true,
              email: true,
              referralCode: true,
              isPaymentCurrent: true
            }
          },
          commissions: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              type: true,
              amount: true,
              status: true,
              monthNumber: true,
              createdAt: true
            }
          }
        }
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lead no encontrado' }
        });
      }

      res.json({
        success: true,
        data: {
          ...lead,
          commissions: lead.commissions.map(c => ({
            ...c,
            amount: Number(c.amount)
          }))
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  }

  /**
   * Agregar nota a un lead
   * POST /api/admin/leads/:id/note
   */
  async addLeadNote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { note } = req.body;

      if (!note) {
        return res.status(400).json({
          success: false,
          error: { message: 'La nota es requerida' }
        });
      }

      const referral = await leadService.addNote(id, note);

      res.json({
        success: true,
        data: referral
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

  /**
   * Subir CSV de clientes (EAClientes)
   * POST /api/admin/clients/upload
   */
  async uploadClientsCSV(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No se subió ningún archivo' },
        });
      }

      const uploadedBy = req.body.uploadedBy || 'admin';

      const result = await clientImportService.importClientsCSV({
        filePath: req.file.path,
        fileName: req.file.originalname,
        uploadedBy,
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
}

export default new AdminController();
