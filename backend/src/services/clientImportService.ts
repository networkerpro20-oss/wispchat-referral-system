import prisma from '../lib/prisma';
import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';

/**
 * Servicio para importar clientes desde CSV de WispHub
 */
class ClientImportService {
  /**
   * Importar clientes desde CSV
   * Esto registra/actualiza clientes en el sistema de referidos
   */
  async importClientsCSV(data: {
    filePath: string;
    fileName: string;
    uploadedBy: string;
  }) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`👥 IMPORTANDO CLIENTES: ${data.fileName}`);
      console.log(`${'='.repeat(60)}\n`);

      // Leer archivo
      const fileContent = await fs.readFile(data.filePath, 'utf-8');
      
      // Detectar delimitador
      const firstLine = fileContent.split('\n')[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      console.log(`📋 Delimitador detectado: ${delimiter === '\t' ? 'TAB' : 'COMA'}`);

      const records: any[] = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: delimiter,
        relax_quotes: true,
        relax_column_count: true,
        quote: '"',
        escape: '"',
      });

      // Log de columnas
      if (records.length > 0) {
        const columns = Object.keys(records[0]);
        console.log(`📋 Columnas encontradas: ${columns.join(', ')}`);
        console.log(`📊 Total de registros: ${records.length}\n`);
      }

      // Helper para buscar columna
      const findColumn = (row: any, keywords: string[]): string => {
        const keys = Object.keys(row);
        for (const keyword of keywords) {
          if (row[keyword] !== undefined) {
            return String(row[keyword]).trim();
          }
          const found = keys.find(k => k.toLowerCase().includes(keyword.toLowerCase()));
          if (found && row[found] !== undefined) {
            return String(row[found]).trim();
          }
        }
        return '';
      };

      // Log primera fila para debug
      if (records.length > 0) {
        console.log('🔍 Primera fila (debug):', JSON.stringify(records[0], null, 2));
      }

      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const row of records) {
        try {
          // Mapear campos del CSV de EAClientes
          // Columnas: ID, Nombre, Servicio, Ip, Estado, Plan Internet, Dirección, Telefono...
          const idServicio = findColumn(row, ['ID', 'id', 'ID Servicio', 'id_servicio']);
          const nombre = findColumn(row, ['Nombre', 'nombre', 'Cliente', 'client']);
          const servicio = findColumn(row, ['Servicio', 'servicio']); // Nombre del servicio
          const email = findColumn(row, ['Email', 'email', 'correo', 'Correo']);
          const telefono = findColumn(row, ['Telefono', 'telefono', 'phone', 'Tel']);
          const ip = findColumn(row, ['Ip', 'IP', 'ip']);
          const estado = findColumn(row, ['Estado', 'estado', 'status']);
          const planInternet = findColumn(row, ['Plan Internet', 'Plan', 'plan']);

          if (!idServicio) {
            errors.push(`Registro sin ID: ${nombre || servicio || 'N/A'}`);
            skipped++;
            continue;
          }

          if (!nombre && !servicio) {
            errors.push(`Registro sin nombre: ID ${idServicio}`);
            skipped++;
            continue;
          }

          // Buscar cliente existente por wispChatClientId (con o sin prefijo)
          const searchId = String(idServicio).trim();
          let existingClient = await prisma.client.findFirst({
            where: {
              OR: [
                { wispChatClientId: searchId },
                { wispChatClientId: `WISPHUB_${searchId}` },
                { wispChatClientId: { endsWith: `_${searchId}` } }
              ]
            }
          });

          // Determinar si está activo basado en el estado
          const isActive = estado.toLowerCase() === 'activo';

          if (existingClient) {
            // Actualizar cliente existente
            await prisma.client.update({
              where: { id: existingClient.id },
              data: {
                nombre: nombre || servicio || existingClient.nombre,
                email: email || existingClient.email,
                telefono: telefono || existingClient.telefono,
                active: isActive,
              }
            });
            updated++;
            console.log(`🔄 Actualizado: ${nombre || servicio} (ID: ${idServicio}) - ${isActive ? 'Activo' : 'Inactivo'}`);
          } else {
            // Crear nuevo cliente
            // Generar código de referido único
            const referralCode = await this.generateReferralCode();
            
            await prisma.client.create({
              data: {
                wispChatClientId: idServicio,
                nombre: nombre || servicio || `Cliente ${idServicio}`,
                email: email || `cliente${idServicio}@easy-access.net`,
                telefono: telefono,
                referralCode: referralCode,
                shareUrl: `https://referidos.wispchat.net/registro/${referralCode}`,
                active: isActive,
                isPaymentCurrent: true, // Por defecto al día hasta que se procese facturas
              }
            });
            created++;
            console.log(`✅ Creado: ${nombre || servicio} (ID: ${idServicio}) - Código: ${referralCode}`);
          }
          
          // === DETECCIÓN DE LEADS QUE YA SON CLIENTES ===
          // Buscar si existe un lead/referido pendiente con este teléfono o email
          await this.matchAndInstallReferral(idServicio, telefono, email, nombre || servicio);
          
        } catch (rowError: any) {
          errors.push(`Error procesando fila: ${rowError.message}`);
          skipped++;
        }
      }

      // Contar cuántos leads fueron vinculados
      const linkedLeads = await this.countLinkedLeads();

      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ IMPORTACIÓN COMPLETADA`);
      console.log(`📥 Creados: ${created}`);
      console.log(`🔄 Actualizados: ${updated}`);
      console.log(`⏭️ Omitidos: ${skipped}`);
      console.log(`🔗 Leads vinculados: ${linkedLeads.recentlyLinked}`);
      if (errors.length > 0) {
        console.log(`❌ Errores: ${errors.length}`);
      }
      console.log(`${'='.repeat(60)}\n`);

      return {
        success: true,
        stats: {
          total: records.length,
          created,
          updated,
          skipped,
          leadsLinked: linkedLeads.recentlyLinked,
          errors: errors.slice(0, 10), // Máximo 10 errores en respuesta
        }
      };
    } catch (error: any) {
      console.error('❌ Error importando clientes:', error.message);
      throw error;
    }
  }

  /**
   * Buscar y vincular un lead pendiente con el nuevo cliente
   */
  private async matchAndInstallReferral(
    wispChatClientId: string, 
    telefono?: string, 
    email?: string,
    nombre?: string
  ) {
    if (!telefono && !email) return;

    try {
      // Buscar lead pendiente que coincida
      const conditions: any[] = [];
      if (telefono) {
        // Normalizar teléfono (quitar espacios, guiones, etc)
        const normalizedPhone = telefono.replace(/\D/g, '');
        conditions.push({ telefono: { contains: normalizedPhone.slice(-10) } });
      }
      if (email) {
        conditions.push({ email: { equals: email, mode: 'insensitive' } });
      }

      const matchingReferral = await prisma.referral.findFirst({
        where: {
          OR: conditions,
          status: { in: ['PENDING', 'CONTACTED'] },
          wispChatClientId: null, // No vinculado aún
        },
        include: {
          client: true,
        },
      });

      if (matchingReferral) {
        console.log(`🔗 Lead encontrado! "${matchingReferral.nombre}" coincide con cliente ${wispChatClientId}`);

        // Actualizar el lead como INSTALLED
        await prisma.referral.update({
          where: { id: matchingReferral.id },
          data: {
            wispChatClientId: wispChatClientId,
            status: 'INSTALLED',
            fechaInstalacion: new Date(),
            notas: `${matchingReferral.notas || ''}\n[${new Date().toISOString()}] Vinculado automáticamente al importar CSV de clientes`,
          },
        });

        // Verificar si ya tiene comisión de instalación
        const existingCommission = await prisma.commission.findFirst({
          where: {
            referralId: matchingReferral.id,
            type: 'INSTALLATION',
          },
        });

        if (!existingCommission) {
          // Generar comisión de instalación
          const settings = await prisma.settings.findFirst();
          const amount = settings?.installationAmount || 200;

          await prisma.commission.create({
            data: {
              clientId: matchingReferral.clientId,
              referralId: matchingReferral.id,
              type: 'INSTALLATION',
              amount,
              status: 'EARNED',
            },
          });

          // Actualizar stats del cliente referidor
          await prisma.client.update({
            where: { id: matchingReferral.clientId },
            data: {
              totalReferrals: { increment: 1 },
              totalEarned: { increment: Number(amount) },
            },
          });

          console.log(`💰 Comisión de instalación generada: $${amount} para ${matchingReferral.client.nombre}`);
        }
      }
    } catch (error: any) {
      console.error(`⚠️  Error vinculando lead: ${error.message}`);
    }
  }

  /**
   * Contar leads vinculados recientemente (últimas 24 horas)
   */
  private async countLinkedLeads() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentlyLinked = await prisma.referral.count({
      where: {
        status: 'INSTALLED',
        fechaInstalacion: { gte: yesterday },
        wispChatClientId: { not: null },
      },
    });

    return { recentlyLinked };
  }

  /**
   * Generar código de referido único
   */
  private async generateReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let exists = true;
    
    while (exists) {
      const random = Array.from({ length: 5 }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
      code = `EASY-${random}`;
      
      const existing = await prisma.client.findUnique({
        where: { referralCode: code }
      });
      exists = !!existing;
    }
    
    return code!;
  }
}

export default new ClientImportService();
