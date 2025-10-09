/**
 * Hook para gerenciar autenticação do usuário
 * ✅ Versão segura com validação de roles
 */
import { useState, useEffect } from 'react';
import { 
  User, 
  LoginResponse, 
  UserRole, 
  isValidUserRole, 
  getAgentForRole,
  getPermissionsForRole,
  hasPermission 
} from '../types/auth';

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  // ✅ Funções de segurança adicionadas
  userRole: UserRole | null;
  userAgent: string | null;
  userPermissions: string[];
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isLogistics: boolean;
  isFinance: boolean;
  isOperator: boolean;
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
        // Definir usuário admin por padrão
        setDefaultAdminUser();
      }
    } else {
      console.log("🔴 useAuth: Nenhum usuário salvo no localStorage - mantendo estado vazio");
      // Não definir usuário padrão - deixar vazio para que login seja obrigatório
    }
  }, []);

  const setDefaultAdminUser = () => {
    const adminUser: User = {
      id: 'admin-demo',
      name: 'Administrador Sistema',
      email: 'admin@logistica.com.br',
      user_type: UserRole.ADMIN,
      role: UserRole.ADMIN,
      is_active: true,
      created_at: new Date().toISOString(),
      has_password: true,
      permissions: getPermissionsForRole(UserRole.ADMIN)
    };
    
    const adminToken = 'demo-admin-token';
    
    setUser(adminUser);
    setToken(adminToken);
    
    // Salvar no localStorage
    localStorage.setItem('mit_token', adminToken);
    localStorage.setItem('mit_user', JSON.stringify(adminUser));
  };

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
        // ✅ Validar role do usuário
        if (!isValidUserRole(data.user.user_type)) {
          throw new Error(`Role inválido: ${data.user.user_type}. Roles válidos: ${Object.values(UserRole).join(', ')}`);
        }

        // ✅ Garantir que user_type seja um UserRole válido
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
    console.log("🔴 useAuth.logout: Iniciando logout...");
    console.log("🔴 useAuth.logout: Estado antes - user:", user, "token:", token);

    setUser(null);
    setToken(null);
    setError(null);

    // Limpar localStorage
    localStorage.removeItem('mit_token');
    localStorage.removeItem('mit_user');

    console.log("🔴 useAuth.logout: LocalStorage limpo");
    console.log("🔴 useAuth.logout: Estados resetados");
  };

  const isAuthenticated = !!user && !!token;
  
  // ✅ Funções derivadas para segurança
  const userRole = user?.user_type || null;
  const userAgent = userRole ? getAgentForRole(userRole) : null;
  const userPermissions = user?.permissions || (userRole ? getPermissionsForRole(userRole) : []);
  
  const checkPermission = (permission: string): boolean => {
    return user ? hasPermission(user, permission) : false;
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    // ✅ Dados de segurança
    userRole,
    userAgent,
    userPermissions,
    hasPermission: checkPermission,
    isAdmin: userRole === UserRole.ADMIN,
    isLogistics: userRole === UserRole.LOGISTICS,
    isFinance: userRole === UserRole.FINANCE,
    isOperator: userRole === UserRole.OPERATOR
  };
};