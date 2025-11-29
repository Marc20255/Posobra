# ⚠️ Repositório Errado no Build

## 🚨 Problema Identificado

Os logs mostram que o Vercel está clonando o repositório **ERRADO**:

```
Clonando github.com/Marc20255/nextjs-boilerplate
```

**Deveria ser**: `github.com/Marc20255/Posobra`

---

## ✅ Solução: Verificar e Corrigir Conexão Git

### 1️⃣ Verificar Qual Repositório Está Conectado

1. No Vercel, vá no projeto (ex: `posobra-c439`)
2. Vá em **Settings** → **Git**
3. Veja qual repositório está conectado:
   - ❌ **ERRADO**: `Marc20255/nextjs-boilerplate`
   - ✅ **CORRETO**: `Marc20255/Posobra`

### 2️⃣ Se Estiver Errado

1. Clique em **"Disconnect"**
2. Aguarde alguns segundos
3. Clique em **"Connect Git Repository"**
4. Selecione **GitHub**
5. **Use a barra de busca** e digite: `Posobra`
6. Procure e selecione: **`Marc20255/Posobra`**
7. Clique em **"Import"** ou **"Connect"**

### 3️⃣ Verificar Root Directory

Após conectar corretamente:

1. Vá em **Settings** → **General** (ou **Build and Deployment**)
2. Verifique se **Root Directory** está configurado como: `frontend-web`
3. Se não estiver, configure e salve

### 4️⃣ Fazer Novo Deploy

1. Vá em **Deployments**
2. Clique em **"Create Deployment"** ou **"Redeploy"**
3. Selecione branch **`main`**
4. Clique em **"Deploy"**

---

## 🔍 Verificar se Funcionou

Nos Build Logs deve aparecer:

✅ **Correto:**
```
Clonando github.com/Marc20255/Posobra (Branch: main, Commit: [commit recente])
```

❌ **Não Deve Aparecer:**
- `nextjs-boilerplate`
- `5c8bbd6` (commit do repositório errado)

---

## 📋 Checklist

- [ ] Verificar em **Settings** → **Git** qual repositório está conectado
- [ ] Se estiver errado (`nextjs-boilerplate`), desconectar
- [ ] Conectar ao repositório correto (`Marc20255/Posobra`)
- [ ] Verificar Root Directory: `frontend-web`
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

- O repositório correto é: **`Marc20255/Posobra`**
- O repositório errado é: **`Marc20255/nextjs-boilerplate`**
- Verifique em **Settings** → **Git** qual está conectado

Avise o que aparece em **Settings** → **Git** para eu ajudar melhor!

