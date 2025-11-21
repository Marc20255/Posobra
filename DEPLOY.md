# Guia de Deploy

## 🚀 Deploy Gratuito

### Backend (Railway ou Render)

#### Railway (Recomendado)
1. Acesse [railway.app](https://railway.app)
2. Crie uma conta
3. Clique em "New Project" > "Deploy from GitHub repo"
4. Conecte seu repositório
5. Configure as variáveis de ambiente:
   - `DB_HOST` - Host do PostgreSQL
   - `DB_PORT` - Porta (geralmente 5432)
   - `DB_NAME` - Nome do banco
   - `DB_USER` - Usuário do banco
   - `DB_PASS` - Senha do banco
   - `JWT_SECRET` - Chave secreta para JWT
   - `PORT` - Porta (Railway define automaticamente)
   - `NODE_ENV` - production
6. Adicione PostgreSQL como serviço no Railway
7. O deploy será automático

#### Render
1. Acesse [render.com](https://render.com)
2. Crie uma conta
3. Clique em "New" > "Web Service"
4. Conecte seu repositório
5. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
6. Configure as variáveis de ambiente (mesmas do Railway)
7. Adicione PostgreSQL como serviço

### Banco de Dados (Supabase ou Neon)

#### Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um projeto
3. Vá em Settings > Database
4. Copie a connection string
5. Use as credenciais nas variáveis de ambiente

#### Neon
1. Acesse [neon.tech](https://neon.tech)
2. Crie um projeto
3. Copie a connection string
4. Use nas variáveis de ambiente

### Frontend Web (Vercel)

1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend-web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Adicione variável de ambiente:
   - `NEXT_PUBLIC_API_URL` - URL da sua API backend
5. Deploy automático a cada push

### Mobile (Expo EAS Build)

1. Instale EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure:
```bash
cd mobile
eas login
eas build:configure
```

3. Build para produção:
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

4. Publique na App Store/Play Store:
```bash
eas submit --platform ios
eas submit --platform android
```

## 📝 Variáveis de Ambiente

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
DB_HOST=seu-host
DB_PORT=5432
DB_NAME=pos_obra
DB_USER=seu-usuario
DB_PASS=sua-senha
JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-frontend.vercel.app
MOBILE_URL=exp://seu-app.expo.dev
```

### Frontend Web (.env.local)
```env
NEXT_PUBLIC_API_URL=https://sua-api.railway.app
```

### Mobile (app.json)
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://sua-api.railway.app"
    }
  }
}
```

## 🔧 Comandos Úteis

### Backend
```bash
cd backend
npm install
npm run dev  # Desenvolvimento
npm start    # Produção
```

### Frontend Web
```bash
cd frontend-web
npm install
npm run dev  # Desenvolvimento
npm run build && npm start  # Produção
```

### Mobile
```bash
cd mobile
npm install
npm start  # Desenvolvimento
```

## ✅ Checklist de Deploy

- [ ] Backend deployado e funcionando
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend web deployado
- [ ] API URL configurada no frontend
- [ ] Testes realizados
- [ ] Mobile build criado (opcional)

