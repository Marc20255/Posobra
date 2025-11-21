#!/bin/bash

# Script para preparar o projeto para deploy
# Uso: ./scripts/prepare-deploy.sh

echo "🚀 Preparando projeto para deploy..."
echo ""

# Verificar se está no diretório raiz
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

echo "✅ Verificando estrutura do projeto..."

# Verificar backend
if [ ! -d "backend" ]; then
    echo "❌ Pasta backend não encontrada"
    exit 1
fi

# Verificar frontend-web
if [ ! -d "frontend-web" ]; then
    echo "❌ Pasta frontend-web não encontrada"
    exit 1
fi

echo "✅ Estrutura OK"
echo ""

# Verificar variáveis de ambiente no backend
echo "📝 Verificando variáveis de ambiente necessárias..."
echo ""
echo "Backend precisa das seguintes variáveis:"
echo "  - DB_HOST"
echo "  - DB_PORT"
echo "  - DB_NAME"
echo "  - DB_USER"
echo "  - DB_PASS"
echo "  - JWT_SECRET"
echo "  - NODE_ENV=production"
echo "  - FRONTEND_URL"
echo ""
echo "Frontend precisa:"
echo "  - NEXT_PUBLIC_API_URL"
echo ""

# Verificar se há arquivo .env.example
if [ -f "backend/.env.example" ]; then
    echo "📄 Arquivo .env.example encontrado no backend"
else
    echo "⚠️  Criando .env.example no backend..."
    cat > backend/.env.example << EOF
PORT=3001
NODE_ENV=production
DB_HOST=seu-host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=sua-senha
JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-frontend.vercel.app
MOBILE_URL=exp://seu-app.expo.dev
EOF
fi

if [ -f "frontend-web/.env.example" ]; then
    echo "📄 Arquivo .env.example encontrado no frontend-web"
else
    echo "⚠️  Criando .env.example no frontend-web..."
    cat > frontend-web/.env.example << EOF
NEXT_PUBLIC_API_URL=https://sua-api.railway.app
EOF
fi

echo ""
echo "✅ Preparação concluída!"
echo ""
echo "📚 Próximos passos:"
echo "1. Leia o guia: GUIA_DEPLOY_COMPLETO.md"
echo "2. Ou use o guia rápido: DEPLOY_RAPIDO.md"
echo "3. Configure as variáveis de ambiente nos serviços"
echo ""
echo "🎉 Boa sorte com o deploy!"

