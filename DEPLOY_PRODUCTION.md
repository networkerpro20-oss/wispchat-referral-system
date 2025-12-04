# 🚀 Guía de Deploy a Producción - Vercel

## ⚡ Deploy Rápido (Método Recomendado)

### Opción 1: Deploy desde GitHub (Automático)

**Paso a paso:**

1. **Ir a Vercel:**
   ```
   https://vercel.com/new
   ```

2. **Import Git Repository:**
   - Click "Add New..." → "Project"
   - Seleccionar: `networkerpro20-oss/wispchat-referral-system`
   - Click "Import"

3. **Configurar Proyecto:**
   ```
   Project Name:           wispchat-referral-frontend
   Framework Preset:       Next.js
   Root Directory:         frontend
   Build Command:          npm run build
   Output Directory:       .next (default)
   Install Command:        npm install
   ```

4. **Environment Variables (IMPORTANTE):**
   ```
   NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com/api
   ```

5. **Click "Deploy"**
   - Esperar 2-3 minutos
   - Vercel automáticamente:
     - Detecta Next.js
     - Instala dependencias
     - Ejecuta build
     - Despliega a CDN global

6. **URL de Producción:**
   ```
   https://wispchat-referral-frontend.vercel.app
   ```
   O tu dominio personalizado

---

## 📋 Checklist Pre-Deploy

- [x] ✅ Build local exitoso (npm run build)
- [x] ✅ Todas las páginas generan correctamente (8/8)
- [x] ✅ Suspense boundary implementado
- [x] ✅ Variables de entorno configuradas (.env.production)
- [x] ✅ Git actualizado y pusheado (commit e35375e)
- [x] ✅ Backend funcionando en Render

---

## 🔧 Configuración Detallada

### Environment Variables en Vercel:

**Production:**
```bash
NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com/api
```

**Preview (opcional):**
```bash
NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com/api
```

### Build Settings:

```yaml
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

### Root Directory:
```
frontend/
```
**IMPORTANTE:** Asegúrate de especificar `frontend` como Root Directory

---

## 🌐 URLs Post-Deploy

Una vez desplegado, tendrás:

**Frontend (Vercel):**
- Production: https://[tu-proyecto].vercel.app
- Admin: https://[tu-proyecto].vercel.app/admin
- Dashboard: https://[tu-proyecto].vercel.app/dashboard?id=WISPHUB_XX
- Landing: https://[tu-proyecto].vercel.app/easyaccess/EASY-XXXXX

**Backend (Render - ya desplegado):**
- API: https://wispchat-referral-backend.onrender.com
- Health: https://wispchat-referral-backend.onrender.com/health

---

## ✅ Verificación Post-Deploy

### 1. Verificar Build
```bash
# En Vercel Dashboard → Deployments → Ver logs
# Debe mostrar: "Build completed successfully"
```

### 2. Test Homepage
```bash
curl -I https://[tu-proyecto].vercel.app
# Debe retornar: 200 OK
```

### 3. Test API Connection
```bash
# Abrir en navegador:
https://[tu-proyecto].vercel.app/dashboard?id=WISPHUB_01

# Abrir DevTools (F12) → Network tab
# Verificar que llama a:
# https://wispchat-referral-backend.onrender.com/api/clients/WISPHUB_01/summary
```

### 4. Test Landing Page
```bash
# Abrir en navegador:
https://[tu-proyecto].vercel.app/easyaccess/EASY-00001

# Verificar:
# - Página carga completamente
# - Formulario funciona
# - Botones de contacto funcionan
```

---

## 🐛 Troubleshooting

### Error: "Module not found"
**Causa:** Dependencies no instaladas correctamente
**Solución:** 
```bash
# En Vercel Dashboard:
# Deployments → [tu deploy] → Redeploy
```

### Error: "Environment variable not defined"
**Causa:** NEXT_PUBLIC_API_URL no configurada
**Solución:**
```bash
# Vercel Dashboard → Settings → Environment Variables
# Agregar: NEXT_PUBLIC_API_URL
# Redeploy
```

### Error: "Failed to compile"
**Causa:** Error en el código
**Solución:**
```bash
# Verificar localmente:
cd frontend
npm run build

# Si falla, revisar errores y corregir
```

### Error: "Root Directory not found"
**Causa:** Root Directory mal configurado
**Solución:**
```bash
# Vercel Dashboard → Settings → General
# Root Directory: frontend
# Save
```

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas push a `main`:
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

**Vercel automáticamente:**
1. Detecta el push
2. Inicia nuevo build
3. Despliega nueva versión
4. Actualiza URL de producción

**NO necesitas hacer nada más!** ✨

---

## 📊 Monitoring

### Vercel Dashboard:
- **Analytics:** Ver tráfico, requests, performance
- **Logs:** Ver logs de función y errores
- **Deployments:** Historial de deploys
- **Settings:** Configuración y env vars

### Render Dashboard (Backend):
- **Metrics:** CPU, memoria, requests
- **Logs:** Ver logs de API
- **Events:** Historial de deploys

---

## 🎯 Testing en Producción

Una vez desplegado, probar:

### 1. Admin Panel
```
https://[tu-proyecto].vercel.app/admin/invoices
```
- Upload CSV
- Ver historial
- Verificar procesamiento

### 2. Dashboard Cliente
```
https://[tu-proyecto].vercel.app/dashboard?id=WISPHUB_01
```
- Ver código de referido
- Generar QR
- Compartir enlaces

### 3. Landing Page
```
https://[tu-proyecto].vercel.app/easyaccess/EASY-00001
```
- Completar formulario 4 pasos
- Verificar registro
- Probar botones de contacto

### 4. API Backend
```bash
# Health check
curl https://wispchat-referral-backend.onrender.com/health

# Client data
curl https://wispchat-referral-backend.onrender.com/api/clients/WISPHUB_01/summary
```

---

## 🎬 Deploy Inmediato

**Pasos rápidos:**

1. Ve a: https://vercel.com/new
2. Import: `networkerpro20-oss/wispchat-referral-system`
3. Root Directory: `frontend`
4. Environment Variable: `NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com/api`
5. Click "Deploy"
6. Esperar 2-3 minutos
7. ✅ ¡Listo! Sistema en producción

**Total tiempo:** ~5 minutos

---

## 📝 Notas Importantes

- ✅ Backend ya está en producción (Render)
- ✅ Frontend listo para deploy (build exitoso)
- ✅ No se requiere Vercel CLI (deploy por web)
- ✅ Git actualizado con últimos cambios
- ⚠️  Schema mismatch en backend (wispHubClientId vs wispChatClientId)
- 💡 Testing se hará en producción (como indicaste)

---

## 🚀 ¡Estás Listo para Deploy!

Todo está preparado. Solo necesitas:
1. Ir a Vercel
2. Seguir los pasos de arriba
3. Esperar el deploy
4. Comenzar testing en producción

**¡Éxito!** 🎉
