# 🔐 Como Fazer Push para o GitHub

O repositório já está conectado! Agora você precisa autenticar. Escolha uma das opções:

## Opção 1: Usar GitHub CLI (Mais Fácil) ✅

Se você tem o GitHub CLI instalado:

```bash
cd "/Users/mac/Pós obra"
gh auth login
git push -u origin main
```

## Opção 2: Usar Token de Acesso Pessoal

1. **Criar Token no GitHub:**
   - Acesse: https://github.com/settings/tokens
   - Clique em "Generate new token" → "Generate new token (classic)"
   - Dê um nome (ex: "Posobra Local")
   - Marque a opção "repo" (acesso completo aos repositórios)
   - Clique em "Generate token"
   - **COPIE O TOKEN** (você não verá ele novamente!)

2. **Fazer Push usando o Token:**
```bash
cd "/Users/mac/Pós obra"
git push -u origin main
# Quando pedir usuário: digite seu username do GitHub
# Quando pedir senha: cole o TOKEN (não sua senha!)
```

## Opção 3: Usar SSH (Recomendado para uso contínuo)

1. **Gerar chave SSH (se ainda não tiver):**
```bash
ssh-keygen -t ed25519 -C "seu_email@exemplo.com"
# Pressione Enter para aceitar o local padrão
# Pressione Enter para não usar senha (ou defina uma)
```

2. **Copiar a chave pública:**
```bash
cat ~/.ssh/id_ed25519.pub
# Copie toda a saída
```

3. **Adicionar no GitHub:**
   - Acesse: https://github.com/settings/keys
   - Clique em "New SSH key"
   - Cole a chave copiada
   - Salve

4. **Alterar o remote para SSH:**
```bash
cd "/Users/mac/Pós obra"
git remote set-url origin git@github.com:Marc20255/Posobra.git
git push -u origin main
```

## Opção 4: Usar GitHub Desktop

1. Abra o GitHub Desktop
2. File → Add Local Repository
3. Selecione a pasta "Pós obra"
4. Clique em "Publish repository"
5. Marque "Keep this code private" se quiser (ou deixe público)
6. Clique em "Publish repository"

## ✅ Verificar se Funcionou

Após fazer o push, acesse:
https://github.com/Marc20255/Posobra

Você deve ver todos os arquivos do projeto lá!

---

**Dica:** Se você já está logado no GitHub no navegador, a Opção 1 (GitHub CLI) é a mais rápida!

