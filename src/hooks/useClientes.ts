/**
 * Hook para gerenciar dados de clientes via API
 */
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  endereco: string;
  score: number;
  status: "ativo" | "inativo" | "pendente";
  total_embarques: number;
  engajamento_chat: number;
  nps: number;
  ultima_atividade_texto: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface ClienteMetrics {
  total: number;
  ativos: number;
  scoremedio: number;
  nps_medio: number;
}

interface UseClientesReturn {
  clientes: Cliente[];
  metrics: ClienteMetrics;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createCliente: (data: any) => Promise<void>;
}

export const useClientes = (): UseClientesReturn => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar lista de clientes da API MitTracking
      const response = await fetch('http://localhost:8000/api/mittracking/clients/list');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setClientes(data);
      
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (clienteData: any) => {
    try {
      const response = await fetch('http://localhost:8000/api/mittracking/clients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: clienteData.nome,
          company_name: clienteData.empresa,
          email: clienteData.email,
          phone: clienteData.telefone,
          city: clienteData.endereco.split(',')[0],
          state: clienteData.endereco.split(',')[1]?.trim() || '',
          company_type: 'cliente'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Recarregar lista após criação
      await fetchClientes();
      
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      throw err;
    }
  };

  // Calcular métricas baseadas nos dados carregados
  const metrics: ClienteMetrics = {
    total: clientes.length,
    ativos: clientes.filter(c => c.status === 'ativo').length,
    scoremedio: clientes.length > 0 
      ? Math.round(clientes.reduce((acc, c) => acc + c.score, 0) / clientes.length)
      : 0,
    nps_medio: clientes.length > 0
      ? Math.round(clientes.reduce((acc, c) => acc + c.nps, 0) / clientes.length)
      : 0
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    metrics,
    loading,
    error,
    refetch: fetchClientes,
    createCliente
  };
};