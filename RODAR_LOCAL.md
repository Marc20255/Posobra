# 🚀 Como Rodar o Sistema na Sua Máquina

Guia completo passo a passo para rodar o sistema Pós Obra localmente.

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Verificar: `node --version`
   - Download: https://nodejs.org/

2. **npm** (vem com Node.js)
   - Verificar: `npm --version`

3. **PostgreSQL** (opcional - pode usar Supabase online)
   - Verificar: `psql --version`
   - Download: https://www.postgresql.org/download/
   - **OU** use Supabase gratuito: https://supabase.com

---

## ⚡ Início Rápido (3 passos)

### 1️⃣ Instalar Dependências

```bash
# No diretório raiz do projeto
cd "/Users/mac/Pós obra"

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend-web
npm install
```

### 2️⃣ Configurar Variáveis de Ambiente

#### Backend - Criar arquivo `.env`

```bash
cd backend
```

Crie um arquivo `.env` com o seguinte conteúdo:

```env
# Banco de Dados (use localhost ou Supabase)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=postgres
DB_PASS=sua_senha_postgres

# OU use Supabase (recomendado para testes rápidos)
# DB_HOST=db.xxxxx.supabase.co
# DB_PORT=5432
# DB_NAME=postgres
# DB_USER=postgres
# DB_PASS=sua_senha_supabase

# JWT (Autenticação)
JWT_SECRET=qualiapps-hackquali-2025-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Servidor
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### Frontend - Criar arquivo `.env.local`

```bash
cd ../frontend-web
```

Crie um arquivo `.env.local` com:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3️⃣ Iniciar os Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend-web
npm run dev
```

### 4️⃣ Acessar o Sistema

Abra seu navegador em: **http://localhost:3000**

---

## 🔧 Configuração Detalhada

### Opção A: PostgreSQL Local

1. **Instalar PostgreSQL** (se ainda não tiver)
   - macOS: `brew install postgresql@14`
   - Linux: `sudo apt-get install postgresql`
   - Windows: Download do site oficial

2. **Iniciar PostgreSQL**
   ```bash
   # macOS
   brew services start postgresql@14
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Criar banco de dados**
   ```bash
   psql -U postgres
   CREATE DATABASE pos_obra;
   \q
   ```

4. **Configurar `.env` do backend:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pos_obra
   DB_USER=postgres
   DB_PASS=sua_senha_aqui
   ```

### Opção B: Supabase (Recomendado - Mais Fácil)

1. **Criar conta no Supabase**: https://supabase.com

2. **Criar novo projeto**

3. **Pegar credenciais de conexão:**
   - Vá em **Settings** → **Database**
   - Copie:
     - Host: `db.xxxxx.supabase.co`
     - Port: `5432`
     - Database: `postgres`
     - User: `postgres`
     - Password: (sua senha)

4. **Configurar `.env` do backend:**
   ```env
   DB_HOST=db.xxxxx.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASS=sua_senha_supabase
   ```

---

## ✅ Verificar se Está Funcionando

### Backend
Acesse: http://localhost:3001/health

Deve retornar:
```json
{"status":"ok","timestamp":"...","environment":"development"}
```

### Frontend
Acesse: http://localhost:3000

Deve carregar a página inicial do sistema.

---

## 🐛 Solução de Problemas

### Erro: "Cannot connect to database"

**Solução:**
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão:
  ```bash
  psql -h localhost -U postgres -d pos_obra
  ```

### Erro: "Port 3001 already in use"

**Solução:**
```bash
# Encontrar processo usando a porta
lsof -ti:3001

# Matar o processo (substitua PID pelo número)
kill -9 PID

# Ou matar todos os processos Node
killall -9 node
```

### Erro: "Module not found"

**Solução:**
```bash
# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro no Frontend: "Network Error"

**Solução:**
- Verifique se o backend está rodando na porta 3001
- Confirme que `NEXT_PUBLIC_API_URL` está correto no `.env.local`
- Reinicie ambos os servidores

---

## 📝 Comandos Úteis

### Parar os servidores
Pressione `Ctrl + C` em cada terminal

### Limpar e reinstalar tudo
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend-web
rm -rf node_modules package-lock.json .next
npm install
```

### Verificar versões
```bash
node --version
npm --version
psql --version
```

---

## 🎯 Checklist de Instalação

- [ ] Node.js instalado (versão 18+)
- [ ] Dependências do backend instaladas (`npm install` na pasta backend)
- [ ] Arquivo `.env` criado no backend
- [ ] Banco de dados configurado (PostgreSQL local ou Supabase)
- [ ] Backend rodando na porta 3001
- [ ] Dependências do frontend instaladas (`npm install` na pasta frontend-web)
- [ ] Arquivo `.env.local` criado no frontend-web
- [ ] Frontend rodando na porta 3000
- [ ] Sistema acessível em http://localhost:3000
- [ ] Health check do backend funcionando (http://localhost:3001/health)

---

## 🚀 Próximos Passos

Após rodar localmente:

1. **Criar primeiro usuário**: Acesse http://localhost:3000/register
2. **Fazer login**: http://localhost:3000/login
3. **Explorar o sistema**: Dashboard, serviços, técnicos, etc.

---

## 📚 Documentação Adicional

- **[MANUAL_INSTALACAO.md](MANUAL_INSTALACAO.md)** - Guia completo detalhado
- **[README.md](README.md)** - Visão geral do projeto
- **[DEPLOY.md](DEPLOY.md)** - Como fazer deploy online

---

**Desenvolvido com ❤️ para facilitar a gestão de assistência técnica pós-obra**

