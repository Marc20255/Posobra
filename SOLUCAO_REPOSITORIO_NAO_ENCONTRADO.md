# 🔍 Solução: Repositório Não Encontrado no Vercel

## ⚠️ Problema

O Vercel não encontra o repositório `Marc20255/Posobra` na lista de repositórios disponíveis.

---

## ✅ Possíveis Causas e Soluções

### 1️⃣ Verificar Nome Exato do Repositório

O nome pode estar diferente. Vamos verificar:

1. Acesse: https://github.com/Marc20255
2. Veja a lista de repositórios
3. Procure pelo repositório (pode ser `Posobra`, `posobra`, `Pos-obra`, etc.)
4. Anote o nome **exato** do repositório

### 2️⃣ Verificar Permissões do GitHub

O repositório pode estar privado ou sem permissão para o Vercel:

1. No GitHub, vá no repositório
2. Vá em **Settings** → **Actions** → **General**
3. Verifique se o repositório está **público** ou se o Vercel tem acesso
4. Se estiver privado, vá em **Settings** → **Collaborators** → Adicione o Vercel como colaborador

### 3️⃣ Reconectar GitHub no Vercel

O GitHub pode não estar conectado corretamente:

1. No Vercel, vá em **Settings** → **Git** (ou **Integrations**)
2. Procure por **GitHub**
3. Se estiver conectado, clique em **"Disconnect"**
4. Clique em **"Connect"** novamente
5. Autorize o Vercel a acessar seus repositórios
6. **IMPORTANTE**: Ao autorizar, certifique-se de dar acesso a **todos os repositórios** ou especificamente ao `Marc20255/Posobra`

### 4️⃣ Verificar Se o Repositório Existe

1. Acesse diretamente: https://github.com/Marc20255/Posobra
2. Se não existir, pode ser que o nome seja diferente
3. Verifique se você tem acesso ao repositório

### 5️⃣ Usar URL Direta do Repositório

Se não aparecer na lista, tente:

1. No Vercel, ao criar novo projeto
2. Procure por uma opção **"Import from URL"** ou **"Import Git Repository"**
3. Cole a URL: `https://github.com/Marc20255/Posobra`
4. Ou: `git@github.com:Marc20255/Posobra.git`

---

## 🔄 Solução Alternativa: Usar o Repositório que Aparece

Se o `Marc20255/Posobra` realmente não aparecer, podemos usar o `mvip23/posobra` temporariamente:

1. Importe o `mvip23/posobra` no Vercel
2. Configure o Root Directory como `frontend-web`
3. Depois, podemos mudar o repositório ou fazer um fork

---

## 📋 Checklist de Verificação

- [ ] Verificar nome exato do repositório no GitHub
- [ ] Verificar se o repositório é público ou se o Vercel tem acesso
- [ ] Reconectar GitHub no Vercel com permissões corretas
- [ ] Tentar usar URL direta do repositório
- [ ] Verificar se o usuário GitHub está correto (`Marc20255`)

---

## 🆘 Se Nada Funcionar

### Opção 1: Criar Fork ou Novo Repositório

1. No GitHub, faça um fork do repositório atual
2. Ou crie um novo repositório com o nome exato
3. Faça push do código para o novo repositório
4. Conecte o Vercel ao novo repositório

### Opção 2: Usar Deploy Manual

1. No Vercel, use a opção **"Deploy from CLI"**
2. Instale o Vercel CLI: `npm i -g vercel`
3. Execute: `vercel` dentro do diretório `frontend-web`
4. Siga as instruções

---

## 🎯 Próximos Passos Recomendados

1. **Primeiro**: Verifique o nome exato do repositório no GitHub
2. **Segundo**: Reconecte o GitHub no Vercel com permissões corretas
3. **Terceiro**: Tente usar URL direta se não aparecer na lista
4. **Quarto**: Se nada funcionar, considere usar o repositório que aparece (`mvip23/posobra`) e configurar corretamente

---

## 💡 Dica

Se você tem acesso ao repositório `mvip23/posobra`, podemos:
1. Usar esse repositório temporariamente
2. Configurar tudo corretamente
3. Depois mudar o repositório ou fazer um fork

Avise qual repositório você consegue ver no Vercel e vamos configurar ele!

