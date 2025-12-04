# 🌐 Configuración del Subdominio referidos.wispchat.net

## 📋 Resumen

El sistema de referidos estará disponible en: **https://referidos.wispchat.net**

Este es un subdominio de tu dominio principal `wispchat.net`.

---

## 🎯 Pasos para Configurar

### PASO 1: Desplegar en Vercel (Primero)

1. Ve a https://vercel.com/new
2. Importa el repositorio `wispchat-referral-system`
3. Configuración:
   - **Project Name**: `referidos-wispchat`
   - **Framework**: Next.js
   - **Root Directory**: `frontend`
   - **Environment Variables**:
     ```bash
     NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com/api/v1
     ```
4. Click **Deploy**
5. ⏳ Espera 3-5 minutos

Vercel te dará una URL temporal como: `referidos-wispchat.vercel.app`

---

### PASO 2: Agregar Dominio Personalizado en Vercel

1. En Vercel, ve al proyecto `referidos-wispchat`
2. Click en **Settings** → **Domains**
3. En "Add Domain", escribe: `referidos.wispchat.net`
4. Click **Add**

Vercel te mostrará los registros DNS que debes configurar.

---

### PASO 3: Configurar DNS en tu Proveedor

Vercel te pedirá uno de estos dos tipos de configuración:

#### Opción A: CNAME (Recomendado)

Agrega este registro en tu proveedor de DNS (GoDaddy, Cloudflare, etc.):

```
Tipo: CNAME
Nombre: referidos
Valor: cname.vercel-dns.com
TTL: Auto o 3600
```

#### Opción B: A Record + CNAME

Si tu proveedor no soporta CNAME para subdominios:

```
Tipo: A
Nombre: referidos
Valor: 76.76.21.21
TTL: Auto o 3600
```

---

### PASO 4: Verificar en Vercel

1. Vuelve a Vercel → Settings → Domains
2. Vercel automáticamente verificará el DNS (puede tomar 1-5 minutos)
3. Una vez verificado, verás: ✅ **Valid Configuration**
4. Vercel generará automáticamente el certificado SSL (HTTPS)

---

### PASO 5: Actualizar Backend

Una vez que el subdominio esté activo, actualiza la variable de entorno en Render:

1. Ve al dashboard de Render
2. Servicio: `wispchat-referral-backend`
3. Settings → Environment
4. Edita:
   ```bash
   FRONTEND_URL=https://referidos.wispchat.net
   ALLOWED_ORIGINS=https://referidos.wispchat.net,https://wispchat.net
   ```
5. Click **Save Changes**
6. Render redesplegará automáticamente

---

## ✅ Verificación

Una vez completados los pasos:

### Test 1: Acceso Directo
```bash
curl -I https://referidos.wispchat.net
```
Debe responder con `200 OK` y certificado SSL válido.

### Test 2: Landing Page
Abre en el navegador: https://referidos.wispchat.net

Debe cargar la landing page del programa de referidos.

### Test 3: Botón en WispChat
1. Login en https://wispchat.net
2. Ve al chat de clientes
3. Verifica que el botón "Recomienda y Gana" abra: https://referidos.wispchat.net

### Test 4: Botón en Admin
1. Login como admin en https://wispchat.net/admin
2. Sidebar → "🎁 Programa de Referidos"
3. Debe abrir: https://referidos.wispchat.net/dashboard

---

## 🔧 Troubleshooting

### Error: "Domain not found"
- **Causa**: DNS aún no propagado
- **Solución**: Espera 5-30 minutos y refresca

### Error: "Invalid SSL Certificate"
- **Causa**: Vercel aún está generando el certificado
- **Solución**: Espera 2-5 minutos

### Error: CORS en la API
- **Causa**: `FRONTEND_URL` no actualizada en Render
- **Solución**: Verifica que `FRONTEND_URL=https://referidos.wispchat.net` en Render

### Error: Botón en WispChat no funciona
- **Causa**: URL no actualizada en código
- **Solución**: Ya actualizada en el código, solo redeploy WispChat frontend

---

## 🌐 Proveedores de DNS Comunes

### GoDaddy
1. Login → My Products → DNS
2. Click **Add** en la sección DNS Records
3. Tipo: CNAME, Host: `referidos`, Value: `cname.vercel-dns.com`

### Cloudflare
1. Dashboard → DNS → Records
2. Click **Add record**
3. Type: CNAME, Name: `referidos`, Target: `cname.vercel-dns.com`
4. **Importante**: Desactiva el proxy (nube gris) para que Vercel maneje el SSL

### Namecheap
1. Dashboard → Domain List → Manage
2. Advanced DNS → Add New Record
3. Type: CNAME Record, Host: `referidos`, Value: `cname.vercel-dns.com`

---

## 📊 Resumen de URLs

### Producción Final
- **Frontend**: https://referidos.wispchat.net
- **Backend API**: https://wispchat-referral-backend.onrender.com
- **WispChat Principal**: https://wispchat.net
- **WispChat Admin**: https://wispchat.net/admin

### Desarrollo Local
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000

---

## 🎉 Una vez configurado...

El flujo completo estará activo:

1. Cliente ve botón "Recomienda y Gana" en https://wispchat.net
2. Click → abre https://referidos.wispchat.net
3. Cliente crea referido y comparte link único
4. Referido se registra en https://referidos.wispchat.net/register/ABC123
5. Admin aprueba desde https://referidos.wispchat.net/dashboard
6. Al completar instalación → comisión $500
7. Al pagar mensualidad en WispChat → comisión $50 (hasta 6 pagos)

---

**¡Sistema de referidos con subdominio profesional listo! 🚀**

---

**Última actualización**: 4 de diciembre de 2024  
**Dominio configurado**: referidos.wispchat.net  
**Tiempo estimado de configuración**: 15-30 minutos
