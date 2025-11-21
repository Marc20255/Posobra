#!/bin/bash

# Script para iniciar o servidor backend
cd "$(dirname "$0")"

echo "🚀 Iniciando servidor backend..."
echo "📁 Diretório: $(pwd)"
echo "🔧 Verificando dependências..."

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
  echo "⚠️  Arquivo .env não encontrado. Criando..."
  cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=qualiapps-hackquali-2025-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
EOF
fi

echo "✅ Iniciando servidor na porta 3001..."
npm run dev

