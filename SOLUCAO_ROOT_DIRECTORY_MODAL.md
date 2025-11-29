# 🔧 Solução: Root Directory Não Aparece no Modal

## ⚠️ Problema

O modal do Vercel mostra apenas "posobra" como opção, não mostra "frontend-web".

Isso significa que o repositório `mvip23/posobra` pode não ter o diretório `frontend-web`, ou o Vercel não está detectando.

---

## ✅ Solução: Deploy Sem Root Directory e Configurar Depois

### Opção 1: Deploy Agora e Configurar Depois (Mais Rápido)

1. **No modal atual**, clique em **"Continue"** (deixe como "posobra")
2. Clique em **"Deploy"**
3. **Aguarde o deploy falhar** (vai falhar porque não encontra o código)
4. Após o deploy, vá em **Settings** → **General**
5. Procure por **"Root Directory"**
6. **Agora deve deixar editar** - digite: `frontend-web`
7. Salve e faça **Redeploy**

### Opção 2: Cancelar e Verificar Repositório

1. **Clique em "Cancel"** no modal
2. Verifique se o repositório `mvip23/posobra` realmente tem o diretório `frontend-web`
3. Se não tiver, precisamos fazer push do código para esse repositório

---

## 🔍 Verificar se o Repositório Tem o Diretório

### Opção A: Verificar no GitHub

1. Acesse: https://github.com/mvip23/posobra
2. Veja se existe um diretório `frontend-web`
3. Se não existir, esse é o problema!

### Opção B: Fazer Push do Código

Se o repositório `mvip23/posobra` não tem o `frontend-web`, precisamos adicionar:

```bash
cd "/Users/mac/Pós obra"

# Adicionar remote do mvip23 (se necessário)
git remote add mvip23 git@github.com:mvip23/posobra.git

# Ou fazer push para esse repositório
git push mvip23 main
```

**⚠️ CUIDADO**: Isso vai enviar seu código para o repositório `mvip23/posobra`. Certifique-se de que é isso que você quer!

---

## ✅ Solução Recomendada: Deploy Agora e Configurar Depois

### Passo a Passo

1. **No modal atual**:
   - Clique em **"Continue"** (deixe como "posobra")
   - Isso vai fechar o modal

2. **Na página de configuração**:
   - Verifique se o Framework está como **Next.js**
   - Clique em **"Deploy"**

3. **O deploy vai falhar** (esperado, porque não encontra o código)

4. **Após o deploy falhar**:
   - Vá em **Settings** → **General**
   - Procure por **"Root Directory"**
   - **Agora deve deixar editar** - digite: `frontend-web`
   - Clique em **"Save"**

5. **Fazer Redeploy**:
   - Vá em **Deployments**
   - Clique nos **3 pontinhos** (⋯) do último deployment
   - Clique em **"Redeploy"**

---

## 🆘 Se Ainda Não Funcionar

### Verificar Estrutura do Repositório

O problema pode ser que o repositório `mvip23/posobra` não tem a mesma estrutura que `Marc20255/Posobra`.

**Solução**: Fazer push do código correto para `mvip23/posobra`:

```bash
cd "/Users/mac/Pós obra"

# Verificar remotes
git remote -v

# Se não tiver mvip23, adicionar
git remote add mvip23 https://github.com/mvip23/posobra.git

# Fazer push
git push mvip23 main --force
```

**⚠️ ATENÇÃO**: O `--force` vai sobrescrever o repositório `mvip23/posobra`. Use com cuidado!

---

## 📋 Checklist

- [ ] Tentar fazer deploy mesmo sem Root Directory correto
- [ ] Após deploy falhar, configurar Root Directory em Settings
- [ ] Fazer redeploy
- [ ] Se não funcionar, verificar se `mvip23/posobra` tem `frontend-web`
- [ ] Se não tiver, fazer push do código correto

---

## 🎯 Resumo Rápido

1. **No modal**: Clique em **"Continue"** (deixe como "posobra")
2. **Deploy**: Clique em **"Deploy"** (vai falhar, mas ok)
3. **Settings**: Vá em **Settings** → **General** → **Root Directory**: `frontend-web`
4. **Redeploy**: Faça redeploy

Avise o que aconteceu após clicar em "Continue"!

