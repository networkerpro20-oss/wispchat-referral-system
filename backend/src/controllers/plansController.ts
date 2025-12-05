import { Request, Response } from 'express';
import prisma from '../lib/prisma';

class PlansController {
  /**
   * GET /api/plans (público)
   * Obtener planes activos para landing page
   */
  async getActivePlans(req: Request, res: Response) {
    try {
      const plans = await prisma.internetPlan.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
      });
      
      return res.json({
        success: true,
        data: plans
      });
    } catch (error: any) {
      console.error('Error obteniendo planes activos:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * GET /api/admin/plans
   * Obtener TODOS los planes (admin)
   */
  async getAllPlans(req: Request, res: Response) {
    try {
      const plans = await prisma.internetPlan.findMany({
        orderBy: { order: 'asc' }
      });
      
      return res.json({
        success: true,
        data: plans
      });
    } catch (error: any) {
      console.error('Error obteniendo todos los planes:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * GET /api/admin/plans/:id
   * Obtener un plan específico
   */
  async getPlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const plan = await prisma.internetPlan.findUnique({
        where: { id }
      });
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: 'Plan no encontrado'
        });
      }
      
      return res.json({
        success: true,
        data: plan
      });
    } catch (error: any) {
      console.error('Error obteniendo plan:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * POST /api/admin/plans
   * Crear nuevo plan
   */
  async createPlan(req: Request, res: Response) {
    try {
      const {
        name,
        slug,
        speed,
        speedDownload,
        speedUpload,
        price,
        currency,
        priceLabel,
        popular,
        badge,
        features,
        maxDevices,
        recommendedFor,
        order,
        active
      } = req.body;
      
      // Validaciones
      if (!name || !slug || !speed || price === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Campos requeridos: name, slug, speed, price'
        });
      }
      
      if (price < 0 || price > 100000) {
        return res.status(400).json({
          success: false,
          error: 'Precio debe estar entre $0 y $100,000'
        });
      }
      
      // Verificar slug único
      const existing = await prisma.internetPlan.findUnique({
        where: { slug }
      });
      
      if (existing) {
        return res.status(400).json({
          success: false,
          error: `Ya existe un plan con el slug "${slug}"`
        });
      }
      
      // Crear plan
      const plan = await prisma.internetPlan.create({
        data: {
          name,
          slug,
          speed,
          speedDownload: speedDownload || 0,
          speedUpload,
          price,
          currency: currency || 'MXN',
          priceLabel,
          popular: popular || false,
          badge,
          features: features || [],
          maxDevices,
          recommendedFor,
          order: order || 0,
          active: active !== undefined ? active : true
        }
      });
      
      return res.status(201).json({
        success: true,
        data: plan,
        message: 'Plan creado exitosamente'
      });
    } catch (error: any) {
      console.error('Error creando plan:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * PATCH /api/admin/plans/:id
   * Actualizar plan existente
   */
  async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Validar precio si se proporciona
      if (updateData.price !== undefined) {
        if (updateData.price < 0 || updateData.price > 100000) {
          return res.status(400).json({
            success: false,
            error: 'Precio debe estar entre $0 y $100,000'
          });
        }
      }
      
      // Verificar que existe
      const existing = await prisma.internetPlan.findUnique({
        where: { id }
      });
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Plan no encontrado'
        });
      }
      
      // Si cambia slug, verificar que no exista otro con ese slug
      if (updateData.slug && updateData.slug !== existing.slug) {
        const slugExists = await prisma.internetPlan.findUnique({
          where: { slug: updateData.slug }
        });
        
        if (slugExists) {
          return res.status(400).json({
            success: false,
            error: `Ya existe un plan con el slug "${updateData.slug}"`
          });
        }
      }
      
      // Actualizar
      const plan = await prisma.internetPlan.update({
        where: { id },
        data: updateData
      });
      
      return res.json({
        success: true,
        data: plan,
        message: 'Plan actualizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error actualizando plan:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * DELETE /api/admin/plans/:id
   * Eliminar plan
   */
  async deletePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar que existe
      const existing = await prisma.internetPlan.findUnique({
        where: { id }
      });
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Plan no encontrado'
        });
      }
      
      await prisma.internetPlan.delete({
        where: { id }
      });
      
      return res.json({
        success: true,
        message: `Plan "${existing.name}" eliminado exitosamente`
      });
    } catch (error: any) {
      console.error('Error eliminando plan:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * POST /api/admin/plans/reorder
   * Reordenar planes
   */
  async reorderPlans(req: Request, res: Response) {
    try {
      const { planIds } = req.body; // Array de IDs en orden deseado
      
      if (!Array.isArray(planIds)) {
        return res.status(400).json({
          success: false,
          error: 'planIds debe ser un array de IDs'
        });
      }
      
      // Actualizar orden de cada plan
      const updates = planIds.map((id, index) =>
        prisma.internetPlan.update({
          where: { id },
          data: { order: index + 1 }
        })
      );
      
      await Promise.all(updates);
      
      return res.json({
        success: true,
        message: 'Orden actualizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error reordenando planes:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * PATCH /api/admin/plans/:id/toggle
   * Toggle activo/inactivo
   */
  async toggleActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const plan = await prisma.internetPlan.findUnique({
        where: { id }
      });
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: 'Plan no encontrado'
        });
      }
      
      const updated = await prisma.internetPlan.update({
        where: { id },
        data: { active: !plan.active }
      });
      
      return res.json({
        success: true,
        data: updated,
        message: `Plan ${updated.active ? 'activado' : 'desactivado'}`
      });
    } catch (error: any) {
      console.error('Error toggle plan:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new PlansController();
