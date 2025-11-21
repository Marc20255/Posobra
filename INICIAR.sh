#!/bin/bash

# Script para iniciar o projeto Pós Obra
# Uso: ./INICIAR.sh

echo "🚀 Iniciando projeto Pós Obra..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado!${NC}"
    echo "Instale em: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"

# Verificar se PostgreSQL está rodando
if command -v pg_isready &> /dev/null; then
    if pg_isready -q; then
        echo -e "${GREEN}✅ PostgreSQL está rodando${NC}"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL não está rodando${NC}"
        echo "Inicie o PostgreSQL antes de continuar"
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL não encontrado no PATH${NC}"
fi

# Verificar se banco existe
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw pos_obra; then
    echo -e "${GREEN}✅ Banco de dados 'pos_obra' existe${NC}"
else
    echo -e "${YELLOW}⚠️  Criando banco de dados 'pos_obra'...${NC}"
    createdb pos_obra 2>/dev/null || echo -e "${RED}❌ Erro ao criar banco. Crie manualmente: createdb pos_obra${NC}"
fi

echo ""
echo "📦 Verificando dependências..."

# Backend
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependências do backend...${NC}"
    cd backend && npm install && cd ..
fi

# Frontend
if [ ! -d "frontend-web/node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependências do frontend...${NC}"
    cd frontend-web && npm install && cd ..
fi

echo ""
echo -e "${GREEN}✅ Tudo pronto!${NC}"
echo ""
echo "Para iniciar os servidores:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend-web && npm run dev"
echo ""
echo "Depois acesse: http://localhost:3000"
echo ""

