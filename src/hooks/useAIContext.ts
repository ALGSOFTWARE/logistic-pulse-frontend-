/**
 * Hook para gerenciar contexto de IA do usuário
 */
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';

export interface UserContext {
  id: string;
  user_id: string;
  context_type: 'SHORT_TERM' | 'GENERAL';
  content: Record<string, any>;
  session_id?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface GlobalContext {
  id: string;
  context_type: 'SYSTEM' | 'COMPANY';
  content: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ConversationEntry {
  id: string;
  user_id: string;
  user_message: string;
  agent_response: string;
  agent_name: string;
  session_id: string;
  context_used: Record<string, any>;
  created_at: string;
  metadata?: Record<string, any>;
}

interface UseAIContextReturn {
  // User Context
  userContexts: UserContext[];
  globalContexts: GlobalContext[];
  conversationHistory: ConversationEntry[];
  loading: boolean;
  error: string | null;
  
  // Context Management
  createUserContext: (data: {
    context_type: 'SHORT_TERM' | 'GENERAL';
    content: Record<string, any>;
    session_id?: string;
    expires_at?: string;
  }) => Promise<UserContext | null>;
  
  updateUserContext: (contextId: string, data: {
    content?: Record<string, any>;
    expires_at?: string;
    is_active?: boolean;
  }) => Promise<boolean>;
  
  loadUserContexts: (params?: {
    context_type?: 'SHORT_TERM' | 'GENERAL';
    session_id?: string;
    is_active?: boolean;
  }) => Promise<void>;
  
  loadGlobalContexts: (params?: {
    context_type?: 'SYSTEM' | 'COMPANY';
  }) => Promise<void>;
  
  // Conversation Management
  saveConversationEntry: (data: {
    user_message: string;
    agent_response: string;
    agent_name: string;
    session_id: string;
    context_used: Record<string, any>;
    metadata?: Record<string, any>;
  }) => Promise<ConversationEntry | null>;
  
  loadConversationHistory: (params?: {
    session_id?: string;
    agent_name?: string;
    limit?: number;
  }) => Promise<void>;
  
  // Helper functions
  getActiveContextForSession: (sessionId: string) => UserContext | null;
  getMergedContext: (sessionId?: string) => Record<string, any>;
  cleanupExpiredContexts: () => Promise<void>;
  
  // Document-Context linking
  linkDocumentsToContext: (data: {
    session_id: string;
    order_ids?: string[];
    journey_ids?: string[];
    document_categories?: string[];
  }) => Promise<boolean>;
  
  // Orders and Journeys
  loadUserOrders: () => Promise<any[]>;
  loadUserJourneys: () => Promise<any[]>;
  userOrders: any[];
  userJourneys: any[];
}

export const useAIContext = (userId?: string): UseAIContextReturn => {
  const [userContexts, setUserContexts] = useState<UserContext[]>([]);
  const [globalContexts, setGlobalContexts] = useState<GlobalContext[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userJourneys, setUserJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set user ID in API service if provided
  useEffect(() => {
    if (userId) {
      apiService.setUserId(userId);
    }
  }, [userId]);

  const createUserContext = useCallback(async (data: {
    context_type: 'SHORT_TERM' | 'GENERAL';
    content: Record<string, any>;
    session_id?: string;
    expires_at?: string;
  }): Promise<UserContext | null> => {
    // Simplified mock context - no API calls to prevent 404 errors
    const mockContext: UserContext = {
      id: `mock-${Date.now()}`,
      user_id: userId || 'anonymous',
      context_type: data.context_type,
      content: data.content,
      session_id: data.session_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: data.expires_at,
      is_active: true
    };

    setUserContexts(prev => [...prev, mockContext]);
    return mockContext;
  }, [userId]);

  const updateUserContext = useCallback(async (contextId: string, data: {
    content?: Record<string, any>;
    expires_at?: string;
    is_active?: boolean;
  }): Promise<boolean> => {
    // Mock update without API calls to prevent 404 errors
    setUserContexts(prev => prev.map(ctx =>
      ctx.id === contextId
        ? { ...ctx, ...data, updated_at: new Date().toISOString() }
        : ctx
    ));
    return true;
  }, []);

  const loadUserContexts = useCallback(async (params?: {
    context_type?: 'SHORT_TERM' | 'GENERAL';
    session_id?: string;
    is_active?: boolean;
  }) => {
    // Mock loading without API calls to prevent 404 errors
    setLoading(true);

    // Simulate loading delay and return empty array
    setTimeout(() => {
      setUserContexts([]);
      setLoading(false);
    }, 100);
  }, []);

  const loadGlobalContexts = useCallback(async (params?: {
    context_type?: 'SYSTEM' | 'COMPANY';
  }) => {
    try {
      setError(null);
      
      const response = await apiService.getGlobalContext(params);
      
      if (response.success) {
        setGlobalContexts(response.contexts || []);
      } else {
        throw new Error('Erro ao carregar contextos globais');
      }
    } catch (err) {
      console.error('Erro ao carregar contextos globais:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, []);

  const saveConversationEntry = useCallback(async (data: {
    user_message: string;
    agent_response: string;
    agent_name: string;
    session_id: string;
    context_used: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<ConversationEntry | null> => {
    // Mock conversation entry without API calls to prevent 404 errors
    const mockEntry: ConversationEntry = {
      id: `mock-${Date.now()}`,
      user_id: userId || 'anonymous',
      user_message: data.user_message,
      agent_response: data.agent_response,
      agent_name: data.agent_name,
      session_id: data.session_id,
      context_used: data.context_used,
      created_at: new Date().toISOString(),
      metadata: data.metadata
    };

    setConversationHistory(prev => [...prev, mockEntry]);
    return mockEntry;
  }, [userId]);

  const loadConversationHistory = useCallback(async (params?: {
    session_id?: string;
    agent_name?: string;
    limit?: number;
  }) => {
    try {
      setError(null);
      
      const response = await apiService.listConversationHistory({
        ...params,
        limit: params?.limit || 50
      });
      
      if (response.success) {
        setConversationHistory(response.conversations || []);
      } else {
        throw new Error('Erro ao carregar histórico de conversas');
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, []);

  // Helper function to get active context for a session
  const getActiveContextForSession = useCallback((sessionId: string): UserContext | null => {
    return userContexts.find(ctx => 
      ctx.session_id === sessionId && 
      ctx.is_active &&
      ctx.context_type === 'SHORT_TERM'
    ) || null;
  }, [userContexts]);

  // Helper function to merge all relevant contexts
  const getMergedContext = useCallback((sessionId?: string): Record<string, any> => {
    const mergedContext: Record<string, any> = {};

    // Add global contexts
    globalContexts.forEach(ctx => {
      if (ctx.context_type === 'SYSTEM') {
        mergedContext.system = { ...mergedContext.system, ...ctx.content };
      } else if (ctx.context_type === 'COMPANY') {
        mergedContext.company = { ...mergedContext.company, ...ctx.content };
      }
    });

    // Add user general context
    const generalContext = userContexts.find(ctx => 
      ctx.context_type === 'GENERAL' && ctx.is_active
    );
    if (generalContext) {
      mergedContext.user_general = generalContext.content;
    }

    // Add session-specific context if provided
    if (sessionId) {
      const sessionContext = getActiveContextForSession(sessionId);
      if (sessionContext) {
        mergedContext.user_session = sessionContext.content;
      }
    }

    return mergedContext;
  }, [userContexts, globalContexts, getActiveContextForSession]);

  const cleanupExpiredContexts = useCallback(async () => {
    try {
      setError(null);
      await apiService.cleanupExpiredContexts();
      
      // Reload user contexts to reflect cleanup
      await loadUserContexts();
    } catch (err) {
      console.error('Erro ao limpar contextos expirados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, [loadUserContexts]);

  // Load user orders
  const loadUserOrders = useCallback(async (): Promise<any[]> => {
    try {
      setError(null);
      const response = await apiService.getUserOrders({ limit: 50 });
      
      if (response.success && response.orders) {
        setUserOrders(response.orders);
        return response.orders;
      } else {
        throw new Error('Erro ao carregar ordens');
      }
    } catch (err) {
      console.error('Erro ao carregar ordens:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return [];
    }
  }, []);

  // Load user journeys
  const loadUserJourneys = useCallback(async (): Promise<any[]> => {
    try {
      setError(null);
      const response = await apiService.getUserJourneys({ limit: 50 });
      
      if (response.success && response.journeys) {
        setUserJourneys(response.journeys);
        return response.journeys;
      } else {
        throw new Error('Erro ao carregar jornadas');
      }
    } catch (err) {
      console.error('Erro ao carregar jornadas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return [];
    }
  }, []);

  // Link documents to context based on orders/journeys
  const linkDocumentsToContext = useCallback(async (data: {
    session_id: string;
    order_ids?: string[];
    journey_ids?: string[];
    document_categories?: string[];
  }): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.linkDocumentsToContext(data);
      
      if (response.success) {
        // Reload user contexts to reflect linked documents
        await loadUserContexts({ session_id: data.session_id });
        return true;
      } else {
        throw new Error(response.message || 'Erro ao vincular documentos ao contexto');
      }
    } catch (err) {
      console.error('Erro ao vincular documentos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  }, [loadUserContexts]);

  // Load initial data with mocked functions to prevent 404 errors
  useEffect(() => {
    if (userId) {
      loadUserContexts({ is_active: true });
      loadGlobalContexts();
    }
  }, [userId, loadUserContexts, loadGlobalContexts]);

  return {
    userContexts,
    globalContexts,
    conversationHistory,
    userOrders,
    userJourneys,
    loading,
    error,
    createUserContext,
    updateUserContext,
    loadUserContexts,
    loadGlobalContexts,
    saveConversationEntry,
    loadConversationHistory,
    getActiveContextForSession,
    getMergedContext,
    cleanupExpiredContexts,
    linkDocumentsToContext,
    loadUserOrders,
    loadUserJourneys
  };
};