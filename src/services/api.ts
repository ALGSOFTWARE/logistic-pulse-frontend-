/**
 * API Service - Comunicação com backend Gatekeeper API
 * 
 * Serviços para comunicação com as APIs do sistema:
 * - Chat inteligente 
 * - Contexto e histórico
 * - Documentos e ordens
 * - Autenticação
 */

const API_BASE_URL = 'http://localhost:8001'; // Porta do gatekeeper-api

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