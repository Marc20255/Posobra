# 🔧 Corrigir Repositório Conectado no Vercel

## ⚠️ Problema Identificado

O Vercel está conectado ao repositório **ERRADO**:
- ❌ **Atual**: `mvip23/posobra`
- ✅ **Correto**: `Marc20255/Posobra`

Além disso, está tentando fazer deploy do commit `fca2af0` que não existe.

---

## ✅ Solução: Reconectar ao Repositório Correto

### Opção 1: Desconectar e Reconectar (Recomendado)

1. **No Vercel**, vá em **Settings** → **Git**
2. Role até a seção **"Connected Git Repository"**
3. Clique em **"Disconnect"** ou **"Disconnect Repository"**
4. Confirme a desconexão
5. Clique em **"Connect Git Repository"** ou **"Add Git Repository"**
6. Selecione **GitHub**
7. Procure e selecione: **`Marc20255/Posobra`**
8. Clique em **"Import"** ou **"Connect"**

### Opção 2: Criar Novo Projeto (Se não conseguir desconectar)

1. No Vercel, vá em **"Add New"** → **"Project"**
2. Selecione **GitHub**
3. Procure e selecione: **`Marc20255/Posobra`**
4. Configure:
   - **Root Directory**: `frontend-web`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Clique em **"Deploy"**

---

## 📋 Após Reconectar

### 1️⃣ Verificar Configurações

1. **Settings** → **General**
   - **Root Directory**: `frontend-web`
   - **Production Branch**: `main`

2. **Settings** → **Environment Variables**
   - Adicione se não existir:
     - Name: `NEXT_PUBLIC_API_URL`
     - Value: `https://posobra-production.up.railway.app`
     - Environment: Production, Preview, Development

### 2️⃣ Fazer Primeiro Deploy

1. Vá em **Deployments**
2. Clique em **"Create Deployment"** ou **"Redeploy"**
3. Selecione:
   - **Branch**: `main`
   - **Commit**: Deixe em branco (usa o mais recente)
4. Clique em **"Deploy"**

---

## 🔍 Verificar se Funcionou

Após o deploy, verifique os logs:

1. **Build Logs** devem mostrar:
   ```
   Cloning github.com/Marc20255/Posobra (Branch: main, Commit: [commit recente])
   ```

2. **NÃO** deve aparecer:
   - ❌ `mvip23/posobra`
   - ❌ `fca2af0`
   - ❌ `The specified Root Directory "frontend-web" does not exist`

3. **Deve aparecer**:
   - ✅ `Marc20255/Posobra`
   - ✅ Commit recente (ex: `a46402b`)
   - ✅ Build iniciando normalmente

---

## 🆘 Se Ainda Não Funcionar

### Verificar Permissões do GitHub

1. No Vercel, vá em **Settings** → **Git**
2. Verifique se o GitHub está conectado corretamente
3. Se necessário, reconecte o GitHub:
   - Clique em **"Disconnect"** no GitHub
   - Clique em **"Connect"** e autorize novamente

### Verificar se o Repositório Existe

1. Acesse: https://github.com/Marc20255/Posobra
2. Verifique se o repositório existe e está público (ou você tem acesso)
3. Verifique se o diretório `frontend-web` existe no repositório

---

## 📝 Resumo Rápido

1. **Vercel** → **Settings** → **Git**
2. **Disconnect** do repositório atual (`mvip23/posobra`)
3. **Connect** ao repositório correto (`Marc20255/Posobra`)
4. **Settings** → **General** → **Root Directory**: `frontend-web`
5. **Deployments** → **Create Deployment** → Branch: `main`
6. ✅ Pronto!

---

## ⚠️ Importante

- O repositório correto é: **`Marc20255/Posobra`**
- O branch correto é: **`main`**
- O Root Directory correto é: **`frontend-web`**
- Use o commit mais recente, não o `fca2af0`

