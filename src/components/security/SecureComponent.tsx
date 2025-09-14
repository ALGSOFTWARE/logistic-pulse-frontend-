/**
 * Exemplo de componente que usa o sistema de segurança
 * Demonstra como implementar controle de acesso baseado em roles
 */
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

interface SecureComponentProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

// ✅ Componente de proteção por role/permissão
export const SecureComponent: React.FC<SecureComponentProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback = <div className="text-red-500">Acesso negado</div>
}) => {
  const { userRole, hasPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div className="text-yellow-500">Usuário não autenticado</div>;
  }

  // Verificar role específico
  if (requiredRole && userRole !== requiredRole) {
    return <>{fallback}</>;
  }

  // Verificar permissão específica
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ✅ Exemplo de uso do sistema de segurança
export const SecurityExample: React.FC = () => {
  const { 
    user, 
    userRole, 
    userAgent, 
    userPermissions, 
    isAdmin, 
    isLogistics, 
    isFinance,
    hasPermission 
  } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔒 Sistema de Segurança</h1>
      
      {/* ✅ Informações do usuário */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Usuário Atual</h2>
        <p><strong>Nome:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {userRole}</p>
        <p><strong>Agente Associado:</strong> {userAgent}</p>
        <p><strong>Permissões:</strong> {userPermissions.join(', ')}</p>
      </div>

      {/* ✅ Indicadores de role */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Verificações de Role</h2>
        <div className="grid grid-cols-2 gap-2">
          <p>Admin: {isAdmin ? '✅' : '❌'}</p>
          <p>Logística: {isLogistics ? '✅' : '❌'}</p>
          <p>Financeiro: {isFinance ? '✅' : '❌'}</p>
          <p>Operador: {user.user_type === UserRole.OPERATOR ? '✅' : '❌'}</p>
        </div>
      </div>

      {/* ✅ Controle por permissão */}
      <SecureComponent 
        requiredPermission="users.create"
        fallback={<p className="text-red-500">❌ Sem permissão para criar usuários</p>}
      >
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <p className="text-green-700">✅ Você pode criar usuários</p>
          <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
            Criar Usuário
          </button>
        </div>
      </SecureComponent>

      {/* ✅ Controle por role específico */}
      <SecureComponent 
        requiredRole={UserRole.ADMIN}
        fallback={<p className="text-red-500">❌ Área restrita para administradores</p>}
      >
        <div className="bg-purple-50 p-4 rounded-lg mb-4">
          <p className="text-purple-700">🔐 Área de Administração</p>
          <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded">
            Configurar Sistema
          </button>
        </div>
      </SecureComponent>

      {/* ✅ Controle específico por permissão */}
      <div className="space-y-2">
        <h3 className="font-semibold">Permissões Específicas:</h3>
        
        {hasPermission('orders.read') && (
          <p className="text-green-600">✅ Pode visualizar pedidos</p>
        )}
        
        {hasPermission('financial.read') && (
          <p className="text-green-600">✅ Pode visualizar dados financeiros</p>
        )}
        
        {hasPermission('system.config') && (
          <p className="text-green-600">✅ Pode configurar sistema</p>
        )}

        {hasPermission('reports.all') && (
          <p className="text-green-600">✅ Pode acessar todos os relatórios</p>
        )}
      </div>

      {/* ✅ Exemplo de chamada com agente correto */}
      <div className="bg-yellow-50 p-4 rounded-lg mt-6">
        <h3 className="font-semibold mb-2">Integração com Chat/Agentes</h3>
        <p>Seu agente designado: <strong>{userAgent}</strong></p>
        <p>Quando você enviar mensagens no chat, será automaticamente roteado para este agente baseado no seu role.</p>
        
        <button 
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            // Exemplo de como seria o envio com agente específico
            const chatPayload = {
              message: "Exemplo de mensagem",
              session_id: "example-session",
              agent_name: userAgent // ✅ Agente correto baseado no role
            };
            console.log('Payload que seria enviado:', chatPayload);
          }}
        >
          Testar Chat com Agente Correto
        </button>
      </div>
    </div>
  );
};