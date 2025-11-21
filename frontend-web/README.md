# Frontend Web - Pós Obra

Aplicação web desenvolvida com Next.js 14.

## 🛠️ Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query
- React Hook Form
- Zod

## 📁 Estrutura

```
frontend-web/
├── src/
│   ├── app/              # Páginas (App Router)
│   ├── components/       # Componentes React
│   │   ├── ui/          # Componentes UI básicos
│   │   ├── sections/    # Seções da página
│   │   └── layout/      # Componentes de layout
│   └── lib/             # Utilitários e serviços
├── public/              # Arquivos estáticos
└── package.json
```

## 🚀 Como Usar

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

Acesse `http://localhost:3000`

### Build
```bash
npm run build
npm start
```

## 📄 Páginas

- `/` - Página inicial
- `/login` - Login
- `/register` - Registro
- `/dashboard` - Dashboard do usuário
- `/services` - Lista de serviços
- `/services/:id` - Detalhes do serviço
- `/technicians` - Lista de técnicos
- `/profile` - Perfil do usuário

## 🎨 Componentes

### UI Components
- `Button` - Botão reutilizável
- Mais componentes podem ser adicionados conforme necessário

### Sections
- `Hero` - Seção hero da página inicial
- `Features` - Funcionalidades
- `HowItWorks` - Como funciona
- `Testimonials` - Depoimentos
- `CTA` - Call to action

## 🔧 Configuração

Crie um arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📱 Responsividade

O site é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🎯 SEO

- Meta tags configuradas
- Open Graph tags
- Estrutura semântica HTML
- URLs amigáveis

