# 🚨 URGENTE: Mude a Porta para 5432

## ⚠️ Problema Atual

Você está usando porta **6543**, que está causando erro de IPv6:
```
ENETUNREACH 2600:1f18:2e13:9d30:753d:361a:63f9:6886:6543
```

---

## ✅ SOLUÇÃO: Mudar Porta para 5432

### Passo a Passo no Railway:

1. **Acesse Railway**: https://railway.app
2. **Abra o projeto Posobra**
3. **Clique no serviço Posobra** (backend)
4. **Vá na aba "Variables"**
5. **Encontre a variável `DB_PORT`**
6. **Clique para editar**
7. **Mude o valor de `6543` para `5432`**
8. **Salve** (Railway vai fazer redeploy automaticamente)

---

## 📋 Variáveis que devem estar configuradas:

```
DB_HOST=db.iqcsixuzgktknuyuabfc.supabase.co
DB_PORT=5432  ← MUDE PARA 5432!
DB_NAME=postgres
DB_USER=postgres
DB_PASS=Marcelo30$
NODE_ENV=production
```

---

## 🔍 Depois de mudar, verifique os logs

Você deve ver:
- `🔍 Porta configurada: 5432`
- `✅ Hostname resolvido para IPv4: [IP]`
- `✅ Conectado ao banco de dados PostgreSQL`

---

## ⚠️ Por que 5432?

- **Porta 5432**: Conexão direta, suporta IPv4 ✅
- **Porta 6543**: Modo transação, problemas com IPv4 ❌

**MUDE PARA 5432 AGORA!**

