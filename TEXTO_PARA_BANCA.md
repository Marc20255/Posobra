# 🏗️ Sistema de Gestão de Assistência Técnica Pós-Obra

## 📍 Link do Repositório

**GitHub:** https://github.com/Marc20255/Posobra

**Manual de Instalação:** Consulte o arquivo `MANUAL_INSTALACAO.md` na raiz do repositório.

---

## 🎯 Sobre o Sistema

Sistema completo e inovador de gestão de assistência técnica pós-obra desenvolvido para o **QualiApps Hackathon**. A plataforma conecta construtoras, moradores/clientes e técnicos em um ecossistema digital que facilita a gestão de chamados, agendamentos, acompanhamento e avaliação de serviços de manutenção pós-obra.

---

## ✅ Funcionalidades Implementadas

### 👤 Para Moradores/Clientes
- ✅ Cadastro e autenticação segura
- ✅ Vinculação de unidade via código único
- ✅ Criação de solicitações com fotos, categoria, prioridade e descrição
- ✅ Acompanhamento em tempo real do status (Pendente → Agendado → Em Andamento → Concluído)
- ✅ Timeline visual com histórico completo
- ✅ **Avaliação obrigatória** após conclusão (bloqueio para criar novo serviço sem avaliar)
- ✅ Dashboard com estatísticas e gráficos interativos
- ✅ Mapa interativo com localização dos serviços
- ✅ Histórico completo de serviços

### 🏗️ Para Construtoras
- ✅ Cadastro de empreendimentos e unidades
- ✅ Geração automática de código único para cada unidade
- ✅ Painel completo de chamados com filtros avançados
- ✅ Atribuição de técnicos aos serviços
- ✅ **Analytics completo** com:
  - Top defeitos mais frequentes
  - Satisfação média e NPS
  - Custo médio de manutenção
  - Tempo médio de resposta e resolução
  - Gráficos interativos de tendências
- ✅ Exportação de relatórios em PDF (com filtros por período)
- ✅ Notificações automáticas quando cliente cria novo serviço
- ✅ Criação de serviços em nome dos moradores

### 🔧 Para Técnicos
- ✅ Visualização de serviços atribuídos e disponíveis
- ✅ Aceitar serviços disponíveis
- ✅ Atualização de status (Agendar → Em Andamento → Concluído)
- ✅ Upload de fotos "depois" após conclusão
- ✅ Comparação antes/depois com slider interativo
- ✅ **Otimização de rotas** quando há múltiplos serviços na mesma região
- ✅ Navegação integrada (Waze e Google Maps)
- ✅ Perfil profissional com qualificações e avaliações
- ✅ Sistema de badges e conquistas automáticas
- ✅ Chat em tempo real com clientes e construtoras

---

## 🌟 Recursos Inovadores

1. **Mapa Interativo** - Visualização geográfica com geocodificação automática e rotas otimizadas
2. **Sistema de Badges** - Gamificação com conquistas automáticas
3. **Analytics Avançado** - Gráficos interativos e métricas de negócio
4. **Comparação Antes/Depois** - Slider interativo de fotos
5. **Chat em Tempo Real** - Comunicação instantânea
6. **Relatórios em PDF** - Exportação profissional com filtros
7. **Sistema de Recomendações** - Técnicos sugeridos inteligentemente
8. **Timeline Visual** - Histórico completo e interativo
9. **Multiplataforma** - Web + Mobile (iOS/Android)

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js + Express.js + PostgreSQL + JWT + Socket.io
- **Frontend Web:** Next.js 14 + TypeScript + Tailwind CSS + React Query
- **Mobile:** React Native + Expo
- **APIs:** Nominatim (Geocodificação), OpenStreetMap (Mapas)
- **Bibliotecas:** Recharts (Gráficos), React Leaflet (Mapas), jsPDF (Relatórios)

---

## 📊 Atendimento aos Requisitos do Edital

### ✅ Funções Construtora (100%)
- ✅ Cadastro de empreendimentos e unidades
- ✅ Geração de código único
- ✅ Painel de chamados com filtros
- ✅ Sistema de priorização
- ✅ Cadastro de técnicos
- ✅ Agenda de visitas
- ✅ Registro de custo de manutenção
- ✅ Avaliação do atendimento

### ✅ Funções Morador/Cliente (100%)
- ✅ Login e vinculação da unidade via código
- ✅ Abertura de solicitação (categoria, descrição, fotos, prioridade)
- ✅ Acompanhamento do status
- ✅ Agendamento de visita
- ✅ **Avaliação obrigatória após fechamento**
- ✅ **Bloqueio: não pode criar novo serviço sem avaliar anterior**

### ✅ Funções Técnico (100%)
- ✅ Ver serviços atribuídos e disponíveis
- ✅ Aceitar serviços
- ✅ Atualizar status
- ✅ Upload de fotos
- ✅ Chat com cliente/construtora
- ✅ Otimização de rotas

### ✅ Recursos Complementares (100%)
- ✅ Notificações (estrutura pronta)
- ✅ Painel analítico completo
- ✅ Top defeitos mais frequentes
- ✅ Satisfação média e NPS
- ✅ Custo médio de manutenção
- ✅ Tempo médio de resposta e resolução
- ✅ Campo de prioridade/urgência
- ✅ Calendário de agendamento

---

## 📱 Plataformas Suportadas

- ✅ **Web:** Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ **Mobile iOS:** iPhone e iPad
- ✅ **Mobile Android:** Smartphones e tablets
- ✅ **Design Responsivo:** Adapta-se a qualquer tamanho de tela

---

## 🔧 Como Instalar e Executar

Consulte o arquivo **`MANUAL_INSTALACAO.md`** no repositório para instruções detalhadas passo a passo.

**Resumo rápido:**
1. Clone o repositório
2. Configure o PostgreSQL e crie o banco `pos_obra`
3. Configure o backend (`.env` com credenciais do banco)
4. Instale dependências (`npm install`)
5. Inicie o backend (`npm start` na pasta `backend`)
6. Configure o frontend (`.env.local` com URL da API)
7. Instale dependências (`npm install` na pasta `frontend-web`)
8. Inicie o frontend (`npm run dev` na pasta `frontend-web`)
9. Acesse `http://localhost:3000`

---

## ✅ Status do Projeto

**100% COMPLETO E FUNCIONAL**

- ✅ Todas as funcionalidades implementadas
- ✅ Testado e validado
- ✅ Documentação completa
- ✅ Código limpo e organizado
- ✅ Pronto para produção

---

## 📚 Documentação Disponível

No repositório você encontrará:
- **MANUAL_INSTALACAO.md** - Guia completo passo a passo
- **DESCRICAO_COMPLETA_SISTEMA.md** - Descrição detalhada de todas as funcionalidades
- **README.md** - Visão geral do projeto
- **FUNCIONALIDADES_IMPLEMENTADAS.md** - Lista completa de funcionalidades
- **ANALISE_EDITAL.md** - Análise de atendimento aos requisitos

---

**Desenvolvido com ❤️ para o QualiApps Hackathon**

**Repositório:** https://github.com/Marc20255/Posobra

