# 🚀 Guia Completo de Deploy - Sistema Pós-Obra

Este guia vai te ajudar a colocar o sistema completo online de forma gratuita.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Passo 1: Banco de Dados](#passo-1-banco-de-dados)
3. [Passo 2: Backend API](#passo-2-backend-api)
4. [Passo 3: Frontend Web](#passo-3-frontend-web)
5. [Passo 4: Configuração e Testes](#passo-4-configuração-e-testes)
6. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

- Conta no GitHub (para hospedar o código)
- Email para criar contas nos serviços
- 30-60 minutos para configurar tudo

---

## Passo 1: Banco de Dados

### Opção A: Supabase (Recomendado)

1. **Criar conta no Supabase**
   - Acesse: https://supabase.com
   - Clique em "Start your project"
   - Faça login com GitHub

2. **Criar novo projeto**
   - Clique em "New Project"
   - Escolha uma organização (ou crie uma)
   - Preencha:
     - **Name**: pos-obra-db
     - **Database Password**: (anote esta senha!)
     - **Region**: Escolha a mais próxima (ex: South America)
   - Clique em "Create new project"
   - Aguarde 2-3 minutos para criação

3. **Obter credenciais**
   - Vá em **Settings** > **Database**
   - Anote as informações:
     - **Host**: `db.xxxxx.supabase.co`
     - **Database name**: `postgres`
     - **Port**: `5432`
     - **User**: `postgres`
     - **Password**: (a que você criou)

4. **Connection String** (opcional, mas útil)
   - Na mesma página, role até "Connection string"
   - Copie a URI (começa com `postgresql://`)

### Opção B: Neon (Alternativa)

1. Acesse: https://neon.tech
2. Crie conta com GitHub
3. Clique em "Create Project"
4. Escolha região e copie as credenciais

---

## Passo 2: Backend API

### Opção A: Railway (Recomendado - Mais fácil)

1. **Criar conta no Railway**
   - Acesse: https://railway.app
   - Clique em "Start a New Project"
   - Faça login com GitHub

2. **Conectar repositório**
   - Clique em "New Project"
   - Escolha "Deploy from GitHub repo"
   - Autorize Railway a acessar seu GitHub
   - Selecione o repositório do projeto
   - Escolha a branch `main` ou `master`

3. **Configurar o serviço**
   - Railway detectará automaticamente que é Node.js
   - Clique no serviço criado
   - Vá em **Settings** > **Root Directory**
   - Defina: `backend`
   - Vá em **Settings** > **Start Command**
   - Defina: `npm start`

4. **Adicionar PostgreSQL**
   - No projeto, clique em "+ New"
   - Escolha "Database" > "Add PostgreSQL"
   - Railway criará um banco automaticamente
   - OU use o banco do Supabase/Neon que você criou

5. **Configurar variáveis de ambiente**
   - No serviço do backend, vá em **Variables**
   - Adicione as seguintes variáveis:

```env
# Banco de Dados (use as credenciais do Supabase/Neon)
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=sua-senha-aqui

# JWT e Segurança
JWT_SECRET=uma-chave-super-secreta-aleatoria-com-pelo-menos-32-caracteres
JWT_EXPIRES_IN=7d

# Ambiente
NODE_ENV=production
PORT=3001

# URLs (você vai atualizar depois com as URLs reais)
FRONTEND_URL=https://seu-app.vercel.app
MOBILE_URL=exp://seu-app.expo.dev
```

6. **Deploy**
   - Railway fará deploy automático
   - Aguarde o build terminar
   - Anote a URL gerada (ex: `https://seu-backend.up.railway.app`)

### Opção B: Render (Alternativa)

1. Acesse: https://render.com
2. Faça login com GitHub
3. Clique em "New" > "Web Service"
4. Conecte seu repositório
5. Configure:
   - **Name**: pos-obra-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Adicione as mesmas variáveis de ambiente do Railway
7. Clique em "Create Web Service"

---

## Passo 3: Frontend Web

### Vercel (Gratuito e automático)

1. **Criar conta no Vercel**
   - Acesse: https://vercel.com
   - Clique em "Sign Up"
   - Faça login com GitHub

2. **Importar projeto**
   - Clique em "Add New" > "Project"
   - Selecione seu repositório GitHub
   - Clique em "Import"

3. **Configurar projeto**
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `frontend-web`
   - **Build Command**: `npm run build` (já vem preenchido)
   - **Output Directory**: `.next` (já vem preenchido)
   - **Install Command**: `npm install` (já vem preenchido)

4. **Variáveis de ambiente**
   - Role até "Environment Variables"
   - Adicione:
     ```
     NEXT_PUBLIC_API_URL=https://seu-backend.up.railway.app
     ```
     (Use a URL do seu backend do Railway/Render)

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Anote a URL gerada (ex: `https://seu-app.vercel.app`)

6. **Atualizar backend**
   - Volte no Railway/Render
   - Atualize a variável `FRONTEND_URL` com a URL do Vercel
   - Faça redeploy do backend

---

## Passo 4: Configuração e Testes

### 1. Testar Backend

```bash
# Teste o health check
curl https://seu-backend.up.railway.app/health

# Deve retornar:
# {"status":"ok","timestamp":"...","environment":"production"}
```

### 2. Testar Frontend

1. Acesse a URL do Vercel
2. Tente criar uma conta
3. Verifique se consegue fazer login
4. Teste criar um serviço

### 3. Verificar Logs

**Railway:**
- Vá no serviço > aba "Deployments" > clique no deployment > "View Logs"

**Vercel:**
- Vá no projeto > aba "Deployments" > clique no deployment > "View Function Logs"

### 4. Configurar CORS (se necessário)

Se tiver erros de CORS, verifique no backend:
- `FRONTEND_URL` está configurada corretamente
- A URL do frontend está na lista de origens permitidas

---

## Configurações Adicionais

### Upload de Arquivos

O sistema usa armazenamento local. Para produção, considere:

1. **Cloudinary** (recomendado)
   - Crie conta: https://cloudinary.com
   - Configure no backend

2. **AWS S3** (alternativa)
   - Mais complexo, mas escalável

### Email (Opcional)

Se quiser enviar emails:
1. Configure SMTP no backend
2. Adicione variáveis:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=sua-senha-app
   ```

### Domínio Personalizado

**Vercel:**
1. Vá em Settings > Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções

**Railway:**
1. Vá em Settings > Networking
2. Adicione domínio customizado

---

## Troubleshooting

### Erro: "Cannot connect to database"

✅ **Solução:**
- Verifique se as credenciais do banco estão corretas
- Verifique se o banco permite conexões externas (Supabase/Neon permitem)
- Teste a conexão com um cliente PostgreSQL

### Erro: "CORS policy"

✅ **Solução:**
- Verifique se `FRONTEND_URL` está configurada no backend
- Adicione a URL exata (com https://)
- Reinicie o backend após alterar

### Erro: "Rate limit exceeded"

✅ **Solução:**
- Isso é normal! O sistema tem rate limiting ativo
- Aguarde alguns minutos e tente novamente
- Em produção, ajuste os limites em `rateLimiter.middleware.js`

### Build falha no Vercel

✅ **Solução:**
- Verifique os logs de build
- Certifique-se que `package.json` está correto
- Verifique se todas as dependências estão instaladas

### Backend não inicia

✅ **Solução:**
- Verifique os logs no Railway/Render
- Certifique-se que `PORT` está configurada (Railway define automaticamente)
- Verifique se o banco está acessível

---

## Checklist Final

- [ ] Banco de dados criado e acessível
- [ ] Backend deployado e respondendo
- [ ] Frontend deployado e acessível
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] Testei criar conta
- [ ] Testei fazer login
- [ ] Testei criar serviço
- [ ] Logs estão funcionando
- [ ] URLs anotadas e documentadas

---

## URLs Importantes

Anote suas URLs aqui:

- **Backend**: `https://________________.railway.app`
- **Frontend**: `https://________________.vercel.app`
- **Banco de Dados**: `________________.supabase.co`

---

## Próximos Passos

1. ✅ Sistema online e funcionando
2. 📱 Configurar app mobile (opcional)
3. 📧 Configurar emails (opcional)
4. 🌐 Adicionar domínio personalizado (opcional)
5. 📊 Configurar analytics (opcional)

---

## Suporte

Se tiver problemas:
1. Verifique os logs
2. Consulte o arquivo `TROUBLESHOOTING.md`
3. Verifique se todas as variáveis estão configuradas

**Boa sorte com o deploy! 🚀**

