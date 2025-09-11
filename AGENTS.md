# Agents.md - Sistema MitTracking
## Estratégia de Migração de PHP/MySQL para MongoDB

---
project_area: "Logistics Intelligence Platform Migration"
context_focus: "Migration strategy from PHP/MySQL to MongoDB with AI agents"
status: "Migration Planning"
key_technologies:
  - "MongoDB"
  - "CrewAI Agents" 
  - "Python FastAPI"
  - "GraphQL"
last_updated: "2025-09-10"
---

## 📋 Análise do Sistema Atual

### Sistema MitTracking Existente
O sistema atual é uma plataforma completa de rastreamento logístico desenvolvida em PHP com banco MySQL, contendo:

- **15 tabelas principais** com relacionamentos complexos
- **3 APIs RESTful** para Dashboard, Clientes e Relatórios
- **Sistema de documentos** (CT-e, NF-e, BL, AWB)
- **Chat inteligente** com mensagens
- **Rastreamento em tempo real** de jornadas e entregas
- **Relatórios avançados** e dashboards dinâmicos

### Estrutura de Dados Identificada

#### Entidades Principais:
1. **Usuários** - Sistema de autenticação e perfis
2. **Clientes** - Empresas contratantes dos serviços
3. **Funcionários** - Operadores do sistema
4. **Transportadoras** - Empresas parceiras de transporte
5. **Motoristas** - Condutores dos veículos
6. **Veículos** - Frota de transporte
7. **Jornadas** - Viagens/rotas de transporte
8. **Checkpoints** - Pontos de controle das jornadas
9. **Entregas** - Entregas individuais
10. **Documentos** - Documentos logísticos
11. **Ocorrências** - Incidentes e problemas
12. **Chat** - Sistema de comunicação
13. **Relatórios** - Relatórios gerados
14. **Configurações** - Configurações do sistema
15. **Logs** - Auditoria e monitoramento

## 🚀 Estratégia de Migração para MongoDB

### Fase 1: Análise e Planejamento (Semanas 1-2)

#### Agent: **DataAnalysisAgent**
```python
# Responsabilidades:
- Mapear todas as tabelas MySQL para coleções MongoDB
- Identificar relacionamentos e dependências
- Analisar queries mais utilizadas
- Mapear índices necessários
- Documentar estrutura de dados atual
```

**Deliverables:**
- Mapeamento completo tabela → coleção
- Análise de performance das queries atuais
- Documentação da estrutura de dados
- Plano de índices MongoDB

### Fase 2: Design da Nova Arquitetura (Semanas 3-4)

#### Agent: **ArchitectureDesignAgent**
```python
# Responsabilidades:
- Projetar coleções MongoDB otimizadas
- Definir estratégias de embedding vs referencing
- Planejar agregações para relatórios
- Desenhar API GraphQL moderna
- Definir estrutura de microserviços
```

**Deliverables:**
- Schema MongoDB otimizado
- Arquitetura de microserviços
- API GraphQL specifications
- Estratégias de agregação

#### Estratégia de Modelagem MongoDB:

##### **Coleção: users**
```javascript
{
  _id: ObjectId,
  nome: String,
  email: String,
  senha: String,
  tipo: "admin|operador|cliente",
  ativo: Boolean,
  profile: {
    telefone: String,
    endereco: Object,
    empresa: String, // Se for cliente
    cargo: String,   // Se for funcionário
    departamento: String
  },
  timestamps: {
    criado_em: Date,
    atualizado_em: Date,
    ultimo_login: Date
  }
}
```

##### **Coleção: companies** (Clientes + Transportadoras)
```javascript
{
  _id: ObjectId,
  tipo: "cliente|transportadora",
  nome: String,
  cnpj: String,
  contato: {
    email: String,
    telefone: String,
    endereco: {
      rua: String,
      cidade: String,
      estado: String,
      cep: String
    }
  },
  metricas: {
    score: Number,
    nps: Number,
    total_embarques: Number,
    engajamento_chat: Number
  },
  status: "ativo|inativo|suspenso",
  timestamps: {
    data_cadastro: Date,
    ultima_atualizacao: Date,
    ultima_atividade: Date
  }
}
```

##### **Coleção: journeys** (Jornadas com Checkpoints Embutidos)
```javascript
{
  _id: ObjectId,
  codigo: String,
  cliente_id: ObjectId,
  transportadora_id: ObjectId,
  veiculo: {
    placa: String,
    modelo: String,
    marca: String,
    motorista: {
      nome: String,
      cnh: String,
      telefone: String
    }
  },
  rota: {
    origem: {
      endereco: String,
      coordenadas: [Number, Number] // [lng, lat]
    },
    destino: {
      endereco: String,
      coordenadas: [Number, Number]
    }
  },
  checkpoints: [{
    nome: String,
    descricao: String,
    ordem: Number,
    coordenadas: [Number, Number],
    status: "pendente|em_andamento|concluido|atrasado",
    data_prevista: Date,
    data_realizada: Date,
    observacoes: String
  }],
  status: "agendada|em_andamento|concluida|cancelada",
  progresso: Number,
  timestamps: {
    data_inicio: Date,
    data_fim: Date,
    data_estimada: Date,
    criado_em: Date,
    atualizado_em: Date
  },
  observacoes: String
}
```

##### **Coleção: deliveries** (Entregas)
```javascript
{
  _id: ObjectId,
  codigo: String,
  jornada_id: ObjectId,
  cliente_id: ObjectId,
  destinatario: {
    nome: String,
    endereco: String,
    coordenadas: [Number, Number]
  },
  carga: {
    valor: Number,
    peso: Number,
    volumes: Number,
    descricao: String
  },
  status: "aguardando|em_transito|entregue|atrasada|devolvida",
  datas: {
    prevista: Date,
    entregue: Date,
    criado_em: Date
  },
  comprovacao: {
    assinatura_digital: String,
    foto_entrega: String
  },
  observacoes: String
}
```

##### **Coleção: documents**
```javascript
{
  _id: ObjectId,
  codigo: String,
  numero: String,
  tipo: "cte|nfe|bl|awb|outro",
  jornada_id: ObjectId,
  entrega_id: ObjectId,
  cliente_id: ObjectId,
  arquivo: {
    path: String,
    tamanho: Number,
    versao: Number
  },
  upload: {
    data_emissao: Date,
    data_upload: Date,
    upload_por: String,
    origem_upload: "chat|manual|api"
  },
  status: "pendente|aprovado|rejeitado|vencido",
  metricas: {
    visualizacoes: Number,
    ultima_visualizacao: Date
  },
  observacoes: String
}
```

##### **Coleção: incidents** (Ocorrências)
```javascript
{
  _id: ObjectId,
  tipo: "atraso|avaria|perda|roubo|acidente|outro",
  titulo: String,
  descricao: String,
  referencias: {
    jornada_id: ObjectId,
    entrega_id: ObjectId,
    cliente_id: ObjectId
  },
  severidade: "baixa|media|alta|critica",
  status: "aberta|em_andamento|resolvida|cancelada",
  datas: {
    ocorrencia: Date,
    resolucao: Date
  },
  responsavel: {
    funcionario_id: ObjectId,
    acoes_tomadas: String
  },
  observacoes: String
}
```

##### **Coleção: chats** (Mensagens de Chat)
```javascript
{
  _id: ObjectId,
  cliente_id: ObjectId,
  referencias: {
    jornada_id: ObjectId,
    entrega_id: ObjectId
  },
  mensagens: [{
    id: String,
    tipo: "texto|imagem|documento|sistema",
    conteudo: String,
    arquivo_path: String,
    remetente: {
      tipo: "cliente|funcionario|sistema",
      usuario_id: ObjectId,
      nome: String
    },
    lida: Boolean,
    data_envio: Date,
    data_leitura: Date
  }],
  status: "ativa|arquivada",
  criado_em: Date,
  atualizado_em: Date
}
```

### Fase 3: Migração de Dados (Semanas 5-8)

#### Agent: **DataMigrationAgent**
```python
# Responsabilidades:
- Criar scripts de migração para cada tabela
- Validar integridade dos dados migrados
- Gerenciar relacionamentos entre coleções
- Executar migração incremental
- Criar rollback procedures
```

**Deliverables:**
- Scripts Python para migração
- Validadores de integridade
- Procedures de rollback
- Logs detalhados de migração

#### Scripts de Migração:

##### **Migração de Usuários:**
```python
def migrate_users():
    # Migrar tabela usuarios
    mysql_users = fetch_mysql_data("SELECT * FROM usuarios")
    
    for user in mysql_users:
        mongo_user = {
            "nome": user["nome"],
            "email": user["email"],
            "senha": user["senha"],
            "tipo": user["tipo"],
            "ativo": user["ativo"],
            "timestamps": {
                "criado_em": user["criado_em"],
                "atualizado_em": user["atualizado_em"],
                "ultimo_login": user["ultimo_login"]
            }
        }
        
        # Buscar dados complementares baseado no tipo
        if user["tipo"] == "cliente":
            cliente_data = fetch_mysql_data(
                "SELECT * FROM clientes WHERE usuario_id = %s", 
                [user["id"]]
            )
            if cliente_data:
                mongo_user["profile"] = {
                    "empresa": cliente_data[0]["empresa"],
                    "telefone": cliente_data[0]["telefone"],
                    "endereco": {
                        "rua": cliente_data[0]["endereco"],
                        "cidade": cliente_data[0]["cidade"],
                        "estado": cliente_data[0]["estado"],
                        "cep": cliente_data[0]["cep"]
                    }
                }
        
        mongo_db.users.insert_one(mongo_user)
```

##### **Migração de Jornadas com Checkpoints:**
```python
def migrate_journeys():
    mysql_journeys = fetch_mysql_data("SELECT * FROM jornadas")
    
    for journey in mysql_journeys:
        # Buscar checkpoints relacionados
        checkpoints = fetch_mysql_data(
            "SELECT * FROM checkpoints WHERE jornada_id = %s ORDER BY ordem",
            [journey["id"]]
        )
        
        # Buscar dados do veículo e motorista
        veiculo_data = fetch_mysql_data(
            """SELECT v.*, m.nome as motorista_nome, m.cnh, m.telefone
               FROM veiculos v 
               LEFT JOIN motoristas m ON v.motorista_id = m.id 
               WHERE v.id = %s""",
            [journey["veiculo_id"]]
        )
        
        mongo_journey = {
            "codigo": journey["codigo"],
            "cliente_id": ObjectId(get_mongo_id("users", journey["cliente_id"])),
            "transportadora_id": ObjectId(get_mongo_id("companies", journey["transportadora_id"])),
            "veiculo": {
                "placa": veiculo_data[0]["placa"],
                "modelo": veiculo_data[0]["modelo"],
                "marca": veiculo_data[0]["marca"],
                "motorista": {
                    "nome": veiculo_data[0]["motorista_nome"],
                    "cnh": veiculo_data[0]["cnh"],
                    "telefone": veiculo_data[0]["telefone"]
                }
            },
            "rota": {
                "origem": {
                    "endereco": journey["origem"],
                    "coordenadas": [journey["origem_lng"], journey["origem_lat"]]
                },
                "destino": {
                    "endereco": journey["destino"],
                    "coordenadas": [journey["destino_lng"], journey["destino_lat"]]
                }
            },
            "checkpoints": [],
            "status": journey["status"],
            "progresso": journey["progresso"],
            "timestamps": {
                "data_inicio": journey["data_inicio"],
                "data_fim": journey["data_fim"],
                "criado_em": journey["criado_em"],
                "atualizado_em": journey["atualizado_em"]
            }
        }
        
        # Adicionar checkpoints
        for checkpoint in checkpoints:
            mongo_journey["checkpoints"].append({
                "nome": checkpoint["nome"],
                "descricao": checkpoint["descricao"],
                "ordem": checkpoint["ordem"],
                "coordenadas": [checkpoint["longitude"], checkpoint["latitude"]],
                "status": checkpoint["status"],
                "data_prevista": checkpoint["data_prevista"],
                "data_realizada": checkpoint["data_realizada"],
                "observacoes": checkpoint["observacoes"]
            })
        
        mongo_db.journeys.insert_one(mongo_journey)
```

### Fase 4: Desenvolvimento da Nova API (Semanas 9-12)

#### Agent: **APITransformationAgent**
```python
# Responsabilidades:
- Converter endpoints PHP para FastAPI/GraphQL
- Implementar queries MongoDB otimizadas
- Criar sistema de cache com Redis
- Implementar autenticação JWT
- Desenvolver webhooks para tempo real
```

**Deliverables:**
- API FastAPI completa
- Schema GraphQL
- Sistema de autenticação
- Documentação Swagger
- Testes automatizados

#### Nova Arquitetura de API:

##### **FastAPI com GraphQL:**
```python
from fastapi import FastAPI
from graphene import ObjectType, String, List, Field
import motor.motor_asyncio

app = FastAPI(title="MitTracking API v2")
client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
db = client.mittracking

class Journey(ObjectType):
    id = String()
    codigo = String()
    status = String()
    progresso = String()
    cliente = Field('Company')
    checkpoints = List('Checkpoint')

class Company(ObjectType):
    id = String()
    nome = String()
    tipo = String()
    score = String()

class Query(ObjectType):
    journeys = List(Journey)
    journey_by_id = Field(Journey, id=String())
    
    async def resolve_journeys(self, info):
        cursor = db.journeys.find()
        journeys = await cursor.to_list(length=100)
        return [Journey(**journey) for journey in journeys]
```

##### **Endpoints REST para Compatibilidade:**
```python
@app.get("/api/dashboard/kpis")
async def get_dashboard_kpis():
    # Agregação MongoDB para KPIs
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_entregas": {"$sum": 1},
                "entregas_no_prazo": {
                    "$sum": {
                        "$cond": [
                            {"$lte": ["$datas.entregue", "$datas.prevista"]}, 
                            1, 0
                        ]
                    }
                },
                "tempo_medio": {"$avg": "$tempo_entrega"}
            }
        }
    ]
    
    result = await db.deliveries.aggregate(pipeline).to_list(1)
    return result[0] if result else {}

@app.get("/api/clients/list")
async def get_clients_list():
    # Buscar clientes com métricas agregadas
    pipeline = [
        {"$match": {"tipo": "cliente", "status": "ativo"}},
        {
            "$lookup": {
                "from": "deliveries",
                "localField": "_id",
                "foreignField": "cliente_id",
                "as": "entregas"
            }
        },
        {
            "$addFields": {
                "total_entregas": {"$size": "$entregas"},
                "entregas_concluidas": {
                    "$size": {
                        "$filter": {
                            "input": "$entregas",
                            "cond": {"$eq": ["$$this.status", "entregue"]}
                        }
                    }
                }
            }
        }
    ]
    
    clients = await db.companies.aggregate(pipeline).to_list(100)
    return clients
```

### Fase 5: Sistema de Chat Inteligente (Semanas 13-14)

#### Agent: **ChatIntelligenceAgent**
```python
# Responsabilidades:
- Migrar sistema de chat para tempo real
- Implementar WebSockets para comunicação
- Integrar processamento de documentos
- Criar respostas automáticas inteligentes
- Implementar análise de sentimentos
```

**Deliverables:**
- Sistema WebSocket
- IA para respostas automáticas
- Processamento de documentos
- Análise de sentimentos

##### **Sistema de Chat em Tempo Real:**
```python
from fastapi import WebSocket
import asyncio

class ChatManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    async def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
    
    async def send_message(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_json(message)
    
    async def process_document_upload(self, client_id: str, document: dict):
        # Processar documento usando IA
        document_analysis = await analyze_document(document)
        
        # Salvar no MongoDB
        await db.documents.insert_one({
            "cliente_id": ObjectId(client_id),
            "tipo": document_analysis["tipo"],
            "numero": document_analysis["numero"],
            "status": "em_analise",
            "upload": {
                "data_upload": datetime.now(),
                "origem_upload": "chat"
            }
        })
        
        # Enviar confirmação via WebSocket
        await self.send_message(client_id, {
            "tipo": "document_processed",
            "documento": document_analysis
        })

@app.websocket("/ws/chat/{client_id}")
async def websocket_chat(websocket: WebSocket, client_id: str):
    await chat_manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_json()
            
            # Salvar mensagem no MongoDB
            await db.chats.update_one(
                {"cliente_id": ObjectId(client_id)},
                {
                    "$push": {
                        "mensagens": {
                            "id": str(uuid4()),
                            "tipo": data["tipo"],
                            "conteudo": data["conteudo"],
                            "remetente": {"tipo": "cliente"},
                            "data_envio": datetime.now(),
                            "lida": False
                        }
                    }
                },
                upsert=True
            )
            
            # Processar resposta automática se necessário
            if data["tipo"] == "consulta_status":
                response = await generate_automatic_response(client_id, data)
                await chat_manager.send_message(client_id, response)
                
    except Exception as e:
        logger.error(f"Erro no WebSocket: {e}")
    finally:
        await chat_manager.disconnect(client_id)
```

### Fase 6: Relatórios e Analytics (Semanas 15-16)

#### Agent: **ReportingAgent**
```python
# Responsabilidades:
- Migrar sistema de relatórios para MongoDB Aggregation
- Criar pipelines de dados eficientes
- Implementar cache de relatórios
- Desenvolver dashboards em tempo real
- Otimizar queries de analytics
```

**Deliverables:**
- Pipelines de agregação MongoDB
- Sistema de cache de relatórios
- APIs de analytics
- Dashboards otimizados

##### **Sistema de Relatórios com Agregações:**
```python
class ReportService:
    
    async def get_delivery_metrics(self, period_days: int = 30):
        """Métricas de entrega usando agregação MongoDB"""
        pipeline = [
            {
                "$match": {
                    "datas.entregue": {
                        "$gte": datetime.now() - timedelta(days=period_days)
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$datas.entregue"},
                        "month": {"$month": "$datas.entregue"},
                        "day": {"$dayOfMonth": "$datas.entregue"}
                    },
                    "total_entregas": {"$sum": 1},
                    "entregas_no_prazo": {
                        "$sum": {
                            "$cond": [
                                {"$lte": ["$datas.entregue", "$datas.prevista"]},
                                1, 0
                            ]
                        }
                    },
                    "valor_total": {"$sum": "$carga.valor"},
                    "peso_total": {"$sum": "$carga.peso"}
                }
            },
            {
                "$addFields": {
                    "sla_percentual": {
                        "$multiply": [
                            {"$divide": ["$entregas_no_prazo", "$total_entregas"]},
                            100
                        ]
                    }
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        result = await db.deliveries.aggregate(pipeline).to_list(100)
        return result
    
    async def get_client_performance_report(self, client_id: str = None):
        """Relatório de performance de clientes"""
        match_stage = {"tipo": "cliente", "status": "ativo"}
        if client_id:
            match_stage["_id"] = ObjectId(client_id)
        
        pipeline = [
            {"$match": match_stage},
            {
                "$lookup": {
                    "from": "deliveries",
                    "localField": "_id",
                    "foreignField": "cliente_id",
                    "as": "entregas"
                }
            },
            {
                "$lookup": {
                    "from": "incidents",
                    "localField": "_id", 
                    "foreignField": "referencias.cliente_id",
                    "as": "incidentes"
                }
            },
            {
                "$addFields": {
                    "metricas_calculadas": {
                        "total_entregas": {"$size": "$entregas"},
                        "entregas_concluidas": {
                            "$size": {
                                "$filter": {
                                    "input": "$entregas",
                                    "cond": {"$eq": ["$$this.status", "entregue"]}
                                }
                            }
                        },
                        "total_incidentes": {"$size": "$incidentes"},
                        "valor_total": {"$sum": "$entregas.carga.valor"},
                        "ticket_medio": {"$avg": "$entregas.carga.valor"}
                    }
                }
            }
        ]
        
        result = await db.companies.aggregate(pipeline).to_list(100)
        return result
```

### Fase 7: Testes e Deploy (Semanas 17-18)

#### Agent: **TestingAgent**
```python
# Responsabilidades:
- Criar testes automatizados para todas as APIs
- Testar migração de dados
- Validar performance do MongoDB
- Executar testes de carga
- Documentar resultados
```

#### Agent: **DeploymentAgent**
```python
# Responsabilidades:
- Configurar ambiente MongoDB em produção
- Implementar CI/CD pipeline
- Configurar monitoramento e alertas
- Executar deploy gradual
- Treinar equipe técnica
```

## 📊 Benefícios da Migração

### Performance
- **Agregações nativas** do MongoDB para relatórios complexos
- **Índices geoespaciais** para rastreamento em tempo real
- **Sharding horizontal** para escala massiva
- **Cache integrado** com menos latência

### Escalabilidade
- **Schema flexível** para novos tipos de documentos
- **Replicação automática** para alta disponibilidade
- **Particionamento por cliente** ou região
- **Crescimento horizontal** sem downtime

### Funcionalidades Avançadas
- **Busca textual** nativa nos documentos
- **Agregações em tempo real** para dashboards
- **Geolocalização** avançada para rotas
- **Análise de séries temporais** para trends

### Integração com IA
- **Processamento de documentos** com OCR integrado
- **Análise de sentimentos** no chat
- **Predição de atrasos** com ML
- **Otimização de rotas** inteligente

## 🔧 Ferramentas e Tecnologias

### Stack Principal
- **MongoDB 7.0+** - Banco de dados principal
- **Python FastAPI** - API backend
- **GraphQL** - Query language flexível
- **Redis** - Cache e sessões
- **WebSockets** - Comunicação em tempo real

### Infraestrutura
- **Docker** - Containerização
- **Kubernetes** - Orquestração 
- **MongoDB Atlas** - Banco gerenciado
- **Grafana** - Monitoramento
- **ElasticSearch** - Logs e busca

### Ferramentas de Migração
- **PyMongo** - Driver Python para MongoDB
- **Pandas** - Manipulação de dados
- **Alembic** - Versionamento de schema
- **Pytest** - Testes automatizados

## 📋 Timeline de Execução

| Fase | Semanas | Agente Principal | Entregável |
|------|---------|------------------|------------|
| Análise | 1-2 | DataAnalysisAgent | Mapeamento completo |
| Design | 3-4 | ArchitectureDesignAgent | Nova arquitetura |
| Migração | 5-8 | DataMigrationAgent | Dados migrados |
| API | 9-12 | APITransformationAgent | APIs funcionais |
| Chat | 13-14 | ChatIntelligenceAgent | Chat em tempo real |
| Relatórios | 15-16 | ReportingAgent | Analytics avançados |
| Deploy | 17-18 | TestingAgent + DeploymentAgent | Sistema em produção |

## 🎯 Critérios de Sucesso

### Performance
- [ ] Queries 50% mais rápidas que MySQL
- [ ] Dashboards carregando em < 2 segundos
- [ ] APIs respondendo em < 200ms
- [ ] Chat em tempo real < 100ms latência

### Funcionalidade  
- [ ] 100% das funcionalidades migradas
- [ ] Zero perda de dados
- [ ] Compatibilidade com frontend existente
- [ ] Novos recursos de IA funcionando

### Qualidade
- [ ] Cobertura de testes > 80%
- [ ] Zero bugs críticos em produção
- [ ] Documentação completa
- [ ] Equipe treinada

---

**Este plano de migração preserva toda a funcionalidade atual do sistema MitTracking enquanto moderniza a arquitetura para MongoDB, proporcionando melhor performance, escalabilidade e recursos avançados de IA.**