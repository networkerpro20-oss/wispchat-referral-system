import prisma from '../lib/prisma';
import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Formato del CSV de facturas de Easy Access
 */
interface EasyAccessInvoiceRow {
  '#Factura': string;
  'Usuario': string;
  'Cliente': string;
  'Fecha Emisión': string;
  'Fecha Vencimiento': string;
  'Fecha Pago': string;
  'Estado': string;
  'Saldo': string;
  'Total Cobrado': string;
  'Forma de Pago': string;
  'Telefono': string;
  'Email': string;
  'ID Servicio': string; // ID del cliente en WispChat
  'Total': string;
  'Acción': string;
}

class InvoiceService {
  /**
   * Procesar CSV de facturas (Días 7 y 21)
   * 1. Parsea CSV y crea InvoiceRecords
   * 2. Actualiza estado de pagos de clientes referidores
   * 3. Actualiza estado de pagos de referidos instalados
   * 4. Genera comisiones mensuales para referidos que pagaron
   * 5. Activa comisiones si cliente referidor está al día
   */
  async processCSV(data: {
    filePath: string;
    fileName: string;
    uploadedBy: string;
    periodStart: Date;
    periodEnd: Date;
  }) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📄 PROCESANDO CSV: ${data.fileName}`);
      console.log(`📅 Período: ${data.periodStart.toLocaleDateString()} - ${data.periodEnd.toLocaleDateString()}`);
      console.log(`${'='.repeat(60)}\n`);

      // Leer y parsear CSV
      const fileContent = await fs.readFile(data.filePath, 'utf-8');
      
      // Detectar delimitador (tab o coma)
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

      // Log de columnas disponibles
      if (records.length > 0) {
        const columns = Object.keys(records[0]);
        console.log(`📋 Columnas encontradas: ${columns.join(', ')}`);
      }

      console.log(`📊 Total de facturas en CSV: ${records.length}\n`);

      // Crear registro de upload
      const upload = await prisma.invoiceUpload.create({
        data: {
          fileName: data.fileName,
          filePath: data.filePath,
          fileUrl: `/uploads/invoices/${data.fileName}`,
          uploadDate: new Date(),
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          totalInvoices: records.length,
          uploadedBy: data.uploadedBy,
        },
      });

      // PASO 1: Procesar cada factura y clasificarla
      console.log('📝 PASO 1: Procesando facturas...\n');
      let paidCount = 0;
      let pendingCount = 0;
      const errors: string[] = [];

      // Helper para buscar columna por palabras clave
      const findColumn = (row: any, keywords: string[]): string => {
        const keys = Object.keys(row);
        for (const keyword of keywords) {
          // Buscar coincidencia exacta primero
          if (row[keyword] !== undefined) {
            return String(row[keyword]).trim();
          }
          // Luego buscar por substring
          const found = keys.find(k => k.toLowerCase().includes(keyword.toLowerCase()));
          if (found && row[found] !== undefined) {
            return String(row[found]).trim();
          }
        }
        return '';
      };

      // Log de primera fila completa para debug
      if (records.length > 0) {
        console.log('🔍 Ejemplo primera fila:', JSON.stringify(records[0], null, 2));
      }

      for (const row of records) {
        try {
          // Obtener valores del CSV de EAfacturas
          // Columnas: #Factura, Cliente, Fecha Emisión, ..., Estado, ..., ID Servicio, IP Servicio, Total
          const estado = row['Estado'] || findColumn(row, ['estado', 'status']);
          const idServicio = row['ID Servicio'] || findColumn(row, ['id servicio', 'servicio', 'ID']);
          const factura = row['#Factura'] || row['Factura'] || findColumn(row, ['factura', 'invoice']);
          const cliente = row['Cliente'] || findColumn(row, ['cliente', 'client', 'nombre']);
          const fechaEmision = row['Fecha Emisión'] || findColumn(row, ['fecha emision', 'emision']);
          const fechaVencimiento = row['Fecha Vencimiento'] || findColumn(row, ['vencimiento']);
          const total = row['Total'] || findColumn(row, ['total', 'monto']) || '0';

          // Log primera fila procesada para debug
          if (paidCount === 0 && pendingCount === 0 && errors.length === 0) {
            console.log(`✅ Primera fila procesada - Estado: "${estado}", ID Servicio: "${idServicio}", Cliente: "${cliente}", Total: "${total}"`);
          }

          // Validar campos requeridos
          if (!idServicio) {
            errors.push(`Factura ${factura || 'N/A'} sin ID Servicio`);
            continue;
          }

          const invoiceDate = this.parseDate(fechaEmision);
          const dueDate = this.parseDate(fechaVencimiento);
          // Verificar si está pagada - buscar variaciones
          // Estados en CSV: "Pagada", "Pendiente de pago", "En Revision", "Cancelada"
          const estadoLower = (estado || '').toLowerCase().trim();
          const isPaid = estadoLower === 'pagada' || 
                        estadoLower === 'pagado' ||
                        estadoLower.includes('pagad') || 
                        estadoLower === 'paid' || 
                        estadoLower === 'pago' ||
                        estadoLower === 'completado' ||
                        estadoLower === 'completed';
          const isEnRevision = estadoLower.includes('revision') || estadoLower.includes('revisión');
          const status = isPaid ? 'PAID' : isEnRevision ? 'PENDING' : 'PENDING';
          const clientId = String(idServicio).trim();

        // Verificar si es cliente referidor (buscar con diferentes formatos de ID)
        const clientId = String(idServicio).trim();
        const isReferrer = await prisma.client.findFirst({
          where: {
            OR: [
              { wispChatClientId: clientId },
              { wispChatClientId: `WISPHUB_${clientId}` },
              { wispChatClientId: { endsWith: `_${clientId}` } }
            ]
          },
        });

        // Verificar si es referido instalado
        const isReferral = await prisma.referral.findFirst({
          where: {
            wispChatClientId: clientId,
            status: 'INSTALLED',
          },
        });

        await prisma.invoiceRecord.create({
          data: {
            uploadId: upload.id,
            wispChatClientId: clientId,
            wispChatInvoiceId: factura,
            clientName: cliente,
            invoiceDate,
            dueDate,
            amount: new Decimal(total.replace(/[,$]/g, '') || '0'),
            status,
            isReferrer: !!isReferrer,
            isReferral: !!isReferral,
          },
        });

        if (isPaid) paidCount++;
        else pendingCount++;

        const icon = status === 'PAID' ? '✅' : '⏳';
        const type = isReferrer ? ' [REFERIDOR]' : isReferral ? ' [REFERIDO]' : '';
        console.log(`  ${icon} #${factura} - ${cliente}${type} - $${total}`);
        } catch (rowError: any) {
          console.error(`❌ Error procesando fila:`, rowError.message);
          errors.push(`Error en fila: ${rowError.message}`);
        }
      }

      await prisma.invoiceUpload.update({
        where: { id: upload.id },
        data: { paidInvoices: paidCount, pendingInvoices: pendingCount },
      });

      console.log(`\n✅ ${paidCount} pagadas, ${pendingCount} pendientes\n`);

      // PASO 2: Actualizar estado de pagos de clientes referidores
      await this.updateReferrersPaymentStatus(upload.id);

      // PASO 3: Generar comisiones mensuales y activar según estado del cliente
      const stats = await this.processCommissions(upload.id);

      // Actualizar estadísticas finales
      await prisma.invoiceUpload.update({
        where: { id: upload.id },
        data: {
          processed: true,
          processedAt: new Date(),
          commissionsGenerated: stats.generated,
          commissionsActivated: stats.activated,
        },
      });

      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ PROCESO COMPLETADO`);
      console.log(`💰 Comisiones generadas: ${stats.generated}`);
      console.log(`🟢 Comisiones activadas: ${stats.activated}`);
      console.log(`🟡 Comisiones en espera: ${stats.generated - stats.activated}`);
      console.log(`${'='.repeat(60)}\n`);

      return {
        uploadId: upload.id,
        stats: {
          totalInvoices: records.length,
          referrerInvoices: paidCount,
          referralInvoices: pendingCount,
          commissionsGenerated: stats.generated,
          commissionsActivated: stats.activated,
          errors: errors,
        }
      };
    } catch (error: any) {
      console.error('❌ Error procesando CSV:', error.message);
      throw error;
    }
  }

  /**
   * PASO 2: Actualizar estado de pagos de clientes referidores
   */
  private async updateReferrersPaymentStatus(uploadId: string) {
    console.log('👥 PASO 2: Actualizando estado de clientes referidores...\n');

    const referrerInvoices = await prisma.invoiceRecord.findMany({
      where: { uploadId, isReferrer: true },
      orderBy: { invoiceDate: 'desc' },
    });

    let updated = 0;

    for (const invoice of referrerInvoices) {
      const client = await prisma.client.findUnique({
        where: { wispChatClientId: invoice.wispChatClientId },
      });

      if (!client) continue;

      // Actualizar estado de pagos del cliente
      const isPaymentCurrent = invoice.status === 'PAID';

      await prisma.client.update({
        where: { id: client.id },
        data: {
          lastInvoiceStatus: invoice.status,
          lastInvoiceDate: invoice.invoiceDate,
          isPaymentCurrent,
        },
      });

      updated++;
      const statusIcon = isPaymentCurrent ? '✅ AL DÍA' : '❌ PENDIENTE';
      console.log(`  ${statusIcon} - ${client.nombre} (${invoice.wispChatInvoiceId})`);
    }

    console.log(`\n✅ ${updated} clientes referidores actualizados\n`);
  }

  /**
   * PASO 3: Generar comisiones mensuales y activar según estado del cliente
   */
  private async processCommissions(uploadId: string) {
    console.log('💰 PASO 3: Procesando comisiones...\n');

    const paidReferralInvoices = await prisma.invoiceRecord.findMany({
      where: {
        uploadId,
        isReferral: true,
        status: 'PAID',
      },
    });

    const settings = await prisma.settings.findFirst();
    const monthlyAmount = settings?.monthlyAmount || 50;
    const monthsToEarn = settings?.monthsToEarn || 6;

    let generated = 0;
    let activated = 0;

    for (const invoice of paidReferralInvoices) {
      const referral = await prisma.referral.findFirst({
        where: {
          wispChatClientId: invoice.wispChatClientId,
          status: 'INSTALLED',
        },
        include: {
          client: true,
          commissions: {
            where: { type: 'MONTHLY' },
            orderBy: { monthNumber: 'asc' },
          },
        },
      });

      if (!referral) continue;

      // Actualizar estado de pagos del referido
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          lastInvoiceStatus: invoice.status,
          lastInvoiceDate: invoice.invoiceDate,
        },
      });

      // Verificar si ya tiene las 6 comisiones mensuales
      const existingCount = referral.commissions.length;
      if (existingCount >= monthsToEarn) {
        console.log(`  ⏭️  ${referral.nombre} - Ya tiene ${monthsToEarn}/6 comisiones`);
        continue;
      }

      // Verificar duplicados para este mes
      const monthKey = invoice.invoiceDate.toISOString().substring(0, 7);
      const existingForMonth = referral.commissions.find(
        (c) => c.monthDate && c.monthDate.toISOString().substring(0, 7) === monthKey
      );

      if (existingForMonth) {
        console.log(`  ⏭️  ${referral.nombre} - Ya tiene comisión para ${monthKey}`);
        continue;
      }

      // Generar comisión mensual
      const monthNumber = existingCount + 1;
      const clientIsPaymentCurrent = referral.client.isPaymentCurrent;

      // Determinar estado inicial de la comisión
      const commissionStatus = clientIsPaymentCurrent ? 'ACTIVE' : 'EARNED';
      const statusReason = clientIsPaymentCurrent
        ? null
        : 'Cliente referidor no está al día con sus pagos';

      const commission = await prisma.commission.create({
        data: {
          clientId: referral.clientId,
          referralId: referral.id,
          type: 'MONTHLY',
          amount: monthlyAmount,
          status: commissionStatus,
          statusReason,
          monthNumber,
          monthDate: invoice.invoiceDate,
        },
      });

      generated++;
      if (commissionStatus === 'ACTIVE') activated++;

      // Actualizar estadísticas del cliente
      if (commissionStatus === 'ACTIVE') {
        await prisma.client.update({
          where: { id: referral.clientId },
          data: {
            totalEarned: { increment: monthlyAmount },
            totalActive: { increment: monthlyAmount },
          },
        });
      } else {
        await prisma.client.update({
          where: { id: referral.clientId },
          data: {
            totalEarned: { increment: monthlyAmount },
          },
        });
      }

      // Marcar factura como matcheada
      await prisma.invoiceRecord.update({
        where: { id: invoice.id },
        data: { matchedReferralId: referral.id },
      });

      const statusIcon = commissionStatus === 'ACTIVE' ? '🟢' : '🟡';
      const statusText = commissionStatus === 'ACTIVE' ? 'ACTIVA' : 'EN ESPERA';
      console.log(
        `  ${statusIcon} Comisión ${monthNumber}/6 - ${referral.nombre} → ${referral.client.nombre} - $${monthlyAmount} [${statusText}]`
      );
    }

    console.log(`\n✅ ${generated} comisiones generadas (${activated} activas, ${generated - activated} en espera)\n`);

    return { generated, activated };
  }

  /**
   * Activar comisiones en espera cuando cliente se pone al día
   * Llamar esto cuando un cliente referidor paga su factura
   */
  async activatePendingCommissions(clientId: string) {
    console.log(`🔄 Activando comisiones en espera para cliente ${clientId}...`);

    const earnedCommissions = await prisma.commission.findMany({
      where: {
        clientId,
        status: 'EARNED',
      },
    });

    let activated = 0;

    for (const commission of earnedCommissions) {
      await prisma.commission.update({
        where: { id: commission.id },
        data: {
          status: 'ACTIVE',
          statusReason: null,
        },
      });

      // Actualizar totalActive del cliente
      await prisma.client.update({
        where: { id: clientId },
        data: {
          totalActive: { increment: Number(commission.amount) },
        },
      });

      activated++;
    }

    console.log(`✅ ${activated} comisiones activadas`);
    return activated;
  }

  /**
   * Parsear fecha DD/MM/YYYY
   */
  private parseDate(dateStr: string): Date {
    if (!dateStr || dateStr.trim() === '') return new Date();
    const datePart = dateStr.split(' ')[0];
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }

  /**
   * Listar uploads
   */
  async listUploads(filters?: { processed?: boolean; page?: number; limit?: number }) {
    const { processed, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;
    const where: any = {};
    if (processed !== undefined) where.processed = processed;

    const [uploads, total] = await Promise.all([
      prisma.invoiceUpload.findMany({
        where,
        orderBy: { uploadDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoiceUpload.count({ where }),
    ]);

    return { uploads, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Obtener detalles de upload
   */
  async getUploadDetails(uploadId: string) {
    return await prisma.invoiceUpload.findUnique({
      where: { id: uploadId },
      include: { invoices: { orderBy: { invoiceDate: 'desc' } } },
    });
  }

  /**
   * Reprocesar upload
   */
  async reprocessUpload(uploadId: string) {
    console.log(`🔄 Reprocesando upload ${uploadId}...`);
    await this.updateReferrersPaymentStatus(uploadId);
    const stats = await this.processCommissions(uploadId);
    return stats;
  }
}

export default new InvoiceService();
