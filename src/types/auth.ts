/**
 * Tipos e enums relacionados à autenticação e autorização
 * Compatível com Gatekeeper API para consistência
 */

export enum UserRole {
  ADMIN = "admin",
  LOGISTICS = "logistics", 
  FINANCE = "finance",
  OPERATOR = "operator"
}

export interface User {
  id: string;
  name: string;
  email: string;
  user_type: UserRole;           // ✅ Tipagem forte com enum
  role?: UserRole;               // ✅ Campo adicional para compatibilidade
  is_active: boolean;
  created_at: string;
  last_login?: string;
  has_password: boolean;
  permissions?: string[];        // ✅ Permissões específicas
}

export interface CreateUserData {
  name: string;
  email: string;
  user_type: UserRole;          // ✅ Apenas roles válidos
  password?: string;
  is_active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  user_type?: UserRole;         // ✅ Apenas roles válidos
  password?: string;
  is_active?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  agent?: string;               // ✅ Agente associado ao role
  permissions?: string[];       // ✅ Permissões do usuário
}

// ✅ Mapeamento de roles para agentes (compatível com Gatekeeper)
export const ROLE_AGENT_MAP: Record<UserRole, string> = {
  [UserRole.ADMIN]: "AdminAgent",
  [UserRole.LOGISTICS]: "LogisticsAgent", 
  [UserRole.FINANCE]: "FinanceAgent",
  [UserRole.OPERATOR]: "LogisticsAgent"
};

// ✅ Permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    "users.create",
    "users.read", 
    "users.update",
    "users.delete",
    "system.config",
    "reports.all"
  ],
  [UserRole.LOGISTICS]: [
    "orders.read",
    "orders.update",
    "documents.read",
    "tracking.read",
    "reports.logistics"
  ],
  [UserRole.FINANCE]: [
    "orders.read",
    "financial.read",
    "financial.update", 
    "reports.financial"
  ],
  [UserRole.OPERATOR]: [
    "orders.read",
    "documents.read",
    "tracking.read"
  ]
};

// ✅ Validação de role
export const isValidUserRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

// ✅ Obter agente para role
export const getAgentForRole = (role: UserRole): string => {
  return ROLE_AGENT_MAP[role];
};

// ✅ Obter permissões para role  
export const getPermissionsForRole = (role: UserRole): string[] => {
  return ROLE_PERMISSIONS[role];
};

// ✅ Verificar se usuário tem permissão
export const hasPermission = (user: User, permission: string): boolean => {
  const rolePermissions = getPermissionsForRole(user.user_type);
  const userPermissions = user.permissions || rolePermissions;
  return userPermissions.includes(permission);
};

// ✅ Obter label amigável para role
export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Administrador",
    [UserRole.LOGISTICS]: "Logística",
    [UserRole.FINANCE]: "Financeiro", 
    [UserRole.OPERATOR]: "Operador"
  };
  return labels[role];
};