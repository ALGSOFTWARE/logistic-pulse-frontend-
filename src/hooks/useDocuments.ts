/**
 * Hook para gerenciar documentos via API
 */
import { useState, useEffect } from 'react';

export interface Document {
  id: string;
  numero: string;
  tipo: string;
  cliente: string;
  jornada?: string;
  origem: string;
  destino: string;
  dataUpload: string;
  dataEmissao: string;
  status: string;
  tamanho: string;
  versao: number;
  uploadPor: string;
  origem_upload: string;
  visualizacoes: number;
  ultimaVisualizacao?: string;
  file_id: string;
  s3_url?: string;
  order_id?: string;
  order_title?: string;
  order_customer?: string;
}

export interface DocumentDetails {
  id: string;
  file_id: string;
  original_name: string;
  file_type: string;
  size_bytes: number;
  category: string;
  processing_status: string;
  uploaded_at: string;
  last_accessed?: string;
  access_count: number;
  s3_url?: string;
  is_public: boolean;
  tags: string[];
  text_content_available: boolean;
  has_embedding: boolean;
  processing_logs: string[];
  order?: {
    order_id: string;
    title: string;
    customer_name: string;
    status?: string;
    created_at?: string;
  };
}

export interface DocumentFilters {
  user_id?: string;
  category?: string;
  status?: string;
  origem_upload?: string;
}

interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  refetch: (filters?: DocumentFilters) => void;
  uploadDocument: (file: File, userId: string, category?: string) => Promise<boolean>;
  getDocumentDetails: (documentId: string, userId?: string) => Promise<DocumentDetails | null>;
  downloadDocument: (documentId: string) => Promise<string | null>;
  deleteDocument: (documentId: string, userId: string) => Promise<boolean>;
  totalDocuments: number;
  hasMore: boolean;
  loadMore: () => void;
}

const API_BASE_URL = 'http://localhost:8001';

export const useDocuments = (initialFilters?: DocumentFilters): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<DocumentFilters>(initialFilters || {});
  const [currentSkip, setCurrentSkip] = useState(0);
  const [limit] = useState(20);

  const fetchDocuments = async (filters: DocumentFilters = currentFilters, skip = 0, append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query parameters
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.origem_upload) params.append('origem_upload', filters.origem_upload);
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());
      
      // Usar endpoint de admin para ver todos os documentos
      const response = await fetch(`${API_BASE_URL}/files/admin/all-documents?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transformar dados da API para o formato esperado pelo frontend
      const transformedDocuments = data.documents.map((doc: any) => ({
        id: doc.id,
        file_id: doc.file_id,
        numero: doc.original_name,
        tipo: doc.category?.toUpperCase() || 'OTHER',
        cliente: doc.order_info?.customer_name || 'Cliente não informado',
        jornada: doc.order_info?.title || 'Sem order associada',
        origem: 'N/A',
        destino: 'N/A',
        dataUpload: doc.uploaded_at,
        dataEmissao: doc.uploaded_at,
        status: doc.processing_status === 'indexed' ? 'Validado' :
                doc.processing_status === 'uploaded' ? 'Pendente Validação' :
                doc.processing_status === 'error' ? 'Rejeitado' : 'Processando',
        tamanho: `${(doc.size_bytes / 1024 / 1024).toFixed(2)} MB`,
        versao: 1,
        uploadPor: 'Sistema',
        origem_upload: 'manual',
        visualizacoes: 0,
        ultimaVisualizacao: doc.uploaded_at,
        s3_url: doc.s3_url,
        order_id: doc.order_id,
        // Adicionar informações da order para facilitar filtros
        order_title: doc.order_info?.title || '',
        order_customer: doc.order_info?.customer_name || ''
      }));
      
      if (append) {
        setDocuments(prev => [...prev, ...transformedDocuments]);
      } else {
        setDocuments(transformedDocuments);
      }
      setTotalDocuments(data.pagination.total);
      setHasMore(data.pagination.has_more);
      setCurrentSkip(skip + transformedDocuments.length);
      
    } catch (err) {
      console.error('Erro ao carregar documentos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      if (!append) {
        setDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = (filters?: DocumentFilters) => {
    const newFilters = filters || currentFilters;
    setCurrentFilters(newFilters);
    setCurrentSkip(0);
    fetchDocuments(newFilters, 0, false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchDocuments(currentFilters, currentSkip, true);
    }
  };

  const uploadDocument = async (
    file: File, 
    userId: string, 
    category: string = 'other'
  ): Promise<boolean> => {
    try {
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Usar uma Order padrão para demonstração - em produção, isso deveria ser selecionado pelo usuário
      const defaultOrderId = 'e53c5a9d-1ccc-4639-9761-8850775ae597';
      
      const params = new URLSearchParams();
      params.append('order_id', defaultOrderId);
      params.append('category', category);
      params.append('public', 'true');
      
      const response = await fetch(`${API_BASE_URL}/files/upload?${params.toString()}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.message && data.message.includes('sucesso')) {
        // Recarregar lista de documentos após upload bem-sucedido
        refetch();
        return true;
      } else {
        throw new Error(data.message || 'Erro ao fazer upload do documento');
      }
    } catch (err) {
      console.error('Erro no upload de documento:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  const getDocumentDetails = async (
    documentId: string, 
    userId?: string
  ): Promise<DocumentDetails | null> => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/files/${documentId}/metadata`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformar dados para o formato esperado
      const details: DocumentDetails = {
        id: data.document.id,
        file_id: data.document.file_id,
        original_name: data.document.original_name,
        file_type: data.document.file_type,
        size_bytes: data.document.size_bytes,
        category: data.document.category || 'other',
        processing_status: data.document.processing_status || 'unknown',
        uploaded_at: data.document.uploaded_at,
        last_accessed: undefined,
        access_count: 0,
        s3_url: data.document.s3_url,
        is_public: data.document.is_public || false,
        tags: data.document.tags || [],
        text_content_available: data.document.text_content_length > 0,
        has_embedding: data.document.has_embedding || false,
        processing_logs: [],
        order: data.order ? {
          order_id: data.order.order_id,
          title: data.order.title,
          customer_name: data.order.customer_name,
          status: data.order.status,
          created_at: data.order.created_at
        } : undefined
      };
      
      return details;
    } catch (err) {
      console.error('Erro ao buscar detalhes do documento:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    }
  };

  const downloadDocument = async (documentId: string): Promise<string | null> => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/files/${documentId}/download`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.download_url;
    } catch (err) {
      console.error('Erro ao fazer download:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    }
  };

  const deleteDocument = async (documentId: string, userId: string): Promise<boolean> => {
    try {
      setError(null);
      
      const params = new URLSearchParams();
      params.append('user_id', userId);
      
      const response = await fetch(
        `${API_BASE_URL}/api/mittracking/documents/${documentId}?${params.toString()}`, 
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remover documento da lista local
        setDocuments(prev => prev.filter(doc => doc.id !== documentId && doc.file_id !== documentId));
        setTotalDocuments(prev => Math.max(0, prev - 1));
        return true;
      } else {
        throw new Error(data.message || 'Erro ao deletar documento');
      }
    } catch (err) {
      console.error('Erro ao deletar documento:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    refetch,
    uploadDocument,
    getDocumentDetails,
    downloadDocument,
    deleteDocument,
    totalDocuments,
    hasMore,
    loadMore
  };
};