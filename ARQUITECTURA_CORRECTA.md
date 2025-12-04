# Arquitectura Correcta del Sistema de Referidos

## Concepto General

El sistema de referidos es **COMPLETAMENTE INDEPENDIENTE** de WispChat. Solo usa WispHub como fuente de datos.

### Flujo Real:

1. **Cliente de EasyAccess** (registrado en WispHub) accede al sistema de referidos
2. Obtiene su **link único** de referido
3. **Comparte el link** con conocidos
4. **Referido completa formulario** en la landing page
5. Sistema **registra el lead** en su propia BD
6. **Admin manualmente** verifica cobertura y agenda instalación
7. **Cuando se instala**, el referido se registra en WispHub como cliente
8. Sistema de referidos **consulta WispHub** para ver si el lead ya es cliente
9. **Cada mes** que el referido paga su factura en WispHub
10. Sistema **genera comisión** automáticamente (6 meses)
11. **Admin visualiza** las comisiones acumuladas
12. **Admin aplica descuento** manualmente a la factura del cliente referidor
13. Sistema **resta el saldo** aplicado

## Modelos de Base de Datos (Sistema de Referidos)

### Client (Cliente Referidor)
- Datos básicos del cliente de EasyAccess
- Sincronizado desde WispHub
- Tiene un código único de referido

### Referral (Lead/Referido)
- Persona que llegó por un link de referido
- Estados: PENDING, CONTACTED, INSTALLED, REJECTED
- Vinculado al cliente que lo refirió

### Commission (Comisión)
- Tipos: INSTALLATION (por instalación), MONTHLY (mes 1-6)
- Estados: EARNED (ganada), APPLIED (aplicada a factura), CANCELLED
- Monto en pesos mexicanos
- Fecha de generación y aplicación

### CommissionApplication (Aplicación de Descuento)
- Registro de cuándo se aplicó descuento
- Qué factura de WispHub
- Cuánto se descontó
- Quién lo aprobó

## APIs Necesarias

### Para Clientes:
- GET /api/my-referrals - Ver mis referidos y su estado
- GET /api/my-commissions - Ver mis comisiones ganadas/aplicadas
- GET /api/my-stats - Resumen: total ganado, aplicado, pendiente

### Para Admin:
- GET /api/leads - Todos los leads pendientes
- PUT /api/leads/:id/status - Cambiar estado (contactado, instalado, rechazado)
- GET /api/commissions/pending - Comisiones pendientes de aplicar
- POST /api/commissions/apply - Aplicar comisión a factura (descontar saldo)
- GET /api/clients - Lista de clientes referidores

### Integración con WispHub:
- GET /wisphub/client/:numero - Verificar si existe cliente
- GET /wisphub/invoices/:numero - Ver facturas del mes
- Webhook cuando se paga una factura → generar comisión

## Dashboard del Cliente

Debe mostrar:
1. **Mi código de referido** y link para compartir
2. **Mis referidos** (tabla: nombre, teléfono, estado, fecha)
3. **Mis comisiones**:
   - Total ganado: $X,XXX
   - Aplicado a facturas: $X,XXX
   - Pendiente de aplicar: $X,XXX
4. **Historial** de aplicaciones (qué mes se aplicó cuánto)

## Dashboard del Admin

Debe mostrar:
1. **Leads pendientes** de contactar
2. **Leads contactados** pendientes de instalar
3. **Clientes instalados** generando comisiones
4. **Comisiones pendientes** de aplicar
5. **Botón "Aplicar a Factura"** para cada comisión
   - Seleccionar mes de factura
   - Ingresar monto aplicado
   - Confirmar
   - Actualizar saldo

## Notas Importantes

- **NO modificar WispChat** - solo consultar datos
- **NO crear clientes en WispHub** desde aquí - solo ver si existen
- **NO generar facturas** - solo aplicar descuentos manualmente
- **Sistema autónomo** - propia BD, propias tablas
- **Sincronización manual** - admin decide cuándo aplicar comisiones
