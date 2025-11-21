# 🏗️ Sistema de Gestão de Assistência Técnica Pós-Obra

## 📍 Repositório GitHub

**Link do Repositório:** https://github.com/Marc20255/Posobra

**Manual de Instalação:** Consulte o arquivo `MANUAL_INSTALACAO.md` na raiz do repositório para instruções detalhadas de instalação local.

---

## 🎯 Visão Geral do Sistema

Sistema completo e inovador de gestão de assistência técnica pós-obra desenvolvido para o **QualiApps Hackathon**. A plataforma conecta construtoras, moradores/clientes e técnicos em um ecossistema digital que facilita a gestão de chamados, agendamentos, acompanhamento e avaliação de serviços de manutenção pós-obra.

---

## 🚀 Funcionalidades Principais

### 👤 Para Moradores/Clientes

#### ✅ Gestão de Conta e Unidades
- **Cadastro e autenticação** segura com JWT
- **Vinculação de unidade** via código único fornecido pela construtora
- **Perfil personalizado** com foto e informações de contato
- **Histórico completo** de todos os serviços realizados

#### ✅ Abertura e Acompanhamento de Serviços
- **Criação de solicitações** com:
  - Categoria do problema (Elétrica, Hidráulica, Pintura, etc.)
  - Descrição detalhada
  - Upload de fotos do problema (câmera ou galeria)
  - Definição de prioridade (Urgente, Alta, Média, Baixa)
  - Endereço completo com geocodificação automática
- **Acompanhamento em tempo real** do status do serviço:
  - Pendente → Agendado → Em Andamento → Concluído
- **Timeline visual** mostrando histórico completo de alterações
- **Chat em tempo real** com técnico atribuído
- **Upload de documentos** e áudios durante o processo

#### ✅ Sistema de Avaliação Obrigatória
- **Avaliação obrigatória** após conclusão do serviço:
  - Qualidade do serviço (1-5 estrelas)
  - Velocidade de atendimento
  - Trabalho do técnico
  - Qualidade da vistoria
  - Comentários e sugestões de melhoria
- **Bloqueio inteligente**: Não permite criar novo serviço sem avaliar o anterior
- **Sistema de reviews** público para técnicos

#### ✅ Dashboard e Visualizações
- **Dashboard personalizado** com:
  - Estatísticas de serviços (Total, Pendentes, Em Andamento, Concluídos)
  - Gráficos interativos de status, tendências, categorias e prioridades
  - Serviços recentes
  - Sistema de badges e conquistas
- **Mapa interativo** mostrando localização dos serviços
- **Histórico completo** com filtros por status e categoria

#### ✅ Busca e Recomendações
- **Busca de técnicos** por categoria e localização
- **Sistema de recomendações inteligente** baseado em:
  - Categoria do serviço
  - Localização (cidade/estado)
  - Experiência e avaliações
- **Visualização de perfil** do técnico com avaliações anteriores

---

### 🏗️ Para Construtoras

#### ✅ Gestão de Empreendimentos
- **Cadastro de empreendimentos** com:
  - Nome, endereço completo, cidade, estado, CEP
  - Total de unidades planejadas
- **Gestão de unidades**:
  - Criação em lote ou individual
  - Geração automática de código único para cada unidade
  - Vinculação de proprietários (moradores)
  - Controle de blocos, andares e números

#### ✅ Painel de Chamados Completo
- **Visualização de todos os serviços** dos empreendimentos
- **Filtros avançados**:
  - Por status (Pendente, Agendado, Em Andamento, Concluído, Cancelado)
  - Por prioridade (Urgente, Alta, Média, Baixa)
  - Por categoria
  - Por empreendimento/unidade
- **Busca inteligente** por título ou categoria
- **Atribuição de técnicos** aos serviços
- **Acompanhamento completo** de cada chamado

#### ✅ Analytics e Relatórios
- **Dashboard analítico** com:
  - Top defeitos mais frequentes
  - Satisfação média e NPS (Net Promoter Score)
  - Custo médio de manutenção
  - Tempo médio de resposta e resolução
  - Distribuição por status e prioridade
  - Gráficos interativos de tendências
- **Exportação de relatórios em PDF**:
  - Filtros por período (data início/fim)
  - Filtros por status
  - Tabelas formatadas com estatísticas
  - Download direto do navegador

#### ✅ Gestão de Funcionários
- **Cadastro de funcionários** (técnicos internos)
- **Vinculação a empreendimentos**
- **Controle de acesso** e permissões

#### ✅ Notificações Automáticas
- **Notificação automática** quando cliente cria novo serviço
- **Acompanhamento** de todas as atividades relacionadas aos empreendimentos

#### ✅ Criação de Serviços
- **Construtora pode criar serviços** em nome dos moradores
- **Seleção de unidade** dos seus empreendimentos
- **Mesmas funcionalidades** de upload de fotos e documentos

---

### 🔧 Para Técnicos

#### ✅ Gestão de Serviços
- **Visualização de serviços atribuídos**
- **Visualização de serviços disponíveis** (pendentes sem técnico)
- **Aceitar serviços** disponíveis
- **Atualização de status**:
  - Agendar visita
  - Marcar como "Em Andamento"
  - Marcar como "Concluído"
- **Upload de fotos "depois"** após conclusão do serviço
- **Visualização de comparação antes/depois** com slider interativo

#### ✅ Otimização de Rotas
- **Mapa de serviços** com localização de todos os chamados
- **Agrupamento automático** por região (CEP)
- **Rota otimizada** quando há múltiplos serviços na mesma região
- **Navegação integrada**:
  - Abrir rota no Waze
  - Abrir rota no Google Maps
- **Algoritmo de otimização** (Nearest Neighbor) para economizar tempo e combustível

#### ✅ Comunicação
- **Chat em tempo real** com clientes e construtoras
- **Notificações** de novos serviços atribuídos
- **Histórico completo** de conversas por serviço

#### ✅ Perfil Profissional
- **Perfil público** com:
  - Foto de perfil
  - Qualificações/categorias de especialização
  - Avaliações e reviews dos clientes
  - Estatísticas de serviços realizados
- **Sistema de badges** e conquistas automáticas:
  - Primeiro serviço
  - Serviços concluídos (marcos: 10, 50, 100)
  - Avaliações recebidas
  - Upload de fotos

#### ✅ Dashboard Profissional
- **Estatísticas pessoais**:
  - Total de serviços
  - Taxa de conclusão
  - Avaliação média
  - Serviços por categoria
- **Gráficos interativos** de desempenho
- **Mapa de serviços** com rotas otimizadas

#### ✅ Gestão de Exclusão de Serviços
- **Aprovação de exclusão**: Se construtora solicitar exclusão de serviço já iniciado, técnico deve aprovar
- **Histórico preservado**: Todas as atividades ficam registradas no log

---

## 🎨 Recursos Complementares e Inovadores

### 📊 Analytics Avançado
- **Gráficos interativos** usando Recharts:
  - Distribuição de status (pizza)
  - Tendências ao longo do tempo (linha)
  - Distribuição por categoria (barras)
  - Distribuição por prioridade (barras)
- **Métricas de negócio**:
  - NPS (Net Promoter Score)
  - Tempo médio de resposta
  - Tempo médio de resolução
  - Custo médio por categoria

### 🗺️ Mapa Interativo
- **Visualização geográfica** de todos os serviços
- **Geocodificação automática** de endereços
- **Agrupamento por região** (CEP)
- **Rotas otimizadas** para técnicos
- **Integração com Waze e Google Maps**

### 📸 Sistema de Fotos
- **Upload de fotos "antes"** ao criar serviço
- **Upload de fotos "depois"** pelo técnico
- **Comparação interativa** antes/depois com slider
- **Suporte mobile**: Câmera direta ou galeria
- **Preview antes de enviar**

### 💬 Chat em Tempo Real
- **Comunicação instantânea** usando Socket.io
- **Histórico completo** de mensagens
- **Upload de arquivos** no chat
- **Notificações** de novas mensagens

### 🏆 Sistema de Badges e Conquistas
- **Badges automáticos** para:
  - Primeiro serviço criado
  - Primeiro serviço concluído
  - Múltiplos serviços (10, 50, 100)
  - Upload de fotos
  - Receber avaliações
- **Exibição no dashboard**
- **Notificações** de conquistas

### 📄 Relatórios em PDF
- **Geração automática** de relatórios
- **Filtros por período** (data início/fim)
- **Filtros por status**
- **Tabelas formatadas** com estatísticas
- **Download direto** do navegador

### 📱 Multiplataforma
- **Web**: Interface completa e responsiva (Next.js)
- **Mobile**: App React Native/Expo (iOS e Android)
- **Design responsivo** que funciona em todos os dispositivos

### 🔔 Sistema de Notificações
- **Notificações em tempo real**:
  - Novo serviço criado
  - Serviço atribuído
  - Mensagem recebida
  - Status alterado
  - Badge conquistado
- **Contador de não lidas**
- **Marcar como lida** individual ou em massa

### 📋 Histórico e Rastreabilidade
- **Timeline visual** de alterações de status
- **Log de atividades** completo:
  - Quem fez a ação
  - Quando foi feita
  - O que foi alterado
- **Histórico de exclusões** e aprovações

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **Express.js** - Servidor API RESTful
- **PostgreSQL** - Banco de dados relacional
- **JWT** (JSON Web Tokens) - Autenticação segura
- **Socket.io** - Comunicação em tempo real
- **Multer** - Upload de arquivos (fotos, documentos, áudios)
- **bcryptjs** - Hash de senhas
- **jsPDF** + **jspdf-autotable** - Geração de relatórios PDF
- **express-validator** - Validação de dados
- **express-rate-limit** - Proteção contra abuso

### Frontend Web
- **Next.js 14** (App Router) - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado e cache
- **React Hook Form** + **Zod** - Formulários e validação
- **Recharts** - Gráficos interativos
- **React Leaflet** - Mapas interativos
- **Socket.io Client** - Comunicação em tempo real
- **React Hot Toast** - Notificações

### Mobile
- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação

### APIs e Serviços Externos
- **Nominatim (OpenStreetMap)** - Geocodificação de endereços
- **OpenStreetMap Tiles** - Mapas

---

## 📐 Arquitetura do Sistema

### Estrutura de Dados
- **Usuários**: Clientes, Técnicos, Construtoras, Admin
- **Empreendimentos**: Dados completos do empreendimento
- **Unidades**: Vinculadas a empreendimentos e proprietários
- **Serviços**: Com histórico completo de status
- **Fotos**: Antes e depois dos serviços
- **Documentos**: Arquivos relacionados aos serviços
- **Mensagens**: Chat em tempo real
- **Avaliações**: Reviews completos
- **Notificações**: Sistema de alertas
- **Badges**: Conquistas dos usuários
- **Logs de Atividade**: Rastreabilidade completa

### Segurança
- **Autenticação JWT** com tokens seguros
- **Hash de senhas** com bcrypt
- **Validação de dados** em todas as rotas
- **Rate limiting** para proteção
- **Autorização baseada em roles** (cliente, técnico, construtora, admin)
- **Sanitização** de inputs

### Performance
- **Cache inteligente** com React Query
- **Lazy loading** de componentes
- **Otimização de imagens**
- **Geocodificação em background**
- **Paginação** de listas grandes

---

## 🎯 Requisitos do Edital - Atendidos

### ✅ Funções Construtora (100%)
- ✅ Cadastro de empreendimentos e unidades
- ✅ Geração de código único da unidade
- ✅ Painel de chamados com filtros
- ✅ Sistema de priorização
- ✅ Cadastro de técnicos
- ✅ Agenda de visitas
- ✅ Registro de custo de manutenção
- ✅ Avaliação do atendimento

### ✅ Funções Morador/Cliente (100%)
- ✅ Login e vinculação da unidade via código
- ✅ Abertura de solicitação (categoria, descrição, fotos, prioridade)
- ✅ Acompanhamento do status da solicitação
- ✅ Agendamento de visita
- ✅ Avaliação obrigatória após fechamento
- ✅ Bloqueio: não pode criar novo serviço sem avaliar anterior

### ✅ Funções Técnico (100%)
- ✅ Ver serviços atribuídos
- ✅ Ver serviços disponíveis
- ✅ Aceitar serviços
- ✅ Atualizar status
- ✅ Upload de fotos após conclusão
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

## 🌟 Diferenciais e Inovações

1. **Multiplataforma Completa**: Web + Mobile (iOS/Android)
2. **Mapa Interativo**: Visualização geográfica com rotas otimizadas
3. **Sistema de Badges**: Gamificação e reconhecimento
4. **Analytics Avançado**: Métricas de negócio e gráficos interativos
5. **Comparação Antes/Depois**: Slider interativo de fotos
6. **Chat em Tempo Real**: Comunicação instantânea
7. **Geocodificação Automática**: Endereços convertidos automaticamente
8. **Relatórios em PDF**: Exportação profissional de dados
9. **Sistema de Recomendações**: Técnicos sugeridos inteligentemente
10. **Timeline Visual**: Histórico completo e interativo

---

## 📱 Plataformas Suportadas

- ✅ **Web**: Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ **Mobile iOS**: iPhone e iPad
- ✅ **Mobile Android**: Smartphones e tablets
- ✅ **Design Responsivo**: Adapta-se a qualquer tamanho de tela

---

## 🔧 Requisitos Técnicos para Instalação

- **Node.js** 18 ou superior
- **PostgreSQL** 12 ou superior
- **npm** ou **yarn**
- **Git** (para clonar o repositório)

---

## 📚 Documentação Disponível

No repositório GitHub você encontrará:

- **MANUAL_INSTALACAO.md** - Guia completo passo a passo
- **README.md** - Visão geral do projeto
- **INSTALL.md** - Guia alternativo de instalação
- **DEPLOY.md** - Guia de deploy em produção
- **FUNCIONALIDADES_IMPLEMENTADAS.md** - Lista completa de funcionalidades
- **ANALISE_EDITAL.md** - Análise de atendimento aos requisitos

---

## 🎯 Como Avaliar o Sistema

### Opção 1: Rodar Localmente (Recomendado)
Siga o **MANUAL_INSTALACAO.md** que contém todas as instruções detalhadas.

### Opção 2: Visualizar o Código
Navegue pelo código diretamente no GitHub para entender a estrutura e implementação.

### Opção 3: Análise de Commits
Analise o histórico de commits para ver a evolução do projeto.

---

## ✅ Status do Projeto

**100% COMPLETO E FUNCIONAL**

- ✅ Todas as funcionalidades implementadas
- ✅ Testado e validado
- ✅ Documentação completa
- ✅ Código limpo e organizado
- ✅ Pronto para produção

---

## 🏆 Destaques Técnicos

- **Código Limpo**: Organizado, comentado e seguindo boas práticas
- **Modular**: Cada módulo é independente e bem estruturado
- **Escalável**: Pronto para crescer e adicionar novas funcionalidades
- **Seguro**: Autenticação JWT, validação de dados, sanitização
- **Performático**: Otimizado para velocidade e eficiência
- **Responsivo**: Funciona perfeitamente em todos os dispositivos
- **SEO Friendly**: Otimizado para mecanismos de busca
- **Documentado**: Documentação completa em português

---

**Desenvolvido com ❤️ para o QualiApps Hackathon**

**Repositório:** https://github.com/Marc20255/Posobra

