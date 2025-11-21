# 🎯 COMECE AQUI - Instruções Simples

## ✅ Tudo já está configurado! Agora só precisa iniciar os servidores.

## 🚀 Forma Mais Fácil (Recomendada)

### Opção 1: Usar os Scripts (Mais Fácil)

**Abra 2 terminais:**

**Terminal 1 - Backend:**
```bash
cd "/Users/mac/Pós obra"
./INICIAR_BACKEND.sh
```

**Terminal 2 - Frontend:**
```bash
cd "/Users/mac/Pós obra"
./INICIAR_FRONTEND.sh
```

### Opção 2: Comandos Manuais

**Terminal 1 - Backend:**
```bash
cd "/Users/mac/Pós obra/backend"
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "/Users/mac/Pós obra/frontend-web"
npm run dev
```

## ✅ O que você DEVE ver:

### Terminal 1 (Backend):
```
✅ Conectado ao banco de dados PostgreSQL
✅ Tabelas do banco de dados criadas/verificadas com sucesso
🚀 Servidor rodando na porta 3001
```

### Terminal 2 (Frontend):
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Ready in 2.5s
```

## 🌐 Acesse no Navegador:

1. **Frontend:** http://localhost:3000
2. **Backend (teste):** http://localhost:3001/health

## ⚠️ Se aparecer erro:

### Erro: "Cannot connect to database"
**Solução:** Inicie o PostgreSQL
```bash
brew services start postgresql@14
```

### Erro: "Port already in use"
**Solução:** Mate o processo
```bash
lsof -ti:3001 | xargs kill
lsof -ti:3000 | xargs kill
```

### Erro: "Command not found: npm"
**Solução:** Instale Node.js em https://nodejs.org/

## 📞 Precisa de ajuda?

Consulte: `TROUBLESHOOTING.md` ou `COMO_EXECUTAR.md`

---

**Agora é só iniciar e usar! 🎉**

