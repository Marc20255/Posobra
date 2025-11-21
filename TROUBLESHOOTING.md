# 🔧 Solução de Problemas - ERR_CONNECTION_REFUSED

## ❌ Erro: "A conexão com localhost foi recusada"

Isso significa que os servidores **não estão rodando**. Vamos resolver!

## ✅ Solução Passo a Passo

### 1. Verificar se os Servidores Estão Rodando

Abra o **Terminal** (ou Prompt de Comando no Windows) e verifique:

```bash
# Verificar se algo está rodando na porta 3001 (backend)
lsof -i :3001

# OU no Windows:
netstat -ano | findstr :3001

# Verificar se algo está rodando na porta 3000 (frontend)
lsof -i :3000

# OU no Windows:
netstat -ano | findstr :3000
```

**Se não aparecer nada, os servidores não estão rodando!**

### 2. Iniciar o Backend PRIMEIRO

**Abra um Terminal** e execute:

```bash
# 1. Vá para a pasta do backend
cd "/Users/mac/Pós obra/backend"

# 2. Verifique se node_modules existe
ls -la node_modules

# Se não existir, instale:
npm install

# 3. Verifique se o arquivo .env existe
ls -la .env

# Se não existir, crie:
cat > .env << 'EOF'
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=qualiapps-hackquali-2025
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
MOBILE_URL=http://localhost:19006
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
EOF

# 4. Crie as pastas de upload
mkdir -p uploads/photos uploads/documents uploads/general

# 5. Inicie o servidor
npm run dev
```

**✅ Você DEVE ver:**
```
✅ Conectado ao banco de dados PostgreSQL
✅ Tabelas do banco de dados criadas/verificadas com sucesso
🚀 Servidor rodando na porta 3001
```

**⚠️ Se aparecer algum ERRO, leia a mensagem!**

### 3. Problemas Comuns no Backend

#### Erro: "Cannot find module"
```bash
# Solução: Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

#### Erro: "Port 3001 already in use"
```bash
# Matar processo na porta 3001
lsof -ti:3001 | xargs kill

# OU no Windows:
netstat -ano | findstr :3001
# Anote o PID e execute:
taskkill /PID [PID_NUMBER] /F
```

#### Erro: "Connection refused" no banco de dados
```bash
# Verificar se PostgreSQL está rodando
pg_isready

# OU tentar conectar:
psql -U postgres

# Se não conectar, inicie o PostgreSQL:
# Mac:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql

# Windows: Inicie pelo Services
```

### 4. Iniciar o Frontend

**Abra um NOVO Terminal** (deixe o backend rodando no primeiro):

```bash
# 1. Vá para a pasta do frontend
cd "/Users/mac/Pós obra/frontend-web"

# 2. Verifique se node_modules existe
ls -la node_modules

# Se não existir, instale:
npm install

# 3. Verifique se o arquivo .env.local existe
ls -la .env.local

# Se não existir, crie:
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# 4. Limpe o cache (se já tentou antes)
rm -rf .next

# 5. Inicie o servidor
npm run dev
```

**✅ Você DEVE ver:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Ready in 2.5s
```

### 5. Testar se Está Funcionando

**Agora teste no navegador:**

1. **Backend:** `http://localhost:3001/health`
   - Deve retornar: `{"status":"ok",...}`

2. **Frontend:** `http://localhost:3000`
   - Deve abrir a página inicial

## 🎯 Checklist de Verificação

Execute estes comandos para verificar:

```bash
# 1. Backend está rodando?
curl http://localhost:3001/health

# 2. Frontend está rodando?
curl http://localhost:3000

# 3. Portas estão abertas?
lsof -i :3001
lsof -i :3000
```

## 🐛 Erros Específicos e Soluções

### Erro: "EADDRINUSE: address already in use"
**Solução:** Alguém já está usando a porta
```bash
# Matar processo na porta
lsof -ti:3001 | xargs kill
lsof -ti:3000 | xargs kill
```

### Erro: "MODULE_NOT_FOUND"
**Solução:** Dependências não instaladas
```bash
cd backend && npm install
cd ../frontend-web && npm install
```

### Erro: "Cannot connect to database"
**Solução:** PostgreSQL não está rodando
```bash
# Verificar status
pg_isready

# Iniciar PostgreSQL
brew services start postgresql@14  # Mac
sudo systemctl start postgresql    # Linux
```

### Erro: "database does not exist"
**Solução:** Criar o banco de dados
```bash
createdb pos_obra
```

## 📝 Comandos Rápidos para Copiar e Colar

### Iniciar Tudo de Uma Vez (Mac/Linux)

```bash
# Terminal 1 - Backend
cd "/Users/mac/Pós obra/backend" && npm install && npm run dev

# Terminal 2 - Frontend (abra em nova aba)
cd "/Users/mac/Pós obra/frontend-web" && npm install && npm run dev
```

### Verificar Status

```bash
# Ver processos rodando
ps aux | grep node

# Ver portas em uso
lsof -i :3001
lsof -i :3000
```

## 🆘 Se Nada Funcionar

1. **Feche TODOS os terminais**
2. **Reinicie o computador** (às vezes ajuda)
3. **Siga o guia COMO_EXECUTAR.md do início**
4. **Verifique se Node.js está instalado:**
   ```bash
   node --version
   npm --version
   ```

## 📞 Próximos Passos

Se ainda não funcionar, me diga:
1. Qual erro aparece no terminal?
2. O que aparece quando você executa `npm run dev`?
3. Você conseguiu instalar as dependências (`npm install`)?

---

**Vamos resolver isso juntos! 💪**

