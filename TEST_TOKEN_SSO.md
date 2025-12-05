# Test Token SSO - Cliente

## 🔍 Problema Identificado

El botón de cliente pasa el token pero necesitamos verificar:
1. ¿El token llega a la página?
2. ¿La API_URL está correcta?
3. ¿El backend responde correctamente?

## 📝 Pasos para Probar en Producción

### 1. Obtener un Token Real

Desde WispChat en producción:
```javascript
// En consola del navegador de WispChat
localStorage.getItem('accessToken')
```

### 2. Probar el Endpoint Manualmente

```bash
# Reemplaza TOKEN_AQUI con el token real
TOKEN="TOKEN_AQUI"

# Test 1: Check si está registrado
curl -X GET "https://wispchat-backend.onrender.com/api/v1/referrals/check" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Test 2: Registrar (si no está registrado)
curl -X POST "https://wispchat-backend.onrender.com/api/v1/referrals/register" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Probar la Página con Token

Abre en navegador:
```
https://referidos.wispchat.net/cliente/auth?token=TOKEN_AQUI
```

**Ahora verás el panel de debug que muestra:**
- ✅ Si el token llegó
- ✅ Qué API_URL está usando
- ✅ Respuestas del servidor
- ❌ Errores específicos

## 🔧 Variable de Entorno CRÍTICA

**Problema anterior con admin:**
```
❌ INCORRECTO: NEXT_PUBLIC_API_URL=https://wispchat-backend.onrender.com/api/v1
✅ CORRECTO: NEXT_PUBLIC_API_URL=https://wispchat-backend.onrender.com/api/v1
```

Wait... ambas son iguales. El problema era que DUPLICABA el `/api/v1`.

**La configuración correcta es:**
```bash
NEXT_PUBLIC_API_URL=https://wispchat-backend.onrender.com/api/v1
```

Y en el código:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-backend.onrender.com/api/v1';
const checkUrl = `${API_URL}/referrals/check`;
// Resultado: https://wispchat-backend.onrender.com/api/v1/referrals/check ✅
```

## 🎯 Checklist de Verificación

- [ ] Panel de debug visible en https://referidos.wispchat.net/cliente/auth
- [ ] Logs muestran token recibido
- [ ] Logs muestran API_URL correcta
- [ ] Backend responde (no 404)
- [ ] Si error, ver mensaje específico en panel

## 📊 Comparación Admin vs Cliente

| Aspecto | Admin | Cliente |
|---------|-------|---------|
| URL auth | `/admin/auth` | `/cliente/auth` |
| Endpoint check | `/api/admin/dashboard` | `/referrals/check` |
| API_URL | Misma | Misma |
| Auto-registro | No | Sí |

## 🚀 Próximos Pasos

1. **Deploy completado** - Panel de debug ya está en producción
2. **Probar con token real** - Desde WispChat hacer clic en botón
3. **Ver panel de debug** - Leer qué está fallando
4. **Ajustar según error** - El panel dirá exactamente qué corregir

---

**Fecha:** 5 dic 2025  
**Deploy:** Automático (~2-3 min)  
**Debug panel:** ✅ Implementado
