/**
 * Hook para gerenciar usuários via API
 * ✅ Versão segura com validação de roles
 */
import { useState, useEffect } from 'react';
import { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UserRole, 
  isValidUserRole,
  getPermissionsForRole,
  getRoleLabel 
} from '../types/auth';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setDefaultPasswords: (forceUpdate?: boolean) => Promise<boolean>;
  changePassword: (userId: string, newPassword: string) => Promise<boolean>;
  createUser: (userData: CreateUserData) => Promise<boolean>;
  updateUser: (userId: string, userData: UpdateUserData) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  // ✅ Funções de segurança adicionadas
  validateUserRole: (role: string) => boolean;
  getRoleOptions: () => { value: UserRole; label: string }[];
  getUsersByRole: (role: UserRole) => User[];
  getRoleLabel: (role: UserRole) => string;
}

const API_BASE_URL = 'http://localhost:8000';

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/mittracking/users/list`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // ✅ Validar roles dos usuários retornados
      const validatedUsers = data.map((user: any) => {
        if (!isValidUserRole(user.user_type)) {
          console.warn(`Usuário ${user.id} tem role inválido: ${user.user_type}`);
          // Definir role padrão para usuários com role inválido
          user.user_type = UserRole.OPERATOR;
        }
        
        return {
          ...user,
          role: user.user_type, // Compatibilidade
          permissions: user.permissions || getPermissionsForRole(user.user_type as UserRole)
        };
      });
      
      setUsers(validatedUsers);
      
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPasswords = async (forceUpdate: boolean = false): Promise<boolean> => {
    try {
      setError(null);
      
      const url = forceUpdate 
        ? `${API_BASE_URL}/api/mittracking/users/set-default-passwords?force_update=true`
        : `${API_BASE_URL}/api/mittracking/users/set-default-passwords`;
        
      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchUsers(); // Recarregar lista
        return true;
      } else {
        throw new Error(data.message || 'Erro ao definir senhas padrão');
      }
    } catch (err) {
      console.error('Erro ao definir senhas padrão:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const changePassword = async (userId: string, newPassword: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/mittracking/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchUsers(); // Recarregar lista
        return true;
      } else {
        throw new Error(data.message || 'Erro ao alterar senha');
      }
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const createUser = async (userData: CreateUserData): Promise<boolean> => {
    try {
      setError(null);
      
      // ✅ Validar role antes de enviar
      if (!isValidUserRole(userData.user_type)) {
        throw new Error(`Role inválido: ${userData.user_type}. Roles válidos: ${Object.values(UserRole).join(', ')}`);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/mittracking/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchUsers(); // Recarregar lista
        return true;
      } else {
        throw new Error(data.message || 'Erro ao criar usuário');
      }
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const updateUser = async (userId: string, userData: UpdateUserData): Promise<boolean> => {
    try {
      setError(null);
      
      // ✅ Validar role se estiver sendo atualizado
      if (userData.user_type && !isValidUserRole(userData.user_type)) {
        throw new Error(`Role inválido: ${userData.user_type}. Roles válidos: ${Object.values(UserRole).join(', ')}`);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/mittracking/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchUsers(); // Recarregar lista
        return true;
      } else {
        throw new Error(data.message || 'Erro ao atualizar usuário');
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/mittracking/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchUsers(); // Recarregar lista
        return true;
      } else {
        throw new Error(data.message || 'Erro ao deletar usuário');
      }
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Funções de segurança
  const validateUserRole = (role: string): boolean => {
    return isValidUserRole(role);
  };

  const getRoleOptions = (): { value: UserRole; label: string }[] => {
    return Object.values(UserRole).map(role => ({
      value: role,
      label: getRoleLabel(role)
    }));
  };

  const getUsersByRole = (role: UserRole): User[] => {
    return users.filter(user => user.user_type === role);
  };

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    setDefaultPasswords,
    changePassword,
    createUser,
    updateUser,
    deleteUser,
    // ✅ Funções de segurança
    validateUserRole,
    getRoleOptions,
    getUsersByRole,
    getRoleLabel
  };
};