import prisma from '../lib/prisma';
import { Referral, ReferralStatus } from '@prisma/client';
import clientService from './clientService';
import wispChatService from './wispChatService';

/**
 * Servicio para manejar leads/referidos
 */
class LeadService {
  /**
   * Registrar nuevo lead desde formulario
   */
  async registerLead(data: {
    referralCode: string;
    nombre: string;
    telefono: string;
    email?: string;
    direccion?: string;
    colonia?: string;
    ciudad?: string;
    codigoPostal?: string;
    tipoServicio?: string;
    velocidad?: string;
  }): Promise<Referral> {
    // Buscar cliente referidor por código
    const client = await clientService.getByReferralCode(data.referralCode);
    
    if (!client) {
      throw new Error('Código de referido inválido');
    }

    // Crear el lead
    const referral = await prisma.referral.create({
      data: {
        clientId: client.id,
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email,
        direccion: data.direccion,
        colonia: data.colonia,
        ciudad: data.ciudad,
        codigoPostal: data.codigoPostal,
        tipoServicio: data.tipoServicio,
        velocidad: data.velocidad,
        status: 'PENDING',
      },
      include: {
        client: {
          select: {
            wispChatClientId: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    // Actualizar contador del cliente
    await clientService.updateStats(client.id);

    console.log(`✅ Nuevo lead registrado: ${referral.nombre} por ${client.nombre}`);

    return referral;
  }

  /**
   * Obtener lead por ID
   */
  async getById(id: string): Promise<Referral | null> {
    return await prisma.referral.findUnique({
      where: { id },
      include: {
        client: true,
        commissions: true,
      },
    });
  }

  /**
   * Listar leads con filtros
   */
  async list(filters: {
    status?: ReferralStatus;
    clientId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, clientId, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const [leads, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          client: {
            select: {
              wispChatClientId: true,
              nombre: true,
              email: true,
              referralCode: true,
            },
          },
          commissions: true,
        },
      }),
      prisma.referral.count({ where }),
    ]);

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Actualizar estado del lead
   * Si se marca como INSTALLED, verificar en WispChat automáticamente
   */
  async updateStatus(
    id: string,
    status: ReferralStatus,
    data?: {
      fechaContacto?: Date;
      fechaInstalacion?: Date;
      notas?: string;
    }
  ): Promise<Referral> {
    const referral = await this.getById(id);
    if (!referral) throw new Error('Lead no encontrado');

    const updateData: any = { status };

    if (data?.fechaContacto) updateData.fechaContacto = data.fechaContacto;
    if (data?.fechaInstalacion) updateData.fechaInstalacion = data.fechaInstalacion;
    if (data?.notas) updateData.notas = data.notas;

    // Si se marca como INSTALLED, verificar en WispChat
    if (status === 'INSTALLED') {
      console.log(`🔍 Verificando referido en WispChat: ${referral.nombre}`);
      
      const wispChatClient = await wispChatService.findClientByEmailOrPhone(
        referral.email || undefined,
        referral.telefono
      );

      if (wispChatClient) {
        console.log(`✅ Referido encontrado en WispChat: ${wispChatClient.clientNumber}`);
        updateData.wispChatClientId = wispChatClient.id;
        
        if (!data?.fechaInstalacion) {
          updateData.fechaInstalacion = new Date();
        }

        // Generar comisión de instalación
        await this.generateInstallationCommission(referral, wispChatClient.id);
      } else {
        console.log(`⚠️  Referido NO encontrado en WispChat - verificar manualmente`);
        throw new Error(
          'Referido no encontrado en WispChat. Verificar que el email/teléfono coincidan con el registro en el sistema.'
        );
      }
    }

    const updated = await prisma.referral.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
      },
    });

    // Actualizar stats del cliente
    await clientService.updateStats(updated.clientId);

    return updated;
  }

  /**
   * Generar comisión de instalación
   */
  private async generateInstallationCommission(referral: Referral, wispChatClientId: string) {
    const settings = await prisma.settings.findFirst();
    const amount = settings?.installationAmount || 500;

    const commission = await prisma.commission.create({
      data: {
        clientId: referral.clientId,
        referralId: referral.id,
        type: 'INSTALLATION',
        amount,
        status: 'EARNED',
      },
    });

    console.log(`💰 Comisión de instalación generada: $${amount} (${commission.id})`);

    await clientService.updateStats(referral.clientId);
  }

  /**
   * Obtener leads del cliente
   */
  async getClientReferrals(clientId: string) {
    return await prisma.referral.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        commissions: {
          select: {
            type: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /**
   * Agregar nota al lead
   */
  async addNote(id: string, note: string): Promise<Referral> {
    const referral = await this.getById(id);
    if (!referral) throw new Error('Lead no encontrado');

    const existingNotes = referral.notas || '';
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${note}`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;

    return await prisma.referral.update({
      where: { id },
      data: { notas: updatedNotes },
    });
  }
}

export default new LeadService();
