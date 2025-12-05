#!/bin/bash

# Script para probar la autenticación SSO entre WispChat y Referidos

echo "==================================="
echo "PRUEBA SSO - WispChat → Referidos"
echo "==================================="
echo ""

# 1. Login en WispChat
echo "1️⃣  Haciendo login en WispChat..."
RESPONSE=$(curl -s -X POST https://wispchat-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: wispchat.net" \
  -d '{
    "email": "ventas@easyaccessnet.com",
    "password": "Proyecto2025$"
  }')

echo "Respuesta: $RESPONSE"
echo ""

TOKEN=$(echo $RESPONSE | jq -r '.data.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener token"
  echo "Verifica las credenciales o que el usuario exista en WispChat"
  exit 1
fi

echo "✅ Token obtenido exitosamente"
echo "Token: ${TOKEN:0:50}..."
echo ""

# 2. Decodificar el JWT para ver el contenido
echo "2️⃣  Decodificando JWT..."
PAYLOAD=$(echo $TOKEN | cut -d. -f2 | base64 -d 2>/dev/null)
echo "Payload: $PAYLOAD"
echo ""

# 3. Probar acceso al admin de referidos
echo "3️⃣  Probando acceso a /api/admin/dashboard en Referidos..."
DASH_RESPONSE=$(curl -s https://wispchat-referral-backend.onrender.com/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Respuesta: $DASH_RESPONSE"
echo ""

# 4. Verificar resultado
if echo $DASH_RESPONSE | jq -e '.success == true' > /dev/null 2>&1; then
  echo "✅ ¡SSO funcionando correctamente!"
  echo ""
  echo "Métricas del dashboard:"
  echo $DASH_RESPONSE | jq '.data'
else
  echo "❌ Error en SSO"
  echo "Verifica:"
  echo "  - WISPCHAT_JWT_SECRET en Render debe ser: your-super-secret-jwt-key-change-in-production"
  echo "  - El usuario debe tener rol 'admin' en WispChat"
  echo "  - El backend de referidos debe estar ejecutándose"
fi

echo ""
echo "==================================="
echo "Fin de la prueba"
echo "==================================="
