# 🔧 Corrigir Porta na DATABASE_URL

## ⚠️ Problema Identificado

Você está usando a porta **5432**, mas precisa usar **6543** para connection pooling!

---

## ✅ Connection String Correta

### Formato Correto:
```
postgresql://postgres:Marcelo30$@db.iqcsixuzgktknuyuabfc.supabase.co:6543/postgres?pgbouncer=true
```

### O que mudar:
1. **Porta**: `5432` → `6543` ✅
2. **Adicionar**: `?pgbouncer=true` no final ✅
3. **Senha**: Substituir `[YOUR_PASSWORD]` por `Marcelo30$` ✅

---

## 📋 Passo a Passo no Railway

1. **Acesse Railway**: https://railway.app
2. **Abra o projeto Posobra**
3. **Clique no serviço Posobra** (backend)
4. **Vá em Variables**
5. **Encontre a variável `DATABASE_URL`**
6. **Clique para editar**
7. **Cole este valor EXATO**:
   ```
   postgresql://postgres:Marcelo30$@db.iqcsixuzgktknuyuabfc.supabase.co:6543/postgres?pgbouncer=true
   ```
8. **Salve** (o Railway vai fazer redeploy automaticamente)

---

## 🔍 Diferença entre as Portas

- **5432**: Conexão direta (pode ter problemas de IPv6)
- **6543**: Connection pooling (recomendado, resolve IPv6 automaticamente) ✅

---

## ✅ Depois de Corrigir

Verifique os logs no Railway. Você deve ver:
- ✅ `✅ Resolvido db.iqcsixuzgktknuyuabfc.supabase.co para IPv4: [IP]`
- ✅ `✅ Conectado ao banco de dados PostgreSQL`
- ✅ `✅ Tabelas do banco de dados criadas/verificadas com sucesso`

---

**🚀 Use porta 6543 com `?pgbouncer=true` - é a solução correta!**

