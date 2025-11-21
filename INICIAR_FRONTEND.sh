#!/bin/bash

# Script para iniciar APENAS o frontend
cd "$(dirname "$0")/frontend-web"

echo "🚀 Iniciando Frontend..."
echo ""

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
fi

# Limpar cache se necessário
if [ -d .next ]; then
    echo "🧹 Limpando cache..."
    rm -rf .next
fi

# Iniciar servidor
npm run dev

