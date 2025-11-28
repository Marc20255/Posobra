# ✅ Próximos Passos Após Reconectar o Repositório

## 🎯 Você Já Fez

- ✅ Desconectou o repositório antigo (`mvip23/posobra`)
- ✅ Conectou ao repositório correto (`Marc20255/Posobra`)

---

## 📋 Agora Precisamos Configurar

### 1️⃣ Verificar Root Directory

1. No Vercel, vá em **Settings** → **General**
2. Procure por **"Root Directory"**
3. Deve estar configurado como: `frontend-web`
4. Se estiver vazio ou diferente, altere para: `frontend-web`
5. Clique em **"Save"**

### 2️⃣ Configurar Variáveis de Ambiente

1. No Vercel, vá em **Settings** → **Environment Variables**
2. Clique em **"Add New"** ou **"Add"**
3. Adicione:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://posobra-production.up.railway.app`
     (Use a URL do seu backend no Railway - ajuste se necessário)
   - **Environment**: Selecione todas:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
4. Clique em **"Save"**

### 3️⃣ Fazer Novo Deploy

1. No Vercel, vá em **Deployments**
2. Clique em **"Create Deployment"** ou **"Redeploy"**
3. Selecione:
   - **Branch**: `main`
   - **Commit**: Deixe em branco (usa o mais recente automaticamente)
4. Clique em **"Deploy"**
5. Aguarde o build (2-3 minutos)

---

## 🔍 Verificar se Funcionou

### Nos Build Logs Deve Aparecer:

✅ **Correto:**
```
Cloning github.com/Marc20255/Posobra (Branch: main, Commit: [commit recente])
Installing dependencies...
Building...
```

❌ **Não Deve Aparecer:**
- `mvip23/posobra`
- `fca2af0`
- `The specified Root Directory "frontend-web" does not exist`

---

## 📝 Checklist Rápido

- [ ] Root Directory configurado como `frontend-web`
- [ ] Variável `NEXT_PUBLIC_API_URL` adicionada
- [ ] Novo deploy iniciado com branch `main`
- [ ] Build logs mostram repositório correto (`Marc20255/Posobra`)
- [ ] Build completou com sucesso

---

## 🆘 Se Ainda Der Erro

### Erro: "Root Directory does not exist"

1. Verifique se o diretório `frontend-web` existe no GitHub:
   - Acesse: https://github.com/Marc20255/Posobra
   - Verifique se há um diretório `frontend-web` na raiz

2. Se não existir, precisamos fazer commit:
   ```bash
   cd "/Users/mac/Pós obra"
   git add frontend-web/
   git commit -m "feat: Adiciona frontend-web ao repositório"
   git push origin main
   ```

### Erro: "Build failed"

1. Verifique os **Build Logs** completos
2. Procure por erros específicos
3. Compartilhe os logs para análise

---

## ✅ Quando Funcionar

Após o deploy bem-sucedido:

1. Acesse a URL do Vercel (ex: `https://posobra.vercel.app`)
2. Teste o site
3. Verifique se não há erro 404
4. Teste fazer login/cadastro

---

## 🎉 Pronto!

Se tudo estiver configurado corretamente, o frontend deve funcionar! 🚀

