# Guía de Inicio Rápido - WispChat Referral System

## 🚀 Comenzando en 5 minutos

### Paso 1: Requisitos
- Node.js 18 o superior
- npm o yarn
- Terminal o línea de comandos

### Paso 2: Instalación

```bash
# Clonar el repositorio
git clone https://github.com/networkerpro20-oss/wispchat-referral-system.git
cd wispchat-referral-system

# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env
```

### Paso 3: Iniciar el servidor

```bash
npm start
```

Verás:
```
🚀 Server running on port 3000
📝 Environment: development
🏢 Company: Easy Access Newtelecom
```

### Paso 4: Probar el API

#### Opción A: Usar el script de demostración
En otra terminal:
```bash
./demo.sh
```

#### Opción B: Probar manualmente con curl

**Crear primer usuario:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+502 1234-5678"
  }'
```

Respuesta:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "Juan Pérez",
    "referralCode": "EA-ABC123",
    "totalRewards": 0,
    ...
  }
}
```

**Crear segundo usuario con código de referido:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María López",
    "email": "maria@example.com",
    "phone": "+502 8765-4321",
    "referralCode": "EA-ABC123"
  }'
```

¡Juan recibirá automáticamente 100 puntos! 🎉

**Ver estadísticas:**
```bash
curl http://localhost:3000/api/referrals/stats
```

### Paso 5: Explorar el API

Visita:
- API Principal: http://localhost:3000/
- Documentación completa: Ver `API_DOCS.md`

## 🎯 Conceptos Clave

### Código de Referido
- Cada usuario recibe un código único (formato: EA-XXXXXX)
- Es generado automáticamente al registrarse
- Ejemplo: EA-7BDFBE

### Flujo de Referido
1. Usuario A se registra → Recibe código EA-ABC123
2. Usuario A comparte su código
3. Usuario B se registra con código EA-ABC123
4. Usuario A recibe 100 puntos automáticamente

### Recompensas
- Cantidad por referido: 100 puntos (configurable en .env)
- Estado: Automáticamente aprobadas
- Acumulativas: Sin límite

## ⚙️ Configuración Básica

Edita `.env` para personalizar:

```bash
# Puntos por referido
REWARD_PER_REFERRAL=100

# Máximo de referidos por usuario
MAX_REFERRALS_PER_USER=50

# Nombre de la empresa
COMPANY_NAME=Easy Access Newtelecom
```

## 📱 Usar con Postman

1. Importa la colección desde el endpoint raíz
2. Configura base URL: http://localhost:3000
3. Comienza con POST /api/users

## 🐳 Usar con Docker

```bash
# Construir imagen
docker build -t wispchat-referral .

# Ejecutar contenedor
docker run -p 3000:3000 wispchat-referral

# O usar docker-compose
docker-compose up
```

## 🔧 Comandos Útiles

```bash
# Desarrollo con auto-reload
npm run dev

# Iniciar servidor
npm start

# Ejecutar tests (cuando estén disponibles)
npm test

# Ver todos los usuarios
curl http://localhost:3000/api/users

# Ver todas las recompensas
curl http://localhost:3000/api/rewards

# Ver todos los referidos
curl http://localhost:3000/api/referrals
```

## 💡 Consejos

1. **Puerto ocupado?** Cambia el puerto en `.env`: `PORT=3001`
2. **Datos de prueba?** Usa el script `demo.sh` para crear datos de ejemplo
3. **Reiniciar datos?** Reinicia el servidor (datos en memoria se borran)
4. **¿Problemas?** Revisa que todas las dependencias estén instaladas

## 📚 Siguiente Paso

Lee la documentación completa:
- `README.md` - Guía completa
- `API_DOCS.md` - Documentación del API
- `CONTRIBUTING.md` - Guía para contribuir

## 🆘 Ayuda

¿Problemas? Abre un issue en GitHub o contacta al equipo de soporte.

---

¡Listo! Ya tienes tu sistema de referidos funcionando 🎉
