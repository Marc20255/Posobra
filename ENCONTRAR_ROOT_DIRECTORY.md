# 🔍 Onde Encontrar Root Directory no Vercel

## ⚠️ Problema

O Root Directory não aparece em **Settings** → **General**.

---

## ✅ Onde Procurar

### 1️⃣ Settings → Build and Deployment

O Root Directory pode estar em outra seção:

1. No menu lateral esquerdo, clique em **"Build and Deployment"**
2. Role a página para baixo
3. Procure por **"Root Directory"** ou **"Root"**
4. Se encontrar, edite para: `frontend-web`

### 2️⃣ Verificar na Página de Deploy

1. Vá em **"Deployments"**
2. Clique no **último deployment** (o que falhou)
3. Veja se há alguma opção de configuração lá

---

## 🔄 Solução Alternativa: Deletar e Recriar

Se não conseguir encontrar o Root Directory, podemos deletar este projeto e criar um novo com a configuração correta:

### Passo a Passo

1. **Deletar Projeto Atual**:
   - Em **Settings** → **General**
   - Role até o final da página
   - Procure por **"Delete Project"** ou **"Danger Zone"**
   - Clique e confirme a exclusão

2. **Criar Novo Projeto**:
   - Clique em **"Add New"** → **"Project"**
   - Selecione **GitHub** → **`mvip23/posobra`**
   - **IMPORTANTE**: Antes de clicar em "Deploy", procure por uma opção de **"Advanced"** ou **"Configure"**
   - Tente encontrar onde configurar o Root Directory ANTES do deploy

---

## 🆘 Solução Definitiva: Fazer Push do Código Correto

O problema pode ser que o repositório `mvip23/posobra` não tem o diretório `frontend-web`. 

Vamos fazer push do código correto para esse repositório:

### Opção 1: Adicionar Remote e Fazer Push

```bash
cd "/Users/mac/Pós obra"

# Adicionar o repositório mvip23 como remote
git remote add mvip23 https://github.com/mvip23/posobra.git

# Fazer push do código completo
git push mvip23 main --force
```

**⚠️ ATENÇÃO**: O `--force` vai sobrescrever tudo no repositório `mvip23/posobra`. Certifique-se de que é isso que você quer!

### Opção 2: Verificar se o Repositório Tem o Diretório

1. Acesse: https://github.com/mvip23/posobra
2. Veja se existe um diretório `frontend-web`
3. Se não existir, esse é o problema!

---

## 📋 Checklist de Verificação

- [ ] Verificar em **Settings** → **Build and Deployment**
- [ ] Verificar se o repositório `mvip23/posobra` tem `frontend-web`
- [ ] Se não tiver, fazer push do código correto
- [ ] Ou deletar projeto e recriar com configuração correta

---

## 🎯 Solução Recomendada

**Primeiro**, vamos verificar se o repositório `mvip23/posobra` tem o diretório `frontend-web`:

1. Acesse: https://github.com/mvip23/posobra
2. Veja a estrutura do repositório
3. Se não tiver `frontend-web`, esse é o problema!

**Depois**, podemos:
- Fazer push do código correto para `mvip23/posobra`
- Ou usar outro método de deploy

---

## 💡 Alternativa: Deploy via CLI

Se não conseguir configurar pelo painel do Vercel:

1. Instale o Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Entre no diretório `frontend-web`:
   ```bash
   cd "/Users/mac/Pós obra/frontend-web"
   ```

3. Execute o deploy:
   ```bash
   vercel
   ```

4. Siga as instruções (vai perguntar sobre Root Directory)

---

Avise o que você encontrou em **Settings** → **Build and Deployment** ou se o repositório `mvip23/posobra` tem o diretório `frontend-web`!

