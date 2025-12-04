# Plan de Migración a Arquitectura Correcta

## Situación Actual

El backend está diseñado como multi-tenant (varias empresas) cuando debe ser **sistema externo independiente** para **UNA SOLA empresa** (Easy Access NewTelecom).

## Problemas Identificados

1. ❌ Schema usa `tenantId` - no necesario
2. ❌ ReferralSettings por tenant - innecesario
3. ❌ Lógica compleja de tenant en controladores
4. ❌ 17 errores de TypeScript por schema incorrecto
5. ❌ Falta integración con WispHub API

## Nuevo Schema Correcto

Ver: `prisma/schema-new.prisma`

### Modelos principales:

- **Client** - Cliente referidor (sincronizado desde WispHub)
- **Referral** - Lead captado por formulario
- **Commission** - Comisión ganada
- **CommissionApplication** - Registro de descuento aplicado
- **Settings** - Configuración global

## Pasos de Migración

### Fase 1: Backup y Preparación ✅
- [x] Crear ARQUITECTURA_CORRECTA.md
- [x] Crear schema-new.prisma
- [ ] Backup de BD actual
- [ ] Backup de código actual (branch)

### Fase 2: Migración de Base de Datos
- [ ] Renombrar schema.prisma a schema-old.prisma
- [ ] Renombrar schema-new.prisma a schema.prisma
- [ ] Crear migración: `npx prisma migrate dev --name nueva-arquitectura`
- [ ] Verificar tablas creadas

### Fase 3: Actualizar Backend

#### 3.1 Servicios
- [ ] Eliminar: `referralSettingsService.ts`
- [ ] Crear: `clientService.ts` - Manejo de clientes referidores
- [ ] Crear: `leadService.ts` - Manejo de leads (renombrar referralService)
- [ ] Actualizar: `commissionService.ts` - Simplificar sin multi-tenant
- [ ] Crear: `wispHubService.ts` - Integración con API WispHub

#### 3.2 Controladores
- [ ] Eliminar: `referralSettingsController.ts`
- [ ] Crear: `clientController.ts`
- [ ] Crear: `leadController.ts`
- [ ] Actualizar: `commissionController.ts`
- [ ] Crear: `adminController.ts`

#### 3.3 Rutas
- [ ] `/api/clients` - Login y datos del cliente
- [ ] `/api/clients/me` - Mi información y código
- [ ] `/api/clients/referrals` - Mis referidos
- [ ] `/api/clients/commissions` - Mis comisiones
- [ ] `/api/leads/register` - Registrar lead (ya existe)
- [ ] `/api/admin/leads` - Gestión de leads
- [ ] `/api/admin/commissions` - Aplicar comisiones
- [ ] `/api/wisphub/*` - Proxy a WispHub

### Fase 4: Frontend

#### 4.1 Dashboard Cliente
- [ ] `/dashboard` - Vista principal cliente
- [ ] Mostrar código y link de referido
- [ ] Lista de referidos con estado
- [ ] Resumen de comisiones
- [ ] Historial de aplicaciones

#### 4.2 Dashboard Admin
- [ ] `/admin` - Vista admin
- [ ] Lista de leads pendientes
- [ ] Cambiar estado de leads
- [ ] Ver comisiones pendientes
- [ ] Aplicar comisiones a facturas

#### 4.3 Landing (ya existe)
- [x] `/easyaccess/[codigo]` - Formulario de registro

### Fase 5: Integración WispHub

#### 5.1 API Client WispHub
```typescript
// wispHubService.ts
class WispHubService {
  async getClient(numero: string): Promise<WispHubClient | null>
  async getInvoices(numero: string, month: string): Promise<Invoice[]>
  async getClientStatus(numero: string): Promise<'active' | 'suspended' | 'cancelled'>
}
```

#### 5.2 Sincronización
- [ ] Script para importar clientes desde WispHub
- [ ] Generar códigos de referido para cada cliente
- [ ] Webhook o cron job para verificar nuevas instalaciones
- [ ] Webhook o cron job para generar comisiones mensuales

### Fase 6: Testing

- [ ] Test unitarios de servicios
- [ ] Test de endpoints API
- [ ] Test de flujo completo:
  1. Cliente comparte link
  2. Lead completa formulario
  3. Admin marca como instalado
  4. Sistema genera comisión instalación
  5. Cada mes genera comisión mensual (6 meses)
  6. Admin aplica comisión a factura
  7. Sistema resta saldo

### Fase 7: Deploy

- [ ] Deploy backend a Render
- [ ] Deploy frontend a Vercel
- [ ] Configurar variables de entorno
- [ ] Pruebas en producción

## Prioridad Inmediata

Para desbloquear deployment:

1. **Arreglar compilación actual** (quick fix):
   - Cambiar 'pending' a 'PENDING' en leads.ts
   - Quitar referencias a 'client' que no existe
   - Agregar métodos faltantes en services
   
2. **Migrar a nueva arquitectura** (correcto):
   - Seguir este plan completo
   - Implementar schema correcto
   - Reescribir servicios sin multi-tenant

## Decisión

¿Prefieres:
- **A) Quick fix** - Arreglar errores para que compile, desplegar, luego migrar después
- **B) Migración completa** - Hacer todo ahora, arquitectura correcta desde el inicio

## Estimación de Tiempo

- Quick fix: 30 minutos
- Migración completa: 4-6 horas

## Recomendación

**Opción A primero**, para desbloquear deployment y tener algo funcionando. Luego **Opción B** en sprint separado con planning adecuado.
