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

      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const row of records) {
        try {
          // Mapear campos - buscar por diferentes nombres posibles
          const idServicio = findColumn(row, ['ID Servicio', 'ID', 'id_servicio', 'servicio', 'ID Cliente']);
          const nombre = findColumn(row, ['Cliente', 'Nombre', 'nombre', 'client']);
          const email = findColumn(row, ['Email', 'email', 'correo', 'Correo']);
          const telefono = findColumn(row, ['Telefono', 'telefono', 'phone', 'Tel']);
          const usuario = findColumn(row, ['Usuario', 'usuario', 'user']);

          // Validar campos requeridos
          if (!idServicio) {
            errors.push(`Registro sin ID Servicio: ${nombre || 'N/A'}`);
            skipped++;
            continue;
          }

          if (!nombre) {
            errors.push(`Registro sin nombre: ID ${idServicio}`);
            skipped++;
            continue;
          }

          // Buscar cliente existente por wispChatClientId
          const existingClient = await prisma.client.findUnique({
            where: { wispChatClientId: idServicio }
          });

          if (existingClient) {
            // Actualizar cliente existente
            await prisma.client.update({
              where: { id: existingClient.id },
              data: {
                nombre: nombre,
                email: email || existingClient.email,
                telefono: telefono || existingClient.telefono,
              }
            });
            updated++;
            console.log(`🔄 Actualizado: ${nombre} (ID: ${idServicio})`);
          } else {
            // Crear nuevo cliente
            // Generar código de referido único
            const referralCode = await this.generateReferralCode();
            
            await prisma.client.create({
              data: {
                wispChatClientId: idServicio,
                nombre: nombre,
                email: email || `${usuario || idServicio}@easy-access.net`,
                telefono: telefono,
                referralCode: referralCode,
                shareUrl: `https://referidos.wispchat.net/registro/${referralCode}`,
                active: true,
                isPaymentCurrent: true, // Por defecto al día hasta que se procese facturas
              }
            });
            created++;
            console.log(`✅ Creado: ${nombre} (ID: ${idServicio}) - Código: ${referralCode}`);
          }
        } catch (rowError: any) {
          errors.push(`Error procesando fila: ${rowError.message}`);
          skipped++;
        }
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ IMPORTACIÓN COMPLETADA`);
      console.log(`📥 Creados: ${created}`);
      console.log(`🔄 Actualizados: ${updated}`);
      console.log(`⏭️ Omitidos: ${skipped}`);
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
          errors: errors.slice(0, 10), // Máximo 10 errores en respuesta
        }
      };
    } catch (error: any) {
      console.error('❌ Error importando clientes:', error.message);
      throw error;
    }
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
