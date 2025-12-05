# Configurar JWT_SECRET en Render

## Problema Detectado

El sistema de referidos necesita el **mismo JWT_SECRET** que usa WispChat para poder validar los tokens.

## Variables de Entorno Requeridas en Render

Ve a: https://dashboard.render.com → `wispchat-referral-backend` → **Environment**

### 1. WISPCHAT_JWT_SECRET ⚠️ **CRÍTICO**

```bash
WISPCHAT_JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Este debe ser EXACTAMENTE el mismo que usa WispChat en producción.**

### 2. Otras variables importantes

```bash
DATABASE_URL=postgresql://...  # Ya está configurada
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://referidos.wispchat.net
ALLOWED_ORIGINS=https://referidos.wispchat.net,https://wispchat.net
```

## Cómo Verificar

Una vez configurado, puedes probar con:

```bash
# 1. Obtener token de WispChat
curl -X POST https://wispchat-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: wispchat.net" \
  -d '{"email":"ventas@easyaccessnet.com","password":"Proyecto2025$"}' \
  | jq -r '.data.token'

# 2. Usar ese token en sistema de referidos
curl https://wispchat-referral-backend.onrender.com/api/admin/dashboard \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

## Siguiente Paso

Después de configurar las variables de entorno:
1. Render hará auto-redeploy
2. El backend compilará exitosamente (ya lo hace)
3. Ahora el JWT será válido y podrás acceder al admin

## Nota sobre el Usuario

El usuario `ventas@easyaccessnet.com` **no necesita existir en la base de datos de referidos**.

El sistema:
1. ✅ Valida el JWT de WispChat
2. ✅ Extrae el `rol` del token
3. ✅ Si `rol === 'admin'`, permite acceso
4. ❌ **NO busca el usuario en la BD de referidos**

Por lo tanto, mientras el token de WispChat sea válido y tenga `rol: 'admin'`, funcionará.
