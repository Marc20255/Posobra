# 🚀 Como Ver o Projeto Funcionando - Guia Completo

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Baixe em: https://nodejs.org/
   - Verifique instalando: `node --version`

2. **PostgreSQL** (versão 14 ou superior)
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql@14`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`
   - Ou use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:14`

3. **Git** (opcional, se ainda não tiver)
   - Baixe em: https://git-scm.com/

## 🎯 Passo a Passo Completo

### PASSO 1: Preparar o Banco de Dados

1. **Inicie o PostgreSQL** (se não estiver rodando)

2. **Crie o banco de dados:**
```bash
# Abra o terminal e execute:
psql -U postgres

# Dentro do psql, execute:
CREATE DATABASE pos_obra;
\q
```

**OU** se estiver usando Docker:
```bash
docker exec -it postgres psql -U postgres
CREATE DATABASE pos_obra;
\q
```

### PASSO 2: Configurar o Backend

1. **Abra um terminal e vá para a pasta do backend:**
```bash
cd "Pós obra/backend"
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Crie o arquivo `.env` na pasta backend:**
```bash
# No Mac/Linux:
touch .env

# No Windows:
type nul > .env
```

4. **Abra o arquivo `.env` e cole este conteúdo:**
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=qualiapps-hackquali-2025-secret-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
MOBILE_URL=http://localhost:19006
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**⚠️ IMPORTANTE:** Se sua senha do PostgreSQL for diferente de "postgres", altere `DB_PASS` no arquivo `.env`.

5. **Crie a pasta de uploads:**
```bash
mkdir -p uploads/photos
mkdir -p uploads/documents
mkdir -p uploads/general
```

6. **Inicie o servidor backend:**
```bash
npm run dev
```

**✅ Você deve ver:**
```
✅ Conectado ao banco de dados PostgreSQL
✅ Tabelas do banco de dados criadas/verificadas com sucesso
🚀 Servidor rodando na porta 3001
```

**Mantenha este terminal aberto!**

### PASSO 3: Configurar o Frontend Web

1. **Abra um NOVO terminal** (deixe o backend rodando)

2. **Vá para a pasta do frontend:**
```bash
cd "Pós obra/frontend-web"
```

3. **Instale as dependências:**
```bash
npm install
```

4. **Crie o arquivo `.env.local`:**
```bash
# Mac/Linux:
touch .env.local

# Windows:
type nul > .env.local
```

5. **Abra o arquivo `.env.local` e cole:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

6. **Inicie o frontend:**
```bash
npm run dev
```

**✅ Você deve ver:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
```

7. **Abra seu navegador e acesse:**
```
http://localhost:3000
```

**🎉 Você deve ver a página inicial do projeto!**

### PASSO 4: Testar o Sistema

#### 4.1 Criar Conta de Construtora

1. Clique em **"Criar Conta"** ou acesse: `http://localhost:3000/register`

2. Preencha:
   - Nome: `Construtora Teste`
   - Email: `constructor@test.com`
   - Tipo de conta: **Construtora**
   - Senha: `senha123`
   - Confirmar senha: `senha123`

3. Clique em **"Criar conta"**

4. Você será redirecionado para o dashboard

#### 4.2 Criar Empreendimento (como Construtora)

1. No dashboard, você verá opções para criar empreendimento
2. Ou acesse diretamente a API: `http://localhost:3001/api/developments`
3. Use um cliente HTTP como Postman ou Insomnia para criar:

**POST** `http://localhost:3001/api/developments`
**Headers:** `Authorization: Bearer [seu-token]`
**Body (JSON):**
```json
{
  "name": "Residencial QualiApps",
  "address": "Rua Exemplo, 123",
  "city": "Porto Velho",
  "state": "RO",
  "zip_code": "76800000",
  "total_units": 50
}
```

#### 4.3 Criar Unidade

**POST** `http://localhost:3001/api/developments/1/units`
**Headers:** `Authorization: Bearer [seu-token]`
**Body (JSON):**
```json
{
  "unit_number": "101",
  "block": "A",
  "floor": 1,
  "type": "Apartamento",
  "area": 75.5
}
```

**✅ Anote o `unit_code` retornado!** (você precisará dele depois)

#### 4.4 Criar Conta de Morador

1. Faça logout da conta de construtora
2. Crie nova conta:
   - Nome: `João Silva`
   - Email: `joao@test.com`
   - Tipo: **Cliente**
   - Senha: `senha123`

#### 4.5 Vincular Unidade (como Morador)

1. No dashboard, procure por "Vincular Unidade" ou "Meus Imóveis"
2. Cole o `unit_code` que você anotou
3. Clique em vincular

**OU** via API:

**POST** `http://localhost:3001/api/developments/units/link`
**Headers:** `Authorization: Bearer [token-do-morador]`
**Body (JSON):**
```json
{
  "unit_code": "1-101-ABC12345"
}
```

#### 4.6 Criar Chamado (como Morador)

1. No dashboard, clique em **"Novo Serviço"** ou **"Criar Chamado"**
2. Preencha:
   - Título: `Vazamento no banheiro`
   - Categoria: `Hidráulica`
   - Descrição: `Há um vazamento constante na torneira do banheiro`
   - Prioridade: `Alta`
   - Selecione a unidade vinculada
3. Adicione fotos (opcional)
4. Clique em **"Criar"**

#### 4.7 Visualizar Chamados (como Construtora)

1. Faça login como construtora novamente
2. No dashboard, você verá todos os chamados
3. Filtre por status, prioridade, empreendimento
4. Veja os analytics e indicadores

## 📱 Testar o App Mobile (Opcional)

### Pré-requisitos Mobile:
- Node.js instalado
- Expo CLI: `npm install -g expo-cli`
- App Expo Go no celular (iOS ou Android)

### Passos:

1. **Abra um NOVO terminal**

2. **Vá para a pasta mobile:**
```bash
cd "Pós obra/mobile"
```

3. **Instale as dependências:**
```bash
npm install
```

4. **Atualize a URL da API no arquivo `src/lib/api.ts`:**
```typescript
const API_URL = 'http://SEU-IP-LOCAL:3001'
```

**Para descobrir seu IP local:**
- Mac/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig` (procure por IPv4)

5. **Inicie o Expo:**
```bash
npm start
```

6. **Escaneie o QR Code** com o app Expo Go no celular

7. **Certifique-se** de que seu celular e computador estão na mesma rede Wi-Fi

## 🔍 Verificar se Está Funcionando

### Teste 1: Backend está rodando?
```bash
curl http://localhost:3001/health
```

**Deve retornar:**
```json
{"status":"ok","timestamp":"...","environment":"development"}
```

### Teste 2: Frontend está rodando?
- Acesse: `http://localhost:3000`
- Deve ver a página inicial

### Teste 3: Banco de dados conectado?
- Verifique o terminal do backend
- Deve ver: `✅ Conectado ao banco de dados PostgreSQL`

### Teste 4: Criar usuário via API
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@test.com",
    "password": "senha123",
    "role": "client"
  }'
```

**Deve retornar:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {...}
}
```

## 🐛 Problemas Comuns e Soluções

### Erro: "Cannot connect to database"
**Solução:**
- Verifique se PostgreSQL está rodando
- Confirme usuário e senha no `.env`
- Teste conexão: `psql -U postgres -d pos_obra`

### Erro: "Port 3001 already in use"
**Solução:**
- Pare o processo: `lsof -ti:3001 | xargs kill` (Mac/Linux)
- Ou altere a porta no `.env`

### Erro: "Module not found"
**Solução:**
- Delete `node_modules` e `package-lock.json`
- Execute `npm install` novamente

### Frontend não conecta ao backend
**Solução:**
- Verifique se backend está rodando na porta 3001
- Confirme `NEXT_PUBLIC_API_URL` no `.env.local`
- Limpe cache: `rm -rf .next` (Mac/Linux) ou `rmdir /s .next` (Windows)

### Mobile não conecta
**Solução:**
- Use IP local, não localhost
- Certifique-se que celular e PC estão na mesma rede
- Verifique firewall do computador

## 📊 Estrutura de Telas para Testar

### Como Construtora:
1. ✅ Dashboard com estatísticas
2. ✅ Criar empreendimento
3. ✅ Adicionar unidades
4. ✅ Ver todos os chamados
5. ✅ Filtrar chamados
6. ✅ Ver analytics por empreendimento
7. ✅ Atribuir técnicos
8. ✅ Ver custos de manutenção

### Como Morador:
1. ✅ Vincular unidade via código
2. ✅ Criar chamado
3. ✅ Acompanhar status
4. ✅ Agendar visita
5. ✅ Chat com técnico
6. ✅ Avaliar serviço (obrigatório)
7. ✅ Ver histórico

### Como Técnico:
1. ✅ Receber chamados
2. ✅ Agendar visitas
3. ✅ Registrar custos
4. ✅ Comunicar com cliente
5. ✅ Marcar como concluído

## 🎥 Para Gravar o Vídeo de Demonstração

1. **Use OBS Studio** ou **QuickTime** (Mac) para gravar tela
2. **Mostre os fluxos principais:**
   - Login como construtora
   - Criar empreendimento e unidade
   - Login como morador
   - Vincular unidade
   - Criar chamado
   - Atribuir técnico (construtora)
   - Agendar visita
   - Concluir serviço
   - Avaliar (morador)
   - Ver analytics (construtora)

## ✅ Checklist Final

- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 3000
- [ ] Banco de dados criado e conectado
- [ ] Consegui criar conta de construtora
- [ ] Consegui criar empreendimento
- [ ] Consegui criar unidade
- [ ] Consegui criar conta de morador
- [ ] Consegui vincular unidade
- [ ] Consegui criar chamado
- [ ] Consegui ver analytics

## 🆘 Precisa de Ajuda?

Se algo não funcionar:
1. Verifique os logs no terminal
2. Confirme todas as configurações
3. Teste cada componente separadamente
4. Consulte a documentação em `INSTALL.md`

---

**Boa sorte! 🚀**

