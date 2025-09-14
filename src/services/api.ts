/**
 * API Service - Comunicação com backend Gatekeeper API
 * 
 * Serviços para comunicação com as APIs do sistema:
 * - Chat inteligente 
 * - Contexto e histórico
 * - Documentos e ordens
 * - Autenticação
 */

const API_BASE_URL = 'http://localhost:8000'; // Porta do gatekeeper-api

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  agent_name?: string;
  attachments?: {
    type: string;
    name: string;
    url: string;
  }[];
}

export interface ChatRequest {
  message: string;
  session_id: string;
  agent_name?: string;
}

export interface ChatResponse {
  message_id: string;
  content: string;
  agent_name: string;
  timestamp: string;
  session_id: string;
  attachments: any[];
  metadata?: any;
}

export interface ChatSession {
  session_id: string;
  session_name?: string;
  created_at: string;
  message_count: number;
  agents_used: string[];
}

/**
 * Classe para gerenciar comunicação com a API
 */
class ApiService {
  private baseUrl: string;
  private userId: string = 'user_demo'; // TODO: Pegar de contexto de autenticação
  private userRole: string = 'logistics'; // TODO: Pegar de contexto de autenticação

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Método auxiliar para fazer requisições HTTP
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * CHAT SERVICES
   */

  /**
   * Enviar mensagem para o chat
   */
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>(`/chat/message?current_user_id=${this.userId}&current_user_role=${this.userRole}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Obter histórico de chat
   */
  async getChatHistory(sessionId?: string, limit: number = 50): Promise<{
    messages: ChatMessage[];
    pagination: any;
    session_id?: string;
  }> {
    const params = new URLSearchParams({
      current_user_id: this.userId,
      limit: limit.toString(),
    });

    if (sessionId) {
      params.append('session_id', sessionId);
    }

    return this.request(`/chat/history?${params.toString()}`);
  }

  /**
   * Criar nova sessão de chat
   */
  async createChatSession(sessionName?: string): Promise<ChatSession> {
    return this.request<ChatSession>(`/chat/session?current_user_id=${this.userId}`, {
      method: 'POST',
      body: JSON.stringify({ session_name: sessionName }),
    });
  }

  /**
   * Listar sessões de chat do usuário
   */
  async getChatSessions(): Promise<{
    user_id: string;
    sessions: ChatSession[];
    total: number;
  }> {
    return this.request(`/chat/sessions?current_user_id=${this.userId}`);
  }

  /**
   * Listar agentes disponíveis
   */
  async getAvailableAgents(): Promise<{
    available_agents: {
      name: string;
      display_name: string;
      status: string;
      description: string;
    }[];
    default_agent: string;
  }> {
    return this.request('/chat/agents');
  }

  /**
   * Verificar saúde do sistema de chat
   */
  async getChatHealth(): Promise<{
    status: string;
    crewai_service: string;
    agents: any;
    timestamp: string;
  }> {
    return this.request('/chat/health');
  }

  /**
   * CONTEXT SERVICES
   */

  /**
   * Obter contexto do usuário
   */
  async getUserContext(sessionId?: string, limit: number = 50): Promise<any> {
    const params = new URLSearchParams({
      current_user_id: this.userId,
      current_user_role: this.userRole,
      limit: limit.toString(),
    });

    if (sessionId) {
      params.append('session_id', sessionId);
    }

    return this.request(`/context/${this.userId}?${params.toString()}`);
  }

  /**
   * Criar contexto do usuário
   */
  async createUserContext(data: {
    context_type: 'SHORT_TERM' | 'GENERAL';
    content: Record<string, any>;
    session_id?: string;
    expires_at?: string;
  }): Promise<any> {
    return this.request(`/api/mittracking/ai/contexts/user`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: this.userId,
        ...data
      }),
    });
  }

  /**
   * Atualizar contexto do usuário
   */
  async updateUserContext(contextId: string, data: {
    content?: Record<string, any>;
    expires_at?: string;
    is_active?: boolean;
  }): Promise<any> {
    return this.request(`/api/mittracking/ai/contexts/user/${contextId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Listar contextos do usuário
   */
  async listUserContexts(params?: {
    context_type?: 'SHORT_TERM' | 'GENERAL';
    session_id?: string;
    is_active?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams({
      user_id: this.userId,
    });

    if (params?.context_type) queryParams.append('context_type', params.context_type);
    if (params?.session_id) queryParams.append('session_id', params.session_id);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    return this.request(`/api/mittracking/ai/contexts/user/list?${queryParams.toString()}`);
  }

  /**
   * Obter contexto global
   */
  async getGlobalContext(params?: {
    context_type?: 'SYSTEM' | 'COMPANY';
    limit?: number;
    skip?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();

    if (params?.context_type) queryParams.append('context_type', params.context_type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    return this.request(`/api/mittracking/ai/contexts/global?${queryParams.toString()}`);
  }

  /**
   * Criar histórico de conversa
   */
  async createConversationHistory(data: {
    user_message: string;
    agent_response: string;
    agent_name: string;
    session_id: string;
    context_used: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<any> {
    return this.request(`/api/mittracking/ai/conversations`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: this.userId,
        ...data
      }),
    });
  }

  /**
   * Listar histórico de conversas
   */
  async listConversationHistory(params?: {
    session_id?: string;
    agent_name?: string;
    limit?: number;
    skip?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams({
      user_id: this.userId,
    });

    if (params?.session_id) queryParams.append('session_id', params.session_id);
    if (params?.agent_name) queryParams.append('agent_name', params.agent_name);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    return this.request(`/api/mittracking/ai/conversations/history?${queryParams.toString()}`);
  }

  /**
   * Limpar contextos expirados
   */
  async cleanupExpiredContexts(): Promise<any> {
    return this.request(`/api/mittracking/ai/contexts/cleanup`, {
      method: 'POST',
    });
  }

  /**
   * ORDERS SERVICES
   */

  /**
   * Buscar documentos por query
   */
  async searchDocuments(query: string): Promise<any> {
    return this.request(`/orders/search?query=${encodeURIComponent(query)}&current_user_id=${this.userId}&current_user_role=${this.userRole}`);
  }

  /**
   * Obter detalhes de uma ordem
   */
  async getOrderDetails(orderId: string): Promise<any> {
    return this.request(`/orders/${orderId}?current_user_id=${this.userId}&current_user_role=${this.userRole}`);
  }

  /**
   * Obter documentos de uma ordem específica
   */
  async getOrderDocuments(orderId: string): Promise<any> {
    return this.request(`/orders/${orderId}/documents?current_user_id=${this.userId}&current_user_role=${this.userRole}`);
  }

  /**
   * Listar ordens do usuário
   */
  async getUserOrders(params?: {
    status?: string;
    order_type?: string;
    limit?: number;
    skip?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams({
      current_user_id: this.userId,
      current_user_role: this.userRole,
    });

    if (params?.status) queryParams.append('status', params.status);
    if (params?.order_type) queryParams.append('order_type', params.order_type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    return this.request(`/orders/list?${queryParams.toString()}`);
  }

  /**
   * MIT TRACKING SERVICES
   */

  /**
   * Obter jornadas do usuário
   */
  async getUserJourneys(params?: {
    status?: string;
    client?: string;
    limit?: number;
    skip?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams({
      user_id: this.userId,
    });

    if (params?.status) queryParams.append('status', params.status);
    if (params?.client) queryParams.append('client', params.client);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    return this.request(`/api/mittracking/journeys?${queryParams.toString()}`);
  }

  /**
   * Obter detalhes de uma jornada
   */
  async getJourneyDetails(journeyId: string): Promise<any> {
    return this.request(`/api/mittracking/journeys/${journeyId}?user_id=${this.userId}`);
  }

  /**
   * Obter documentos de uma jornada
   */
  async getJourneyDocuments(journeyId: string): Promise<any> {
    return this.request(`/api/mittracking/journeys/${journeyId}/documents?user_id=${this.userId}`);
  }

  /**
   * Conectar documentos ao contexto do usuário baseado em ordens/jornadas
   */
  async linkDocumentsToContext(data: {
    session_id: string;
    order_ids?: string[];
    journey_ids?: string[];
    document_categories?: string[];
  }): Promise<any> {
    return this.request(`/api/mittracking/ai/contexts/link-documents`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: this.userId,
        ...data
      }),
    });
  }

  /**
   * UTILITY METHODS
   */

  /**
   * Configurar ID do usuário (quando implementar autenticação real)
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Configurar role do usuário
   */
  setUserRole(role: string) {
    this.userRole = role;
  }

  /**
   * Verificar saúde geral da API
   */
  async getHealth(): Promise<{
    status: string;
    service: string;
    timestamp: string;
    version: string;
  }> {
    return this.request('/health');
  }
}

// Instância singleton do serviço de API
export const apiService = new ApiService();

export default apiService;