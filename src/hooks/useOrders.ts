/**
 * Hook para gerenciar orders via API
 */
import { useState, useEffect } from 'react';

export interface Order {
  order_id: string;
  title: string;
  customer_name: string;
  status: string;
  order_type: string;
  created_at: string;
  updated_at?: string;
  description?: string;
  total_value?: number;
  currency?: string;
  origin_location?: string;
  destination_location?: string;
  documents_count?: number;
  documents?: OrderDocument[];
}

export interface OrderDocument {
  id: string;
  file_id: string;
  original_name: string;
  category: string;
  file_type: string;
  size_bytes: number;
  processing_status: string;
  uploaded_at: string;
  s3_url?: string;
}

export interface OrderCommit {
  hash: string;
  action: string;
  message: string;
  user_id: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface OrderVersionHistory {
  order_id: string;
  history: OrderCommit[];
  total_commits: number;
  showing: number;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getOrderDetails: (orderId: string) => Promise<Order | null>;
  getOrderHistory: (orderId: string, limit?: number) => Promise<OrderVersionHistory | null>;
  totalOrders: number;
}

const API_BASE_URL = 'http://localhost:8001';

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/orders/`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // A API retorna diretamente um array de orders
      const ordersArray = Array.isArray(data) ? data : data.orders || [];

      // Para cada order, vamos buscar o count real de documentos
      const documentsResponse = await fetch(`${API_BASE_URL}/files/admin/all-documents?limit=1000`);
      let documentCounts: { [key: string]: number } = {};

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        // Contar documentos por order_id
        documentsData.documents.forEach((doc: any) => {
          if (doc.order_id) {
            documentCounts[doc.order_id] = (documentCounts[doc.order_id] || 0) + 1;
          }
        });
      }

      // Mapear os dados para corresponder à nossa interface
      const mappedOrders = ordersArray.map((order: any) => ({
        order_id: order.order_id,
        title: order.title,
        customer_name: order.customer_name,
        status: order.status,
        order_type: order.order_type,
        created_at: order.created_at,
        updated_at: order.updated_at,
        description: order.description,
        total_value: order.estimated_value,
        currency: order.currency,
        origin_location: order.origin,
        destination_location: order.destination,
        documents_count: documentCounts[order.order_id] || 0
      }));

      setOrders(mappedOrders);
      setTotalOrders(mappedOrders.length);

    } catch (err) {
      console.error('Erro ao carregar orders:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchOrders();
  };

  const getOrderDetails = async (orderId: string): Promise<Order | null> => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.order;
    } catch (err) {
      console.error('Erro ao buscar detalhes da order:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    }
  };

  const getOrderHistory = async (orderId: string, limit?: number): Promise<OrderVersionHistory | null> => {
    try {
      setError(null);

      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/history?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao buscar histórico da order:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refetch,
    getOrderDetails,
    getOrderHistory,
    totalOrders
  };
};