# 📍 Onde Adicionar Variáveis de Ambiente no Vercel

## ⚠️ Você Está em "Environments"

Você está na página **Settings** → **Environments**. 

Para adicionar variáveis de ambiente, você precisa ir para outra seção.

---

## ✅ Onde Clicar

### No Menu Lateral Esquerdo

Procure por **"Environment Variables"** (Variáveis de Ambiente)

Está logo abaixo de **"Environments"** no menu lateral esquerdo.

### Passo a Passo

1. **Feche o modal** (se ainda estiver aberto) - clique em **"Cancel"**
2. No **menu lateral esquerdo**, procure por:
   - **"Environment Variables"** (está logo abaixo de "Environments")
3. **Clique em "Environment Variables"**

---

## 📋 O Que Você Verá

Na página **Settings** → **Environment Variables**, você verá:

- Uma lista de variáveis de ambiente (se houver alguma)
- Um botão **"Add New"** ou **"Add"** para adicionar novas variáveis
- Campos para:
  - **Name** (Nome)
  - **Value** (Valor)
  - **Environment** (Produção, Preview, Desenvolvimento)

---

## 🎯 O Que Adicionar

Quando estiver em **Environment Variables**, adicione:

1. Clique em **"Add New"** ou **"Add"**
2. Preencha:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://posobra-production.up.railway.app`
     (⚠️ Ajuste se sua URL do Railway for diferente!)
   - **Environment**: Selecione todas:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
3. Clique em **"Save"**

---

## 📝 Resumo Visual

```
Settings (menu lateral)
├── General
├── Build and Deployment
├── Domains
├── Environments ← Você está aqui
├── Environment Variables ← CLIQUE AQUI!
├── Git
└── ...
```

---

## ⚠️ Importante

- **NÃO** é em "Environments" (onde você está agora)
- **SIM**, é em **"Environment Variables"** (logo abaixo no menu)

---

## 🎯 Próximos Passos Após Adicionar

1. Adicionar variável `NEXT_PUBLIC_API_URL`
2. Ir em **Deployments**
3. Fazer **"Create Deployment"** ou **"Redeploy"**
4. Selecionar branch `main`
5. Clicar em **"Deploy"**

