# WispChat Referral System - Easy Access Newtelecom

Sistema de referidos y recompensas para Easy Access Newtelecom. Este sistema permite a los usuarios referir nuevos clientes y ganar recompensas por cada referido exitoso.

## 🎯 Características

- ✅ Registro de usuarios con código de referido único
- ✅ Sistema de referidos con seguimiento automático
- ✅ Gestión de recompensas por referidos
- ✅ API RESTful completa
- ✅ Sistema de puntos configurable
- ✅ Estadísticas de referidos en tiempo real

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 18.0.0
- npm o yarn

### Pasos de instalación

1. Clone el repositorio:
```bash
git clone https://github.com/networkerpro20-oss/wispchat-referral-system.git
cd wispchat-referral-system
```

2. Instale las dependencias:
```bash
npm install
```

3. Configure las variables de entorno:
```bash
cp .env.example .env
# Edite .env con sus configuraciones
```

4. Inicie el servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📖 Uso de la API

### Endpoints Principales

#### Usuarios

**Crear un nuevo usuario**
```bash
POST /api/users
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+502 1234-5678",
  "referralCode": "EA-ABC123"  // Opcional
}
```

**Obtener todos los usuarios**
```bash
GET /api/users
```

**Obtener usuario por ID**
```bash
GET /api/users/:id
```

**Obtener usuario por código de referido**
```bash
GET /api/users/referral-code/:code
```

#### Referidos

**Obtener todos los referidos**
```bash
GET /api/referrals
```

**Obtener referidos de un usuario**
```bash
GET /api/referrals/user/:userId
```

**Obtener estadísticas de referidos**
```bash
GET /api/referrals/stats
```

#### Recompensas

**Obtener todas las recompensas**
```bash
GET /api/rewards
```

**Obtener recompensas de un usuario**
```bash
GET /api/rewards/user/:userId
```

**Redimir una recompensa**
```bash
POST /api/rewards/:id/redeem
```

## 💡 Ejemplos de Uso

### Demostración Rápida

Ejecute el script de demostración para ver el sistema en acción:

```bash
# Terminal 1: Iniciar el servidor
npm start

# Terminal 2: Ejecutar la demostración
./demo.sh
```

El script de demostración creará usuarios, simulará referidos y mostrará estadísticas en tiempo real.

### Ejemplo 1: Registrar un nuevo usuario

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "phone": "+502 9876-5432"
  }'
```

Respuesta:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-here",
    "name": "María García",
    "email": "maria@example.com",
    "phone": "+502 9876-5432",
    "referralCode": "EA-X7Y2K9",
    "totalRewards": 0,
    "referralCount": 0,
    "createdAt": "2025-12-04T03:00:00.000Z",
    "isActive": true
  }
}
```

### Ejemplo 2: Registrar usuario con código de referido

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos López",
    "email": "carlos@example.com",
    "phone": "+502 5555-1234",
    "referralCode": "EA-X7Y2K9"
  }'
```

Cuando un usuario se registra con un código de referido:
- Se crea automáticamente el registro de referido
- El usuario que refirió recibe 100 puntos (configurable)
- Se incrementa el contador de referidos del referidor
- Se crea un registro de recompensa aprobado

### Ejemplo 3: Ver estadísticas

```bash
curl http://localhost:3000/api/referrals/stats
```

Respuesta:
```json
{
  "totalUsers": 15,
  "totalReferrals": 8,
  "completedReferrals": 8,
  "totalRewards": 800
}
```

## ⚙️ Configuración

El sistema se configura a través del archivo `.env`:

```bash
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de recompensas
REWARD_PER_REFERRAL=100        # Puntos por referido
REWARD_CURRENCY=points          # Tipo de moneda
MAX_REFERRALS_PER_USER=50      # Máximo de referidos por usuario

# Información de la empresa
COMPANY_NAME=Easy Access Newtelecom
```

## 🏗️ Estructura del Proyecto

```
wispchat-referral-system/
├── src/
│   ├── controllers/        # Controladores de la API
│   │   ├── user.controller.js
│   │   ├── referral.controller.js
│   │   └── reward.controller.js
│   ├── models/            # Modelos de datos
│   │   ├── User.js
│   │   ├── Referral.js
│   │   └── Reward.js
│   ├── routes/            # Definición de rutas
│   │   ├── user.routes.js
│   │   ├── referral.routes.js
│   │   └── reward.routes.js
│   ├── utils/             # Utilidades
│   │   └── database.js    # Base de datos en memoria
│   └── server.js          # Punto de entrada
├── .env.example           # Ejemplo de configuración
├── .gitignore
├── package.json
└── README.md
```

## 📊 Modelos de Datos

### Usuario (User)
- `id`: UUID único
- `name`: Nombre completo
- `email`: Correo electrónico
- `phone`: Número de teléfono
- `referralCode`: Código único de referido (EA-XXXXXX)
- `referredBy`: ID del usuario que lo refirió (opcional)
- `totalRewards`: Total de puntos acumulados
- `referralCount`: Cantidad de personas referidas
- `createdAt`: Fecha de creación
- `isActive`: Estado del usuario

### Referido (Referral)
- `id`: UUID único
- `referrerId`: ID del usuario que refirió
- `referredUserId`: ID del usuario referido
- `status`: Estado (pending, completed, cancelled)
- `rewardAmount`: Cantidad de puntos otorgados
- `createdAt`: Fecha de creación
- `completedAt`: Fecha de completación

### Recompensa (Reward)
- `id`: UUID único
- `userId`: ID del usuario
- `amount`: Cantidad de puntos
- `type`: Tipo (referral, bonus, promotion)
- `description`: Descripción
- `status`: Estado (pending, approved, redeemed)
- `createdAt`: Fecha de creación
- `redeemedAt`: Fecha de redención

## 🔄 Flujo de Referidos

1. **Usuario A** se registra y recibe su código de referido único (ej: EA-ABC123)
2. **Usuario A** comparte su código con **Usuario B**
3. **Usuario B** se registra usando el código EA-ABC123
4. El sistema automáticamente:
   - Crea el registro del **Usuario B**
   - Vincula a **Usuario B** con **Usuario A**
   - Crea un registro de referido
   - Otorga 100 puntos a **Usuario A**
   - Incrementa el contador de referidos de **Usuario A**
   - Crea un registro de recompensa aprobado

## 🚧 Próximas Características

- [ ] Integración con base de datos (PostgreSQL/MongoDB)
- [ ] Sistema de autenticación JWT
- [ ] Panel de administración
- [ ] Notificaciones por email/SMS
- [ ] Niveles de recompensas
- [ ] Sistema de redención de puntos
- [ ] Reportes y analytics avanzados
- [ ] API webhooks
- [ ] Límites de referidos por período
- [ ] Validación de referidos fraudulentos

## 🛡️ Seguridad

- Validación de entrada en todos los endpoints
- Uso de Helmet para headers de seguridad HTTP
- CORS habilitado y configurable
- Manejo de errores centralizado

## 📝 Licencia

MIT

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Cree una rama para su feature (`git checkout -b feature/AmazingFeature`)
3. Commit sus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abra un Pull Request

## 📞 Soporte

Para soporte, contacte a Easy Access Newtelecom o abra un issue en GitHub.

---

Desarrollado con ❤️ para Easy Access Newtelecom