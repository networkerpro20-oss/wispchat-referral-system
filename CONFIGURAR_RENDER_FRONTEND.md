# Configurar Variables de Entorno en Render - Frontend

## Problema Detectado

El frontend está intentando llamar a:
```
https://wispchat-referral-backend.onrender.com/api/api/admin/dashboard
```

Cuando debería llamar a:
```
https://wispchat-referral-backend.onrender.com/api/admin/dashboard
```

## Solución

Ve a: **https://dashboard.render.com** → `wispchat-referral-frontend` → **Environment**

### Variable de Entorno Requerida:

```
NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com
```

**IMPORTANTE:** NO incluyas `/api` al final.

## Verificación

Después de configurar y que Render haga redeploy, prueba:

1. Login en WispChat: https://wispchat.net
2. Clic en "Programa de Referidos"
3. Deberías ver: ✅ "Autenticación exitosa. Redirigiendo..."

## Archivo Local

También actualiza `frontend/.env.production` localmente:
```bash
NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com
```

(Este archivo no se sube a git por seguridad, pero necesitas configurarlo en Render)
