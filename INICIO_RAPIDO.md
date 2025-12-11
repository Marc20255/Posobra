# ⚡ Início Rápido - Rodar Sistema Localmente

## 🚀 3 Passos Simples

### 1️⃣ Verificar Pré-requisitos

```bash
node --version  # Deve ser 18 ou superior
npm --version   # Deve estar instalado
```

### 2️⃣ Instalar Dependências (se ainda não instalou)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend-web
npm install
```

### 3️⃣ Iniciar os Servidores

**Abra 2 terminais:**

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

### 4️⃣ Acessar

Abra seu navegador em: **http://localhost:3000**

---

## ✅ Verificar se Está Funcionando

- **Backend**: http://localhost:3001/health
- **Frontend**: http://localhost:3000

---

## ⚙️ Configuração de Banco de Dados

### Opção 1: PostgreSQL Local

Edite `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=postgres
DB_PASS=sua_senha
```

### Opção 2: Supabase (Recomendado)

1. Crie conta em: https://supabase.com
2. Crie um projeto
3. Pegue as credenciais em **Settings** → **Database**
4. Edite `backend/.env`:
```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=sua_senha_supabase
```

---

## 🐛 Problemas Comuns

### Porta 3001 já em uso
```bash
killall -9 node
```

### Erro de conexão com banco
- Verifique se PostgreSQL está rodando
- Confirme credenciais no `.env`

### Frontend não conecta ao backend
- Verifique se backend está rodando
- Confirme `NEXT_PUBLIC_API_URL=http://localhost:3001/api` no `.env.local`

---

## 📚 Documentação Completa

Veja **[RODAR_LOCAL.md](RODAR_LOCAL.md)** para guia detalhado.

