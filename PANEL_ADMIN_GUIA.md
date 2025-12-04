# Panel Admin - Sistema de Referidos Easy Access

## 📋 Descripción General

El panel de administración permite gestionar el procesamiento de facturas CSV de Easy Access y visualizar el estado de comisiones generadas.

## 🗂️ Estructura de Páginas

### 1. Dashboard (`/admin`)
- Vista general de comisiones
- Filtros por estado (EARNED, ACTIVE, APPLIED, CANCELLED)
- Edición de montos de comisión
- Configuración del sistema

### 2. Subir CSV (`/admin/invoices`)
- **Función:** Upload y procesamiento de archivos de facturas
- **Features:**
  - Drag & drop de archivos .txt o .csv
  - Selección de período (inicio y fin)
  - Vista previa de archivo seleccionado
  - Procesamiento automático con feedback en tiempo real
  - Estadísticas de procesamiento (facturas, comisiones, activaciones)
  - Visualización de errores

**Flujo de uso:**
1. Selecciona archivo `EAfacturas DDMMYY.txt`
2. Define fechas del período cubierto
3. Ingresa nombre del usuario que sube
4. Click en "Subir y Procesar CSV"
5. Sistema automáticamente:
   - Parse del CSV (delimitado por TAB)
   - Clasificación de facturas (referidores vs referidos)
   - Actualización de estado de pago de referidores
   - Generación de comisiones mensuales
   - **Activación automática** si referidor está al día

**Resultado esperado:**
```
✅ Total Facturas: X
👥 Referidores: Y  
👥 Referidos: Z
💰 Comisiones Generadas: N
⚡ Comisiones Activadas: M
```

### 3. Historial de Uploads (`/admin/uploads`)
- **Función:** Visualizar todos los CSVs procesados
- **Features:**
  - Lista completa de uploads con stats
  - Estados: PROCESSING, COMPLETED, FAILED
  - Filtros por fecha, uploader
  - Vista detallada de cada upload
  - Opción de reprocesar uploads fallidos
  - Tabla de registros individuales procesados

**Información mostrada:**
- Nombre de archivo
- Usuario que subió
- Período cubierto
- Total de facturas procesadas
- Referidores y referidos detectados
- Comisiones generadas y activadas
- Errores encontrados
- Timestamp de upload

**Modal de detalles:**
- Estadísticas completas
- Lista de errores (si hay)
- Tabla de invoice records con:
  - Número de factura
  - Cliente
  - Monto
  - Estado (PAID/PENDING)
  - Tipo (Referidor/Referido)

## 📁 Formato CSV Requerido

### Archivo de entrada
- **Nombre:** `EAfacturas DDMMYY.txt` (ej: `EAfacturas 041224.txt`)
- **Delimitador:** TAB (`\t`)
- **Encoding:** UTF-8

### Columnas requeridas
| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| #Factura | Número de factura | FA001 |
| Usuario | Usuario del sistema | admin |
| Cliente | Nombre del cliente | Juan Pérez |
| Fecha Emisión | Fecha DD/MM/YYYY | 01/12/2024 |
| Estado | PAID o PENDING | PAID |
| ID Servicio | Código del servicio | EASY-12345 |
| Total | Monto con decimales | 500.00 |

### Ejemplo de archivo válido:
```
#Factura	Usuario	Cliente	Fecha Emisión	Estado	ID Servicio	Total
FA001	admin	Juan Pérez	01/12/2024	PAID	EASY-12345	500.00
FA002	admin	María García	01/12/2024	PAID	SRV-00234	450.00
```

## 🔄 Lógica de Procesamiento

### Clasificación de Facturas
1. **Referidor:** Cliente que tiene un código EASY-XXXXX asignado
2. **Referido:** Cliente cuyo ID Servicio contiene "EASY-" (código de otro referidor)

### Actualización de Estado de Pago
- Si factura tiene estado **PAID** → Cliente marcado como `isPaymentCurrent = true`
- Si factura tiene estado **PENDING** → Cliente marcado como `isPaymentCurrent = false`

### Generación de Comisiones
Para cada referido con factura PAID:
1. Buscar al referidor (dueño del código EASY-XXXXX)
2. Crear comisión mensual
3. **Estado inicial:**
   - `ACTIVE` si referidor está al día (`isPaymentCurrent = true`)
   - `EARNED` si referidor NO está al día

### Activación Automática
Cuando un referidor paga su factura:
- Todas sus comisiones en estado `EARNED` → cambian a `ACTIVE`
- Puede cobrarlas inmediatamente

## 🎯 Estados de Comisión

| Estado | Significado | Puede cobrar |
|--------|-------------|--------------|
| **EARNED** | Generada pero referidor NO está al día | ❌ No |
| **ACTIVE** | Generada Y referidor está al día | ✅ Sí |
| **APPLIED** | Ya cobrada/aplicada a factura | ✅ Completada |
| **CANCELLED** | Cancelada (referido se dio de baja) | ❌ No |

## 🔐 API Endpoints Utilizados

### Upload CSV
```http
POST /api/admin/invoices/upload
Content-Type: multipart/form-data

FormData:
- file: File
- periodStart: string (YYYY-MM-DD)
- periodEnd: string (YYYY-MM-DD)
- uploadedBy: string

Response:
{
  "success": true,
  "data": {
    "uploadId": "uuid",
    "stats": {
      "totalInvoices": 100,
      "referrerInvoices": 45,
      "referralInvoices": 55,
      "commissionsGenerated": 55,
      "commissionsActivated": 30,
      "errors": []
    }
  }
}
```

### Listar Uploads
```http
GET /api/admin/invoices/uploads

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fileName": "EAfacturas 041224.txt",
      "uploadedBy": "admin",
      "periodStart": "2024-12-01",
      "periodEnd": "2024-12-07",
      "status": "COMPLETED",
      "totalInvoices": 100,
      "commissionsGenerated": 55,
      "commissionsActivated": 30,
      "createdAt": "2024-12-04T20:00:00Z"
    }
  ]
}
```

### Detalles de Upload
```http
GET /api/admin/invoices/uploads/:uploadId

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    ...uploadInfo,
    "invoiceRecords": [
      {
        "invoiceNumber": "FA001",
        "clientName": "Juan Pérez",
        "amount": 500.00,
        "status": "PAID",
        "isReferrer": true,
        "isReferral": false
      }
    ]
  }
}
```

### Reprocesar Upload
```http
POST /api/admin/invoices/uploads/:uploadId/reprocess

Response:
{
  "success": true,
  "data": {
    "uploadId": "uuid",
    "message": "Upload reprocesado exitosamente",
    "stats": {...}
  }
}
```

## 🚀 Despliegue

### Variables de Entorno
```env
NEXT_PUBLIC_API_URL=https://wispchat-referral-backend.onrender.com/api
```

### Build y Deploy
```bash
npm run build
npm start
```

### Vercel
```bash
vercel --prod
```

## ✅ Testing

### Test Manual - Subir CSV
1. Navega a `/admin/invoices`
2. Usa el archivo de prueba: `test-data/EAfacturas_test_041224.txt`
3. Período: 01/12/2024 - 07/12/2024
4. Verifica que muestre:
   - Total facturas: 5
   - Referidores identificados
   - Comisiones generadas
   - Sin errores

### Test de Historial
1. Navega a `/admin/uploads`
2. Verifica que aparezca el upload anterior
3. Click en "Ver Detalles"
4. Valida que muestre los 5 registros

### Test de Reprocesar
1. En historial, encuentra un upload
2. Click "Reprocesar" (solo si FAILED)
3. Confirma la acción
4. Verifica actualización de stats

## 📊 Métricas y Monitoreo

### KPIs a monitorear:
- **Total uploads procesados:** Historial completo
- **Tasa de éxito:** COMPLETED vs FAILED
- **Comisiones generadas:** Total acumulado
- **Tasa de activación:** ACTIVE vs EARNED (%)
- **Tiempo de procesamiento:** Por upload

### Troubleshooting

**Error: "Solo se permiten archivos .txt o .csv"**
- Verificar extensión del archivo
- Verificar que no sea un .xlsx renombrado

**Error: "Error al procesar CSV"**
- Verificar formato del archivo (TAB-delimited)
- Verificar que tenga todas las columnas requeridas
- Verificar encoding UTF-8

**Error: "La fecha de fin debe ser posterior"**
- Verificar selección de fechas
- Período debe ser lógico (inicio < fin)

**Comisiones no se activan automáticamente:**
- Verificar que referidor tenga factura PAID en el CSV
- Verificar que comisión esté en estado EARNED
- Consultar logs del backend para detalles

## 🔗 Navegación del Panel

```
/admin
├── / (Dashboard - Gestión de comisiones)
├── /invoices (Subir CSV)
└── /uploads (Historial de uploads)
```

Navegación mediante tabs en la parte superior.

## 🎨 UI/UX

### Colores del sistema:
- **Azul** (#2563eb): Acciones principales, referidores
- **Verde** (#10b981): Estados exitosos, referidos
- **Emerald** (#059669): Comisiones activas
- **Naranja** (#f97316): Acciones secundarias
- **Rojo** (#dc2626): Errores y cancelaciones
- **Gris** (#64748b): Estados neutrales

### Iconos (lucide-react):
- Upload: Subir archivos
- FileText: Facturas/documentos
- TrendingUp: Comisiones/crecimiento
- Users: Referidores/referidos
- Calendar: Fechas/períodos
- RefreshCw: Reprocesar
- Eye: Ver detalles
- AlertCircle: Errores/advertencias

## 📝 Notas Importantes

1. **Archivos se procesan sincrónicamente** - El usuario espera la respuesta
2. **No hay límite de tamaño** - Pero se recomienda < 5MB
3. **Prevención de duplicados** - Sistema detecta facturas ya procesadas
4. **Activación es automática** - No requiere acción manual
5. **Reprocesar puede duplicar comisiones** - Usar con precaución
6. **Toast notifications** - Feedback inmediato en todas las acciones
7. **Responsive design** - Funciona en mobile y desktop

## 🔮 Próximos Features

- [ ] Exportar resultados a Excel
- [ ] Filtros avanzados en historial
- [ ] Búsqueda de facturas específicas
- [ ] Gráficas de tendencias
- [ ] Notificaciones por email al procesar
- [ ] Programación de uploads automáticos
- [ ] Validación previa del CSV antes de procesar
- [ ] Rollback de uploads con errores
