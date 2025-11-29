# 🔧 Corrigir Framework e Root Directory no Vercel

## ⚠️ Problema Identificado

O Framework está detectado como **"Astro"** (errado), quando deveria ser **"Next.js"**.

Quando o Framework está errado, o Vercel pode não deixar editar o Root Directory.

---

## ✅ Solução: Mudar Framework Primeiro

### 1️⃣ Mudar Framework para Next.js

1. Na seção **"Framework Preset"**, você verá um campo com **"Astro"**
2. **Clique no campo** ou na **seta para baixo** (dropdown)
3. Uma lista de frameworks vai aparecer
4. **Procure e selecione**: **"Next.js"**
   - Pode estar escrito como "Next.js" ou apenas "Next"
5. Clique em **"Next.js"**

### 2️⃣ Depois Mudar Root Directory

Após mudar o Framework para Next.js:

1. Na seção **"Root Directory"**, você verá um campo com `./`
2. **Clique no botão "Edit"** ao lado do campo
3. OU **clique diretamente no campo** de texto
4. **Apague** o conteúdo (`./`)
5. **Digite**: `frontend-web`
6. Pressione Enter ou clique fora

### 3️⃣ Verificar Configurações

Após mudar ambos:

- ✅ **Framework Preset**: **Next.js** (não Astro)
- ✅ **Root Directory**: **`frontend-web`** (não `./`)
- ✅ **Project Name**: Pode deixar como `posobra-qlg3` ou mudar para `posobra`

### 4️⃣ Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos

---

## 🔍 Passo a Passo Visual

```
1. Framework Preset
   └── Clique no campo → Selecione "Next.js" (não Astro)

2. Root Directory
   └── Clique em "Edit" → Digite "frontend-web"

3. Deploy
```

---

## 🆘 Se Ainda Não Conseguir Mudar o Root Directory

### Opção 1: Usar o Botão "Edit"

1. Clique no botão **"Edit"** ao lado do Root Directory
2. Uma janela ou campo editável deve aparecer
3. Digite: `frontend-web`
4. Confirme

### Opção 2: Clicar Diretamente no Campo

1. Clique diretamente no campo de texto onde está `./`
2. Se não deixar editar, tente clicar duas vezes (double-click)
3. Apague o conteúdo
4. Digite: `frontend-web`

### Opção 3: Expandir "Build and Output Settings"

1. Clique na seta ao lado de **"Build and Output Settings"** para expandir
2. Lá dentro pode ter uma opção para editar o Root Directory
3. Procure por campos relacionados a "Root" ou "Directory"

---

## 📋 Checklist Antes de Deploy

Antes de clicar em "Deploy", verifique:

- [ ] **Framework Preset**: **Next.js** (não Astro)
- [ ] **Root Directory**: **`frontend-web`** (não `./`)
- [ ] **Project Name**: Qualquer nome está ok

---

## ⚠️ Importante

- **Mude o Framework PRIMEIRO** para Next.js
- **Depois** tente mudar o Root Directory
- Se não conseguir mudar o Root Directory, tente expandir "Build and Output Settings"

---

## 🎯 Resumo Rápido

1. **Framework Preset**: Mude de "Astro" para **"Next.js"**
2. **Root Directory**: Clique em "Edit" → Digite **`frontend-web`**
3. **Deploy**

Avise se conseguiu mudar o Framework para Next.js primeiro!

