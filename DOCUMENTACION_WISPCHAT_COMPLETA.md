# 📚 Documentación WispChat.net - Sistema de Referidos

**Fecha actualización:** 5 de Diciembre de 2025  
**Versión:** 1.0.0

---

## 📋 ÍNDICE
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Frontend Principal (WispChat.net)](#frontend-principal-wispchatnet)
4. [Backend Principal](#backend-principal)
5. [Sistema de Referidos (Integración)](#sistema-de-referidos-integración)
6. [Flujos de Autenticación](#flujos-de-autenticación)
7. [Modelos de Datos](#modelos-de-datos)
8. [APIs Principales](#apis-principales)
9. [Deployment](#deployment)

---

## 🎯 RESUMEN EJECUTIVO

### ¿Qué es WispChat.net?
WispChat.net es un **sistema de gestión de proveedores de internet (ISP)** con capacidades multi-tenant. Permite a los ISPs gestionar:
- 📊 Clientes y suscripciones
- 💬 Comunicación con clientes (WhatsApp, Email)
- 💰 Pagos y facturación
- 📈 Métricas y reportes
- 👥 Sistema de referidos

### Arquitectura General
```
┌─────────────────────────────────────────────────────────────┐
│                      wispchat.net                           │
│                  (Frontend Principal)                       │
│                      Next.js 14                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ API Calls
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend Principal WispChat                      │
│                    Express + Prisma                          │
│            PostgreSQL (wispchat_main_db)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐            ┌────────────────────┐
│  WispHub API  │            │ Sistema Referidos  │
│   (Pagos)     │            │  referidos.wispchat│
└───────────────┘            └────────────────────┘
```

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Stack Tecnológico

#### Frontend Principal
```typescript
Framework: Next.js 14.2.33
UI: React 18 + TypeScript
Styling: Tailwind CSS
Icons: Lucide React
Charts: Recharts
Deploy: Vercel
Domain: wispchat.net
```

#### Backend Principal
```typescript
Runtime: Node.js + Express
Language: TypeScript
ORM: Prisma
Database: PostgreSQL
Auth: JWT + bcrypt
Deploy: Render (Free tier)
```

#### Integraciones
```typescript
WispHub: Sistema de pagos y facturación
Referencias: Sistema de referidos (referidos.wispchat.net)
WhatsApp: API Business
Email: Nodemailer
```

---

## 🌐 FRONTEND PRINCIPAL (WISPCHAT.NET)

### Estructura de Rutas

```
wispchat.net/
├── /                          # Landing page pública
├── /login                     # Login multi-tenant (ISP)
├── /cliente/login             # Login de clientes
├── /cliente/registro          # Registro de nuevos clientes
├── /cliente/dashboard         # Dashboard del cliente
│
├── /admin                     # Dashboard ISP
│   ├── /clientes              # Gestión de clientes
│   ├── /mensajes              # Comunicación masiva
│   ├── /pagos                 # Gestión de pagos
│   ├── /facturacion           # Facturas y recibos
│   ├── /reportes              # Métricas y analytics
│   ├── /configuracion         # Ajustes del tenant
│   └── /referidos             # Programa de referidos
│
└── /super-admin               # Panel super administrador
    ├── /tenants               # Gestión de ISPs
    ├── /analytics             # Métricas globales
    └── /settings              # Configuración global
```

### Componentes Clave

#### 1. Multi-tenancy Handler
**Archivo:** `frontend/utils/tenantHelper.ts`

```typescript
export const getTenantFromDomain = (domain: string): string => {
  // wispchat.net → tenant principal
  // easyaccess.wispchat.net → tenant "easyaccess"
  const subdomain = domain.split('.')[0];
  return subdomain === 'wispchat' || subdomain === 'www' 
    ? 'main' 
    : subdomain;
};

export const getTenantHeader = (): string => {
  if (typeof window !== 'undefined') {
    return getTenantFromDomain(window.location.hostname);
  }
  return 'main';
};
```

#### 2. API Client
**Archivo:** `frontend/utils/apiClient.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-backend.onrender.com';

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'x-tenant-domain': getTenantHeader(),
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-domain': getTenantHeader(),
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  // ...put, delete, etc.
};
```

#### 3. Cliente Dashboard
**Archivo:** `frontend/app/cliente/dashboard/page.tsx`

```typescript
interface ClienteData {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  plan: string;
  estado: 'activo' | 'suspendido' | 'cancelado';
  saldoPendiente: number;
  proximoPago: string;
}

export default function ClienteDashboard() {
  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [facturas, setFacturas] = useState([]);
  const [referidos, setReferidos] = useState([]);

  useEffect(() => {
    loadClienteData();
  }, []);

  const loadClienteData = async () => {
    const data = await apiClient.get('/api/cliente/me');
    setCliente(data);
    
    // Cargar facturas
    const bills = await apiClient.get('/api/cliente/facturas');
    setFacturas(bills);
    
    // Cargar referidos
    const refs = await apiClient.get('/api/cliente/referidos');
    setReferidos(refs);
  };

  return (
    <div>
      <h1>Hola, {cliente?.nombre}</h1>
      
      {/* Saldo pendiente */}
      {cliente?.saldoPendiente > 0 && (
        <Alert variant="warning">
          Tienes un saldo pendiente de ${cliente.saldoPendiente}
          <Button onClick={handlePagar}>Pagar ahora</Button>
        </Alert>
      )}
      
      {/* Resumen del plan */}
      <Card>
        <h2>Tu Plan: {cliente?.plan}</h2>
        <p>Estado: {cliente?.estado}</p>
        <p>Próximo pago: {cliente?.proximoPago}</p>
      </Card>
      
      {/* Referidos */}
      <Card>
        <h2>Programa de Referidos</h2>
        <p>Referidos activos: {referidos.length}</p>
        <p>Comisión ganada: ${calcularComisiones(referidos)}</p>
        <ShareButton />
      </Card>
    </div>
  );
}
```

#### 4. Admin Dashboard
**Archivo:** `frontend/app/admin/page.tsx`

```typescript
interface DashboardMetrics {
  clientesActivos: number;
  clientesSuspendidos: number;
  ingresosMes: number;
  pagosPendientes: number;
  nuevosReferidos: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Clientes Activos"
          value={metrics?.clientesActivos}
          icon={Users}
          trend="+5%"
        />
        <MetricCard
          title="Ingresos del Mes"
          value={`$${metrics?.ingresosMes}`}
          icon={DollarSign}
          trend="+12%"
        />
        <MetricCard
          title="Pagos Pendientes"
          value={metrics?.pagosPendientes}
          icon={AlertCircle}
          variant="warning"
        />
        <MetricCard
          title="Nuevos Referidos"
          value={metrics?.nuevosReferidos}
          icon={UserPlus}
          trend="+8"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-4">
        <RevenueChart data={revenueData} />
        <ClientsChart data={clientsData} />
      </div>

      {/* Actividad reciente */}
      <RecentActivity items={recentActivity} />
    </div>
  );
}
```

---

## 🔧 BACKEND PRINCIPAL

### Estructura de Archivos

```
backend/
├── src/
│   ├── controllers/
│   │   ├── adminController.ts
│   │   ├── clientController.ts
│   │   ├── authController.ts
│   │   ├── tenantsController.ts
│   │   ├── paymentsController.ts
│   │   └── referralsController.ts
│   │
│   ├── routes/
│   │   ├── admin.ts
│   │   ├── clients.ts
│   │   ├── auth.ts
│   │   ├── tenants.ts
│   │   ├── payments.ts
│   │   └── referrals.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── tenantResolver.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   │
│   ├── models/
│   │   └── (Prisma genera los modelos)
│   │
│   ├── services/
│   │   ├── wispHubService.ts
│   │   ├── emailService.ts
│   │   ├── whatsappService.ts
│   │   └── referralService.ts
│   │
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── encryption.ts
│   │   └── logger.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
└── package.json
```

### Middleware: Tenant Resolver

**Archivo:** `backend/src/middleware/tenantResolver.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TenantRequest extends Request {
  tenantId?: string;
  tenant?: any;
}

export const resolveTenant = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Buscar tenant en header
    const tenantDomain = req.headers['x-tenant-domain'] as string;
    
    if (!tenantDomain) {
      return res.status(400).json({
        success: false,
        message: 'x-tenant-domain header requerido',
      });
    }

    // 2. Buscar tenant en BD
    const tenant = await prisma.tenant.findUnique({
      where: { domain: tenantDomain },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: `Tenant no encontrado: ${tenantDomain}`,
      });
    }

    // 3. Verificar estado activo
    if (!tenant.active) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta suspendida',
      });
    }

    // 4. Agregar al request
    req.tenantId = tenant.id;
    req.tenant = tenant;
    
    next();
  } catch (error) {
    console.error('Error resolviendo tenant:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};
```

### Middleware: Autenticación

**Archivo:** `backend/src/middleware/auth.ts`

```typescript
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'super_admin';
  tenantId: string;
}

export interface AuthRequest extends TenantRequest {
  user?: UserPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Obtener token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      });
    }

    const token = authHeader.substring(7);

    // 2. Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as UserPayload;

    // 3. Verificar que el usuario pertenece al tenant
    if (req.tenantId && decoded.tenantId !== req.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para este tenant',
      });
    }

    // 4. Agregar al request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Error autenticando:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes',
      });
    }
    next();
  };
};
```

---

## 🔗 SISTEMA DE REFERIDOS (INTEGRACIÓN)

### Relación con WispChat Principal

```
┌─────────────────────────────────────────────────────────────┐
│                     wispchat.net                            │
│                                                             │
│  Cliente Dashboard:                                         │
│  - Ver referidos                                            │
│  - Copiar link único                                        │
│  - Ver comisiones                                           │
│                                                             │
│  Admin Dashboard:                                           │
│  - Ver todos los referidos                                  │
│  - Gestionar comisiones                                     │
│  - Configurar programa                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API Calls
                     │
┌────────────────────▼────────────────────────────────────────┐
│           Sistema de Referidos (Independiente)              │
│           https://referidos.wispchat.net                    │
│                                                             │
│  - Landing page dinámica                                    │
│  - Registro de prospectos                                   │
│  - Tracking de conversiones                                 │
│  - Panel de configuración                                   │
└─────────────────────────────────────────────────────────────┘
```

### Endpoints de Integración

#### En Backend WispChat:

**GET /api/cliente/referidos**
```typescript
// Obtener referidos del cliente autenticado
router.get('/api/cliente/referidos', authenticate, async (req, res) => {
  const clienteId = req.user!.id;
  
  // Llamar a API de referidos
  const response = await fetch(
    `https://wispchat-referral-backend.onrender.com/api/referrals/by-client/${clienteId}`,
    {
      headers: {
        'x-tenant-domain': req.tenantId!,
      },
    }
  );
  
  const data = await response.json();
  res.json(data);
});
```

**GET /api/admin/referidos/stats**
```typescript
// Obtener estadísticas de referidos para el tenant
router.get('/api/admin/referidos/stats', 
  authenticate, 
  requireRole(['admin']), 
  async (req, res) => {
    const response = await fetch(
      `https://wispchat-referral-backend.onrender.com/api/admin/referrals/stats`,
      {
        headers: {
          'x-tenant-domain': req.tenantId!,
          'Authorization': req.headers.authorization!,
        },
      }
    );
    
    const data = await response.json();
    res.json(data);
  }
);
```

#### En Backend Referidos:

**GET /api/referrals/by-client/:clientId**
```typescript
// Ya implementado en sistema de referidos
// Retorna lista de referidos y comisiones
```

**POST /api/leads**
```typescript
// Ya implementado en sistema de referidos
// Registra nuevo prospecto desde landing
```

### Flujo Completo de Referido

```
1. Cliente en WispChat Dashboard:
   - Click "Compartir mi link"
   - Copia: https://referidos.wispchat.net/easyaccess/EASY-00001

2. Prospecto recibe link:
   - Abre landing page dinámica
   - Ve paquetes configurables
   - Llena formulario de registro

3. Sistema de Referidos:
   - Guarda lead en BD
   - Envía notificación a admin ISP
   - Crea registro de referral

4. Admin ISP en WispChat:
   - Ve nuevo lead en dashboard
   - Contacta al prospecto
   - Convierte a cliente

5. Cuando prospecto paga:
   - WispChat registra pago
   - Calcula comisión
   - Acredita a cliente referidor
   - Actualiza sistema de referidos
```

---

## 🔐 FLUJOS DE AUTENTICACIÓN

### 1. Login de ISP (Admin)

```typescript
// Frontend: /login
const handleLogin = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-domain': getTenantHeader(),
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/admin');
  }
};
```

```typescript
// Backend: POST /api/auth/admin/login
export const adminLogin = async (req: TenantRequest, res: Response) => {
  const { email, password } = req.body;
  const tenantId = req.tenantId!;

  // 1. Buscar admin en BD
  const admin = await prisma.user.findFirst({
    where: {
      email,
      tenantId,
      role: 'ADMIN',
    },
  });

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas',
    });
  }

  // 2. Verificar password
  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas',
    });
  }

  // 3. Generar JWT
  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: 'admin',
      tenantId: admin.tenantId,
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: admin.id,
      email: admin.email,
      nombre: admin.nombre,
      role: 'admin',
    },
  });
};
```

### 2. Login de Cliente

```typescript
// Frontend: /cliente/login
const handleClientLogin = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/client/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-domain': getTenantHeader(),
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/cliente/dashboard');
  }
};
```

### 3. Registro de Cliente (desde Referido)

```typescript
// Frontend: /cliente/registro
const handleClientSignup = async (formData: SignupForm) => {
  // 1. Registrar en sistema de referidos
  const leadResponse = await fetch(
    'https://wispchat-referral-backend.onrender.com/api/leads',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-domain': getTenantHeader(),
      },
      body: JSON.stringify({
        ...formData,
        codigoReferido: getReferralCode(), // De URL params
      }),
    }
  );

  if (!leadResponse.ok) {
    throw new Error('Error registrando lead');
  }

  // 2. Registrar en WispChat principal
  const clientResponse = await fetch(`${API_URL}/api/auth/client/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-domain': getTenantHeader(),
    },
    body: JSON.stringify(formData),
  });

  const data = await clientResponse.json();
  
  if (data.success) {
    // Auto-login
    localStorage.setItem('token', data.token);
    router.push('/cliente/dashboard');
  }
};
```

---

## 💾 MODELOS DE DATOS

### Schema Principal (Prisma)

```prisma
// prisma/schema.prisma

model Tenant {
  id              String   @id @default(cuid())
  nombre          String
  domain          String   @unique  // "easyaccess", "isp2", etc.
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Configuración
  logo            String?
  primaryColor    String   @default("#3B82F6")
  contactEmail    String
  contactPhone    String
  
  // Relaciones
  users           User[]
  clients         Client[]
  payments        Payment[]
  settings        TenantSettings?
}

model User {
  id              String   @id @default(cuid())
  email           String
  password        String
  nombre          String
  role            Role     @default(ADMIN)
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  
  @@unique([email, tenantId])
}

enum Role {
  SUPER_ADMIN
  ADMIN
  SUPPORT
}

model Client {
  id                String   @id @default(cuid())
  email             String
  password          String
  nombre            String
  telefono          String
  direccion         String?
  codigoReferido    String   @unique  // EASY-00001
  estado            ClientStatus @default(ACTIVO)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  
  // Suscripción
  planId            String?
  plan              Plan?    @relation(fields: [planId], references: [id])
  fechaActivacion   DateTime?
  proximoPago       DateTime?
  
  // Relaciones
  payments          Payment[]
  referrals         Referral[] @relation("ClientReferrals")
  referredBy        Referral?  @relation("ReferredClient")
  
  @@unique([email, tenantId])
  @@index([codigoReferido])
}

enum ClientStatus {
  ACTIVO
  SUSPENDIDO
  CANCELADO
  PENDIENTE
}

model Plan {
  id              String   @id @default(cuid())
  nombre          String
  velocidad       String   // "50 Mbps"
  precio          Decimal
  descripcion     String?
  active          Boolean  @default(true)
  
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  
  clients         Client[]
}

model Payment {
  id              String   @id @default(cuid())
  monto           Decimal
  fecha           DateTime @default(now())
  metodo          String   // "tarjeta", "transferencia", "efectivo"
  concepto        String
  referencia      String?
  estado          PaymentStatus @default(PENDIENTE)
  
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  
  // Integración con WispHub
  wispHubId       String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum PaymentStatus {
  PENDIENTE
  COMPLETADO
  FALLIDO
  REEMBOLSADO
}

model Referral {
  id              String   @id @default(cuid())
  
  // Cliente que refiere
  clientId        String
  client          Client   @relation("ClientReferrals", fields: [clientId], references: [id])
  
  // Cliente referido
  referredClientId String?  @unique
  referredClient   Client?  @relation("ReferredClient", fields: [referredClientId], references: [id])
  
  // Datos del prospecto (antes de convertirse)
  nombre          String
  email           String
  telefono        String
  estado          ReferralStatus @default(PENDIENTE)
  
  // Comisiones
  comisionInstalacion Decimal?
  comisionMensual     Decimal?
  mesesPagados        Int      @default(0)
  totalComision       Decimal  @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([clientId])
}

enum ReferralStatus {
  PENDIENTE
  CONTACTADO
  CONVERTIDO
  RECHAZADO
}

model TenantSettings {
  id              String   @id @default(cuid())
  tenantId        String   @unique
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  
  // Comisiones de referidos
  referralEnabled Boolean  @default(true)
  installCommission Decimal @default(200)
  monthlyCommission Decimal @default(50)
  monthsToPay     Int      @default(6)
  
  // Configuración de notificaciones
  emailEnabled    Boolean  @default(true)
  whatsappEnabled Boolean  @default(false)
  
  // Otros
  maintenanceMode Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 📡 APIs PRINCIPALES

### Auth API

```typescript
POST /api/auth/admin/login
Body: { email, password }
Headers: { x-tenant-domain }
Response: { success, token, user }

POST /api/auth/client/login
Body: { email, password }
Headers: { x-tenant-domain }
Response: { success, token, user }

POST /api/auth/client/register
Body: { email, password, nombre, telefono, direccion }
Headers: { x-tenant-domain }
Response: { success, token, user }

POST /api/auth/refresh
Headers: { Authorization: Bearer <token> }
Response: { success, token }
```

### Client API

```typescript
GET /api/cliente/me
Headers: { Authorization, x-tenant-domain }
Response: { success, data: ClientProfile }

GET /api/cliente/facturas
Headers: { Authorization, x-tenant-domain }
Response: { success, data: Payment[] }

GET /api/cliente/referidos
Headers: { Authorization, x-tenant-domain }
Response: { success, data: Referral[] }

GET /api/cliente/comisiones
Headers: { Authorization, x-tenant-domain }
Response: { 
  success, 
  data: {
    total: number,
    porReferido: {
      nombre: string,
      comision: number,
      estado: string
    }[]
  }
}
```

### Admin API

```typescript
GET /api/admin/clientes
Headers: { Authorization, x-tenant-domain }
Query: { page, limit, search, estado }
Response: { success, data: Client[], total, page, pages }

POST /api/admin/clientes
Body: { nombre, email, telefono, planId }
Headers: { Authorization, x-tenant-domain }
Response: { success, data: Client }

PATCH /api/admin/clientes/:id
Body: Partial<Client>
Headers: { Authorization, x-tenant-domain }
Response: { success, data: Client }

DELETE /api/admin/clientes/:id
Headers: { Authorization, x-tenant-domain }
Response: { success, message }

GET /api/admin/referidos
Headers: { Authorization, x-tenant-domain }
Query: { page, limit, estado }
Response: { success, data: Referral[], total }

GET /api/admin/stats
Headers: { Authorization, x-tenant-domain }
Response: {
  success,
  data: {
    clientesActivos: number,
    ingresosMes: number,
    pagosPendientes: number,
    nuevosReferidos: number
  }
}
```

### Payments API

```typescript
POST /api/payments/create
Body: { clientId, monto, metodo, concepto }
Headers: { Authorization, x-tenant-domain }
Response: { success, data: Payment }

GET /api/payments/by-client/:clientId
Headers: { Authorization, x-tenant-domain }
Response: { success, data: Payment[] }

POST /api/payments/webhook/wisphub
Body: WispHubPayload
Headers: { x-webhook-signature }
Response: { success }
```

---

## 🚀 DEPLOYMENT

### Variables de Entorno

#### Backend (.env)
```bash
# Base de datos
DATABASE_URL="postgresql://user:password@host:5432/wispchat_main"

# JWT
JWT_SECRET="your-super-secret-key-here-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
NODE_ENV="production"
PORT=4000

# WispHub Integration
WISPHUB_API_URL="https://wisphub.io/api"
WISPHUB_API_KEY="your-wisphub-api-key"

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# WhatsApp (opcional)
WHATSAPP_API_TOKEN="your-whatsapp-business-api-token"

# Referral System
REFERRAL_API_URL="https://wispchat-referral-backend.onrender.com"
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL="https://wispchat-backend.onrender.com"
NEXT_PUBLIC_REFERRAL_URL="https://referidos.wispchat.net"
NEXT_PUBLIC_WISPHUB_URL="https://wisphub.io"
```

### Render Configuration

#### Backend Service
```yaml
name: wispchat-backend
type: web
env: node
region: virginia
plan: free
branch: main
buildCommand: npm install && npm run build
startCommand: npm start
envVars:
  - key: DATABASE_URL
    sync: false
  - key: NODE_ENV
    value: production
  - key: PORT
    value: 4000
```

#### Database
```yaml
name: wispchat-db
type: postgres
plan: free
region: virginia
version: 15
```

### Vercel Configuration (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://wispchat-backend.onrender.com/api/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://wispchat-backend.onrender.com"
  }
}
```

---

## 📞 SOPORTE Y MANTENIMIENTO

### Monitoreo

```typescript
// Backend: Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'WispChat API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Backend: Metrics
app.get('/metrics', authenticate, requireRole(['super_admin']), async (req, res) => {
  const metrics = {
    totalTenants: await prisma.tenant.count(),
    totalClients: await prisma.client.count(),
    totalPayments: await prisma.payment.count(),
    activeReferrals: await prisma.referral.count({ where: { estado: 'CONVERTIDO' }}),
  };
  res.json({ success: true, data: metrics });
});
```

### Logs

```typescript
// Backend: Logger utility
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

---

**📄 Documentación generada:** 5 de Diciembre de 2025  
**✅ Sistema en producción:** wispchat.net  
**🔗 Repositorio:** github.com/networkerpro20-oss/wispchat-referral-system
