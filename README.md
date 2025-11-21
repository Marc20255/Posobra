# 🏗️ App de Assistência Técnica Pós-Obra

Sistema completo e inovador de gestão de assistência técnica pós-obra com versões Web, iOS e Android. Desenvolvido com código limpo, organizado e pronto para deploy em servidores gratuitos.

## ✨ Status do Projeto

**✅ PROJETO 100% COMPLETO**

Todos os módulos foram desenvolvidos, testados e estão prontos para uso em produção.

## 🏗️ Estrutura do Projeto

```
pos-obra/
├── backend/          # API Node.js/Express
├── frontend-web/     # Next.js (Web)
├── mobile/          # React Native/Expo (iOS/Android)
├── shared/          # Código compartilhado
└── docs/            # Documentação
```

## 🚀 Tecnologias

### Backend
- Node.js + Express
- PostgreSQL (banco de dados)
- JWT (autenticação)
- Multer (upload de arquivos)
- Socket.io (comunicação em tempo real)

### Frontend Web
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query

### Mobile
- React Native / Expo
- TypeScript
- React Navigation

## 📦 Instalação

### ⚡ Instalação Rápida

Para instalação completa e detalhada, consulte o **[MANUAL_INSTALACAO.md](MANUAL_INSTALACAO.md)**.

### Resumo dos Passos:

1. **Clone o repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd "Pós obra"
```

2. **Configure o Backend**
```bash
cd backend
npm install
# Crie arquivo .env (veja backend/.env.example)
npm run dev
```

3. **Configure o Frontend Web**
```bash
cd frontend-web
npm install
# Crie arquivo .env.local com: NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev
```

4. **Acesse**: http://localhost:3000

### 📖 Documentação Detalhada

- **[MANUAL_INSTALACAO.md](MANUAL_INSTALACAO.md)** - Guia completo passo a passo para instalação local
- **[INSTALL.md](INSTALL.md)** - Guia alternativo de instalação

## 🌐 Deploy Online

**Quer colocar o sistema online? Siga os guias:**

- 📖 **[Guia Completo de Deploy](GUIA_DEPLOY_COMPLETO.md)** - Passo a passo detalhado
- ⚡ **[Deploy Rápido (10 min)](DEPLOY_RAPIDO.md)** - Versão resumida
- 📋 **[Guia Original](DEPLOY.md)** - Versão anterior

### Serviços Recomendados (Gratuitos)

- **Frontend Web**: [Vercel](https://vercel.com) (gratuito)
- **Backend API**: [Railway](https://railway.app) ou [Render](https://render.com) (gratuito)
- **Banco de Dados**: [Supabase](https://supabase.com) ou [Neon](https://neon.tech) (gratuito)
- **Mobile**: Expo EAS Build

### Preparação Rápida

```bash
# Execute o script de preparação
./scripts/prepare-deploy.sh
```

## 📱 Funcionalidades Implementadas

### Para Clientes
- ✅ Cadastro e autenticação
- ✅ Criar solicitações de serviço
- ✅ Buscar e escolher técnicos qualificados
- ✅ Agendar serviços
- ✅ Chat em tempo real com técnicos
- ✅ Upload de fotos e documentos
- ✅ Avaliar técnicos após serviço
- ✅ Receber notificações
- ✅ Dashboard com estatísticas
- ✅ Histórico completo de serviços

### Para Técnicos
- ✅ Cadastro profissional
- ✅ Receber solicitações de serviço
- ✅ Gerenciar serviços (aceitar, agendar, concluir)
- ✅ Chat em tempo real com clientes
- ✅ Upload de fotos/documentos
- ✅ Receber e gerenciar avaliações
- ✅ Dashboard com estatísticas profissionais
- ✅ Perfil público com avaliações

### Sistema Geral
- ✅ Autenticação JWT segura
- ✅ Banco de dados PostgreSQL
- ✅ API RESTful completa
- ✅ Chat em tempo real (Socket.io)
- ✅ Sistema de notificações
- ✅ Upload de arquivos
- ✅ Avaliações e reviews
- ✅ Dashboard analítico
- ✅ Marketing orgânico (SEO, blog, compartilhamento)
- ✅ Design responsivo (mobile-first)
- ✅ Interface moderna e intuitiva

## 📚 Documentação

- **[INSTALL.md](INSTALL.md)** - Guia completo de instalação local
- **[DEPLOY.md](DEPLOY.md)** - Guia de deploy em servidores gratuitos
- **[MARKETING.md](MARKETING.md)** - Estratégia de marketing orgânico
- **[PROJETO_COMPLETO.md](PROJETO_COMPLETO.md)** - Visão geral completa do projeto
- **README.md** em cada módulo (backend, frontend-web, mobile)

## 🚀 Quick Start

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd "Pós obra"

# 2. Configure e inicie o backend
cd backend
npm install
# Crie arquivo .env (veja INSTALL.md)
npm run dev

# 3. Configure e inicie o frontend web (em outro terminal)
cd frontend-web
npm install
# Crie arquivo .env.local
npm run dev

# 4. Configure e inicie o mobile (em outro terminal)
cd mobile
npm install
npm start
```

## 🎯 Próximos Passos

1. Configure as variáveis de ambiente (veja INSTALL.md)
2. Crie o banco de dados PostgreSQL
3. Teste localmente
4. Faça o deploy (veja DEPLOY.md)
5. Configure domínio personalizado
6. Comece a usar!

## 💡 Destaques Técnicos

- **Código Limpo**: Organizado, comentado e seguindo boas práticas
- **Modular**: Cada módulo é independente e bem estruturado
- **Escalável**: Pronto para crescer e adicionar novas funcionalidades
- **Seguro**: Autenticação JWT, validação de dados, sanitização
- **Performático**: Otimizado para velocidade e eficiência
- **Responsivo**: Funciona perfeitamente em todos os dispositivos
- **SEO Friendly**: Otimizado para mecanismos de busca
- **Documentado**: Documentação completa em português

## 🤝 Contribuindo

Este é um projeto completo e funcional. Sinta-se livre para:
- Adicionar novas funcionalidades
- Melhorar o código existente
- Reportar bugs
- Sugerir melhorias

## 📄 Licença

MIT License - Use livremente para projetos pessoais ou comerciais.

---

**Desenvolvido com ❤️ para facilitar a gestão de assistência técnica pós-obra**

