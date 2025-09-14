/**
 * Cliente para comunicação com Gatekeeper API (JWT)
 */

export interface GatekeeperUser {
  id: string;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: GatekeeperUser;
  message?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  agent_name?: string;
}

export interface ChatResponse {
  success: boolean;
  message_id: string;
  content: string;
  agent_name: string;
  session_id: string;
  timestamp: string;
  attachments?: Array<{
    type: string;
    name: string;
    url: string;
  }>;
  message?: string;
}

export interface CreateSessionResponse {
  success: boolean;
  session_id: string;
  message?: string;
}

class GatekeeperApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = 'http://localhost:8001';
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async login(email: string, password?: string): Promise<LoginResponse> {
    try {
      console.log('🔑 Gatekeeper login attempt:', email);

      // Build URL with query parameters (Gatekeeper API format)
      const params = new URLSearchParams({ email });
      if (password) {
        params.append('password', password);
      }

      const response = await fetch(`${this.baseUrl}/auth/login?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔑 Login response status:', response.status);
      const data = await response.json();
      console.log('🔑 Login response data:', data);

      if (response.ok && data.access_token) {
        this.setAuthToken(data.access_token);
        // Store in localStorage
        localStorage.setItem('jwt_token', data.access_token);
        localStorage.setItem('jwt_user', JSON.stringify(data.user));

        console.log('✅ Gatekeeper login successful');
        return {
          success: true,
          access_token: data.access_token,
          token_type: data.token_type || 'Bearer',
          expires_in: data.expires_in,
          user: data.user,
        };
      } else {
        console.log('❌ Gatekeeper login failed:', data);
        return {
          success: false,
          message: data.detail || data.message || 'Erro no login',
        };
      }
    } catch (error) {
      console.error('❌ Gatekeeper login error:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  }

  async createChatSession(title: string): Promise<CreateSessionResponse> {
    try {
      console.log('🚀 Creating chat session...');
      console.log('🚀 URL:', `${this.baseUrl}/chat/session`);
      console.log('🚀 Has token:', !!this.authToken);

      const headers = this.getAuthHeaders();
      console.log('🚀 Headers:', headers);

      const response = await fetch(`${this.baseUrl}/chat/session`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(title),  // Gatekeeper expects JSON string
      });

      console.log('🚀 Response status:', response.status);
      console.log('🚀 Response ok:', response.ok);

      const data = await response.json();
      console.log('🚀 Response data:', data);

      if (response.ok) {
        return {
          success: true,
          session_id: data.session_id,
        };
      } else {
        // If 401 (unauthorized), try to login to Gatekeeper with MIT user
        if (response.status === 401) {
          console.log('🔄 Token rejected, attempting Gatekeeper login...');
          const mitUserStr = localStorage.getItem('mit_user');

          if (mitUserStr) {
            try {
              const mitUser = JSON.parse(mitUserStr);
              console.log('🔄 Attempting login with MIT user:', mitUser.email);

              const loginResult = await this.login(mitUser.email);
              if (loginResult.success && loginResult.access_token) {
                console.log('✅ Gatekeeper login successful, retrying session creation...');

                // Retry session creation with new token
                const retryResponse = await fetch(`${this.baseUrl}/chat/session`, {
                  method: 'POST',
                  headers: this.getAuthHeaders(),
                  body: JSON.stringify(title),  // Gatekeeper expects JSON string
                });

                const retryData = await retryResponse.json();

                if (retryResponse.ok) {
                  return {
                    success: true,
                    session_id: retryData.session_id,
                  };
                }
              }
            } catch (retryError) {
              console.error('❌ Retry login failed:', retryError);
            }
          }
        }

        return {
          success: false,
          session_id: '',
          message: data.detail || data.message || 'Erro ao criar sessão',
        };
      }
    } catch (error) {
      console.error('❌ Create session error:', error);
      return {
        success: false,
        session_id: '',
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/message`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message_id: data.message_id,
          content: data.content,
          agent_name: data.agent_name,
          session_id: data.session_id,
          timestamp: data.timestamp,
          attachments: data.attachments,
        };
      } else {
        return {
          success: false,
          message_id: '',
          content: '',
          agent_name: '',
          session_id: '',
          timestamp: '',
          message: data.detail || 'Erro ao enviar mensagem',
        };
      }
    } catch (error) {
      console.error('Send message error:', error);
      return {
        success: false,
        message_id: '',
        content: '',
        agent_name: '',
        session_id: '',
        timestamp: '',
        message: 'Erro de conexão com o servidor',
      };
    }
  }

  // Initialize from MIT system localStorage
  initFromMITStorage(): GatekeeperUser | null {
    try {
      console.log('🔍 Checking MIT localStorage...');
      const mitToken = localStorage.getItem('mit_token');
      const mitUserStr = localStorage.getItem('mit_user');
      const jwtToken = localStorage.getItem('jwt_token');
      const jwtUserStr = localStorage.getItem('jwt_user');

      console.log('🔍 MIT Token found:', !!mitToken);
      console.log('🔍 MIT User found:', !!mitUserStr);
      console.log('🔍 JWT Token found:', !!jwtToken);
      console.log('🔍 JWT User found:', !!jwtUserStr);

      // Try JWT first (from localhost:3000 login)
      if (jwtToken && jwtUserStr) {
        console.log('✅ Using JWT authentication from localhost:3000');
        this.setAuthToken(jwtToken);
        const jwtUser = JSON.parse(jwtUserStr);

        return {
          id: jwtUser.id,
          name: jwtUser.name,
          email: jwtUser.email,
          user_type: jwtUser.user_type || jwtUser.role,
          role: jwtUser.role || jwtUser.user_type
        };
      }

      // Fallback to MIT token
      if (mitToken && mitUserStr) {
        console.log('✅ Using MIT authentication from localhost:8080');
        this.setAuthToken(mitToken);
        const mitUser = JSON.parse(mitUserStr);

        // Convert MIT user format to Gatekeeper format
        const gatekeeperUser: GatekeeperUser = {
          id: mitUser.id,
          name: mitUser.name,
          email: mitUser.email,
          user_type: mitUser.user_type,
          role: mitUser.role || mitUser.user_type
        };

        return gatekeeperUser;
      }

      console.log('❌ No authentication tokens found');
    } catch (error) {
      console.error('❌ Error loading user from storage:', error);
    }
    return null;
  }

  // Initialize from localStorage (legacy JWT tokens)
  initFromStorage(): GatekeeperUser | null {
    try {
      const token = localStorage.getItem('jwt_token');
      const userStr = localStorage.getItem('jwt_user');

      if (token && userStr) {
        this.setAuthToken(token);
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
    return null;
  }

  logout() {
    this.clearAuthToken();
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_user');
  }
}

export const gatekeeperApi = new GatekeeperApiClient();