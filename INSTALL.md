# Guia de Instalação

## 📋 Pré-requisitos

- Node.js 18+ e npm
- PostgreSQL 14+
- Git
- Para mobile: Expo CLI

## 🚀 Instalação Local

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd "Pós obra"
```

### 2. Configure o Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend`:
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
MOBILE_URL=http://localhost:19006
```

### 3. Configure o Banco de Dados

```bash
# Crie o banco de dados
createdb pos_obra

# Ou usando psql
psql -U postgres
CREATE DATABASE pos_obra;
\q
```

### 4. Inicie o Backend

```bash
cd backend
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### 5. Configure o Frontend Web

```bash
cd frontend-web
npm install
```

Crie um arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Inicie o frontend:
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 6. Configure o Mobile (Opcional)

```bash
cd mobile
npm install
```

Instale o Expo CLI globalmente:
```bash
npm install -g expo-cli
```

Inicie o app:
```bash
npm start
```

## 🧪 Testando a Instalação

1. Acesse `http://localhost:3001/health` - deve retornar `{"status":"ok"}`
2. Acesse `http://localhost:3000` - deve abrir a página inicial
3. Crie uma conta em `http://localhost:3000/register`
4. Faça login e acesse o dashboard

## 🐛 Solução de Problemas

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Verifique se o banco de dados existe

### Erro de porta em uso
- Altere a porta no `.env`
- Ou pare o processo que está usando a porta

### Erro no frontend
- Verifique se o backend está rodando
- Confirme a URL da API no `.env.local`
- Limpe o cache: `rm -rf .next`

### Erro no mobile
- Verifique se o Expo está instalado
- Confirme que o backend está acessível
- Use o IP local da sua máquina na URL da API

## 📚 Próximos Passos

1. Configure as variáveis de ambiente de produção
2. Faça o deploy seguindo o guia em `DEPLOY.md`
3. Configure domínios personalizados
4. Configure SSL/HTTPS
5. Configure monitoramento e logs

