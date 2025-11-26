# 📋 Como Configurar NEXT_PUBLIC_API_URL no Frontend

## 🎯 Onde Configurar

A variável `NEXT_PUBLIC_API_URL` precisa ser configurada no **Vercel** (ou outro provedor de hosting do frontend).

---

## 🚀 Passo a Passo no Vercel

### 1️⃣ Acessar o Vercel

1. Acesse: https://vercel.com
2. Faça login com sua conta GitHub

### 2️⃣ Encontrar o Projeto

1. No dashboard do Vercel, encontre seu projeto
2. Se ainda não criou o projeto:
   - Clique em **"Add New"** → **"Project"**
   - Selecione o repositório `Marc20255/Posobra`
   - Configure:
     - **Root Directory**: `frontend-web`
     - **Framework**: Next.js (detectado automaticamente)
   - Clique em **"Deploy"**

### 3️⃣ Configurar a Variável de Ambiente

1. No projeto do Vercel, vá em **"Settings"** (Configurações)
2. No menu lateral, clique em **"Environment Variables"** (Variáveis de Ambiente)
3. Clique em **"Add New"** ou **"Add"**
4. Preencha:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://posobra-production.up.railway.app`
   - **Environment**: Selecione todas as opções:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
5. Clique em **"Save"**

### 4️⃣ Fazer Redeploy

1. Após adicionar a variável, vá em **"Deployments"**
2. Clique nos **3 pontinhos** (⋯) do último deployment
3. Clique em **"Redeploy"**
4. Ou faça um novo commit/push no GitHub (deploy automático)

---

## 🔍 Verificar se Funcionou

1. Após o redeploy, acesse a URL do seu frontend no Vercel
2. Abra o **Console do Navegador** (F12 → Console)
3. Verifique se não há erros de conexão com a API
4. Tente fazer login - deve conectar ao backend

---

## 📝 Resumo Rápido

**No Vercel:**
1. Settings → Environment Variables
2. Add New
3. Name: `NEXT_PUBLIC_API_URL`
4. Value: `https://posobra-production.up.railway.app`
5. Save → Redeploy

---

## ⚠️ Importante

- Use `https://` (não `http://`)
- Use a URL completa do Railway
- Não esqueça de fazer redeploy após adicionar a variável
- A variável deve começar com `NEXT_PUBLIC_` para ser acessível no frontend

---

## 🆘 Se Não Encontrar o Projeto no Vercel

Se ainda não fez deploy do frontend:

1. Acesse: https://vercel.com
2. Clique em **"Add New"** → **"Project"**
3. Conecte seu repositório GitHub: `Marc20255/Posobra`
4. Configure:
   - **Root Directory**: `frontend-web` ⚠️ IMPORTANTE!
   - **Framework**: Next.js
5. Em **"Environment Variables"**, adicione:
   - `NEXT_PUBLIC_API_URL` = `https://posobra-production.up.railway.app`
6. Clique em **"Deploy"**

---

## ✅ Pronto!

Após configurar, seu frontend vai conectar ao backend automaticamente! 🎉

