# 🔍 Como Descobrir o IP IPv4 do Supabase

## ⚠️ Problema

O Railway não consegue resolver DNS para IPv4 do Supabase. Precisamos descobrir o IP manualmente.

---

## 📋 Método 1: Usando nslookup (Recomendado)

### No seu computador local:

```bash
nslookup db.iqcsixuzgktknuyuabfc.supabase.co 8.8.8.8
```

**Ou:**

```bash
nslookup -type=A db.iqcsixuzgktknuyuabfc.supabase.co 8.8.8.8
```

### Exemplo de saída:
```
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	db.iqcsixuzgktknuyuabfc.supabase.co
Address: 54.xxx.xxx.xxx  ← ESTE É O IP IPv4 QUE VOCÊ PRECISA
```

---

## 📋 Método 2: Usando dig

```bash
dig +short db.iqcsixuzgktknuyuabfc.supabase.co A @8.8.8.8
```

---

## 📋 Método 3: Usando Site Online

1. Acesse: https://www.whatsmydns.net/#A/db.iqcsixuzgktknuyuabfc.supabase.co
2. Procure por um resultado IPv4 (formato: xxx.xxx.xxx.xxx)
3. Anote o IP

---

## ✅ Depois de Descobrir o IP

### No Railway:

1. Vá em **Variables**
2. Adicione uma **NOVA** variável:
   - **Nome**: `DB_HOST_IP`
   - **Valor**: `54.xxx.xxx.xxx` (substitua pelo IP real que você descobriu)
3. **MANTENHA** `DB_HOST` com o hostname original:
   - `DB_HOST=db.iqcsixuzgktknuyuabfc.supabase.co`
4. Salve e aguarde redeploy

---

## 🔍 O que o código faz agora:

1. ✅ Se `DB_HOST_IP` estiver definido, usa diretamente (bypass DNS)
2. ✅ Se não, tenta resolver `DB_HOST` para IPv4
3. ✅ Se resolução falhar, mostra instruções claras

---

## ⚠️ IMPORTANTE

- **NÃO remova** `DB_HOST` - mantenha com o hostname
- **ADICIONE** `DB_HOST_IP` com o IP IPv4
- O código usará `DB_HOST_IP` se estiver definido

---

## 📝 Exemplo de Configuração Final:

```
DB_HOST=db.iqcsixuzgktknuyuabfc.supabase.co
DB_HOST_IP=54.xxx.xxx.xxx  ← IP IPv4 que você descobriu
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=Marcelo30$
NODE_ENV=production
```

