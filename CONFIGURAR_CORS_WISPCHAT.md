# Configurar CORS para wispchat.net en Backend de Referidos

**Fecha:** 5 de diciembre de 2025  
**Backend:** wispchat-referral-backend.onrender.com  
**Problema:** wispchat.net necesita acceso al dashboard de referidos

## 🎯 Objetivo

Permitir que el frontend de WispChat (`wispchat.net`) pueda acceder al backend del sistema de referidos para que los clientes vean su dashboard.

## 🔧 Configuración en Render

### Paso 1: Entrar a Render Dashboard

1. Ve a https://dashboard.render.com
2. Login con tu cuenta
3. Selecciona el servicio: **wispchat-referral-backend**

### Paso 2: Agregar Variable de Entorno

1. En el menú lateral, clic en **Environment**
2. Buscar la variable `ALLOWED_ORIGINS` (si existe) o crear nueva
3. Configurar el valor:

```
ALLOWED_ORIGINS=https://referidos.wispchat.net,https://wispchat.net,http://localhost:3001
```

**Importante:** 
- URLs separadas por **comas** (sin espacios)
- Incluir `https://` en cada URL
- NO poner `/` al final

### Paso 3: Guardar y Redesplegar

1. Clic en **Save Changes**
2. Render automáticamente redesplegarán el servicio (~5-10 min)
3. Verificar en los logs que inició correctamente

## 📋 URLs que Deben Estar Permitidas

| URL | Propósito |
|-----|-----------|
| `https://referidos.wispchat.net` | Frontend del sistema de referidos |
| `https://wispchat.net` | Frontend de WispChat (dashboard cliente) |
| `http://localhost:3001` | Desarrollo local |

## ✅ Verificar Configuración

### Test 1: Desde Consola del Navegador

Abre `https://wispchat.net`, abre consola (F12) y ejecuta:

```javascript
fetch('https://wispchat-referral-backend.onrender.com/health')
  .then(r => r.json())
  .then(data => console.log('✅ CORS OK:', data))
  .catch(e => console.error('❌ CORS ERROR:', e));
```

**Resultado esperado:** 
```json
{
  "success": true,
  "message": "Easy Access Referral System API",
  "timestamp": "2025-12-05T..."
}
```

### Test 2: Dashboard de Cliente

1. Login en WispChat como cliente
2. Clic en "💰 Promociona y Gana"
3. La página `/cliente/auth` debe cargar sin errores CORS
4. Debe redirigir al dashboard con el código de referido

## 🐛 Troubleshooting

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa:** La URL no está en `ALLOWED_ORIGINS`

**Solución:** 
1. Verificar que agregaste `https://wispchat.net` (con https)
2. Sin espacios entre las URLs
3. Esperar que termine el redespliegue de Render

### Error: "Failed to fetch"

**Causa:** Backend no está corriendo o URL incorrecta

**Solución:**
1. Ir a https://wispchat-referral-backend.onrender.com/health
2. Debe responder con JSON
3. Si no responde, revisar logs en Render

### Error: Conexión rechazada

**Causa:** Servicio de Render apagado (free tier)

**Solución:**
1. Render free tier se apaga después de inactividad
2. Primera request toma ~2-3 minutos en iniciar
3. Ser paciente en primera carga

## 📝 Código Backend (Referencia)

El backend usa esta configuración automáticamente:

```typescript
// src/config/index.ts
allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',')

// src/app.ts
app.use(cors({
  origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : '*',
  credentials: true,
}));
```

## 🔐 Seguridad

### ¿Por qué NO usar '*' (permitir todos)?

- Seguridad: Solo dominios confiables deben acceder
- Credenciales: `credentials: true` requiere orígenes específicos
- Control: Sabemos exactamente quién accede al API

### Dominios Permitidos en Producción

**Solo estos dominios:**
- ✅ `https://referidos.wispchat.net` - Frontend de referidos
- ✅ `https://wispchat.net` - Frontend de WispChat
- ❌ Otros dominios - Bloqueados

## 📊 Resumen de Cambios

### ANTES
```
ALLOWED_ORIGINS=https://referidos.wispchat.net
```

Cliente de wispchat.net → ❌ CORS error al acceder dashboard

### DESPUÉS
```
ALLOWED_ORIGINS=https://referidos.wispchat.net,https://wispchat.net,http://localhost:3001
```

Cliente de wispchat.net → ✅ Acceso correcto al dashboard

## 🚀 Checklist Post-Configuración

- [ ] Variable `ALLOWED_ORIGINS` configurada en Render
- [ ] Servicio redespleado exitosamente
- [ ] Test desde consola del navegador pasa
- [ ] Login en WispChat funciona
- [ ] Botón "Promociona y Gana" funciona
- [ ] Dashboard de cliente se carga correctamente
- [ ] No hay errores CORS en consola

---

**Configuración crítica para:** Cliente pueda acceder a su dashboard de referidos  
**Tiempo estimado:** 15 minutos (incluyendo redespliegue)  
**Prioridad:** Alta ⚠️
