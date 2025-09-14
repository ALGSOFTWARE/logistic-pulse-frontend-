/**
 * ProtectedRoute - Component para proteger rotas que requerem autenticação
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log("🛡️ ProtectedRoute: isAuthenticated:", isAuthenticated, "loading:", loading);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, redirecionar para login
  if (!isAuthenticated) {
    console.log("🛡️ ProtectedRoute: Usuário não autenticado, redirecionando para /login");
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, mostrar conteúdo protegido
  console.log("🛡️ ProtectedRoute: Usuário autenticado, permitindo acesso");
  return <>{children}</>;
};