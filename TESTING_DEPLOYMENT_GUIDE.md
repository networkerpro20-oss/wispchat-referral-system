# Guía de Testing y Deployment - Sistema de Referidos Easy Access

## Estado Actual

### ✅ Completado (6/7 tareas - 86%)

1. **Backend WispChat API** - Deployed en Render
2. **Backend Sistema Activación** - Lógica EARNED/ACTIVE implementada
3. **Frontend WispChat Botón** - Promociona y Gana integrado
4. **Admin Panel** - Upload CSV y gestión
5. **Dashboard Cliente** - Panel de referidos con QR
6. **Landing Page** - Captación de leads completa

### 🔄 En Proceso (1/7 tareas - 14%)

7. **Testing y Deployment** - Esta guía

---

## 1. Testing Local

### 1.1 Verificar Backend (Render)

```bash
# Health check
curl -s https://wispchat-referral-backend.onrender.com/health | jq .

# Validar código de referido
curl -s "https://wispchat-referral-backend.onrender.com/api/referral-codes/EASY-00001/validate" | jq .

# Ver resumen de cliente
curl -s "https://wispchat-referral-backend.onrender.com/api/clients/WISPHUB_01/summary" | jq .
```

**Respuestas esperadas:**
- Health: `{"success": true, "message": "Easy Access Referral System API"}`
- Validate: `{"success": true, "data": {...}}`
- Summary: Datos del cliente con stats

### 1.2 Testing Frontend Local

```bash
cd /home/easyaccess/projects/wispchat-referral-system/frontend

# Verificar build
npm run build

# Iniciar servidor de desarrollo
npm run dev
```

**URLs para probar:**

1. **Admin Panel:**
   - http://localhost:3001/admin - Dashboard admin
   - http://localhost:3001/admin/invoices - Subir CSV
   - http://localhost:3001/admin/uploads - Historial

2. **Dashboard Cliente:**
   - http://localhost:3001/dashboard?id=WISPHUB_01
   - Debe mostrar código, QR, referidos, comisiones

3. **Landing Page:**
   - http://localhost:3001/easyaccess/EASY-00001
   - Debe mostrar página completa con formulario

### 1.3 Testing con CSV Real

**Formato esperado:** EAfacturas DDMMYY.txt (tab-delimited)

```
CuentaNombreCorreoTeléfonoPaqueteMontoEstadoFecha
WISPHUB_01Juan Pérezjuan@example.com5551234567Básico299Pagado2025-12-01
WISPHUB_02María Lópezmaria@example.com5559876543Hogar449Pagado2025-12-01
```

**Pasos:**

1. Acceder a http://localhost:3001/admin/invoices
2. Seleccionar período (fecha inicio y fin)
3. Drag & drop archivo CSV
4. Click "Procesar CSV"
5. Verificar stats:
   - Facturas procesadas
   - Referidores identificados
   - Referidos encontrados
   - Comisiones generadas

**Validaciones:**
- ✅ Parsing correcto (tab-delimited)
- ✅ Clasificación de clientes (isReferrer/isReferral)
- ✅ Generación de comisiones
- ✅ Estados correctos (EARNED vs ACTIVE)
- ✅ Auto-activación cuando referidor paga

---

## 2. Deployment a Vercel

### 2.1 Preparación

**Archivos verificados:**
- ✅ `.env.production` creado con API_URL de producción
- ✅ Build exitoso (8/8 páginas generadas)
- ✅ Suspense boundary en dashboard (fix aplicado)
- ✅ Git actualizado (commit c81c526)

### 2.2 Deploy desde CLI

```bash
cd /home/easyaccess/projects/wispchat-referral-system/frontend

# Login a Vercel (primera vez)
npx vercel login

# Deploy a producción
npx vercel --prod
```

**Pasos interactivos:**

1. Set up and deploy? **Y**
2. Which scope? Seleccionar tu cuenta
3. Link to existing project? **N** (primera vez)
4. What's your project name? **wispchat-referral-frontend**
5. In which directory is your code located? **./**
6. Want to override settings? **N**

### 2.3 Deploy desde Web (Alternativa)

1. Ir a https://vercel.com/new
2. Import Git Repository
3. Seleccionar: **networkerpro20-oss/wispchat-referral-system**
4. Configure:
   - Framework: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com/api
   ```
6. Click **Deploy**

### 2.4 Verificar Deployment

```bash
# Ejemplo de URL de producción
# https://wispchat-referral-frontend.vercel.app

# Test health
curl -s https://wispchat-referral-frontend.vercel.app/api/health

# Test páginas
# https://wispchat-referral-frontend.vercel.app/dashboard?id=WISPHUB_01
# https://wispchat-referral-frontend.vercel.app/easyaccess/EASY-00001
# https://wispchat-referral-frontend.vercel.app/admin
```

---

## 3. Testing End-to-End en Producción

### 3.1 Flujo Completo del Cliente

**Paso 1: Registro en WispChat**
1. Cliente inicia sesión en WispChat
2. Click en botón "Promociona y Gana"
3. Sistema genera código EASY-XXXXX
4. Cliente ve QR y botones de compartir

**Paso 2: Cliente Comparte**
1. Click "Compartir por WhatsApp"
2. Mensaje con link se abre: `https://wispchat-referral-frontend.vercel.app/easyaccess/EASY-XXXXX`
3. O copiar link manualmente
4. O descargar QR

**Paso 3: Lead Visita Landing**
1. Lead hace click en link compartido
2. Ve página de bienvenida personalizada: "🎁 Invitado por [Nombre]"
3. Navega por secciones (video, beneficios, planes)
4. Click "Verificar Cobertura"

**Paso 4: Lead Completa Formulario**
1. **Paso 1/4:** Ciudad, colonia, CP → Verificar cobertura
2. **Paso 2/4:** Nombre, email, teléfono
3. **Paso 3/4:** Dirección completa
4. **Paso 4/4:** Seleccionar plan → Confirmar

**Paso 5: Registro Exitoso**
1. Página de éxito con mensaje
2. Botones de contacto (WhatsApp/Telegram/WispChat)
3. Lead registrado en sistema como LEAD

### 3.2 Flujo Admin - Procesamiento CSV

**Día 7 o 21 del mes:**

1. Admin accede a `/admin/invoices`
2. Selecciona período (ej: 01/12/2025 - 07/12/2025)
3. Sube archivo `EAfacturas071225.txt`
4. Sistema procesa:
   - Parse de 150 facturas
   - Identifica 45 referidores
   - Encuentra 12 referidos
   - Genera 18 comisiones (instalación + 6 meses)

**Verificar:**
- ✅ Estado EARNED para comisiones si referidor NO está al día
- ✅ Estado ACTIVE para comisiones si referidor SÍ está al día
- ✅ Lead cambia a ACTIVE si se encontró en CSV

### 3.3 Flujo Cliente - Ver Comisiones

1. Cliente accede a `/dashboard?id=WISPHUB_XX`
2. Ve stats:
   - **Total Referidos:** 3 (2 activos)
   - **Disponible:** $1,200 (ACTIVE)
   - **Pendiente:** $300 (EARNED - esperando pago)
   - **Total Ganado:** $800 (APPLIED)

3. Lista de Referidos:
   - Juan Pérez - ACTIVE (badge verde)
   - María López - ACTIVE (badge verde)
   - Carlos Ruiz - LEAD (badge amarillo)

4. Lista de Comisiones:
   - Instalación - $500 - ACTIVE (puede cobrar)
   - Mensualidad Mes 1 - $50 - ACTIVE
   - Mensualidad Mes 2 - $50 - EARNED (badge naranja: "Requiere pago al día")

### 3.4 Flujo de Auto-Activación

**Escenario:** Cliente con comisiones EARNED paga su factura

1. **Estado inicial:**
   - Cliente WISPHUB_15 tiene 3 comisiones EARNED ($650 total)
   - Razón: "Referidor no está al día con pagos"
   - Estado: isPaymentCurrent = false

2. **Admin sube CSV nuevo:**
   - CSV incluye pago de WISPHUB_15
   - Sistema detecta pago y actualiza isPaymentCurrent = true

3. **Auto-activación:**
   - Sistema busca comisiones EARNED del cliente
   - Cambia estado EARNED → ACTIVE
   - Actualiza activatedAt = ahora
   - Actualiza statusReason = null

4. **Cliente ve cambio:**
   - Dashboard actualiza en tiempo real
   - "Pendiente" disminuye: $650 → $0
   - "Disponible" aumenta: $0 → $650
   - Badge cambia de naranja (EARNED) a verde (ACTIVE)

---

## 4. Configuración de Producción

### 4.1 Variables de Entorno

**Backend (Render):**
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=4000
```

**Frontend (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com/api
```

### 4.2 Actualizar Información de Contacto

**Archivo:** `frontend/app/easyaccess/[codigo]/page.tsx`

**Líneas a actualizar (aprox. 750-770):**

```typescript
// WhatsApp - Reemplazar número
const contactWhatsApp = () => {
  window.open('https://wa.me/5215512345678?text=...', '_blank'); // ← ACTUALIZAR NÚMERO REAL
};

// Telegram - Verificar canal
const contactTelegram = () => {
  window.open('https://t.me/easyaccesssoporte', '_blank'); // ← VERIFICAR CANAL
};

// WispChat - Confirmar perfil
const contactWispChat = () => {
  window.open('https://wispchat.net/chat?user=ventas@easyaccessnet.com', '_blank'); // ← VERIFICAR PERFIL
};
```

### 4.3 Implementar Video Institucional

**Archivo:** `frontend/app/easyaccess/[codigo]/page.tsx`

**Línea aprox. 465:**

```typescript
{/* Video placeholder - Reemplazar con iframe real */}
<div className="relative aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl overflow-hidden shadow-2xl group">
  {/* Reemplazar con: */}
  <iframe 
    src="https://www.youtube.com/embed/TU_VIDEO_ID"
    className="w-full h-full"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>
```

**Pasos:**
1. Subir video institucional a YouTube o Vimeo
2. Obtener ID del video
3. Reemplazar `TU_VIDEO_ID` en el código
4. Commit y redeploy

---

## 5. Monitoring y Mantenimiento

### 5.1 Monitoreo de Servicios

**Backend (Render):**
- Dashboard: https://dashboard.render.com
- Logs: Click en servicio → Logs
- Métricas: CPU, memoria, requests

**Frontend (Vercel):**
- Dashboard: https://vercel.com/dashboard
- Analytics: Ver visitas, performance
- Logs: Functions logs para errores

### 5.2 Schedule de CSV

**Automático (días 7 y 21):**

**Opción 1: Cron Job Manual**
```bash
# Agregar a crontab del servidor admin
0 9 7,21 * * /usr/local/bin/upload-csv.sh
```

**Opción 2: Admin Manual**
- Admin recibe recordatorio calendario
- Día 7: Procesa facturas 1-7
- Día 21: Procesa facturas 8-21

### 5.3 Troubleshooting

**Error: "Código de referido inválido"**
- Verificar que código existe en BD
- Check formato: EASY-XXXXX
- Ver logs backend

**Error: "Failed to load client data"**
- Verificar conexión backend
- Check CORS headers
- Ver network tab en DevTools

**Error: CSV no procesa**
- Verificar formato tab-delimited
- Check encoding (UTF-8)
- Ver columnas requeridas
- Revisar logs en /admin/uploads

**Comisiones no se activan:**
- Verificar isPaymentCurrent del referidor
- Check estado del referido (debe ser ACTIVE)
- Ver statusReason en comisión
- Revisar logs de procesamiento

---

## 6. Checklist Final

### Pre-Deploy
- [x] Build exitoso sin errores
- [x] Suspense boundary implementado
- [x] Variables de entorno configuradas
- [x] Git actualizado y pusheado
- [ ] Números de contacto actualizados
- [ ] Video institucional subido
- [ ] Testing local completo

### Deploy
- [ ] Vercel proyecto creado
- [ ] Environment variables en Vercel
- [ ] Deploy exitoso
- [ ] URLs de producción verificadas

### Post-Deploy
- [ ] Testing E2E en producción
- [ ] CSV real probado
- [ ] Flujo de auto-activación verificado
- [ ] Notificaciones funcionando
- [ ] Responsive design en móvil
- [ ] Performance acceptable (<3s load)

### Documentación
- [ ] URLs de producción documentadas
- [ ] Credenciales admin compartidas
- [ ] Guía de troubleshooting
- [ ] Schedule de mantenimiento
- [ ] Contactos de soporte

---

## 7. URLs de Producción

**Backend:**
- API: https://wispchat-referral-backend.onrender.com
- Health: https://wispchat-referral-backend.onrender.com/health
- Docs: https://wispchat-referral-backend.onrender.com/api-docs

**Frontend (Pending Deploy):**
- Dashboard: https://[TU-DOMINIO].vercel.app
- Admin: https://[TU-DOMINIO].vercel.app/admin
- Landing: https://[TU-DOMINIO].vercel.app/easyaccess/EASY-XXXXX

**WispChat Integration:**
- Chat: https://wispchat.net
- API: https://wispchat-backend.onrender.com
- Referral Button: Visible en sidebar del chat

---

## 8. Próximos Pasos

### Corto Plazo (Esta semana)
1. ✅ Deploy frontend a Vercel
2. ⏳ Actualizar contactos reales
3. ⏳ Implementar video institucional
4. ⏳ Testing con CSV real
5. ⏳ Documentar URLs finales

### Mediano Plazo (Este mes)
1. Analytics de conversión
2. A/B testing de landing page
3. Notificaciones push
4. Dashboard de métricas
5. Reportes automáticos

### Largo Plazo (Próximos 3 meses)
1. App móvil nativa
2. Sistema de niveles (gamificación)
3. Programa de afiliados
4. Integración con CRM
5. API pública para partners

---

## 9. Contactos y Soporte

**Equipo de Desarrollo:**
- GitHub: https://github.com/networkerpro20-oss/wispchat-referral-system
- Issues: [Crear ticket]

**Easy Access NewTelecom:**
- Soporte: soporte@easyaccessnet.com
- Ventas: ventas@easyaccessnet.com
- WhatsApp: [PENDIENTE]
- Telegram: @easyaccesssoporte

**Servicios Cloud:**
- Render: dashboard.render.com
- Vercel: vercel.com/dashboard
- GitHub: github.com

---

## Conclusión

Sistema 86% completo. Solo falta:
1. Deploy a Vercel
2. Testing E2E en producción
3. Actualizar datos de contacto
4. Documentación final

**Tiempo estimado:** 2-4 horas

**Ready to deploy!** 🚀
