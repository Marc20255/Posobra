# 🔍 Verificar e Corrigir Conexão Git no Vercel

## ⚠️ Problema

Os logs ainda mostram:
```
Cloning github.com/mvip23/posobra (Branch: main, Commit: fca2af0)
```

Isso significa que o projeto **ainda está conectado** ao repositório errado.

---

## ✅ Verificar Qual Repositório Está Conectado

### 1️⃣ Ir em Settings → Git

1. No projeto `posobra-c439`, vá em **Settings** → **Git**
2. Veja qual repositório está conectado:
   - ❌ **ERRADO**: `mvip23/posobra`
   - ✅ **CORRETO**: `Marc20255/Posobra`

### 2️⃣ Se Estiver Errado

Se ainda mostrar `mvip23/posobra`:

1. Clique em **"Disconnect"**
2. Aguarde alguns segundos
3. Clique em **"Connect Git Repository"**
4. Selecione **GitHub**
5. **Use a barra de busca** e digite: `Marc20255` ou `Posobra`
6. Procure e selecione: **`Marc20255/Posobra`**
7. Clique em **"Import"** ou **"Connect"**

### 3️⃣ Se Não Aparecer `Marc20255/Posobra`

Pode ser problema de permissões:

1. No GitHub, vá em **Settings** → **Applications** → **Authorized OAuth Apps**
2. Procure por **Vercel**
3. Clique em **Vercel**
4. Verifique se tem acesso aos repositórios
5. Se necessário:
   - Clique em **"Revoke"**
   - Volte no Vercel
   - Reconecte o GitHub
   - Autorize novamente

---

## 📋 Após Conectar Corretamente

### 1️⃣ Configurar Root Directory

1. Vá em **Settings** → **General**
2. Procure por **"Root Directory"**
3. Se não aparecer, vá em **Settings** → **Build and Deployment**
4. Configure como: **`frontend-web`**
5. Clique em **"Save"**

### 2️⃣ Fazer Novo Deploy

1. Vá em **Deployments**
2. Clique em **"Create Deployment"** ou **"Redeploy"**
3. Selecione branch **`main`**
4. Clique em **"Deploy"**

### 3️⃣ Verificar Logs

Nos Build Logs deve aparecer:

✅ **Correto:**
```
Cloning github.com/Marc20255/Posobra (Branch: main, Commit: [commit recente])
```

❌ **Não Deve Aparecer:**
- `mvip23/posobra`
- `fca2af0`
- Erro sobre Root Directory não encontrado

---

## 🔍 Checklist Completo

- [ ] Verificar em **Settings** → **Git** qual repositório está conectado
- [ ] Se estiver errado (`mvip23/posobra`), desconectar
- [ ] Conectar ao repositório correto (`Marc20255/Posobra`)
- [ ] Se não aparecer, verificar permissões do GitHub
- [ ] Configurar Root Directory: `frontend-web`
- [ ] Fazer novo deploy
- [ ] Verificar logs - deve mostrar repositório correto

---

## 🎯 Resumo Rápido

1. **Settings** → **Git** → Verificar repositório conectado
2. Se estiver errado → **Disconnect** → **Connect** → `Marc20255/Posobra`
3. **Root Directory**: `frontend-web`
4. **Deploy**

---

## ⚠️ Importante

- O repositório **correto** é: `Marc20255/Posobra`
- O repositório **errado** é: `mvip23/posobra` (não existe - 404)
- Verifique em **Settings** → **Git** qual está conectado

Avise o que aparece em **Settings** → **Git** para eu ajudar melhor!

