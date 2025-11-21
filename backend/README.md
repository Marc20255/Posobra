# Backend API - Pós Obra

API RESTful para o sistema de assistência técnica pós-obra.

## 🛠️ Tecnologias

- Node.js + Express
- PostgreSQL
- JWT (Autenticação)
- Socket.io (Tempo real)
- Multer (Upload de arquivos)

## 📁 Estrutura

```
backend/
├── src/
│   ├── database/
│   │   └── connection.js      # Conexão com PostgreSQL
│   ├── middleware/
│   │   └── auth.middleware.js  # Autenticação JWT
│   ├── routes/
│   │   ├── auth.routes.js       # Autenticação
│   │   ├── user.routes.js       # Usuários
│   │   ├── service.routes.js   # Serviços
│   │   ├── chat.routes.js      # Chat
│   │   ├── upload.routes.js    # Uploads
│   │   ├── review.routes.js    # Avaliações
│   │   └── notification.routes.js # Notificações
│   └── server.js               # Servidor principal
├── uploads/                    # Arquivos enviados
└── package.json
```

## 🚀 Como Usar

### Instalação
```bash
npm install
```

### Configuração
Crie um arquivo `.env` com as variáveis necessárias (veja `.env.example`)

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📡 Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/technicians` - Listar técnicos
- `GET /api/users/technicians/:id` - Detalhes do técnico

### Serviços
- `POST /api/services` - Criar serviço
- `GET /api/services` - Listar serviços
- `GET /api/services/:id` - Detalhes do serviço
- `PUT /api/services/:id` - Atualizar serviço

### Chat
- `GET /api/chat/service/:serviceId` - Mensagens do serviço
- `POST /api/chat/service/:serviceId` - Enviar mensagem

### Upload
- `POST /api/upload` - Upload de arquivo
- `POST /api/upload/multiple` - Upload múltiplo
- `POST /api/upload/service/:serviceId/photo` - Foto do serviço
- `POST /api/upload/service/:serviceId/document` - Documento do serviço

### Avaliações
- `POST /api/reviews` - Criar avaliação
- `GET /api/reviews/technician/:technicianId` - Avaliações do técnico
- `GET /api/reviews/service/:serviceId` - Avaliação do serviço

### Notificações
- `GET /api/notifications` - Listar notificações
- `PUT /api/notifications/:id/read` - Marcar como lida
- `PUT /api/notifications/read-all` - Marcar todas como lidas
- `DELETE /api/notifications/:id` - Deletar notificação

## 🔒 Autenticação

A maioria dos endpoints requer autenticação via JWT. Envie o token no header:
```
Authorization: Bearer <token>
```

## 📝 Banco de Dados

O banco de dados é criado automaticamente na primeira execução. As tabelas são:
- `users` - Usuários
- `services` - Serviços
- `service_photos` - Fotos dos serviços
- `service_documents` - Documentos dos serviços
- `chat_messages` - Mensagens do chat
- `reviews` - Avaliações
- `notifications` - Notificações

