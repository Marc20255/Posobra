# 🔧 Solução: Conta GitHub Errada Conectada no Vercel

## ⚠️ Problema Identificado

O Vercel está conectado à conta GitHub **`mvip23`**, por isso só mostra repositórios dessa conta.

O repositório correto (`Marc20255/Posobra`) está em outra conta GitHub (`Marc20255`).

---

## ✅ Soluções Possíveis

### Opção 1: Conectar Conta GitHub Correta (Recomendado)

#### 1️⃣ Desconectar GitHub Atual

1. No Vercel, vá em **Settings** (do time, não do projeto) → **Git** ou **Integrations**
2. Procure por **GitHub**
3. Clique em **"Disconnect"** ou **"Remove"**
4. Confirme

#### 2️⃣ Conectar Conta GitHub Correta

1. Clique em **"Connect"** ou **"Add Integration"**
2. Selecione **GitHub**
3. **IMPORTANTE**: Se você tiver múltiplas contas GitHub, certifique-se de fazer login com a conta **`Marc20255`**
4. Autorize o Vercel a acessar os repositórios
5. **Certifique-se** de dar acesso ao repositório `Marc20255/Posobra`

#### 3️⃣ Conectar Projeto ao Repositório Correto

1. No projeto `posobra-c439`, vá em **Settings** → **Git**
2. Clique em **"Connect Git Repository"**
3. Agora deve aparecer **`Marc20255/Posobra`** na lista
4. Selecione e conecte

---

### Opção 2: Criar Repositório mvip23/posobra e Fazer Push

Se você não conseguir mudar a conta GitHub no Vercel, podemos criar o repositório `mvip23/posobra` e fazer push do código:

#### 1️⃣ Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. **Owner**: Selecione `mvip23` (se você tiver acesso)
3. **Repository name**: `posobra`
4. **Visibility**: Público ou Privado
5. **NÃO** marque "Initialize with README"
6. Clique em **"Create repository"**

#### 2️⃣ Fazer Push do Código

```bash
cd "/Users/mac/Pós obra"

# Adicionar o repositório mvip23 como remote
git remote add mvip23 https://github.com/mvip23/posobra.git

# Fazer push do código completo
git push mvip23 main --force
```

**⚠️ ATENÇÃO**: O `--force` vai sobrescrever tudo no repositório `mvip23/posobra`.

#### 3️⃣ Conectar no Vercel

1. No projeto `posobra-c439`, vá em **Settings** → **Git**
2. Clique em **"Connect Git Repository"**
3. Agora deve aparecer **`mvip23/posobra`** na lista
4. Selecione e conecte
5. Configure Root Directory: `frontend-web`
6. Faça deploy

---

### Opção 3: Fazer Fork do Repositório

Se você não tem acesso para criar `mvip23/posobra`, pode fazer fork:

1. Acesse: https://github.com/Marc20255/Posobra
2. Clique em **"Fork"** (canto superior direito)
3. Selecione a conta **`mvip23`** como destino
4. Isso vai criar `mvip23/Posobra`
5. Depois conecte no Vercel

---

## 🔍 Verificar Qual Conta GitHub Está Conectada

### No Vercel

1. Vá em **Settings** (do time) → **Git** ou **Integrations**
2. Veja qual conta GitHub aparece
3. Se for `mvip23`, você precisa conectar `Marc20255`

### No GitHub

1. Acesse: https://github.com/settings/applications
2. Vá em **Authorized OAuth Apps**
3. Procure por **Vercel**
4. Veja qual conta está autorizada

---

## 📋 Checklist

- [ ] Verificar qual conta GitHub está conectada no Vercel
- [ ] Se for `mvip23`, desconectar e conectar `Marc20255`
- [ ] Ou criar `mvip23/posobra` e fazer push do código
- [ ] Conectar projeto ao repositório correto
- [ ] Configurar Root Directory: `frontend-web`
- [ ] Fazer deploy

---

## 🎯 Solução Recomendada

**Opção Mais Rápida**: Criar `mvip23/posobra` e fazer push do código:

1. Criar repositório `mvip23/posobra` no GitHub
2. Fazer push do código (comandos acima)
3. Conectar no Vercel
4. Configurar Root Directory: `frontend-web`
5. Deploy

---

## ⚠️ Importante

- O Vercel está conectado à conta **`mvip23`**
- O repositório correto está na conta **`Marc20255`**
- Precisamos alinhar isso (mudar conta OU criar repositório)

Avise qual opção você prefere seguir!

