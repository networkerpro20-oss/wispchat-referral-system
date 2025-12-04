#!/bin/bash

API_URL="https://wispchat-referral-backend.onrender.com/api"

echo "=================================="
echo "Insertando datos de prueba..."
echo "=================================="
echo ""

# Crear lead de prueba vía API
echo "1. Registrando lead de prueba..."
curl -X POST "$API_URL/lead/register" \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "EASY-00001",
    "nombre": "Pedro González",
    "email": "pedro@test.com",
    "telefono": "5551112233",
    "ciudad": "Ciudad de México",
    "colonia": "Roma Norte",
    "codigoPostal": "06700",
    "calle": "Álvaro Obregón",
    "numeroExterior": "123",
    "numeroInterior": "4B",
    "referencias": "Entre Orizaba y Jalapa",
    "plan": "Hogar"
  }' | jq .

echo ""
echo "=================================="
echo "Datos de prueba insertados"
echo "=================================="
