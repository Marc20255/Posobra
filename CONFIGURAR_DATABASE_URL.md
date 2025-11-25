# 🚀 Configurar DATABASE_URL no Railway

## ✅ Código Atualizado e Enviado

O código foi atualizado para resolver o problema de IPv6 e já está no GitHub!

---

## 📋 Passo a Passo para Configurar

### 1️⃣ Obter Connection String do Supabase

1. Acesse: https://supabase.com/dashboard/project/iqcsixuzgktknuyuabfc
2. Vá em **Settings** → **Database**
3. Role até **Connection Pooling**
4. Na aba **"URI"**, copie a connection string
5. Ela deve ser algo como:
   ```
   postgresql://postgres:[SENHA]@db.iqcsixuzgktknuyuabfc.supabase.co:6543/postgres?pgbouncer=true
   ```
6. **Substitua `[SENHA]` pela sua senha real**: `Marcelo30$`

### 2️⃣ Adicionar no Railway

1. Acesse o Railway: https://railway.app
2. Abra o projeto **Posobra**
3. Clique no serviço **Posobra** (backend)
4. Vá na aba **Variables**
5. Clique em **+ New Variable**
6. Configure:
   - **Name**: `DATABASE_URL`
   - **Value**: Cole a connection string completa (com a senha substituída)
   - Exemplo:
     ```
     postgresql://postgres:Marcelo30$@db.iqcsixuzgktknuyuabfc.supabase.co:6543/postgres?pgbouncer=true
     ```
7. Clique em **Add**

### 3️⃣ Verificar Variáveis Existentes

Certifique-se de que estas variáveis também estão configuradas:
- ✅ `NODE_ENV=production`
- ✅ `PORT=3001` (ou a porta que você configurou)

**Você pode manter ou remover as variáveis individuais** (`DB_HOST`, `DB_PORT`, etc.) - o código vai usar `DATABASE_URL` se ela existir.

### 4️⃣ Redeploy

1. Após adicionar `DATABASE_URL`, o Railway vai fazer redeploy automaticamente
2. Ou clique em **Deploy** → **Redeploy** manualmente
3. Aguarde o build completar

### 5️⃣ Verificar Logs

1. Vá na aba **Deploy Logs**
2. Procure por:
   - ✅ `✅ Resolvido [hostname] para IPv4: [IP]`
   - ✅ `✅ Conectado ao banco de dados PostgreSQL`
   - ✅ `✅ Tabelas do banco de dados criadas/verificadas com sucesso`

---

## 🔍 O que foi corrigido?

1. ✅ **Resolução DNS para IPv4**: O código agora resolve o hostname do Supabase para IPv4 antes de criar a conexão
2. ✅ **Suporte a DATABASE_URL**: Pode usar connection string completa ou variáveis individuais
3. ✅ **Compatibilidade**: Mantém compatibilidade com todos os arquivos existentes

---

## ⚠️ Se ainda der erro

1. Verifique se a `DATABASE_URL` está correta (senha, hostname, porta)
2. Verifique se está usando porta **6543** (pooling) ou **5432** (direto)
3. Verifique os logs para ver qual erro específico está ocorrendo
4. Certifique-se de que o código foi atualizado (deve aparecer logs sobre resolução IPv4)

---

**🚀 Depois de configurar, o sistema deve conectar com sucesso!**

