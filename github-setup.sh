#!/bin/bash

# Script para crear repositorio de GitHub y pushear código

echo "🚀 WispChat Referral System - GitHub Setup"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Paso 1: Crear repositorio en GitHub${NC}"
echo "1. Ve a: https://github.com/new"
echo "2. Repository name: wispchat-referral-system"
echo "3. Description: Sistema de referidos y comisiones para WispChat"
echo "4. Public o Private: Public (recomendado)"
echo "5. NO inicializar con README, .gitignore o license"
echo "6. Click 'Create repository'"
echo ""

read -p "¿Ya creaste el repositorio? (y/n): " created

if [ "$created" != "y" ]; then
    echo "Por favor crea el repositorio primero y vuelve a ejecutar este script"
    exit 1
fi

echo ""
read -p "Ingresa tu GitHub username: " github_user

echo ""
echo -e "${BLUE}Paso 2: Conectar repositorio local${NC}"

# Verificar si ya existe el remote
if git remote | grep -q "origin"; then
    echo "Remote 'origin' ya existe, removiendo..."
    git remote remove origin
fi

# Agregar nuevo remote
git remote add origin "https://github.com/$github_user/wispchat-referral-system.git"

echo -e "${GREEN}✓ Remote configurado${NC}"

echo ""
echo -e "${BLUE}Paso 3: Push a GitHub${NC}"

# Renombrar branch a main si es necesario
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "Renombrando branch a 'main'..."
    git branch -M main
fi

# Push
echo "Pushing código a GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Código pusheado exitosamente!${NC}"
    echo ""
    echo "🎉 Tu repositorio está en:"
    echo "https://github.com/$github_user/wispchat-referral-system"
    echo ""
    echo "📚 Próximos pasos:"
    echo "1. Deploy backend en Render: https://dashboard.render.com"
    echo "2. Deploy frontend en Vercel: https://vercel.com/new"
    echo "3. Seguir la guía: DEPLOYMENT_GUIDE.md"
else
    echo ""
    echo "❌ Error al pushear. Verifica tus credenciales de GitHub"
    echo "Puede que necesites configurar un Personal Access Token"
fi
