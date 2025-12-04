#!/bin/bash

# Script para verificar el estado del deploy en Render
# Uso: ./check-deploy.sh

BACKEND_URL="https://wispchat-referral-backend.onrender.com"
MAX_RETRIES=30
RETRY_INTERVAL=10

echo "🔍 Verificando deploy de wispchat-referral-backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Función para verificar health
check_health() {
  local response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health" 2>/dev/null)
  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "200" ]; then
    echo "✅ Backend está ONLINE"
    echo "   Response: $body"
    return 0
  else
    echo "⏳ Backend aún no responde (HTTP $http_code)"
    return 1
  fi
}

# Intentar conectar múltiples veces
for i in $(seq 1 $MAX_RETRIES); do
  echo "[$i/$MAX_RETRIES] Intento de conexión..."
  
  if check_health; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 Deploy completado exitosamente!"
    echo ""
    echo "📊 Verificando endpoints adicionales:"
    echo ""
    
    # Dashboard
    echo -n "   Dashboard: "
    dashboard=$(curl -s "$BACKEND_URL/api/admin/dashboard" | jq -r '.success' 2>/dev/null)
    if [ "$dashboard" = "true" ]; then
      echo "✅ OK"
    else
      echo "⚠️  No responde correctamente"
    fi
    
    # Settings
    echo -n "   Settings:  "
    settings=$(curl -s "$BACKEND_URL/api/settings" | jq -r '.success' 2>/dev/null)
    if [ "$settings" = "true" ]; then
      echo "✅ OK"
    else
      echo "⚠️  No responde correctamente"
    fi
    
    echo ""
    echo "🌐 URLs:"
    echo "   Backend:  $BACKEND_URL"
    echo "   Health:   $BACKEND_URL/health"
    echo "   Dashboard: $BACKEND_URL/api/admin/dashboard"
    echo ""
    exit 0
  fi
  
  if [ $i -lt $MAX_RETRIES ]; then
    echo "   Esperando ${RETRY_INTERVAL}s antes del siguiente intento..."
    echo ""
    sleep $RETRY_INTERVAL
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ Deploy no completado después de $((MAX_RETRIES * RETRY_INTERVAL))s"
echo ""
echo "Posibles causas:"
echo "  1. Build aún en progreso (espera más tiempo)"
echo "  2. Error de compilación (revisa Render Dashboard)"
echo "  3. Error en configuración (verifica render.yaml)"
echo ""
echo "Para revisar logs:"
echo "  1. Ve a: https://dashboard.render.com"
echo "  2. Selecciona: wispchat-referral-backend"
echo "  3. Haz clic en: Logs"
echo ""
exit 1
