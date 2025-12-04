#!/bin/bash

echo "🔍 Verificando deployment del Sistema de Referidos Easy Access"
echo "================================================================"
echo ""

API_URL="https://wispchat-referral-backend.onrender.com"

# 1. Health Check
echo "1️⃣  Health Check..."
HEALTH=$(curl -s "$API_URL/health")
echo "$HEALTH" | jq '.'
MESSAGE=$(echo "$HEALTH" | jq -r '.message')

if [[ "$MESSAGE" == "Easy Access Referral System API" ]]; then
    echo "✅ Backend actualizado correctamente"
else
    echo "⚠️  Backend todavía usa código antiguo: $MESSAGE"
    echo "   Esperando deployment..."
fi
echo ""

# 2. Verificar nueva arquitectura - Dashboard Admin
echo "2️⃣  Probando endpoint de admin (nueva arquitectura)..."
DASHBOARD=$(curl -s "$API_URL/api/admin/dashboard")
if echo "$DASHBOARD" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Endpoint /api/admin/dashboard existe"
    echo "$DASHBOARD" | jq '.'
else
    echo "❌ Endpoint no encontrado o error:"
    echo "$DASHBOARD"
fi
echo ""

# 3. Verificar endpoint de clientes
echo "3️⃣  Probando endpoint de clientes..."
CLIENTS_TEST=$(curl -s "$API_URL/api/clients/TEST001/summary")
if echo "$CLIENTS_TEST" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Endpoint /api/clients/:id/summary responde"
else
    echo "⚠️  Cliente de prueba no existe (esperado si no hay datos)"
    echo "$CLIENTS_TEST" | jq -r '.message // .'
fi
echo ""

# 4. Verificar endpoint público de leads
echo "4️⃣  Verificando estructura de endpoint público /api/leads/register..."
LEAD_TEST=$(curl -s -X POST "$API_URL/api/leads/register" \
    -H "Content-Type: application/json" \
    -d '{"nombre":"Test"}')

if echo "$LEAD_TEST" | jq -e '.message' > /dev/null 2>&1; then
    echo "✅ Endpoint /api/leads/register existe y responde"
    echo "$LEAD_TEST" | jq '.'
else
    echo "❌ Error en endpoint:"
    echo "$LEAD_TEST"
fi
echo ""

# 5. Resumen
echo "================================================================"
echo "📊 RESUMEN"
echo "================================================================"
if [[ "$MESSAGE" == "Easy Access Referral System API" ]]; then
    echo "✅ Backend desplegado con nueva arquitectura"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Configurar variables de entorno en Render"
    echo "   2. Ejecutar: npm run sync:clients"
    echo "   3. Probar registro de lead con código real"
else
    echo "⏳ Deployment en progreso..."
    echo "   Ejecuta este script nuevamente en unos minutos"
fi
