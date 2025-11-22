# 🚀 Como Executar o Sistema Online pelo GitHub

## ✅ Sim! Você pode executar o sistema online usando GitHub

O GitHub permite fazer deploy automático usando serviços gratuitos. Este guia mostra como fazer isso em **menos de 30 minutos**.

---

## 📋 O que você vai precisar

- ✅ Conta no GitHub (gratuita)
- ✅ Email para criar contas nos serviços de deploy
- ✅ 30 minutos do seu tempo

---

## 🎯 Opções de Deploy Gratuito

### **Opção 1: Deploy Completo Automático** (Recomendado)
- **Frontend**: Vercel (gratuito, automático)
- **Backend**: Railway ou Render (gratuito)
- **Banco de Dados**: Supabase ou Neon (gratuito)

### **Opção 2: Tudo em um lugar**
- **Railway**: Backend + Banco de Dados (gratuito com limites)
- **Vercel**: Frontend (gratuito)

---

## 🚀 Passo a Passo Completo

### **ETAPA 1: Preparar o Código no GitHub** (5 min)

#### 1.1 Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `pos-obra` (ou outro nome)
   - **Description**: Sistema de Assistência Técnica Pós-Obra
   - **Public** ou **Private** (sua escolha)
3. **NÃO** marque "Initialize with README" (você já tem código)
4. Clique em **"Create repository"**

#### 1.2 Fazer upload do código

**No terminal, na pasta do seu projeto:**

```bash
# 1. Inicializar git (se ainda não fez)
cd "/Users/mac/Pós obra"
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer commit inicial
git commit -m "Initial commit - Sistema Pós-Obra completo"

# 4. Renomear branch para main
git branch -M main

# 5. Adicionar repositório remoto (SUBSTITUA SEU-USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU-USUARIO/pos-obra.git

# 6. Enviar código para GitHub
git push -u origin main
```

**✅ Pronto! Seu código está no GitHub.**

---

### **ETAPA 2: Banco de Dados PostgreSQL** (5 min)

#### Opção A: Supabase (Recomendado - Mais fácil)

1. **Criar conta**
   - Acesse: https://supabase.com
   - Clique em **"Start your project"**
   - Faça login com **GitHub** (mais rápido)

2. **Criar projeto**
   - Clique em **"New Project"**
   - Preencha:
     - **Name**: `pos-obra-db`
     - **Database Password**: Crie uma senha forte (⚠️ **ANOTE EM LUGAR SEGURO!**)
     - **Region**: **South America (São Paulo)** - Mais rápido no Brasil
   - Clique em **"Create new project"**
   - Aguarde 2-3 minutos (criação do banco)

3. **Copiar credenciais**
   - Vá em **Settings** (⚙️) > **Database**
   - Role até **"Connection string"**
   - Clique em **"URI"** e copie
   - Ou anote manualmente:
     ```
     Host: db.xxxxx.supabase.co
     Port: 5432
     Database: postgres
     User: postgres
     Password: [sua senha criada]
     ```

#### Opção B: Neon (Alternativa)

1. Acesse: https://neon.tech
2. Login com GitHub
3. Clique em **"Create Project"**
4. Escolha região **São Paulo**
5. Copie as credenciais

**✅ Banco de dados criado!**

---

### **ETAPA 3: Deploy do Backend** (10 min)

#### Opção A: Railway (Recomendado - Mais fácil)

1. **Criar conta**
   - Acesse: https://railway.app
   - Clique em **"Start a New Project"**
   - Faça login com **GitHub**

2. **Conectar repositório**
   - Clique em **"New Project"**
   - Escolha **"Deploy from GitHub repo"**
   - Autorize acesso ao GitHub se necessário
   - Selecione seu repositório `pos-obra`
   - Railway vai detectar automaticamente

3. **Configurar o serviço**
   - Railway criou um serviço automaticamente
   - Clique no serviço criado
   - Vá em **Settings** (⚙️)
   - Configure:
     - **Root Directory**: `backend`
     - **Start Command**: `npm start`
   - Clique em **"Save"**

4. **Adicionar PostgreSQL (se não tiver)**
   - No projeto, clique em **"+ New"**
   - Escolha **"Database"** > **"Add PostgreSQL"**
   - Railway cria um banco gratuito
   - **OU** use o Supabase que você já criou

5. **Configurar variáveis de ambiente**
   - No serviço do backend, clique em **"Variables"**
   - Clique em **"+ New Variable"**
   - Adicione uma por uma:

```env
# Banco de Dados (use as credenciais do Supabase)
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=sua-senha-do-supabase

# JWT e Segurança
JWT_SECRET=uma-chave-super-secreta-aleatoria-com-pelo-menos-32-caracteres-123456789
JWT_EXPIRES_IN=7d

# Ambiente
NODE_ENV=production
PORT=3001

# URLs (você vai atualizar depois com as URLs finais)
FRONTEND_URL=https://seu-app.vercel.app
MOBILE_URL=exp://seu-app.expo.dev

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

6. **Deploy automático**
   - Railway vai fazer deploy automaticamente
   - Aguarde 2-3 minutos
   - Vá em **Settings** > **Domains**
   - Anote a URL gerada (ex: `https://seu-backend.up.railway.app`)
   - **✅ Backend deployado!**

#### Opção B: Render (Alternativa)

1. Acesse: https://render.com
2. Login com GitHub
3. Clique em **"New"** > **"Web Service"**
4. Conecte seu repositório `pos-obra`
5. Configure:
   - **Name**: `pos-obra-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Adicione as mesmas variáveis de ambiente
7. Clique em **"Create Web Service"**
8. Aguarde deploy (pode demorar 5-10 minutos)

---

### **ETAPA 4: Deploy do Frontend** (5 min)

#### Vercel (Gratuito e automático)

1. **Criar conta**
   - Acesse: https://vercel.com
   - Clique em **"Sign Up"**
   - Faça login com **GitHub**

2. **Importar projeto**
   - Clique em **"Add New"** > **"Project"**
   - Selecione seu repositório `pos-obra`
   - Clique em **"Import"**

3. **Configurar projeto**
   - **Framework Preset**: Next.js (detectado automaticamente ✅)
   - **Root Directory**: `frontend-web` ⚠️ **IMPORTANTE!**
   - **Build Command**: `npm run build` (já vem preenchido)
   - **Output Directory**: `.next` (já vem preenchido)
   - **Install Command**: `npm install` (já vem preenchido)

4. **Variáveis de ambiente**
   - Role até **"Environment Variables"**
   - Clique em **"Add"**
   - Adicione:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: https://seu-backend.up.railway.app
     ```
     (Use a URL do seu backend do Railway/Render)

5. **Deploy**
   - Clique em **"Deploy"**
   - Aguarde 2-3 minutos
   - Vercel vai mostrar o progresso
   - Quando terminar, anote a URL gerada (ex: `https://seu-app.vercel.app`)
   - **✅ Frontend deployado!**

---

### **ETAPA 5: Atualizar URLs** (2 min)

1. **Atualizar backend**
   - Volte no Railway/Render
   - Vá em **Variables**
   - Encontre `FRONTEND_URL`
   - Atualize com a URL do Vercel:
     ```
     FRONTEND_URL=https://seu-app.vercel.app
     ```
   - Railway/Render vai fazer redeploy automaticamente

2. **Verificar CORS**
   - O backend já está configurado para aceitar requisições do frontend
   - Não precisa fazer nada adicional

---

### **ETAPA 6: Testar o Sistema** (3 min)

1. **Testar Backend**
   ```bash
   # No navegador, acesse:
   https://seu-backend.up.railway.app/health
   
   # Deve retornar:
   {"status":"ok","timestamp":"...","environment":"production"}
   ```

2. **Testar Frontend**
   - Acesse a URL do Vercel
   - Tente criar uma conta em `/register`
   - Faça login em `/login`
   - Teste criar um serviço
   - Teste upload de foto/áudio

3. **Verificar Logs (se houver problemas)**
   - **Railway**: Serviço > **Deployments** > **View Logs**
   - **Vercel**: Projeto > **Deployments** > Clique no deployment > **View Function Logs**

---

## 🔄 Deploy Automático (CI/CD)

### **GitHub Actions (Opcional - Avançado)**

O GitHub pode fazer deploy automático a cada push:

- **Vercel**: Já conectado automaticamente - cada push faz deploy
- **Railway**: Já conectado automaticamente - cada push faz deploy
- **Render**: Já conectado automaticamente - cada push faz deploy

**✅ Não precisa fazer nada!** Cada vez que você fizer `git push`, o sistema atualiza automaticamente.

---

## 📝 Checklist Final

- [ ] Código enviado para GitHub
- [ ] Banco de dados criado (Supabase/Neon)
- [ ] Backend deployado (Railway/Render)
- [ ] Frontend deployado (Vercel)
- [ ] Variáveis de ambiente configuradas
- [ ] URLs atualizadas (FRONTEND_URL no backend)
- [ ] Teste de criação de conta funcionando
- [ ] Teste de login funcionando
- [ ] Teste de upload funcionando
- [ ] Sistema acessível publicamente

---

## 🆘 Problemas Comuns e Soluções

### ❌ Erro: "Cannot connect to database"

**Solução:**
- Verifique se as credenciais do banco estão corretas
- No Supabase: Settings > Database > Connection Pooling
- Verifique se o IP do Railway está liberado (geralmente já está)

### ❌ Erro: "CORS policy"

**Solução:**
- Verifique se `FRONTEND_URL` está configurada corretamente no backend
- Verifique se a URL está exata (com/sem www, http/https)
- A URL deve ser exatamente igual à do Vercel

### ❌ Erro: "Module not found"

**Solução:**
- Verifique se o `package.json` tem todas as dependências
- Railway/Render instala automaticamente, mas pode demorar
- Veja os logs do deploy

### ❌ Upload não funciona

**Solução:**
- Verifique se a pasta `uploads` existe no servidor
- Railway mantém arquivos entre deploys
- Render pode perder arquivos em reinicializações
- **Para produção**: Considere usar Cloudinary ou AWS S3

### ❌ Frontend não conecta ao backend

**Solução:**
- Verifique se `NEXT_PUBLIC_API_URL` está configurada no Vercel
- Verifique se a URL do backend está correta (sem barra no final)
- Teste a URL do backend diretamente: `https://seu-backend.up.railway.app/health`
- Verifique os logs do Vercel

### ❌ Build falha no Vercel

**Solução:**
- Verifique se o **Root Directory** está como `frontend-web`
- Verifique os logs do build no Vercel
- Certifique-se de que todas as dependências estão no `package.json`

---

## 🎉 Pronto!

Seu sistema está online! Compartilhe as URLs:

- **🌐 Frontend**: `https://seu-app.vercel.app`
- **🔧 Backend API**: `https://seu-backend.up.railway.app`
- **💚 Health Check**: `https://seu-backend.up.railway.app/health`

---

## 📚 Recursos Adicionais

### Limites Gratuitos

**Vercel:**
- ✅ Deploys ilimitados
- ✅ 100GB de bandwidth/mês
- ✅ Domínios personalizados gratuitos

**Railway:**
- ✅ $5 crédito grátis/mês
- ✅ Suficiente para projetos pequenos/médios

**Supabase:**
- ✅ 500MB de banco de dados
- ✅ Suficiente para começar

### Upgrade para Produção

Quando precisar de mais recursos:
- **Vercel Pro**: $20/mês (mais bandwidth)
- **Railway**: Pay-as-you-go
- **Supabase Pro**: $25/mês (mais espaço)

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [ ] `JWT_SECRET` é uma chave forte e aleatória
- [ ] Senha do banco de dados é forte
- [ ] `NODE_ENV=production` está configurado
- [ ] CORS está configurado corretamente
- [ ] Rate limiting está ativo (já configurado no backend)

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs nos serviços (Railway/Vercel)
2. Consulte a documentação:
   - [Vercel Docs](https://vercel.com/docs)
   - [Railway Docs](https://docs.railway.app)
   - [Supabase Docs](https://supabase.com/docs)

---

**✅ Agora seu sistema está online e acessível de qualquer lugar do mundo!**

**Cada vez que você fizer `git push`, o sistema atualiza automaticamente! 🚀**

