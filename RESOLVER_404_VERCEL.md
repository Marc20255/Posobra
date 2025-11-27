# 🔧 Como Resolver Erro 404 no Vercel

## 🎯 Problema

O frontend está deployado mas retorna 404. Isso geralmente acontece por configuração incorreta no Vercel.

---

## ✅ Solução: Verificar Configurações no Vercel

### 1️⃣ Verificar Root Directory

1. No Vercel, vá em **Settings** → **General**
2. Procure por **"Root Directory"**
3. Deve estar configurado como: `frontend-web`
4. Se estiver diferente ou vazio, altere para `frontend-web`
5. Clique em **"Save"**

### 2️⃣ Verificar Build Settings

1. Ainda em **Settings** → **General**
2. Verifique **"Build and Development Settings"**:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (ou `cd frontend-web && npm run build` se Root Directory não funcionar)
   - **Output Directory**: `.next` (ou deixe vazio para Next.js detectar automaticamente)
   - **Install Command**: `npm install` (ou `cd frontend-web && npm install`)

### 3️⃣ Verificar Variáveis de Ambiente

1. Vá em **Settings** → **Environment Variables**
2. Verifique se `NEXT_PUBLIC_API_URL` está configurada:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://posobra-production.up.railway.app`
   - Environment: Production, Preview, Development

### 4️⃣ Fazer Redeploy

1. Vá em **Deployments**
2. Clique nos **3 pontinhos** (⋯) do último deployment
3. Clique em **"Redeploy"**
4. Ou faça um novo commit/push no GitHub

---

## 🔍 Verificar Logs do Build

1. No deployment, clique em **"Build Logs"**
2. Verifique se há erros durante o build
3. Se houver erros, corrija antes de fazer redeploy

---

## 📋 Configuração Correta no Vercel

**Settings → General:**
- Root Directory: `frontend-web`
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next` (ou vazio)
- Install Command: `npm install`

**Settings → Environment Variables:**
- `NEXT_PUBLIC_API_URL` = `https://posobra-production.up.railway.app`

---

## 🆘 Se Ainda Não Funcionar

### Opção 1: Criar vercel.json

Crie um arquivo `vercel.json` na raiz do projeto (não em `frontend-web`):

```json
{
  "buildCommand": "cd frontend-web && npm run build",
  "outputDirectory": "frontend-web/.next",
  "installCommand": "cd frontend-web && npm install",
  "framework": "nextjs",
  "rootDirectory": "frontend-web"
}
```

### Opção 2: Mover frontend-web para raiz

Se nada funcionar, você pode mover o conteúdo de `frontend-web` para a raiz do repositório (mas isso requer reorganização).

---

## ✅ Checklist Rápido

- [ ] Root Directory = `frontend-web`
- [ ] Framework = Next.js
- [ ] Build Command = `npm run build`
- [ ] `NEXT_PUBLIC_API_URL` configurada
- [ ] Redeploy feito após mudanças

---

## 💡 Dica

Se o Root Directory não funcionar, tente usar o Build Command completo:
```
cd frontend-web && npm install && npm run build
```

E Output Directory:
```
frontend-web/.next
```

