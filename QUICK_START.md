# ⚡ Quick Start - Rápido e Prático

## 🎯 Começar em 5 Minutos

### 1. Banco de Dados (1 minuto)
```bash
# Crie o banco
createdb pos_obra

# OU via psql:
psql -U postgres
CREATE DATABASE pos_obra;
\q
```

### 2. Backend (2 minutos)
```bash
cd backend
npm install

# Crie .env com:
cat > .env << EOF
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=qualiapps-hackquali-2025
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
MOBILE_URL=http://localhost:19006
EOF

mkdir -p uploads/photos uploads/documents uploads/general
npm run dev
```

### 3. Frontend (2 minutos)
```bash
# Em outro terminal:
cd frontend-web
npm install

# Crie .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

npm run dev
```

### 4. Acesse!
```
http://localhost:3000
```

## 🧪 Teste Rápido

1. **Crie conta:** `http://localhost:3000/register`
   - Email: `teste@test.com`
   - Senha: `senha123`

2. **Faça login:** `http://localhost:3000/login`

3. **Veja o dashboard!** 🎉

## 📱 Mobile (Opcional)

```bash
cd mobile
npm install

# Edite src/lib/api.ts e coloque seu IP local
npm start
```

**Pronto!** 🚀

