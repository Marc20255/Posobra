# 📖 Manual de Instalação - Sistema Pós Obra

Este manual fornece instruções detalhadas para instalar e executar o sistema localmente em sua máquina.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/
   - Verificar instalação: `node --version`
   - Verificar npm: `npm --version`

2. **PostgreSQL** (versão 12 ou superior)
   - Download: https://www.postgresql.org/download/
   - Ou use uma instância online gratuita (Supabase, Neon, etc.)
   - Verificar instalação: `psql --version`

3. **Git** (para clonar o repositório)
   - Download: https://git-scm.com/
   - Verificar instalação: `git --version`

## 🚀 Passo a Passo de Instalação

### 1. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd "Pós obra"
```

### 2. Configurar o Banco de Dados PostgreSQL

#### Opção A: PostgreSQL Local

1. Crie um banco de dados:
```bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE pos_obra;

# Saia do psql
\q
```

#### Opção B: PostgreSQL Online (Recomendado para testes rápidos)

Use um serviço gratuito:
- **Supabase**: https://supabase.com (gratuito)
- **Neon**: https://neon.tech (gratuito)

Anote as credenciais de conexão (host, port, database, user, password).

### 3. Configurar o Backend

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Crie o arquivo .env
cp .env.example .env
# OU crie manualmente um arquivo .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# JWT (Autenticação)
JWT_SECRET=seu_jwt_secret_aqui_use_uma_string_aleatoria_segura
JWT_EXPIRES_IN=7d

# Porta do Servidor
PORT=3001

# URLs (para desenvolvimento local)
FRONTEND_URL=http://localhost:3000
MOBILE_URL=http://localhost:19006

# Ambiente
NODE_ENV=development
```

**⚠️ IMPORTANTE**: 
- Substitua `sua_senha_aqui` pela senha do seu PostgreSQL
- Substitua `seu_jwt_secret_aqui_use_uma_string_aleatoria_segura` por uma string aleatória segura (ex: `abc123xyz789def456`)

### 4. Iniciar o Backend

```bash
# Ainda na pasta backend
npm run dev
```

O servidor deve iniciar na porta 3001. Você verá:
```
🚀 Servidor rodando na porta 3001
📱 Ambiente: development
```

**Mantenha este terminal aberto!**

### 5. Configurar o Frontend Web

Abra um **novo terminal** e execute:

```bash
# Volte para a raiz do projeto
cd ..

# Entre na pasta do frontend-web
cd frontend-web

# Instale as dependências
npm install

# Crie o arquivo .env.local
```

Crie o arquivo `.env.local` com:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 6. Iniciar o Frontend Web

```bash
# Ainda na pasta frontend-web
npm run dev
```

O frontend deve iniciar na porta 3000. Você verá:
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

**Mantenha este terminal aberto também!**

### 7. Acessar o Sistema

Abra seu navegador e acesse:
- **Frontend Web**: http://localhost:3000

## ✅ Verificação da Instalação

### Verificar se o Backend está funcionando:

1. Acesse: http://localhost:3001/health
2. Deve retornar: `{"status":"ok","timestamp":"...","environment":"development"}`

### Verificar se o Frontend está funcionando:

1. Acesse: http://localhost:3000
2. Deve carregar a página inicial do sistema

### Criar Primeiro Usuário:

1. Acesse: http://localhost:3000/register
2. Crie uma conta (Cliente, Técnico ou Construtora)
3. Faça login em: http://localhost:3000/login

## 🔧 Solução de Problemas Comuns

### Erro: "Cannot connect to database"

**Solução:**
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `psql -U postgres -d pos_obra`

### Erro: "Port 3001 already in use"

**Solução:**
```bash
# Encontre o processo usando a porta
lsof -ti:3001

# Mate o processo (substitua PID pelo número retornado)
kill -9 PID

# Ou use:
killall -9 node
```

### Erro: "Module not found"

**Solução:**
```bash
# Delete node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro: "JWT_SECRET is required"

**Solução:**
- Certifique-se de que o arquivo `.env` existe na pasta `backend`
- Verifique se `JWT_SECRET` está definido no `.env`
- Reinicie o servidor backend

### Erro no Frontend: "Network Error" ou "Cannot connect"

**Solução:**
- Verifique se o backend está rodando na porta 3001
- Confirme que `NEXT_PUBLIC_API_URL` está correto no `.env.local`
- Verifique se não há bloqueio de CORS (o backend já está configurado)

## 📁 Estrutura de Arquivos Importantes

```
Pós obra/
├── backend/
│   ├── .env                    # Configurações do backend (CRIAR)
│   ├── package.json
│   └── src/
│       └── server.js           # Servidor principal
│
├── frontend-web/
│   ├── .env.local              # Configurações do frontend (CRIAR)
│   ├── package.json
│   └── src/
│       └── app/
│           └── page.tsx        # Página inicial
│
└── MANUAL_INSTALACAO.md        # Este arquivo
```

## 🎯 Comandos Rápidos

### Iniciar tudo (Backend + Frontend):

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend-web
npm run dev
```

### Parar os servidores:

- Pressione `Ctrl + C` em cada terminal

### Limpar e reinstalar:

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend-web
rm -rf node_modules package-lock.json .next
npm install
```

## 📝 Notas Importantes

1. **Banco de Dados**: O sistema cria automaticamente as tabelas na primeira execução
2. **Portas**: 
   - Backend: 3001
   - Frontend: 3000
   - Certifique-se de que essas portas estão livres
3. **Ambiente**: Este manual é para desenvolvimento local. Para produção, veja `DEPLOY.md`
4. **Segurança**: Nunca commite arquivos `.env` ou `.env.local` no Git

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique os logs no terminal onde o servidor está rodando
2. Confirme que todos os pré-requisitos estão instalados
3. Verifique se as portas 3000 e 3001 estão livres
4. Certifique-se de que o PostgreSQL está acessível

## ✅ Checklist de Instalação

- [ ] Node.js instalado (versão 18+)
- [ ] PostgreSQL instalado/configurado
- [ ] Repositório clonado
- [ ] Dependências do backend instaladas (`npm install` na pasta backend)
- [ ] Arquivo `.env` criado no backend com configurações corretas
- [ ] Backend rodando na porta 3001
- [ ] Dependências do frontend instaladas (`npm install` na pasta frontend-web)
- [ ] Arquivo `.env.local` criado no frontend-web
- [ ] Frontend rodando na porta 3000
- [ ] Sistema acessível em http://localhost:3000
- [ ] Primeiro usuário criado com sucesso

---

**Desenvolvido para o QualiApps Hackathon** 🚀

