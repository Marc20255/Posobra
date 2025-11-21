# Mobile App - Pós Obra

Aplicativo mobile desenvolvido com React Native e Expo.

## 🛠️ Tecnologias

- React Native
- Expo
- TypeScript
- React Navigation
- React Query
- React Hook Form

## 📁 Estrutura

```
mobile/
├── src/
│   ├── screens/         # Telas do app
│   ├── components/     # Componentes reutilizáveis
│   ├── lib/            # Utilitários e serviços
│   └── navigation/    # Configuração de navegação
├── assets/            # Imagens e recursos
├── App.tsx           # Componente principal
└── package.json
```

## 🚀 Como Usar

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm start
```

Isso abrirá o Expo Dev Tools. Você pode:
- Escanear o QR code com o app Expo Go
- Pressionar `i` para iOS simulator
- Pressionar `a` para Android emulator

### Build

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

## 📱 Telas

- `Home` - Tela inicial
- `Login` - Login
- `Register` - Registro
- `Dashboard` - Dashboard do usuário
- `Services` - Lista de serviços
- `ServiceDetail` - Detalhes do serviço
- `Profile` - Perfil do usuário

## 🔧 Configuração

Atualize a URL da API em `src/lib/api.ts`:
```typescript
const API_URL = 'http://seu-ip-local:3001'
```

Para produção, configure em `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://sua-api.com"
    }
  }
}
```

## 📦 Build para Produção

### Expo EAS Build
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
eas build --platform android
```

## 🎨 Design

O app segue o design system do projeto:
- Cores primárias: #0ea5e9
- Tipografia: System fonts
- Espaçamento: 8px grid

## 📱 Funcionalidades

- Autenticação
- Dashboard com estatísticas
- Lista de serviços
- Perfil do usuário
- Chat (em desenvolvimento)
- Upload de fotos (em desenvolvimento)

