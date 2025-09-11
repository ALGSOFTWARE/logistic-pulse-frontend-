/**
 * Hook para gerenciar autenticação do usuário
 */
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  user_type: string;
  last_login?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const API_BASE_URL = 'http://localhost:8001';

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    const savedToken = localStorage.getItem('mit_token');
    const savedUser = localStorage.getItem('mit_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        // Limpar dados corrompidos
        localStorage.removeItem('mit_token');
        localStorage.removeItem('mit_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/mittracking/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no login');
      }

      if (data.success && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        
        // Salvar no localStorage
        localStorage.setItem('mit_token', data.token);
        localStorage.setItem('mit_user', JSON.stringify(data.user));
        
        return true;
      } else {
        throw new Error(data.message || 'Dados de login inválidos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    
    // Limpar localStorage
    localStorage.removeItem('mit_token');
    localStorage.removeItem('mit_user');
  };

  const isAuthenticated = !!user && !!token;

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated
  };
};