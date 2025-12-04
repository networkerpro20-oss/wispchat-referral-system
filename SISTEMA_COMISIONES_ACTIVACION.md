# Sistema de Comisiones con Activación Automática

## 📊 Resumen Ejecutivo

**Estado:** ✅ **IMPLEMENTADO Y DESPLEGADO**

Sistema de comisiones que **activa automáticamente** las comisiones solo cuando el **referidor está al día con sus pagos**. Procesa CSVs de facturas en días 7 y 21 de cada mes.

---

## 🎯 Lógica de Negocio

### Estados de Comisiones

| Estado | Descripción | Puede Cobrar |
|--------|-------------|--------------|
| **EARNED** | Referido pagó, pero referidor NO está al día | ❌ No |
| **ACTIVE** | Referido pagó Y referidor está al día | ✅ Sí |
| **APPLIED** | Comisión aplicada a factura del cliente | ✅ Cobrada |
| **CANCELLED** | Comisión cancelada por admin | ❌ No |

### Flujo de Activación

```
📅 Día 7 o 21: Admin sube CSV de facturas
    ↓
📊 Sistema clasifica cada factura:
    - isReferrer: Cliente que refirió a alguien
    - isReferral: Cliente que fue referido
    ↓
💰 Para cada referido que pagó (PAID):
    ↓
    ¿El referidor está al día?
    ↓
    SÍ → Comisión = ACTIVE (puede cobrar)
    NO → Comisión = EARNED (no puede cobrar aún)
    ↓
🔄 Si referidor paga tarde:
    Sistema convierte automáticamente EARNED → ACTIVE
```

### Ejemplo Práctico

**Mes 1:**
- Juan (referidor) tiene 2 referidos: María y Pedro
- **Día 7:** CSV muestra:
  - Juan: PENDING (no ha pagado)
  - María: PAID ($100)
  - Pedro: PAID ($150)
  
**Resultado:**
```
Comisión #1: María ($50) → EARNED (Juan no está al día)
Comisión #2: Pedro ($50) → EARNED (Juan no está al día)
```

**Día 15:** Juan finalmente paga su factura

**Día 21:** Nuevo CSV:
- Juan: PAID (pagó el día 15)
- María: PAID
- Pedro: PAID

**Resultado:**
```
Sistema detecta que Juan pagó:
  ✅ Comisión #1: EARNED → ACTIVE ($50)
  ✅ Comisión #2: EARNED → ACTIVE ($50)
  
Juan ahora puede cobrar $100 en total
```

---

## 📁 Formato CSV (Easy Access)

**Archivo:** `EAfacturas DDMMYY.txt`  
**Delimitador:** TAB (`\t`)  
**Codificación:** UTF-8

### Columnas Requeridas

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `#Factura` | Número de factura | `10234` |
| `ID Servicio` | ID del cliente en WispChat | `123` |
| `Estado` | PAID o PENDING | `PAID` |
| `Cliente` | Nombre del cliente | `Juan Pérez` |
| `Total` | Monto de la factura | `$100.00` |
| `Fecha Emisión` | Fecha DD/MM/YYYY | `01/12/2025` |

### Ejemplo CSV

```
#FacturaUsuarioClienteFecha EmisiónEstadoID ServicioTotal
10234jperezJuan Pérez01/12/2025PAID123$100.00
10235mlopezMaría López01/12/2025PENDING124$150.00
10236pgarciaPedro García01/12/2025PAID125$100.00
```

---

## 🔧 Implementación Técnica

### 1. Schema de Base de Datos

#### Client
```prisma
model Client {
  lastInvoiceStatus  InvoiceStatus?  // PAID | PENDING
  lastInvoiceDate    DateTime?
  isPaymentCurrent   Boolean @default(false)  // ← Clave para activación
  totalActive        Decimal @default(0)      // Suma de ACTIVE
}
```

#### Commission
```prisma
model Commission {
  status       CommissionStatus  // EARNED | ACTIVE | APPLIED | CANCELLED
  statusReason String?           // Razón del estado
  month        Int               // 1-6
  amount       Decimal           // $500 instalación, $50 mensuales
}
```

#### InvoiceUpload
```prisma
model InvoiceUpload {
  commissionsGenerated Int @default(0)  // Comisiones creadas
  commissionsActivated Int @default(0)  // EARNED → ACTIVE
}
```

### 2. Servicio de Procesamiento (invoiceService.ts)

#### Función Principal: `processCSV()`

```typescript
async processCSV({ filePath, uploadedBy, periodStart, periodEnd }) {
  // PASO 1: Parsear CSV
  const invoices = await parseTabDelimitedCSV(filePath);
  
  // PASO 2: Clasificar facturas
  for (const invoice of invoices) {
    const client = await prisma.client.findUnique({
      where: { wispChatClientId: invoice.clientId }
    });
    
    invoice.isReferrer = client && client.referrals.length > 0;
    invoice.isReferral = await prisma.referral.findUnique({
      where: { wispChatClientId: invoice.clientId }
    });
  }
  
  // PASO 3: Actualizar estado de pago de referidores
  await updateReferrersPaymentStatus(invoices);
  
  // PASO 4: Generar y activar comisiones
  const stats = await processCommissions(invoices, uploadId);
  
  return stats;
}
```

#### Actualizar Estado de Pago

```typescript
async updateReferrersPaymentStatus(invoices) {
  const referrerInvoices = invoices.filter(i => i.isReferrer);
  
  for (const invoice of referrerInvoices) {
    const isPaymentCurrent = invoice.estado === 'PAID';
    
    await prisma.client.update({
      where: { wispChatClientId: invoice.clientId },
      data: {
        isPaymentCurrent,
        lastInvoiceStatus: invoice.estado,
        lastInvoiceDate: invoice.fecha
      }
    });
    
    // Si pagó, activar comisiones pendientes
    if (isPaymentCurrent) {
      await activatePendingCommissions(invoice.clientId);
    }
  }
}
```

#### Generar Comisiones con Activación

```typescript
async processCommissions(invoices, uploadId) {
  const referralInvoices = invoices.filter(i => i.isReferral && i.estado === 'PAID');
  
  for (const invoice of referralInvoices) {
    const referral = await prisma.referral.findUnique({
      where: { wispChatClientId: invoice.clientId },
      include: { client: true }
    });
    
    // Verificar si el referidor está al día
    const status = referral.client.isPaymentCurrent ? 'ACTIVE' : 'EARNED';
    const statusReason = status === 'EARNED' 
      ? 'Referidor no está al día con sus pagos'
      : null;
    
    // Crear comisión mensual
    await prisma.commission.create({
      data: {
        clientId: referral.clientId,
        referralId: referral.id,
        type: 'MONTHLY',
        month: calculateMonth(referral.installedAt),
        amount: 50.00,
        status,
        statusReason,
        invoiceUploadId: uploadId
      }
    });
  }
}
```

#### Auto-activación cuando Referidor Paga

```typescript
async activatePendingCommissions(clientId: string) {
  // Obtener todas las comisiones EARNED del cliente
  const earnedCommissions = await prisma.commission.findMany({
    where: {
      clientId,
      status: 'EARNED'
    }
  });
  
  // Convertir todas a ACTIVE
  await prisma.commission.updateMany({
    where: {
      clientId,
      status: 'EARNED'
    },
    data: {
      status: 'ACTIVE',
      statusReason: null
    }
  });
  
  // Actualizar totalActive del cliente
  const totalActive = earnedCommissions.reduce((sum, c) => sum + Number(c.amount), 0);
  await prisma.client.update({
    where: { id: clientId },
    data: {
      totalActive: {
        increment: totalActive
      }
    }
  });
  
  return earnedCommissions.length;
}
```

---

## 🌐 Endpoints de API

### Admin - Upload CSV

**POST** `/api/admin/invoices/upload`

```bash
curl -X POST https://wispchat-referral-backend.onrender.com/api/admin/invoices/upload \
  -F "file=@EAfacturas_041225.txt" \
  -F "uploadedBy=admin" \
  -F "periodStart=2025-12-01" \
  -F "periodEnd=2025-12-07"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "cm4skd...",
    "stats": {
      "totalInvoices": 150,
      "referrerInvoices": 25,
      "referralInvoices": 30,
      "commissionsGenerated": 28,
      "commissionsActivated": 15,
      "errors": []
    }
  }
}
```

### Admin - Ver Uploads

**GET** `/api/admin/invoices/uploads`

```bash
curl https://wispchat-referral-backend.onrender.com/api/admin/invoices/uploads
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploads": [
      {
        "id": "cm4skd...",
        "fileName": "EAfacturas_041225.txt",
        "uploadedBy": "admin",
        "periodStart": "2025-12-01T00:00:00.000Z",
        "periodEnd": "2025-12-07T23:59:59.999Z",
        "processed": true,
        "commissionsGenerated": 28,
        "commissionsActivated": 15,
        "createdAt": "2025-12-04T19:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

### Admin - Comisiones Activas

**GET** `/api/admin/commissions/active`

```bash
curl https://wispchat-referral-backend.onrender.com/api/admin/commissions/active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cm4sl...",
      "type": "MONTHLY",
      "month": 2,
      "amount": "50.00",
      "status": "ACTIVE",
      "statusReason": null,
      "client": {
        "id": "cm4sk...",
        "nombre": "Juan Pérez",
        "email": "juan@example.com",
        "wispChatClientId": "123"
      },
      "referral": {
        "id": "cm4sm...",
        "nombre": "María López",
        "wispChatClientId": "124"
      }
    }
  ]
}
```

### Admin - Aplicar Comisión

**POST** `/api/admin/commissions/:id/apply`

```bash
curl -X POST https://wispchat-referral-backend.onrender.com/api/admin/commissions/cm4sl.../apply \
  -H "Content-Type: application/json" \
  -d '{
    "wispChatInvoiceId": "10245",
    "invoiceMonth": "2025-12",
    "invoiceAmount": 100.00,
    "appliedBy": "admin",
    "amount": 50.00,
    "notas": "Descuento aplicado en factura de diciembre"
  }'
```

---

## 📝 Migration Aplicada

**Archivo:** `20251204195423_add_commission_activation_logic/migration.sql`

**Cambios:**
- ✅ Client: `lastInvoiceStatus`, `lastInvoiceDate`, `isPaymentCurrent`, `totalActive`
- ✅ Referral: `lastInvoiceStatus`, `lastInvoiceDate`
- ✅ Commission: `statusReason`, nuevo estado `ACTIVE`
- ✅ InvoiceUpload: `commissionsActivated`
- ✅ InvoiceRecord: `isReferrer`, `isReferral`

**Aplicación:**
```bash
npx prisma migrate dev --name add_commission_activation_logic
# ✅ Migration applied successfully
```

---

## 🚀 Deployment

### Status Actual

| Componente | Estado | URL |
|------------|--------|-----|
| **Backend** | ✅ Deployed | https://wispchat-referral-backend.onrender.com |
| **Frontend** | ✅ Deployed | https://referidos.wispchat.net |
| **Database** | ✅ Running | Render PostgreSQL |
| **Migration** | ✅ Applied | 20251204195423 |
| **Build** | ✅ Success | 0 errors |

### Verificación

```bash
# Health check
curl https://wispchat-referral-backend.onrender.com/health
# Response: "Easy Access Referral System API"

# Test Settings
curl https://wispchat-referral-backend.onrender.com/api/settings
# Response: Settings con wispChatAdminEmail configurado
```

---

## 📋 Checklist de Pruebas

### ✅ Completado

- [x] Schema con estados EARNED/ACTIVE
- [x] Migration aplicada a producción
- [x] InvoiceService con 3 pasos de procesamiento
- [x] Parseo de CSV tab-delimited
- [x] Clasificación de isReferrer/isReferral
- [x] Actualización de isPaymentCurrent
- [x] Generación de comisiones con activación condicional
- [x] Auto-activación cuando referidor paga
- [x] Endpoints de admin (upload, list, details)
- [x] Build sin errores
- [x] Deploy a Render
- [x] Credenciales WispChat configuradas

### ⏳ Pendiente de Prueba

- [ ] Subir CSV real de Easy Access
- [ ] Verificar clasificación correcta de facturas
- [ ] Confirmar activación automática funciona
- [ ] Probar aplicación manual de comisión
- [ ] Validar cálculo de totalActive
- [ ] Test de reprocesamiento de upload

---

## 🔐 Configuración de Producción

### Variables de Entorno (.env)

```bash
DATABASE_URL="postgresql://wispchat_referral_user:3nb03t6hkagYUGJSXjmsLCVg0OIXZaiD@dpg-d4oglonpm1nc73e6n880-a.virginia-postgres.render.com/wispchat_referral"

WISPCHAT_API_URL="https://wispchat-backend.onrender.com"
WISPCHAT_TENANT_DOMAIN="easyaccessnet.com"

FRONTEND_URL="https://referidos.wispchat.net"

NODE_ENV="production"
PORT=10000
```

### Settings en Base de Datos

```sql
SELECT 
  "wispChatUrl", 
  "wispChatTenantDomain", 
  "wispChatAdminEmail",
  "installationAmount",
  "monthlyAmount",
  "monthsToEarn"
FROM "Settings";

-- Resultado:
-- wispChatUrl: https://wispchat-backend.onrender.com
-- wispChatTenantDomain: easyaccessnet.com
-- wispChatAdminEmail: admin@easyaccessnet.com
-- installationAmount: 500.00
-- monthlyAmount: 50.00
-- monthsToEarn: 6
```

---

## 📊 Métricas y Estadísticas

### Dashboard Admin

**GET** `/api/admin/dashboard`

Retorna:
- Total de clientes activos
- Total de leads (pending, installed)
- Total de comisiones (active, earned, applied)
- Sumas monetarias (totalEarned, totalActive, totalApplied)

### Ejemplo de Uso

```javascript
// Obtener dashboard
const response = await fetch('https://wispchat-referral-backend.onrender.com/api/admin/dashboard');
const { data } = await response.json();

console.log(data);
// {
//   clients: { total: 50 },
//   leads: { total: 120, pending: 30, installed: 90 },
//   commissions: {
//     active: 150,
//     earned: 45,
//     totalEarned: 4750.00,
//     totalActive: 7500.00,
//     totalApplied: 12000.00
//   }
// }
```

---

## 🎓 Próximos Pasos

1. **Prueba con CSV Real:**
   - Subir archivo `EAfacturas 041225.txt`
   - Verificar que clasifica correctamente
   - Confirmar activación automática

2. **Integración Frontend:**
   - Panel de admin para subir CSV
   - Vista de comisiones activas
   - Aplicación manual de comisiones

3. **Endpoint en WispChat:**
   - `POST /api/v1/referrals/register`
   - Botón "Promociona y Gana"
   - Registro automático de clientes

4. **Notificaciones:**
   - Email cuando comisión se activa
   - Email cuando se aplica descuento
   - Resumen mensual de comisiones

---

## 📞 Soporte

**Sistema:** Easy Access Referral System  
**Backend:** https://wispchat-referral-backend.onrender.com  
**Repositorio:** https://github.com/networkerpro20-oss/wispchat-referral-system

**Documentación adicional:**
- [ESTADO_PROYECTO_2DIC2025.md](./ESTADO_PROYECTO_2DIC2025.md)
- [EXPLICACION_SISTEMA_CHAT_COMPLETO.md](./EXPLICACION_SISTEMA_CHAT_COMPLETO.md)

---

**Última actualización:** 4 de diciembre de 2025  
**Build:** ✅ 0 errores  
**Deployment:** ✅ Render  
**Database:** ✅ PostgreSQL con migration aplicada
