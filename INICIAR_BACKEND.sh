#!/bin/bash

# Script para iniciar APENAS o backend
cd "$(dirname "$0")/backend"

echo "🚀 Iniciando Backend..."
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cat > .env << 'EOF'
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=qualiapps-hackquali-2025-secret-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
MOBILE_URL=http://localhost:19006
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
EOF
fi

# Criar pastas de upload
mkdir -p uploads/photos uploads/documents uploads/general

# Iniciar servidor
npm run dev

