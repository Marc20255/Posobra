# 📍 Como Encontrar e Configurar Root Directory no Vercel

## 🎯 Passo a Passo Detalhado

### 1️⃣ Acessar Settings

1. No Vercel, você está na página **"Overview"** do projeto "posobra"
2. Olhe para o **menu superior** (onde está "Overview", "Deployments", etc.)
3. Clique em **"Setting"** (ou "Settings" - pode estar no final do menu)

### 2️⃣ Encontrar General Settings

1. Dentro de **Settings**, você verá um **menu lateral à esquerda**
2. Clique em **"General"** (geralmente é o primeiro item)
3. Se não vir "General", procure por **"Project Settings"** ou **"Configuration"**

### 3️⃣ Procurar Root Directory

Na página **General**, role a página para baixo e procure por:

- **"Root Directory"** (pode estar escrito assim)
- Ou **"Project Root"**
- Ou uma seção chamada **"Build and Development Settings"**

### 4️⃣ Configurar Root Directory

1. Quando encontrar o campo **"Root Directory"**:
   - Ele pode estar vazio ou com `/` ou `.`
   - **Altere para**: `frontend-web`
   - Clique em **"Save"** (geralmente no final da página)

---

## 🔍 Onde Pode Estar (Alternativas)

Se não encontrar em **Settings → General**, procure em:

### Opção A: Na Página de Deploy
1. Vá em **"Deployments"**
2. Clique no deployment mais recente
3. Procure por **"Settings"** ou **"Configure"** dentro do deployment

### Opção B: Ao Criar Novo Deploy
1. Vá em **"Deployments"**
2. Clique em **"Create Deployment"** ou **"Redeploy"**
3. Antes de fazer deploy, procure por **"Configure"** ou **"Settings"**
4. Deve ter uma opção de **"Root Directory"**

### Opção C: Criar arquivo vercel.json
Se não conseguir encontrar, podemos criar um arquivo de configuração:

1. Crie um arquivo `vercel.json` na **raiz do seu repositório** (não dentro de frontend-web)
2. Com este conteúdo:

```json
{
  "buildCommand": "cd frontend-web && npm run build",
  "outputDirectory": "frontend-web/.next",
  "installCommand": "cd frontend-web && npm install",
  "framework": "nextjs"
}
```

3. Faça commit e push:
```bash
git add vercel.json
git commit -m "fix: Adiciona configuração do Vercel"
git push origin main
```

---

## 📋 Checklist Visual

**No Vercel:**
1. ✅ Projeto "posobra" aberto
2. ✅ Menu superior → **"Setting"** ou **"Settings"**
3. ✅ Menu lateral → **"General"**
4. ✅ Role a página → Procure **"Root Directory"**
5. ✅ Altere para `frontend-web`
6. ✅ Clique em **"Save"**

---

## 🆘 Se Ainda Não Encontrar

**Solução Rápida: Criar vercel.json**

Vou criar o arquivo `vercel.json` para você. Isso vai configurar automaticamente o Root Directory.

