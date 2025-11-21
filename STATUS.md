# 📊 Status dos Servidores

## ✅ Como Verificar se Está Funcionando

### 1. Verificar se os servidores estão rodando:

```bash
# Ver processos nas portas 3000 e 3001
lsof -i :3000
lsof -i :3001
```

### 2. Testar no navegador:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001/health

### 3. Testar via terminal:

```bash
# Testar backend
curl http://localhost:3001/health

# Testar frontend
curl http://localhost:3000
```

## 🚀 Iniciar Manualmente

### Terminal 1 - Backend:
```bash
cd "/Users/mac/Pós obra/backend"
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd "/Users/mac/Pós obra/frontend-web"
npm run dev
```

## ⚠️ Problemas Comuns

### Porta 3000 já em uso:
```bash
lsof -ti:3000 | xargs kill
```

### Porta 3001 já em uso:
```bash
lsof -ti:3001 | xargs kill
```

### Frontend não conecta ao backend:
- Verifique se backend está rodando na porta 3001
- Verifique o arquivo `.env.local` no frontend
- Deve conter: `NEXT_PUBLIC_API_URL=http://localhost:3001`

