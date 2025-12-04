# Troubleshooting Render Deployment

## ❌ Error TS2688: Cannot find type definition file for 'node'

### Síntoma
```
error TS2688: Cannot find type definition file for 'node'.
  The file is in the program because:
    Entry point of type library 'node' specified in compilerOptions
==> Build failed 😞
```

### Causa Raíz
Render usa **buildCache** que puede causar conflictos con `@types/node` cuando:
1. La versión de Node.js cambia
2. Las dependencias se actualizan
3. TypeScript se actualiza a una versión mayor

### Solución Permanente ✅

**render.yaml:**
```yaml
services:
  - type: web
    name: wispchat-referral-backend
    buildCache: false  # ← Desactivar caché
    buildCommand: npm ci && npm install --save-dev @types/node@22 && npx prisma generate && npm run build
```

**Cambios clave:**
1. `buildCache: false` - Evita caché corrupta
2. `npm ci` en lugar de `npm install` - Instalación limpia desde package-lock.json
3. `npm install --save-dev @types/node@22` - Forzar instalación de tipos

### Solución Rápida (Render Dashboard)

Si el error ocurre en producción:

1. **Ir a Render Dashboard** → Tu servicio
2. **Manual Deploy** → Seleccionar "Clear build cache & deploy"
3. Esto forzará reinstalación limpia

### Verificar package.json

Asegurar que `@types/node` esté en `devDependencies`:

```json
{
  "devDependencies": {
    "@types/node": "^22.19.1",
    "typescript": "^5.7.2"
  }
}
```

### Verificación Post-Deploy

```bash
# Health check
curl https://wispchat-referral-backend.onrender.com/health

# Respuesta esperada:
# {"success":true,"message":"Easy Access Referral System API","timestamp":"..."}
```

---

## 🔄 Build Process en Render

### Secuencia Correcta

```bash
# 1. Limpiar e instalar deps
npm ci

# 2. Instalar tipos de Node explícitamente
npm install --save-dev @types/node@22

# 3. Generar Prisma Client
npx prisma generate

# 4. Compilar TypeScript
npm run build

# 5. Iniciar servidor
npm start
```

### Variables de Entorno Necesarias

```
DATABASE_URL - PostgreSQL connection string (desde Render DB)
NODE_ENV - production
PORT - 10000
WISPCHAT_API_URL - https://wispchat-backend.onrender.com
FRONTEND_URL - https://referidos.wispchat.net
```

---

## 📊 Logs Útiles

### Ver logs en tiempo real

**Opción 1: Render Dashboard**
- Settings → Logs
- Filtrar por "Error" o "Build"

**Opción 2: Render CLI**
```bash
render logs --service wispchat-referral-backend --tail
```

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `TS2688: Cannot find type definition file` | buildCache corrupta | `buildCache: false` |
| `P1001: Can't reach database` | DATABASE_URL incorrecta | Verificar env var |
| `Module not found: @prisma/client` | Falta `prisma generate` | Agregar a buildCommand |
| `ENOENT: no such file or directory, open 'dist/index.js'` | Build falló | Verificar `npm run build` |
| `Port already in use` | Puerto incorrecto | Usar PORT=10000 |

---

## 🚀 Optimizaciones

### Después de Deploy Estable

Una vez que el sistema funcione sin errores por 1+ semanas:

```yaml
# render.yaml
buildCache: true  # Reactivar para builds más rápidos
buildCommand: npm install && npx prisma generate && npm run build
```

**Ventajas de buildCache: true**
- Builds 2-3x más rápidos
- Menos uso de recursos
- Deploys más ágiles

**Desventajas**
- Puede causar problemas con actualizaciones mayores
- Requiere clear cache manual en caso de errores

### Recomendación Actual

**Mantener `buildCache: false`** hasta que:
1. Sistema esté en producción estable (3+ meses)
2. No haya cambios frecuentes en dependencias
3. TypeScript/Node estén en versiones LTS

---

## 📝 Checklist de Deploy

Antes de hacer push:

- [ ] `npm run build` compila sin errores localmente
- [ ] `npx prisma generate` funciona
- [ ] `.env` tiene DATABASE_URL de Render
- [ ] Migration aplicada: `npx prisma migrate deploy`
- [ ] Commit incluye todos los archivos necesarios
- [ ] render.yaml tiene `buildCache: false`

Después de push:

- [ ] Render detecta cambios automáticamente
- [ ] Build log no muestra errores TS2688
- [ ] Health check responde: `curl /health`
- [ ] Endpoints principales funcionan
- [ ] Database conectada correctamente

---

## 🆘 Soporte

**Si el error persiste:**

1. Verificar versión de Node.js en Render (debe ser 22.x)
2. Limpiar caché manualmente en Render Dashboard
3. Revisar package-lock.json en el repo
4. Considerar downgrade de TypeScript si es necesario

**Render Status:** https://status.render.com/  
**Documentación:** https://render.com/docs/troubleshooting-deploys

---

**Última actualización:** 4 de diciembre de 2025  
**Estado actual:** ✅ Deploy funcionando con buildCache: false
