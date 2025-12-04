import { Request, Response } from 'express';
import leadService from '../services/leadService';
import { ReferralStatus } from '@prisma/client';

/**
 * Controlador para leads/referidos
 */
class LeadController {
  /**
   * Registrar nuevo lead desde formulario
   * POST /api/leads/register
   */
  async registerLead(req: Request, res: Response) {
    try {
      const {
        codigo,
        nombre,
        telefono,
        email,
        direccion,
        colonia,
        ciudad,
        codigoPostal,
        tipoServicio,
        velocidad,
      } = req.body;

      // Validar campos requeridos
      if (!codigo || !nombre || !telefono) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: codigo, nombre, telefono',
        });
      }

      const referral = await leadService.registerLead({
        referralCode: codigo,
        nombre,
        telefono,
        email,
        direccion,
        colonia,
        ciudad,
        codigoPostal,
        tipoServicio,
        velocidad,
      });

      return res.status(201).json({
        success: true,
        message: '¡Gracias! Hemos recibido tu solicitud. Te contactaremos pronto.',
        data: {
          id: referral.id,
          nombre: referral.nombre,
          telefono: referral.telefono,
        },
      });
    } catch (error: any) {
      console.error('Error registering lead:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar solicitud',
      });
    }
  }

  /**
   * Obtener lead por ID
   * GET /api/leads/:id
   */
  async getLead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const lead = await leadService.getById(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead no encontrado',
        });
      }

      return res.json({
        success: true,
        data: lead,
      });
    } catch (error: any) {
      console.error('Error getting lead:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Listar leads con filtros
   * GET /api/leads
   */
  async listLeads(req: Request, res: Response) {
    try {
      const { status, clientId, page, limit } = req.query;

      const filters: any = {};
      if (status) filters.status = status as ReferralStatus;
      if (clientId) filters.clientId = clientId as string;
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await leadService.list(filters);

      return res.json({
        success: true,
        data: result.leads,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Error listing leads:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Actualizar estado del lead
   * PUT /api/leads/:id/status
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, wispHubClientId, fechaInstalacion, notas } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'El campo status es requerido',
        });
      }

      const data: any = {};
      if (wispHubClientId) data.wispHubClientId = wispHubClientId;
      if (fechaInstalacion) data.fechaInstalacion = new Date(fechaInstalacion);
      if (notas) data.notas = notas;

      // Si se marca como CONTACTED, agregar fecha de contacto
      if (status === 'CONTACTED') {
        data.fechaContacto = new Date();
      }

      const lead = await leadService.updateStatus(id, status, data);

      return res.json({
        success: true,
        message: 'Estado actualizado correctamente',
        data: lead,
      });
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Agregar nota al lead
   * POST /api/leads/:id/notes
   */
  async addNote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { note } = req.body;

      if (!note) {
        return res.status(400).json({
          success: false,
          message: 'El campo note es requerido',
        });
      }

      const lead = await leadService.addNote(id, note);

      return res.json({
        success: true,
        message: 'Nota agregada correctamente',
        data: lead,
      });
    } catch (error: any) {
      console.error('Error adding note:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new LeadController();
