# ✅ Checklist Manual de Testing - Sistema de Referidos

## 🎯 Estado Actual

- ✅ Backend en Render: https://wispchat-referral-backend.onrender.com
- ✅ Frontend local: http://localhost:3001
- ⚠️ Base de datos: Requiere datos de prueba

---

## 📋 Testing Manual - Paso a Paso

### 1. Testing del Backend (API)

#### ✅ Test 1: Health Check
```bash
curl https://wispchat-referral-backend.onrender.com/health | jq .
```
**Resultado esperado:** `{"success": true, "message": "Easy Access Referral System API"}`

**Estado:** ✅ PASÓ

---

#### ⚠️ Test 2: Endpoints de Cliente
```bash
# Resumen del cliente
curl https://wispchat-referral-backend.onrender.com/api/clients/WISPHUB_01/summary | jq .

# Referidos del cliente
curl https://wispchat-referral-backend.onrender.com/api/clients/WISPHUB_01/referrals | jq .

# Comisiones del cliente
curl https://wispchat-referral-backend.onrender.com/api/clients/WISPHUB_01/commissions | jq .
```

**Resultado esperado:** Datos del cliente con stats

**Estado actual:** ⚠️ ERROR - "Column Client.wispHubClientId does not exist"

**Causa:** Schema mismatch. El campo es `wispChatClientId` no `wispHubClientId`

**Acción requerida:** Revisar código del backend o crear datos de prueba

---

### 2. Testing del Frontend Local

#### ✅ URLs a probar en navegador:

##### 2.1 Admin Panel
- **Dashboard Admin:** http://localhost:3001/admin
  - [ ] Página carga correctamente
  - [ ] Muestra stats generales
  - [ ] Navegación funciona

- **Upload CSV:** http://localhost:3001/admin/invoices
  - [ ] Formulario de upload visible
  - [ ] Drag & drop funciona
  - [ ] Selector de período visible
  - [ ] Botón "Procesar CSV" habilitado

- **Historial:** http://localhost:3001/admin/uploads
  - [ ] Lista de uploads carga
  - [ ] Botones de detalle funcionan
  - [ ] Modal de detalle se abre

##### 2.2 Dashboard del Cliente
- **URL:** http://localhost:3001/dashboard?id=WISPHUB_01

**Checklist:**
- [ ] Página carga sin errores
- [ ] Muestra código de referido (EASY-XXXXX)
- [ ] Botón QR funciona
- [ ] Modal QR se abre
- [ ] Stats grid visible:
  - [ ] Total Referidos
  - [ ] Disponible
  - [ ] Pendiente
  - [ ] Total Ganado
- [ ] Botones de compartir:
  - [ ] WhatsApp abre correctamente
  - [ ] Email abre cliente de correo
  - [ ] Copy link copia al portapapeles
- [ ] Lista de referidos visible
- [ ] Lista de comisiones visible
- [ ] Banner de beneficios visible

**Nota:** Si no hay datos, mostrará ceros y listas vacías (esperado)

##### 2.3 Landing Page
- **URL:** http://localhost:3001/easyaccess/EASY-00001

**Checklist - Secciones:**
- [ ] Hero section carga
- [ ] Mensaje de referencia visible
- [ ] CTA "Verificar Cobertura" funciona (scroll)
- [ ] Video placeholder visible
- [ ] Sección beneficios (4 cards)
- [ ] Sección problemas resueltos
- [ ] Grid de planes (3 planes)
- [ ] Plan "Hogar" tiene badge POPULAR
- [ ] Testimonios (3 clientes)
- [ ] Formulario visible

**Checklist - Formulario Multi-paso:**
- [ ] **Paso 1/4:** Cobertura
  - [ ] Campos: Ciudad, Colonia, CP
  - [ ] Botón "Verificar Cobertura"
  - [ ] Loading state funciona
  - [ ] Toast de éxito aparece
  - [ ] Avanza a paso 2

- [ ] **Paso 2/4:** Datos Personales
  - [ ] Campos: Nombre, Email, Teléfono
  - [ ] Validaciones HTML5 funcionan
  - [ ] Botón "Atrás" regresa a paso 1
  - [ ] Botón "Continuar" avanza a paso 3

- [ ] **Paso 3/4:** Dirección
  - [ ] Campos: Calle, Ext, Int, Referencias
  - [ ] Textarea referencias funciona
  - [ ] Navegación funciona

- [ ] **Paso 4/4:** Confirmación
  - [ ] 3 cards de planes son clickables
  - [ ] Plan seleccionado se resalta (borde azul)
  - [ ] Resumen muestra todos los datos
  - [ ] Botón "Confirmar Registro" visible

- [ ] **Página de Éxito:**
  - [ ] Checkmark verde grande
  - [ ] Mensaje "¡Registro Exitoso!"
  - [ ] Lista de próximos pasos
  - [ ] 3 botones de contacto:
    - [ ] WhatsApp funciona
    - [ ] Telegram funciona
    - [ ] WispChat funciona

**Checklist - Contacto:**
- [ ] Sección de contacto visible
- [ ] 3 botones grandes de contacto
- [ ] Todos abren en nueva ventana

**Checklist - Footer:**
- [ ] Copyright visible
- [ ] Texto secundario visible

---

### 3. Testing de CSV Upload (Requiere archivo)

#### Formato del archivo: `EAfacturas071225.txt`

**Estructura (tab-delimited):**
```
CuentaNombreCorreoTeléfonoPaqueteMontoEstadoFecha
WISPHUB_01Juan Pérezjuan@example.com5551234567Básico299Pagado2025-12-01
WISPHUB_02María Lópezmaria@example.com5559876543Hogar449Pagado2025-12-01
```

**Pasos de testing:**
1. [ ] Ir a http://localhost:3001/admin/invoices
2. [ ] Seleccionar fecha inicio: 01/12/2025
3. [ ] Seleccionar fecha fin: 07/12/2025
4. [ ] Arrastrar archivo CSV al área
5. [ ] Verificar nombre de archivo visible
6. [ ] Click "Procesar CSV"
7. [ ] Ver loading state
8. [ ] Verificar stats mostradas:
   - [ ] Facturas procesadas: X
   - [ ] Referidores identificados: Y
   - [ ] Referidos encontrados: Z
   - [ ] Comisiones generadas: W
9. [ ] Toast de éxito aparece
10. [ ] Ir a http://localhost:3001/admin/uploads
11. [ ] Verificar nuevo upload en lista
12. [ ] Click en "Ver Detalle"
13. [ ] Modal con records se abre
14. [ ] Ver estados: COMPLETED

---

### 4. Testing de Responsive Design

**Dispositivos a probar:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Páginas críticas:**
- [ ] Landing page
- [ ] Dashboard cliente
- [ ] Admin panel

**Chrome DevTools:** F12 → Toggle Device Toolbar (Ctrl+Shift+M)

---

### 5. Testing de Browser Compatibility

**Navegadores:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

### 6. Testing de Performance

**Herramienta:** Chrome DevTools → Lighthouse

**Métricas objetivo:**
- [ ] Performance: >80
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >80

**Páginas a medir:**
- [ ] Landing page
- [ ] Dashboard

---

## 🐛 Issues Encontrados

### Issue #1: Schema Mismatch en Backend
**Descripción:** Columna `Client.wispHubClientId` no existe
**Endpoint afectado:** Todos los de cliente
**Severidad:** ALTA
**Status:** 🔴 BLOQUEANTE
**Solución propuesta:** 
1. Revisar schema.prisma
2. Verificar que use `wispChatClientId`
3. Regenerar cliente Prisma
4. Redeploy backend

### Issue #2: No hay datos de prueba
**Descripción:** Base de datos vacía
**Severidad:** MEDIA
**Status:** ⚠️ ESPERADO
**Solución:**
1. Ejecutar CREATE_TEST_DATA.sql en Render
2. O usar insert-test-data.sh para crear vía API
3. O subir CSV real desde admin panel

---

## ✅ Resumen de Testing

### Backend
- ✅ Health check: PASÓ
- 🔴 Client endpoints: FALLÓ (schema issue)
- ⏳ CSV processing: NO PROBADO (requiere datos)

### Frontend Local
- ✅ Servidor iniciado: http://localhost:3001
- ⏳ Admin panel: PENDIENTE testing manual
- ⏳ Dashboard: PENDIENTE testing manual
- ⏳ Landing: PENDIENTE testing manual

### Integración
- ⏳ Flujo completo E2E: PENDIENTE
- ⏳ Auto-activación comisiones: PENDIENTE
- ⏳ Compartir referidos: PENDIENTE

---

## 🎬 Próximos Pasos

1. **URGENTE:** Arreglar schema mismatch en backend
   - Opción A: Actualizar código para usar `wispChatClientId`
   - Opción B: Migración de BD para renombrar columna

2. **Datos de prueba:** Insertar datos en BD de Render
   - Ejecutar CREATE_TEST_DATA.sql
   - O crear manualmente desde admin

3. **Testing manual completo:** 
   - Completar todos los checkboxes de arriba
   - Documentar cualquier issue encontrado

4. **CSV real:** Obtener archivo EAfacturas real
   - Probar parsing
   - Verificar generación de comisiones
   - Validar auto-activación

5. **Deploy a producción:**
   - Una vez todos los tests pasen
   - Configurar dominio personalizado
   - Actualizar variables de entorno

---

## 📝 Notas

- Frontend corre en: http://localhost:3001
- Backend en producción: https://wispchat-referral-backend.onrender.com
- Repo GitHub: networkerpro20-oss/wispchat-referral-system
- Rama: main
- Último commit: c81c526 (Suspense fix)

**Fecha de testing:** 4 de diciembre de 2025
**Tester:** [TU NOMBRE]
**Versión:** 1.0.0-beta

