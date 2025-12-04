import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Ruta pública para registrar leads desde la landing page
router.post('/register', async (req, res) => {
  try {
    const {
      nombre,
      telefono,
      email,
      direccion,
      colonia,
      ciudad,
      codigoPostal,
      servicioInteres,
      velocidadInteres,
      comentarios,
      codigoReferido,
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !telefono || !direccion || !colonia || !ciudad || !codigoPostal || !codigoReferido) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes',
      });
    }

    // Buscar el referral por código
    const referral = await prisma.referral.findFirst({
      where: { shareUrl: codigoReferido },
      include: { client: true },
    });

    if (!referral) {
      return res.status(404).json({
        success: false,
        error: 'Código de referido no válido',
      });
    }

    // Crear el lead
    const lead = await prisma.referral.create({
      data: {
        clientId: referral.clientId,
        name: nombre,
        phone: telefono,
        email: email || undefined,
        address: `${direccion}, ${colonia}, ${ciudad}, CP ${codigoPostal}`,
        serviceType: servicioInteres,
        notes: `Velocidad de interés: ${velocidadInteres || 'No especificada'}\nComentarios: ${comentarios || 'Ninguno'}`,
        status: 'pending',
        referredBy: codigoReferido,
      },
    });

    // TODO: Enviar notificación al cliente referidor
    // TODO: Enviar notificación al administrador

    res.json({
      success: true,
      data: {
        id: lead.id,
        mensaje: 'Tu solicitud ha sido recibida. Te contactaremos pronto.',
      },
    });
  } catch (error) {
    console.error('Error al registrar lead:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud',
    });
  }
});

// Obtener leads (requiere autenticación)
router.get('/', async (req, res) => {
  try {
    const leads = await prisma.referral.findMany({
      where: { status: 'pending' },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error('Error al obtener leads:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener leads',
    });
  }
});

export default router;
