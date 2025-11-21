# 🌐 Como Colocar o Sistema Online - Guia Completo

Este guia vai te ajudar a colocar o sistema **Pós-Obra** online de forma **100% gratuita** em menos de 30 minutos.

## 📋 O que você vai precisar

- ✅ Conta no GitHub (gratuita)
- ✅ Email para criar contas nos serviços
- ✅ 30 minutos do seu tempo

---

## 🎯 Passo a Passo Completo

### **Passo 1: Preparar o Código no GitHub** (5 min)

1. **Criar repositório no GitHub**
   - Acesse: https://github.com/new
   - Nome: `pos-obra` (ou outro nome)
   - Público ou Privado (sua escolha)
   - Clique em "Create repository"

2. **Fazer upload do código**
   ```bash
   # No terminal, na pasta do projeto
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/pos-obra.git
   git push -u origin main
   ```

---

### **Passo 2: Banco de Dados PostgreSQL** (5 min)

#### Opção A: Supabase (Recomendado)

1. **Criar conta**
   - Acesse: https://supabase.com
   - Clique em "Start your project"
   - Faça login com GitHub

2. **Criar projeto**
   - Clique em "New Project"
   - Preencha:
     - **Name**: `pos-obra-db`
     - **Database Password**: Crie uma senha forte (ANOTE!)
     - **Region**: South America (Brasil)
   - Clique em "Create new project"
   - Aguarde 2-3 minutos

3. **Copiar credenciais**
   - Vá em **Settings** > **Database**
   - Anote estas informações:
     ```
     Host: db.xxxxx.supabase.co
     Port: 5432
     Database: postgres
     User: postgres
     Password: [sua senha]
     ```

#### Opção B: Neon (Alternativa)

1. Acesse: https://neon.tech
2. Login com GitHub
3. "Create Project"
4. Copie as credenciais

---

### **Passo 3: Backend API** (10 min)

#### Railway (Recomendado - Mais fácil)

1. **Criar conta**
   - Acesse: https://railway.app
   - Clique em "Start a New Project"
   - Login com GitHub

2. **Conectar repositório**
   - Clique em "New Project"
   - Escolha "Deploy from GitHub repo"
   - Selecione seu repositório `pos-obra`
   - Railway vai detectar automaticamente

3. **Configurar o serviço**
   - Clique no serviço criado
   - Vá em **Settings**
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - Salve

4. **Configurar variáveis de ambiente**
   - No serviço, clique em **Variables**
   - Adicione estas variáveis:

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

# URLs (você vai atualizar depois)
FRONTEND_URL=https://seu-app.vercel.app
MOBILE_URL=exp://seu-app.expo.dev

# Upload (opcional)
MAX_FILE_SIZE=10485760
```

5. **Deploy automático**
   - Railway vai fazer deploy automaticamente
   - Aguarde 2-3 minutos
   - Anote a URL gerada (ex: `https://seu-backend.up.railway.app`)

#### Render (Alternativa)

1. Acesse: https://render.com
2. Login com GitHub
3. "New" > "Web Service"
4. Conecte repositório
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Adicione as mesmas variáveis de ambiente
7. Clique em "Create Web Service"

---

### **Passo 4: Frontend Web** (5 min)

#### Vercel (Gratuito e automático)

1. **Criar conta**
   - Acesse: https://vercel.com
   - Clique em "Sign Up"
   - Login com GitHub

2. **Importar projeto**
   - Clique em "Add New" > "Project"
   - Selecione seu repositório `pos-obra`
   - Clique em "Import"

3. **Configurar projeto**
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `frontend-web`
   - **Build Command**: `npm run build` (já vem preenchido)
   - **Output Directory**: `.next` (já vem preenchido)
   - **Install Command**: `npm install` (já vem preenchido)

4. **Variáveis de ambiente**
   - Role até "Environment Variables"
   - Clique em "Add"
   - Adicione:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: https://seu-backend.up.railway.app
     ```
     (Use a URL do seu backend do Railway)

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Anote a URL gerada (ex: `https://seu-app.vercel.app`)

---

### **Passo 5: Atualizar URLs** (2 min)

1. **Atualizar backend**
   - Volte no Railway/Render
   - Vá em **Variables**
   - Atualize `FRONTEND_URL` com a URL do Vercel:
     ```
     FRONTEND_URL=https://seu-app.vercel.app
     ```
   - Railway vai fazer redeploy automaticamente

2. **Verificar CORS**
   - O backend já está configurado para aceitar requisições do frontend
   - Não precisa fazer nada adicional

---

### **Passo 6: Testar o Sistema** (3 min)

1. **Testar Backend**
   ```bash
   # No navegador ou terminal
   curl https://seu-backend.up.railway.app/health
   
   # Deve retornar:
   # {"status":"ok","timestamp":"...","environment":"production"}
   ```

2. **Testar Frontend**
   - Acesse a URL do Vercel
   - Tente criar uma conta
   - Faça login
   - Teste criar um serviço
   - Teste upload de foto/áudio

3. **Verificar Logs**
   - **Railway**: Serviço > Deployments > View Logs
   - **Vercel**: Projeto > Deployments > View Function Logs

---

## 🔧 Configurações Importantes

### Upload de Arquivos

O sistema salva arquivos localmente no servidor. Para produção, considere:

**Opção 1: Cloudinary (Recomendado)**
- Crie conta: https://cloudinary.com
- Configure variáveis no Railway:
  ```
  CLOUDINARY_CLOUD_NAME=seu-cloud-name
  CLOUDINARY_API_KEY=sua-api-key
  CLOUDINARY_API_SECRET=sua-api-secret
  ```

**Opção 2: AWS S3**
- Configure credenciais AWS
- Adicione variáveis de ambiente

**Opção 3: Continuar com armazenamento local**
- Funciona, mas arquivos serão perdidos se o servidor reiniciar
- Railway mantém arquivos entre deploys

### Domínio Personalizado (Opcional)

**Backend:**
- Railway: Settings > Domains > Add Custom Domain
- Render: Settings > Custom Domains

**Frontend:**
- Vercel: Settings > Domains > Add Domain

---

## 📝 Checklist Final

- [ ] Banco de dados criado (Supabase/Neon)
- [ ] Backend deployado (Railway/Render)
- [ ] Frontend deployado (Vercel)
- [ ] Variáveis de ambiente configuradas
- [ ] URLs atualizadas
- [ ] Teste de criação de conta funcionando
- [ ] Teste de login funcionando
- [ ] Teste de upload funcionando
- [ ] Sistema acessível publicamente

---

## 🆘 Problemas Comuns

### Erro: "Cannot connect to database"
- Verifique se as credenciais do banco estão corretas
- Verifique se o IP do Railway está liberado no Supabase (Settings > Database > Connection Pooling)

### Erro: "CORS policy"
- Verifique se `FRONTEND_URL` está configurada corretamente no backend
- Verifique se a URL do frontend está exata (com/sem www, http/https)

### Erro: "Module not found"
- Verifique se o `package.json` tem todas as dependências
- Railway/Render instala automaticamente, mas pode demorar

### Upload não funciona
- Verifique se a pasta `uploads` existe no servidor
- Railway mantém arquivos, mas Render pode perder em reinicializações
- Considere usar Cloudinary para produção

### Frontend não conecta ao backend
- Verifique se `NEXT_PUBLIC_API_URL` está configurada no Vercel
- Verifique se a URL do backend está correta (sem barra no final)
- Teste a URL do backend diretamente no navegador

---

## 🎉 Pronto!

Seu sistema está online! Compartilhe as URLs:

- **Frontend**: https://seu-app.vercel.app
- **Backend**: https://seu-backend.up.railway.app
- **API Health**: https://seu-backend.up.railway.app/health

---

## 📚 Documentação Adicional

- **[DEPLOY_RAPIDO.md](DEPLOY_RAPIDO.md)** - Versão resumida (10 min)
- **[GUIA_DEPLOY_COMPLETO.md](GUIA_DEPLOY_COMPLETO.md)** - Versão detalhada
- **[DEPLOY.md](DEPLOY.md)** - Guia original

---

**Dúvidas? Verifique os logs nos serviços ou consulte a documentação completa!**

