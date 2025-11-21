# 🚀 Como Enviar para o GitHub

O repositório Git já está inicializado e pronto! Siga estes passos para conectar ao GitHub:

## 📋 Passo a Passo

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Escolha um nome para o repositório (ex: `pos-obra-sistema` ou `qualiapps-hackathon`)
3. **NÃO** marque "Initialize with README" (já temos um)
4. Clique em "Create repository"

### 2. Conectar o Repositório Local ao GitHub

Após criar o repositório no GitHub, você verá instruções. Execute estes comandos:

```bash
cd "/Users/mac/Pós obra"

# Adicionar o remote (substitua SEU_USUARIO e NOME_DO_REPO)
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git

# Ou se preferir SSH:
# git remote add origin git@github.com:SEU_USUARIO/NOME_DO_REPO.git

# Verificar se foi adicionado corretamente
git remote -v
```

### 3. Enviar o Código para o GitHub

```bash
# Enviar para o GitHub (primeira vez)
git push -u origin main

# Se der erro porque a branch é 'master', use:
# git branch -M main
# git push -u origin main
```

### 4. Verificar no GitHub

Acesse seu repositório no GitHub e confirme que todos os arquivos foram enviados.

## ✅ O que já está pronto:

- ✅ Repositório Git inicializado
- ✅ Commit inicial criado com todas as alterações
- ✅ `.gitignore` configurado (não envia arquivos sensíveis)
- ✅ Arquivos `.env.example` criados (templates de configuração)
- ✅ `MANUAL_INSTALACAO.md` completo e pronto
- ✅ README.md atualizado

## 🔒 Arquivos que NÃO serão enviados (protegidos pelo .gitignore):

- `backend/.env` (configurações sensíveis)
- `frontend-web/.env.local` (configurações sensíveis)
- `node_modules/` (dependências)
- `uploads/` (arquivos enviados pelos usuários)
- `.next/` (build do Next.js)
- Arquivos temporários e logs

## 📝 Próximos Commits

Para fazer alterações futuras:

```bash
# Ver o que mudou
git status

# Adicionar arquivos alterados
git add .

# Criar commit
git commit -m "Descrição da alteração"

# Enviar para GitHub
git push
```

## 🎯 Dica

Se você já tem um repositório no GitHub e quer usar ele:

```bash
# Remover o remote atual (se houver)
git remote remove origin

# Adicionar seu repositório
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git

# Enviar
git push -u origin main
```

---

**Pronto!** O projeto está configurado e pronto para ser enviado ao GitHub! 🎉

