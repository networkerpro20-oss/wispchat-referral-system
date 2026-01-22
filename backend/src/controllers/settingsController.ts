import { Request, Response } from 'express';
import prisma from '../lib/prisma';

class SettingsController {
  /**
   * GET /api/admin/settings
   * Obtener configuración actual (ADMIN)
   */
  async getSettings(req: Request, res: Response) {
    try {
      const settings = await prisma.settings.findFirst();
      
      if (!settings) {
        return res.status(404).json({
          success: false,
          error: 'No se encontró configuración'
        });
      }
      
      return res.json({
        success: true,
        data: settings
      });
    } catch (error: any) {
      console.error('Error obteniendo settings:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * PATCH /api/admin/settings
   * Actualizar configuración (ADMIN)
   */
  async updateSettings(req: Request, res: Response) {
    try {
      const {
        // Comisiones
        installationAmount,
        monthlyAmount,
        monthsToEarn,
        currency,
        
        // Promociones
        promoActive,
        promoName,
        promoStartDate,
        promoEndDate,
        promoInstallAmount,
        promoMonthlyAmount,
        promoDescription,
        promoDisplayBanner,
        
        // Contacto
        whatsappNumber,
        whatsappMessage,
        telegramUser,
        telegramGroup,
        phoneNumber,
        supportEmail,
        supportHours,
        
        // Video
        videoEnabled,
        videoUrl,
        videoTitle,
        videoThumbnail,
        
        // WispChat API
        wispChatUrl,
        wispChatTenantDomain,
        wispChatAdminEmail,
        wispChatAdminPassword,
      } = req.body;
      
      // Validaciones
      if (installationAmount !== undefined) {
        if (installationAmount < 0 || installationAmount > 10000) {
          return res.status(400).json({
            success: false,
            error: 'Comisión de instalación debe estar entre $0 y $10,000'
          });
        }
      }
      
      if (monthlyAmount !== undefined) {
        if (monthlyAmount < 0 || monthlyAmount > 1000) {
          return res.status(400).json({
            success: false,
            error: 'Comisión mensual debe estar entre $0 y $1,000'
          });
        }
      }
      
      if (monthsToEarn !== undefined) {
        if (monthsToEarn < 1 || monthsToEarn > 24) {
          return res.status(400).json({
            success: false,
            error: 'Meses debe estar entre 1 y 24'
          });
        }
      }
      
      // Si activa promo, validar fechas
      if (promoActive) {
        if (!promoStartDate || !promoEndDate) {
          return res.status(400).json({
            success: false,
            error: 'Promoción requiere fechas de inicio y fin'
          });
        }
        
        const start = new Date(promoStartDate);
        const end = new Date(promoEndDate);
        
        if (end <= start) {
          return res.status(400).json({
            success: false,
            error: 'Fecha de fin debe ser posterior a fecha de inicio'
          });
        }
      }
      
      // Obtener settings actual
      const settings = await prisma.settings.findFirst();
      
      if (!settings) {
        return res.status(404).json({
          success: false,
          error: 'No se encontró configuración'
        });
      }
      
      // Actualizar
      const updated = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          ...(installationAmount !== undefined && { installationAmount }),
          ...(monthlyAmount !== undefined && { monthlyAmount }),
          ...(monthsToEarn !== undefined && { monthsToEarn }),
          ...(currency !== undefined && { currency }),
          
          ...(promoActive !== undefined && { promoActive }),
          ...(promoName !== undefined && { promoName }),
          ...(promoStartDate !== undefined && { promoStartDate: new Date(promoStartDate) }),
          ...(promoEndDate !== undefined && { promoEndDate: new Date(promoEndDate) }),
          ...(promoInstallAmount !== undefined && { promoInstallAmount }),
          ...(promoMonthlyAmount !== undefined && { promoMonthlyAmount }),
          ...(promoDescription !== undefined && { promoDescription }),
          ...(promoDisplayBanner !== undefined && { promoDisplayBanner }),
          
          ...(whatsappNumber !== undefined && { whatsappNumber }),
          ...(whatsappMessage !== undefined && { whatsappMessage }),
          ...(telegramUser !== undefined && { telegramUser }),
          ...(telegramGroup !== undefined && { telegramGroup }),
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(supportEmail !== undefined && { supportEmail }),
          ...(supportHours !== undefined && { supportHours }),
          
          ...(videoEnabled !== undefined && { videoEnabled }),
          ...(videoUrl !== undefined && { videoUrl }),
          ...(videoTitle !== undefined && { videoTitle }),
          ...(videoThumbnail !== undefined && { videoThumbnail }),
          
          // WispChat API
          ...(wispChatUrl !== undefined && { wispChatUrl }),
          ...(wispChatTenantDomain !== undefined && { wispChatTenantDomain }),
          ...(wispChatAdminEmail !== undefined && { wispChatAdminEmail }),
          ...(wispChatAdminPassword !== undefined && { wispChatAdminPassword }),
        }
      });
      
      return res.json({
        success: true,
        data: updated,
        message: 'Configuración actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Error actualizando settings:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * GET /api/settings (público)
   * Obtener configuración para landing page
   */
  async getPublicSettings(req: Request, res: Response) {
    try {
      const settings = await prisma.settings.findFirst({
        select: {
          // Comisiones (para mostrar en landing)
          installationAmount: true,
          monthlyAmount: true,
          monthsToEarn: true,
          currency: true,
          
          // Promociones
          promoActive: true,
          promoName: true,
          promoStartDate: true,
          promoEndDate: true,
          promoInstallAmount: true,
          promoMonthlyAmount: true,
          promoDescription: true,
          promoDisplayBanner: true,
          
          // Contacto
          whatsappNumber: true,
          whatsappMessage: true,
          telegramUser: true,
          phoneNumber: true,
          supportEmail: true,
          supportHours: true,
          
          // Video
          videoEnabled: true,
          videoUrl: true,
          videoTitle: true,
          videoThumbnail: true,
        }
      });
      
      if (!settings) {
        return res.status(404).json({
          success: false,
          error: 'No se encontró configuración'
        });
      }
      
      // Si hay promo activa, verificar fechas
      let promoActive = settings.promoActive;
      if (settings.promoActive && settings.promoStartDate && settings.promoEndDate) {
        const now = new Date();
        const start = new Date(settings.promoStartDate);
        const end = new Date(settings.promoEndDate);
        
        if (now < start || now > end) {
          // Promo expirada o no iniciada
          promoActive = false;
        }
      }
      
      return res.json({
        success: true,
        data: {
          ...settings,
          promoActive // Override con validación de fechas
        }
      });
    } catch (error: any) {
      console.error('Error obteniendo settings públicos:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new SettingsController();
