# 🚀 Configuración de Render para Sistema de Referidos

## ✅ Base de Datos PostgreSQL (Ya Creada)

```
External URL: postgresql://wispchat_referral_user:3nb03t6hkagYUGJSXjmsLCVg0OIXZaiD@dpg-d4oglonpm1nc73e6n880-a.virginia-postgres.render.com/wispchat_referral
Internal URL: postgresql://wispchat_referral_user:3nb03t6hkagYUGJSXjmsLCVg0OIXZaiD@dpg-d4oglonpm1nc73e6n880-a/wispchat_referral
```

**Estado:** ✅ Migración aplicada, tablas creadas, settings inicializados

---

## 📋 Configurar Variables de Entorno en Render

Ve al panel de Render > Backend Service > Environment Variables y agrega:

### 1. Base de Datos
```
DATABASE_URL=postgresql://wispchat_referral_user:3nb03t6hkagYUGJSXjmsLCVg0OIXZaiD@dpg-d4oglonpm1nc73e6n880-a/wispchat_referral?schema=public
```
**Nota:** Usa la Internal URL para mejor rendimiento (mismo datacenter)

### 2. Servidor
```
PORT=4000
NODE_ENV=production
```

### 3. Integración WispHub
```
WISPHUB_API_URL=https://wispchat-backend.onrender.com
WISPCHAT_JWT_SECRET=wispchat-secret-key-2024-ultra-secure
```

### 4. Storage
```
UPLOAD_DIR=/opt/render/project/src/uploads
```

### 5. Frontend
```
FRONTEND_URL=https://referidos.wispchat.net
```

### 6. CORS
```
ALLOWED_ORIGINS=https://referidos.wispchat.net,https://wispchat.net
```

---

## 🔧 Build & Deploy Settings

### Build Command:
```bash
npm install && npx prisma generate && npm run build
```

### Start Command:
```bash
npm start
```

### Health Check Path:
```
/health
```

---

## 🌱 Inicialización (Primera vez)

### 1. Aplicar migración (YA HECHO ✅)
```bash
DATABASE_URL="..." npx prisma migrate deploy
```

### 2. Seed inicial (YA HECHO ✅)
```bash
DATABASE_URL="..." npm run seed
```

### 3. Sincronizar clientes desde WispHub
```bash
DATABASE_URL="..." npm run sync:clients
```

**Resultado esperado:**
- Importará todos los clientes activos de easyaccessnet.com
- Generará códigos únicos de referido para cada cliente
- Ejemplo: Cliente #12345 → Código EASY-54321

---

## 🔄 Proceso de Despliegue

1. **Push a GitHub** → Trigger automático en Render
2. **Render detecta cambios** → Inicia build
3. **Build Process:**
   - `npm install`
   - `npx prisma generate` (genera cliente Prisma)
   - `npm run build` (compila TypeScript)
4. **Start Process:**
   - `npm start` (ejecuta `dist/server.js`)
5. **Health Check:**
   - Render verifica `/health` cada 30 segundos
   - Si responde 200, marca como "healthy"

---

## 🧪 Verificar Deployment

### 1. Health Check
```bash
curl https://wispchat-referral-backend.onrender.com/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Easy Access Referral System API",
  "timestamp": "2025-12-04T18:10:00.000Z"
}
```

### 2. Probar Registro de Lead
```bash
curl -X POST https://wispchat-referral-backend.onrender.com/api/leads/register \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "EASY-12345",
    "nombre": "Juan Pérez",
    "telefono": "5551234567",
    "email": "juan@example.com",
    "direccion": "Calle Principal 123",
    "colonia": "Centro",
    "ciudad": "Ciudad de México",
    "codigoPostal": "01000",
    "tipoServicio": "fibra",
    "velocidad": "100M"
  }'
```

### 3. Obtener Info de Cliente
```bash
curl https://wispchat-referral-backend.onrender.com/api/clients/WISPHUB_123/summary
```

### 4. Dashboard Admin
```bash
curl https://wispchat-referral-backend.onrender.com/api/admin/dashboard
```

---

## 📊 Estructura de Base de Datos

### Tablas creadas:
- ✅ `Client` - Clientes referidores (sincronizados desde WispHub)
- ✅ `Referral` - Leads captados por formulario
- ✅ `Commission` - Comisiones generadas (instalación + mensuales)
- ✅ `CommissionApplication` - Registro de descuentos aplicados
- ✅ `Settings` - Configuración global del sistema

### Datos iniciales:
- ✅ Settings: $500 instalación, $50 mensual, 6 meses
- ⏳ Clientes: Pendiente ejecutar `npm run sync:clients`

---

## 🔐 Seguridad

### Conexión a BD:
- ✅ SSL/TLS habilitado por defecto en Render
- ✅ Credenciales seguras generadas automáticamente
- ✅ Internal URL para mejor rendimiento y seguridad

### APIs Públicas:
- `/api/leads/register` - Sin autenticación (necesario para formulario)
- Todas las demás rutas deberían tener autenticación (TODO)

### CORS:
- Configurado para: `referidos.wispchat.net` y `wispchat.net`

---

## 🛠️ Troubleshooting

### Error: "Cannot connect to database"
- Verificar que DATABASE_URL esté configurada en Render
- Usar Internal URL si el servicio está en Render
- Verificar que la BD esté en el mismo región

### Error: "Prisma Client not generated"
- Agregar `npx prisma generate` al Build Command
- Verificar que @prisma/client esté en dependencies (no devDependencies)

### Error: "Port already in use"
- No especificar puerto fijo, usar `process.env.PORT`
- Render asigna puerto dinámicamente

### Logs en vivo:
```
Render Dashboard > Service > Logs
```

---

## 📈 Próximos Pasos

1. **Sincronizar clientes** ejecutando `sync:clients` en shell de Render
2. **Configurar Cron Jobs** para:
   - Verificar nuevas instalaciones (diario)
   - Generar comisiones mensuales (día 1 de cada mes)
3. **Implementar autenticación** en rutas de admin
4. **Frontend:** Dashboards de cliente y admin
5. **Notificaciones:** Email cuando se registra un lead

---

## 🔗 URLs Importantes

- **Backend API:** https://wispchat-referral-backend.onrender.com
- **Frontend:** https://referidos.wispchat.net
- **WispHub API:** https://wispchat-backend.onrender.com
- **GitHub Repo:** https://github.com/networkerpro20-oss/wispchat-referral-system
