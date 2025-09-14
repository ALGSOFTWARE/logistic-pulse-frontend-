/**
 * AuthContext - Provider de Autenticação
 * Gerencia estado global de autenticação e protege rotas
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  LoginResponse,
  UserRole,
  isValidUserRole,
  getAgentForRole,
  getPermissionsForRole,
  hasPermission
} from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userAgent: string | null;
  userPermissions: string[];
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isLogistics: boolean;
  isFinance: boolean;
  isOperator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8000';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Iniciar com loading=true
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    console.log("🔑 AuthProvider: Verificando localStorage...");
    const savedToken = localStorage.getItem('mit_token');
    const savedUser = localStorage.getItem('mit_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("🔑 AuthProvider: Usuário encontrado no localStorage:", parsedUser.email);

        setToken(savedToken);
        setUser(parsedUser);
      } catch (err) {
        console.log("🔑 AuthProvider: Dados corrompidos no localStorage, limpando...");
        localStorage.removeItem('mit_token');
        localStorage.removeItem('mit_user');
      }
    } else {
      console.log("🔑 AuthProvider: Nenhum usuário no localStorage");
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔑 AuthProvider: Tentativa de login para:", email);

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
        // Validar role do usuário
        if (!isValidUserRole(data.user.user_type)) {
          throw new Error(`Role inválido: ${data.user.user_type}. Roles válidos: ${Object.values(UserRole).join(', ')}`);
        }

        // Garantir que user_type seja um UserRole válido
        const validatedUser: User = {
          ...data.user,
          user_type: data.user.user_type as UserRole,
          role: data.user.user_type as UserRole, // Compatibilidade
          permissions: data.permissions || getPermissionsForRole(data.user.user_type as UserRole)
        };

        setUser(validatedUser);
        setToken(data.token);

        // Salvar no localStorage
        localStorage.setItem('mit_token', data.token);
        localStorage.setItem('mit_user', JSON.stringify(validatedUser));

        console.log("🔑 AuthProvider: Login bem-sucedido para:", email);
        return true;
      } else {
        throw new Error(data.message || 'Dados de login inválidos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.log("🔑 AuthProvider: Erro no login:", errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("🔑 AuthProvider: Fazendo logout...");

    setUser(null);
    setToken(null);
    setError(null);

    // Limpar localStorage
    localStorage.removeItem('mit_token');
    localStorage.removeItem('mit_user');

    console.log("🔑 AuthProvider: Logout concluído");
  };

  const isAuthenticated = !!user && !!token;

  // Funções derivadas para segurança
  const userRole = user?.user_type || null;
  const userAgent = userRole ? getAgentForRole(userRole) : null;
  const userPermissions = user?.permissions || (userRole ? getPermissionsForRole(userRole) : []);

  const checkPermission = (permission: string): boolean => {
    return user ? hasPermission(user, permission) : false;
  };

  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    userRole,
    userAgent,
    userPermissions,
    hasPermission: checkPermission,
    isAdmin: userRole === UserRole.ADMIN,
    isLogistics: userRole === UserRole.LOGISTICS,
    isFinance: userRole === UserRole.FINANCE,
    isOperator: userRole === UserRole.OPERATOR
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};