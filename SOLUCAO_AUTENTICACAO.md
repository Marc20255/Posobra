# 🔐 Solução de Autenticação GitHub

## ❌ Problema
GitHub não aceita mais senhas. É necessário usar **Personal Access Token (PAT)** ou **SSH**.

## ✅ SOLUÇÃO MAIS FÁCIL: GitHub Desktop

### Passo a Passo:
1. **Abra o GitHub Desktop**
2. **Certifique-se que está logado** com a conta `Marc20255`
   - Se não estiver: **File** → **Preferences** → **Accounts** → **Sign in**
3. **No GitHub Desktop**, você verá os 3 commits pendentes
4. **Clique em "Push origin"** (botão azul no topo)
5. ✅ **Pronto!** O GitHub Desktop usa autenticação automática

---

## 🔑 Alternativa: Criar Personal Access Token (PAT)

Se preferir usar o terminal:

### 1. Criar Token no GitHub:
1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: `PosObra-Local`
4. Selecione escopos:
   - ✅ `repo` (acesso completo aos repositórios)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá uma vez!)

### 2. Usar o Token:
```bash
git push origin main
# Username: Marc20255
# Password: [COLE O TOKEN AQUI, NÃO A SENHA]
```

### 3. Salvar Credenciais (opcional):
```bash
git config --global credential.helper osxkeychain
```

---

## 🔐 Alternativa: Configurar SSH (Mais Seguro)

### 1. Verificar se já tem chave SSH:
```bash
ls -al ~/.ssh
```

### 2. Criar nova chave SSH (se não tiver):
```bash
ssh-keygen -t ed25519 -C "Marc20255@github.com"
# Pressione Enter para aceitar local padrão
# Digite uma senha (ou deixe vazio)
```

### 3. Adicionar chave ao ssh-agent:
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### 4. Copiar chave pública:
```bash
cat ~/.ssh/id_ed25519.pub
# Copie toda a saída
```

### 5. Adicionar no GitHub:
1. Acesse: https://github.com/settings/keys
2. Clique em **"New SSH key"**
3. Cole a chave pública
4. Clique em **"Add SSH key"**

### 6. Mudar remote para SSH:
```bash
git remote set-url origin git@github.com:Marc20255/Posobra.git
git push origin main
```

---

## 🎯 RECOMENDAÇÃO

**Use o GitHub Desktop** - é mais fácil e já está configurado!

