# ⚡ Deploy Rápido via GitHub - 15 Minutos

## 🎯 Resumo Ultra-Rápido

1. **GitHub**: Enviar código (2 min)
2. **Supabase**: Criar banco (3 min)
3. **Railway**: Deploy backend (5 min)
4. **Vercel**: Deploy frontend (5 min)

**Total: ~15 minutos** ⏱️

---

## 📝 Passo a Passo Rápido

### 1️⃣ GitHub (2 min)

```bash
cd "/Users/mac/Pós obra"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/pos-obra.git
git push -u origin main
```

### 2️⃣ Supabase (3 min)

1. https://supabase.com → Login GitHub
2. New Project → `pos-obra-db`
3. Anotar credenciais (Host, User, Password)

### 3️⃣ Railway Backend (5 min)

1. https://railway.app → Login GitHub
2. New Project → Deploy from GitHub → Selecionar repo
3. Settings → Root Directory: `backend`
4. Variables → Adicionar:
   ```
   DB_HOST=[do Supabase]
   DB_USER=postgres
   DB_PASS=[do Supabase]
   DB_NAME=postgres
   DB_PORT=5432
   JWT_SECRET=chave-aleatoria-32-caracteres-minimo
   NODE_ENV=production
   FRONTEND_URL=https://seu-app.vercel.app
   ```
5. Anotar URL gerada

### 4️⃣ Vercel Frontend (5 min)

1. https://vercel.com → Login GitHub
2. Add New → Project → Selecionar repo
3. Root Directory: `frontend-web`
4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=[URL do Railway]
   ```
5. Deploy → Anotar URL

### 5️⃣ Atualizar (1 min)

- Railway → Variables → `FRONTEND_URL` → Colar URL do Vercel

---

## ✅ Pronto!

- Frontend: `https://seu-app.vercel.app`
- Backend: `https://seu-backend.up.railway.app`

**Cada `git push` atualiza automaticamente! 🚀**

---

📖 **Guia completo**: Ver `GUIA_DEPLOY_GITHUB.md`

