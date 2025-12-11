#!/bin/bash

# Script para iniciar o sistema Pós Obra localmente
# Uso: ./scripts/iniciar-local.sh

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório raiz do projeto
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo -e "${BLUE}🚀 Iniciando Sistema Pós Obra Localmente${NC}"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado!${NC}"
    echo "Instale em: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"
echo -e "${GREEN}✅ npm encontrado: $(npm --version)${NC}"
echo ""

# Verificar dependências do backend
echo -e "${YELLOW}📦 Verificando dependências do backend...${NC}"
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependências do backend...${NC}"
    cd backend
    npm install
    cd ..
else
    echo -e "${GREEN}✅ Dependências do backend já instaladas${NC}"
fi

# Verificar dependências do frontend
echo -e "${YELLOW}📦 Verificando dependências do frontend...${NC}"
if [ ! -d "frontend-web/node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependências do frontend...${NC}"
    cd frontend-web
    npm install
    cd ..
else
    echo -e "${GREEN}✅ Dependências do frontend já instaladas${NC}"
fi

echo ""

# Verificar arquivo .env do backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env do backend não encontrado${NC}"
    echo -e "${YELLOW}📝 Criando arquivo .env com configurações padrão...${NC}"
    cat > backend/.env << EOF
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=postgres
DB_PASS=postgres

# JWT
JWT_SECRET=qualiapps-hackquali-2025-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Servidor
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
EOF
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edite backend/.env com suas credenciais de banco de dados!${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env do backend encontrado${NC}"
fi

# Verificar arquivo .env.local do frontend
if [ ! -f "frontend-web/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env.local do frontend não encontrado${NC}"
    echo -e "${YELLOW}📝 Criando arquivo .env.local...${NC}"
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > frontend-web/.env.local
    echo -e "${GREEN}✅ Arquivo .env.local criado${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env.local do frontend encontrado${NC}"
fi

echo ""
echo -e "${GREEN}✅ Tudo pronto!${NC}"
echo ""
echo -e "${BLUE}📋 Para iniciar o sistema, abra 2 terminais:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
echo "  cd frontend-web"
echo "  npm run dev"
echo ""
echo -e "${BLUE}Depois acesse: http://localhost:3000${NC}"
echo ""

