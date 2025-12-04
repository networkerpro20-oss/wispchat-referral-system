# 🚀 GUÍA DE DEPLOYMENT - WispChat Referral System

## Paso 1: Crear Repositorio en GitHub

```bash
# En tu máquina local
cd /home/easyaccess/projects/wispchat-referral-system

# Crear repositorio en GitHub: wispchat-referral-system
# Luego conectar:
git remote add origin https://github.com/YOUR_USERNAME/wispchat-referral-system.git
git branch -M main
git push -u origin main
```

## Paso 2: Deploy Backend en Render

### 2.1 Crear PostgreSQL Database

1. Ir a https://render.com
2. Click "New" → "PostgreSQL"
3. Configuración:
   - Name: `wispchat-referral-db`
   - Database: `wispchat_referral`
   - User: `wispchat_referral_user`
   - Region: Oregon (US West)
   - Plan: Free
4. Click "Create Database"
5. **Guardar la "Internal Database URL"** (la necesitarás)

### 2.2 Deploy Backend Web Service

1. Click "New" → "Web Service"
2. Conectar tu repositorio de GitHub
3. Configuración:
   - Name: `wispchat-referral-backend`
   - Region: Oregon (US West)
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Plan: Free

4. **Variables de Entorno** (Environment Variables):

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<PEGAR_INTERNAL_DATABASE_URL>
WISPCHAT_API_URL=https://wispchat-backend.onrender.com
WISPCHAT_JWT_SECRET=wispchat-secret-key-2024-ultra-secure
FRONTEND_URL=https://referidos.wispchat.net
ALLOWED_ORIGINS=https://referidos.wispchat.net,https://wispchat.app
UPLOAD_DIR=/opt/render/project/src/uploads
```

5. Click "Create Web Service"

### 2.3 Aplicar Migraciones

Una vez que el servicio esté deployed:

1. Ir a "Shell" en el dashboard de Render
2. Ejecutar:
```bash
npx prisma migrate deploy
```

3. Crear tenant inicial:
```bash
npx prisma db execute --file prisma/seed.sql
```

### 2.4 Verificar Health Check

Visitar: `https://wispchat-referral-backend.onrender.com/health`

Deberías ver:
```json
{
  "success": true,
  "message": "WispChat Referral System API",
  "timestamp": "2025-12-03T..."
}
```

## Paso 3: Deploy Frontend en Vercel

### 3.1 Conectar Repositorio

1. Ir a https://vercel.com
2. Click "Add New Project"
3. Import tu repositorio de GitHub
4. Configuración:
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detectado)
   - Output Directory: `.next` (auto-detectado)

### 3.2 Variables de Entorno

Agregar en "Environment Variables":

```
NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com
```

### 3.3 Deploy

1. Click "Deploy"
2. Esperar a que termine el build (~2-3 minutos)
3. Obtener URL: `https://referidos.wispchat.net`

### 3.4 Configurar Dominio Custom (Opcional)

1. En Vercel, ir a "Settings" → "Domains"
2. Agregar: `referidos.wispchat.app`
3. Configurar DNS en tu proveedor:
   - Type: `CNAME`
   - Name: `referidos`
   - Value: `cname.vercel-dns.com`

## Paso 4: Testing en Producción

### 4.1 Test Backend API

```bash
# Health check
curl https://wispchat-referral-backend.onrender.com/health

# Obtener configuración (requiere token)
curl -H "Authorization: Bearer <TOKEN>" \
  https://wispchat-referral-backend.onrender.com/api/v1/referrals/settings/config
```

### 4.2 Test Frontend

1. Visitar: `https://referidos.wispchat.net`
2. Verificar que carga correctamente
3. Click "Ingresar" → debería ir a `/dashboard`
4. Generar enlace de referido
5. Compartir y probar registro público

### 4.3 Test Flujo Completo

1. **Cliente genera enlace:**
   - Login en WispChat → Dashboard Referidos
   - Click "Generar Enlace Único"
   - Copiar URL: `https://referidos.wispchat.net/register/abc123`

2. **Referido se registra:**
   - Abrir el enlace
   - Llenar formulario
   - Subir INE + Comprobante
   - Verificar documentos subidos

3. **Admin revisa (temporal - con Postman):**
   ```bash
   # Obtener todos los referidos
   curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
     https://wispchat-referral-backend.onrender.com/api/v1/referrals
   
   # Aprobar referido
   curl -X PUT \
     -H "Authorization: Bearer <ADMIN_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"status": "APPROVED"}' \
     https://wispchat-referral-backend.onrender.com/api/v1/referrals/{id}/status
   ```

4. **Completar instalación:**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <ADMIN_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "installedBy": "Juan Perez",
       "clientId": "cliente_123",
       "installerNotes": "Instalación exitosa"
     }' \
     https://wispchat-referral-backend.onrender.com/api/v1/installations/{referralId}/complete
   ```

5. **Verificar comisión generada:**
   ```bash
   curl -H "Authorization: Bearer <CLIENTE_TOKEN>" \
     https://wispchat-referral-backend.onrender.com/api/v1/commissions/my-commissions
   ```

## Paso 5: Integración con WispChat Principal

### 5.1 Agregar Botón en Frontend

Editar `WispChatV1/frontend/components/chat/ChatSidebar.tsx`:

```tsx
import { Gift } from 'lucide-react';

// Dentro del sidebar, agregar:
<Link
  href="https://referidos.wispchat.app/dashboard"
  target="_blank"
  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition"
>
  <Gift className="w-5 h-5 text-purple-600" />
  <span className="text-gray-700 font-medium">Programa Referidos</span>
</Link>
```

### 5.2 Configurar Webhook en Backend

Editar `WispChatV1/backend/src/services/paymentService.ts`:

```typescript
// Después de confirmar el pago exitosamente:
async function notifyReferralSystem(payment: any) {
  try {
    await axios.post(
      'https://wispchat-referral-backend.onrender.com/api/v1/webhooks/payment-received',
      {
        tenantId: 'wispchat',
        clientId: payment.clientId,
        wispHubClientId: payment.wispHubClientId,
        amount: payment.amount,
        paymentDate: payment.createdAt,
        invoiceId: payment.invoiceId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Referral system notified of payment');
  } catch (error) {
    console.error('❌ Error notifying referral system:', error);
    // No lanzar error, solo log
  }
}

// Llamar después de payment.status = 'COMPLETED'
await notifyReferralSystem(payment);
```

## Paso 6: Monitoreo y Mantenimiento

### 6.1 Logs de Render

- Ir a Dashboard → wispchat-referral-backend → "Logs"
- Monitorear errores y requests

### 6.2 Logs de Vercel

- Ir a Dashboard → referidos-wispchat → "Deployments" → "View Function Logs"

### 6.3 Métricas Clave

- Referidos creados por día
- Comisiones generadas
- Tasa de conversión (registro → instalación)
- Uploads de documentos exitosos

## Troubleshooting

### Error: Cannot connect to database

```bash
# Verificar DATABASE_URL en Render
# Debe ser la "Internal Database URL" de PostgreSQL
```

### Error: CORS blocked

```bash
# Verificar ALLOWED_ORIGINS en backend
# Debe incluir la URL exacta de Vercel
```

### Error: Token invalid

```bash
# Verificar que WISPCHAT_JWT_SECRET sea igual en:
# - WispChat backend
# - Referral backend
```

### Frontend no carga datos

```bash
# Verificar NEXT_PUBLIC_API_URL en Vercel
# Debe ser: https://wispchat-referral-backend.onrender.com
```

## URLs de Producción

- **Frontend:** https://referidos.wispchat.net
- **Backend API:** https://wispchat-referral-backend.onrender.com
- **Health Check:** https://wispchat-referral-backend.onrender.com/health

## Variables de Entorno - Resumen

### Backend (Render)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<from-render-postgresql>
WISPCHAT_API_URL=https://wispchat-backend.onrender.com
WISPCHAT_JWT_SECRET=wispchat-secret-key-2024-ultra-secure
FRONTEND_URL=https://referidos.wispchat.net
ALLOWED_ORIGINS=https://referidos.wispchat.net,https://wispchat.app
UPLOAD_DIR=/opt/render/project/src/uploads
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com
```

---

## ✅ Checklist de Deployment

- [ ] Crear repo en GitHub y push del código
- [ ] Crear PostgreSQL en Render
- [ ] Deploy backend en Render
- [ ] Aplicar migraciones de Prisma
- [ ] Ejecutar seed.sql para tenant inicial
- [ ] Verificar health check del backend
- [ ] Deploy frontend en Vercel
- [ ] Configurar variables de entorno
- [ ] Test flujo completo end-to-end
- [ ] Agregar botón en WispChat frontend
- [ ] Configurar webhook en WispChat backend
- [ ] Documentar URLs de producción
- [ ] Setup monitoreo de logs

---

**Última actualización:** 3 de Diciembre, 2025  
**Tiempo estimado de deployment:** 30-45 minutos
