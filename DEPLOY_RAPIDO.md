# ⚡ Deploy Rápido - 10 Minutos

Guia ultra-rápido para colocar o sistema online.

## 🎯 Passo a Passo Rápido

### 1. Banco de Dados (3 min)

1. Acesse: https://supabase.com
2. Crie projeto
3. Anote: Host, User, Password, Database name

### 2. Backend Railway (3 min)

1. Acesse: https://railway.app
2. New Project > GitHub repo
3. Configure:
   - Root: `backend`
   - Start: `npm start`
4. Adicione PostgreSQL (ou use Supabase)
5. Variáveis:
```env
DB_HOST=seu-host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=sua-senha
JWT_SECRET=chave-aleatoria-32-chars
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app
```

### 3. Frontend Vercel (2 min)

1. Acesse: https://vercel.com
2. Import GitHub repo
3. Root: `frontend-web`
4. Variável:
```env
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
```

### 4. Atualizar Backend (1 min)

1. Volte no Railway
2. Atualize `FRONTEND_URL` com URL do Vercel
3. Redeploy

### 5. Testar (1 min)

1. Acesse URL do Vercel
2. Crie conta
3. Teste login

**Pronto! Sistema online! 🎉**

---

## 📝 URLs para Anotar

- Backend: `________________`
- Frontend: `________________`
- Banco: `________________`

---

**Dúvidas? Veja `GUIA_DEPLOY_COMPLETO.md` para detalhes.**

