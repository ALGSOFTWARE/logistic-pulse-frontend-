# AGENTS.md - Frontend Logistics Intelligence Platform

## Análise Específica do Serviço Frontend

Este documento fornece uma análise detalhada do estado atual do frontend React da plataforma de inteligência logística, identificando componentes conectados, pendências de integração e próximos passos.

---

## 📋 Estado Atual da Integração

### ✅ **Componentes Totalmente Integrados**

#### 1. **Sistema de Documentos** (`/documentos`)
- **Status**: 🟢 Completamente conectado
- **Integração**: MongoDB + API + OCR + S3
- **Funcionalidades**:
  - Upload de arquivos com drag-and-drop
  - Listagem com filtros avançados
  - Visualização de metadados
  - Download seguro
  - Controle de acesso por usuário
  - Processamento OCR integrado
- **Hook**: `useDocuments.ts`
- **Endpoints**: `/api/mittracking/documents/*`

#### 2. **Sistema de Usuários** (`/configuracoes`)
- **Status**: 🟢 Completamente conectado  
- **Integração**: MongoDB + API de autenticação
- **Funcionalidades**:
  - CRUD completo de usuários
  - Gerenciamento de senhas
  - Tipos de usuário
  - Status ativo/inativo
- **Hook**: `useUsers.ts`
- **Endpoints**: `/api/mittracking/users/*`, `/api/mittracking/auth/*`

#### 3. **Sistema de Autenticação** (`/login`)
- **Status**: 🟢 Parcialmente conectado
- **Integração**: API de login
- **Funcionalidades**:
  - Login com email/senha
  - Validação de credenciais
  - Redirecionamento pós-login
- **Hook**: `useAuth.ts`
- **Endpoints**: `/api/mittracking/auth/login`

---

### 🟡 **Componentes Parcialmente Integrados**

#### 1. **Sistema de Chat** (`ChatContainer`)
- **Status**: 🟡 Interface pronta, API limitada
- **Integração**: Estrutura criada, falta contexto completo
- **Conectado**:
  - Interface de chat funcional
  - Componentes de mensagem
  - Input e histórico
- **Pendente**:
  - Integração com sistema de contexto IA
  - Conexão com agentes CrewAI
  - Persistência de conversas
  - Sistema de sessões
- **Próximo passo**: Conectar com `/api/mittracking/ai/conversation/*`

#### 2. **Dashboard Principal** (`/`)
- **Status**: 🟡 Mock data, estrutura pronta
- **Integração**: Interface completa, dados estáticos
- **Conectado**:
  - Layout responsivo
  - Widgets de estatísticas
  - Gráficos e métricas
- **Pendente**:
  - Dados reais do MongoDB
  - Métricas de documentos
  - KPIs logísticos
  - Alertas em tempo real

---

### 🔴 **Componentes Não Integrados** 

#### 1. **Sistema de Jornadas** (`/jornadas`)
- **Status**: 🔴 Apenas mock data
- **Necessário**:
  - Modelo `Journey` no backend
  - CRUD de jornadas
  - Status de transporte
  - Timeline de eventos
  - Integração GPS/rastreamento
- **Hook necessário**: `useJornadas.ts`
- **Endpoints necessários**: `/api/mittracking/journeys/*`

#### 2. **Sistema de Entregas** (`/entregas`)
- **Status**: 🔴 Apenas mock data
- **Necessário**:
  - Modelo `Delivery` no backend
  - CRUD de entregas
  - Status de entrega
  - Confirmações e assinaturas
  - Histórico de tentativas
- **Hook necessário**: `useEntregas.ts`
- **Endpoints necessários**: `/api/mittracking/deliveries/*`

#### 3. **Sistema de Clientes** (`/clientes`)
- **Status**: 🔴 Interface básica, dados estáticos
- **Conectado**: Hook `useClientes.ts` criado mas não usado
- **Necessário**:
  - CRUD completo de clientes
  - Histórico de operações
  - Documentos por cliente
  - Contratos e acordos
- **Hook**: `useClientes.ts` (existe, precisa integrar)
- **Endpoints**: `/api/mittracking/clients/*` (parciais)

#### 4. **Sistema de Relatórios** (`/relatorios`)
- **Status**: 🔴 Apenas interface
- **Necessário**:
  - Geração de relatórios PDF
  - Filtros avançados por período
  - Métricas de performance
  - Exportação em múltiplos formatos
  - Relatórios agendados
- **Hook necessário**: `useRelatorios.ts`
- **Endpoints necessários**: `/api/mittracking/reports/*`

---

## 🗄️ Estado dos Modelos de Dados

### ✅ **Modelos Implementados no Backend**
- `MitUser` - Usuários completo
- `DocumentFile` - Documentos completo
- `Order` - Ordens básico
- `UserContext`, `GlobalContext`, `ConversationHistory` - Sistema IA

### 🔴 **Modelos Faltando no Backend**
- `Journey` - Jornadas de transporte
- `Delivery` - Entregas específicas  
- `Client` - Clientes (modelo MIT específico)
- `Route` - Rotas de transporte
- `Vehicle` - Veículos da frota
- `Driver` - Motoristas
- `Report` - Relatórios gerados
- `Notification` - Sistema de notificações
- `GPS_Tracking` - Rastreamento GPS
- `Incident` - Incidentes de transporte

---

## 📡 Endpoints de API Pendentes

### **Jornadas** (`/api/mittracking/journeys/`)
```
GET    /list                 # Listar jornadas
POST   /create               # Criar jornada
GET    /{journey_id}         # Detalhes da jornada
PUT    /{journey_id}         # Atualizar jornada
DELETE /{journey_id}         # Deletar jornada
GET    /{journey_id}/track   # Rastreamento GPS
POST   /{journey_id}/event   # Adicionar evento
```

### **Entregas** (`/api/mittracking/deliveries/`)
```
GET    /list                 # Listar entregas
POST   /create               # Criar entrega
GET    /{delivery_id}        # Detalhes da entrega
PUT    /{delivery_id}/status # Atualizar status
POST   /{delivery_id}/confirm # Confirmar entrega
GET    /{delivery_id}/proof  # Comprovante de entrega
```

### **Clientes** (`/api/mittracking/clients/`)
```
GET    /list                 # Listar clientes
POST   /create               # Criar cliente
PUT    /{client_id}          # Atualizar cliente
GET    /{client_id}/history  # Histórico do cliente
GET    /{client_id}/documents # Documentos do cliente
```

### **Relatórios** (`/api/mittracking/reports/`)
```
GET    /templates            # Templates disponíveis
POST   /generate             # Gerar relatório
GET    /list                 # Relatórios gerados
GET    /{report_id}/download # Download do relatório
POST   /schedule             # Agendar relatório
```

### **Dashboard** (`/api/mittracking/dashboard/`)
```
GET    /metrics              # Métricas gerais
GET    /kpis                 # KPIs principais
GET    /alerts               # Alertas ativos
GET    /recent-activity      # Atividade recente
```

---

## 🚀 Plano de Implementação Priorizado

### **Fase 1: Chat Inteligente** (1-2 semanas)
1. **Conectar chat com sistema de contexto IA**
   - Integrar `ChatContainer` com `/api/mittracking/ai/conversation/*`
   - Implementar persistência de conversas
   - Adicionar sistema de sessões
   - Conectar com agentes CrewAI

2. **Dashboard com dados reais**
   - Substituir mock data por dados do MongoDB
   - Implementar métricas de documentos
   - Adicionar widgets de usuários ativos

### **Fase 2: Gestão de Jornadas** (2-3 semanas)
1. **Criar modelos de Jornada no backend**
   - Implementar `Journey`, `Route`, `Vehicle`, `Driver`
   - Criar endpoints CRUD
   - Implementar sistema de status

2. **Conectar frontend de Jornadas**
   - Criar `useJornadas.ts`
   - Integrar página `/jornadas` com API
   - Implementar rastreamento GPS (se disponível)

### **Fase 3: Sistema de Entregas** (2-3 semanas)
1. **Criar modelos de Entrega no backend**
   - Implementar `Delivery`, `Proof`, `Attempt`
   - Sistema de confirmação
   - Integração com assinatura digital

2. **Conectar frontend de Entregas**
   - Criar `useEntregas.ts`
   - Implementar confirmação de entregas
   - Sistema de comprovantes

### **Fase 4: Clientes e Relatórios** (2-3 semanas)
1. **Expandir sistema de Clientes**
   - Completar modelo `Client` MIT-específico
   - Histórico detalhado
   - Integração com documentos

2. **Sistema de Relatórios**
   - Geração automática de PDFs
   - Templates customizáveis
   - Agendamento de relatórios

---

## 🔧 Hooks React Pendentes

### **Criar:**
```typescript
// src/hooks/useJornadas.ts
// src/hooks/useEntregas.ts  
// src/hooks/useRelatorios.ts
// src/hooks/useDashboard.ts
// src/hooks/useNotifications.ts
// src/hooks/useGPS.ts
```

### **Melhorar:**
```typescript
// src/hooks/useAuth.ts - adicionar refresh token
// src/hooks/useClientes.ts - conectar com backend
// src/hooks/useDocuments.ts - adicionar busca semântica
```

---

## 📊 Métricas de Cobertura Atual

| Componente | Interface | Backend | Integração | Status |
|------------|-----------|---------|------------|---------|
| **Documentos** | ✅ 100% | ✅ 100% | ✅ 100% | 🟢 **Completo** |
| **Usuários** | ✅ 100% | ✅ 100% | ✅ 100% | 🟢 **Completo** |
| **Autenticação** | ✅ 90% | ✅ 90% | ✅ 80% | 🟡 **Quase pronto** |
| **Chat** | ✅ 90% | ✅ 70% | 🔴 30% | 🟡 **Parcial** |
| **Dashboard** | ✅ 100% | 🔴 20% | 🔴 20% | 🟡 **Interface pronta** |
| **Jornadas** | ✅ 80% | 🔴 0% | 🔴 0% | 🔴 **Mock data** |
| **Entregas** | ✅ 80% | 🔴 0% | 🔴 0% | 🔴 **Mock data** |
| **Clientes** | ✅ 60% | 🔴 30% | 🔴 10% | 🔴 **Básico** |
| **Relatórios** | ✅ 40% | 🔴 0% | 🔴 0% | 🔴 **Esqueleto** |

**Cobertura Geral**: **47%** *(4.2/9 componentes completamente integrados)*

---

## 🎯 Próximos Passos Imediatos

### **Esta Semana:**
1. **Finalizar Chat IA** - Conectar com sistema de contexto
2. **Dashboard real** - Integrar dados do MongoDB  
3. **Melhorar autenticação** - Sistema de sessão completo

### **Próximas 2 Semanas:**
1. **Implementar Jornadas** - Backend + Frontend completo
2. **Sistema de Entregas** - CRUD + confirmações
3. **Clientes completo** - Expandir funcionalidades

### **Mês Seguinte:**
1. **Relatórios avançados** - Geração PDF + agendamento
2. **Notificações em tempo real** - WebSocket + push
3. **Rastreamento GPS** - Se disponível API externa

---

## 🔗 Dependências Técnicas

### **Frontend Dependencies** (Já instaladas)
- `react`, `typescript`, `vite` - Base
- `@tanstack/react-query` - State management  
- `tailwindcss`, `shadcn/ui` - UI
- `react-router-dom` - Routing

### **Dependências Pendentes**
- `socket.io-client` - WebSocket para tempo real
- `react-pdf` - Geração de PDFs no cliente
- `leaflet` ou `google-maps` - Mapas e GPS (se necessário)
- `react-signature-canvas` - Assinaturas digitais
- `date-fns` ou `dayjs` - Manipulação de datas avançada

---

## 📋 Lista de Tarefas Técnicas

### **Backend (API)**
- [ ] Implementar modelos: Journey, Delivery, Client, Report
- [ ] Criar endpoints completos para cada modelo
- [ ] Sistema de notificações em tempo real
- [ ] Integração com APIs de rastreamento GPS
- [ ] Geração automática de relatórios PDF

### **Frontend (React)**
- [ ] Conectar Chat com sistema de contexto IA  
- [ ] Implementar Dashboard com dados reais
- [ ] Criar hooks para Jornadas, Entregas, Relatórios
- [ ] Sistema de notificações push
- [ ] Melhorar UX de upload de documentos
- [ ] Implementar busca semântica
- [ ] Sistema de permissões por usuário

### **DevOps & Deploy**
- [ ] CI/CD pipeline automatizado
- [ ] Ambiente de staging
- [ ] Monitoramento e logs
- [ ] Backup automático do MongoDB
- [ ] CDN para assets estáticos

---

*Última atualização: 2025-09-11*  
*Próxima revisão: 2025-09-18*