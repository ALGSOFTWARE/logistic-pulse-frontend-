import React, { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "../contexts/AuthContext";
import {
  Package,
  FileText,
  Download,
  Eye,
  Filter,
  Calendar,
  User,
  Truck,
  Search,
  MoreVertical,
  Building,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Ship,
  Plane,
  GitCommit,
  GitBranch,
  Plus,
  Upload,
  History
} from "lucide-react";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "created":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "shipped":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getOrderTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "import":
      return { icon: Ship, color: "text-blue-500" };
    case "export":
      return { icon: Plane, color: "text-green-500" };
    case "domestic":
      return { icon: Truck, color: "text-orange-500" };
    default:
      return { icon: Package, color: "text-gray-500" };
  }
};

const getCommitColor = (action: string) => {
  switch (action) {
    case "document_added":
    case "document_linked":
    case "document_indexed":
      return "border-green-500 bg-green-50 dark:bg-green-950";
    case "document_processing":
      return "border-orange-500 bg-orange-50 dark:bg-orange-950";
    case "status_changed":
      return "border-blue-500 bg-blue-50 dark:bg-blue-950";
    case "note_added":
      return "border-purple-500 bg-purple-50 dark:bg-purple-950";
    case "order_created":
      return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950";
    default:
      return "border-gray-500 bg-gray-50 dark:bg-gray-950";
  }
};

const getCommitIconColor = (action: string) => {
  switch (action) {
    case "document_added":
    case "document_linked":
    case "document_indexed":
      return "text-green-600";
    case "document_processing":
      return "text-orange-600";
    case "status_changed":
      return "text-blue-600";
    case "note_added":
      return "text-purple-600";
    case "order_created":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
};

const getTimelineStepColor = (action: string) => {
  switch (action) {
    case "document_added":
    case "document_linked":
    case "document_indexed":
      return "bg-green-500";
    case "document_processing":
      return "bg-orange-500";
    case "status_changed":
      return "bg-blue-500";
    case "note_added":
      return "bg-purple-500";
    case "order_created":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const getTimelineTitle = (action: string, details: any) => {
  switch (action) {
    case "document_added":
    case "document_linked":
      return "Documento Adicionado";
    case "document_indexed":
      return "Documento Indexado";
    case "document_processing":
      return "Processamento do Documento";
    case "status_changed":
      return "Status Atualizado";
    case "note_added":
      return "Nota Adicionada";
    case "order_created":
      return "Order Criada";
    default:
      return "Atividade";
  }
};

const getTimelineDescription = (action: string, message: string, details: any) => {
  switch (action) {
    case "document_added":
    case "document_linked":
      return details?.document_name ?
        `Documento "${details.document_name}" foi adicionado` :
        message;
    case "document_indexed":
      return details?.document_name ?
        `Documento "${details.document_name}" indexado para busca` :
        message;
    case "document_processing":
      return message;
    case "status_changed":
      return details?.from_status && details?.to_status ?
        `Order movida de "${details.from_status}" para "${details.to_status}"` :
        message;
    case "note_added":
      return details?.content_preview ?
        `Nota: ${details.content_preview.slice(0, 50)}${details.content_preview.length > 50 ? '...' : ''}` :
        message;
    case "order_created":
      return message;
    default:
      return message;
  }
};

const OrderDetailsModal = ({ order, isOpen, onClose, onViewDocument }: {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onViewDocument: (document: any) => void;
}) => {
  const { getOrderDetails, getOrderHistory } = useOrders();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [versionHistory, setVersionHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [orderDocuments, setOrderDocuments] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadOrderDetails = async () => {
    if (!order?.order_id) return;

    setLoadingDetails(true);
    try {
      const details = await getOrderDetails(order.order_id);
      setOrderDetails(details);
    } catch (error) {
      console.error('Erro ao carregar detalhes da order:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadVersionHistory = async () => {
    if (!order?.order_id) return;

    setLoadingHistory(true);
    try {
      const history = await getOrderHistory(order.order_id, 20);
      setVersionHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico da order:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadOrderDocuments = async () => {
    if (!order?.order_id) return;

    setLoadingDocuments(true);
    try {
      const response = await fetch(`http://localhost:8001/orders/${order.order_id}/documents`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const documents = await response.json();
      setOrderDocuments(documents);
    } catch (error) {
      console.error('Erro ao carregar documentos da order:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`http://localhost:8001/files/${documentId}/download`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Criar um link temporário para fazer o download
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Erro ao fazer download do documento:', error);
      // Aqui você pode adicionar um toast de erro se quiser
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !order?.order_id) {
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const params = new URLSearchParams();
      params.append('order_id', order.order_id);
      params.append('category', 'other');
      params.append('public', 'true');

      const response = await fetch(`http://localhost:8001/files/upload?${params.toString()}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Recarregar documentos e fechar modal
      await loadOrderDocuments();
      setUploadModalOpen(false);
      setSelectedFile(null);

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && order) {
      loadOrderDetails();
      loadVersionHistory();
      loadOrderDocuments();
    }
  }, [isOpen, order]);

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {order.title}
            </DialogTitle>
            <div className="flex items-center gap-3">
              {/* Cards compactos no header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold">{order.documents_count || 0}</div>
                  <div className="text-xs text-muted-foreground">Documentos</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                <Badge variant="outline">{order.order_type}</Badge>
              </div>
            </div>
          </div>

          {/* Informações básicas em linha */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
            <span><strong>Cliente:</strong> {order.customer_name}</span>
            <span><strong>Criado:</strong> {new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
            <span><strong>ID:</strong> {order.order_id.slice(0, 8)}...</span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {loadingDetails ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando detalhes...</p>
            </div>
          ) : (
            <>

              {/* Sistema de Versionamento tipo Git */}
              <Tabs defaultValue="documents" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="documents" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documentos Atuais
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Histórico de Mudanças
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Timeline
                  </TabsTrigger>
                </TabsList>

                {/* Aba de Documentos Atuais */}
                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Documentos Atuais ({orderDocuments?.length || 0})
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUploadModalOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Documento
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingDocuments ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Carregando documentos...</p>
                        </div>
                      ) : orderDocuments && orderDocuments.length > 0 ? (
                        <div className="space-y-3">
                          {orderDocuments.map((doc: any, index: number) => (
                            <div
                              key={doc.id || index}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{doc.original_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.category} • {(doc.size_bytes / 1024 / 1024).toFixed(1)} MB
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {doc.processing_status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onViewDocument(doc)}
                                  title="Visualizar documento"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadDocument(doc.file_id, doc.original_name)}
                                  title="Baixar documento"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Nenhum documento associado a esta order</p>
                          <p className="text-sm">Adicione documentos para começar o rastreamento</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba de Histórico de Mudanças */}
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitCommit className="h-5 w-5" />
                        Histórico de Mudanças (Tipo Git)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingHistory ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Carregando histórico...</p>
                        </div>
                      ) : versionHistory?.history && versionHistory.history.length > 0 ? (
                        <div className="space-y-4">
                          {versionHistory.history.map((commit: any, index: number) => (
                            <div
                              key={commit.hash || index}
                              className={`flex items-start gap-4 p-4 border-l-2 rounded-r-lg ${getCommitColor(commit.action)}`}
                            >
                              <GitCommit className={`h-5 w-5 mt-0.5 ${getCommitIconColor(commit.action)}`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{commit.message}</span>
                                  {index === 0 && (
                                    <Badge variant="outline" className="text-xs">HEAD</Badge>
                                  )}
                                </div>
                                {commit.details && Object.keys(commit.details).length > 0 && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {commit.action === 'document_added' && commit.details.document_name && (
                                      `Documento: ${commit.details.document_name} (${commit.details.document_category})`
                                    )}
                                    {commit.action === 'status_changed' && commit.details.from_status && commit.details.to_status && (
                                      `Status: ${commit.details.from_status} → ${commit.details.to_status}`
                                    )}
                                    {commit.action === 'note_added' && commit.details.content_preview && (
                                      `Nota: ${commit.details.content_preview}`
                                    )}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>commit {commit.hash}</span>
                                  <span>por {commit.user_id}</span>
                                  <span>{new Date(commit.timestamp).toLocaleDateString('pt-BR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <GitCommit className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Nenhum histórico de versões encontrado</p>
                          <p className="text-sm">As mudanças aparecerão aqui quando a order for modificada</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba de Timeline */}
                <TabsContent value="timeline">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Timeline da Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingHistory ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Carregando timeline...</p>
                        </div>
                      ) : versionHistory?.history && versionHistory.history.length > 0 ? (
                        <div className="relative">
                          {/* Timeline vertical */}
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>

                          <div className="space-y-6">
                            {versionHistory.history.map((commit: any, index: number) => (
                              <div key={commit.hash || index} className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full ${getTimelineStepColor(commit.action)} flex items-center justify-center text-white text-sm font-bold relative z-10`}>
                                  {versionHistory.history.length - index}
                                </div>
                                <div>
                                  <h4 className="font-medium">{getTimelineTitle(commit.action, commit.details)}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {getTimelineDescription(commit.action, commit.message, commit.details)}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    <span>{new Date(commit.timestamp).toLocaleDateString('pt-BR', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}</span>
                                    <span>•</span>
                                    <span>por {commit.user_id}</span>
                                    <span>•</span>
                                    <span className="font-mono">{commit.hash}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Nenhuma atividade registrada</p>
                          <p className="text-sm">As atividades aparecerão aqui conforme mudanças forem feitas</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Modal de Upload */}
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Documento à Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione um arquivo para adicionar à order
                </p>

                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.xml,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="order-file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById('order-file-upload') as HTMLInputElement;
                    if (input) input.click();
                  }}
                >
                  Selecionar Arquivo
                </Button>

                {selectedFile && (
                  <div className="mt-4 p-3 bg-muted rounded-lg text-left">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setUploadModalOpen(false);
                    setSelectedFile(null);
                  }}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

const DocumentViewer = ({ documento, isOpen, onClose }: { documento: any; isOpen: boolean; onClose: () => void }) => {
  const [documentDetails, setDocumentDetails] = useState<any>(null);
  const [documentAccess, setDocumentAccess] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [ocrText, setOcrText] = useState(null);
  const [loadingOcrText, setLoadingOcrText] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const ensurePreviewUrl = async (docData: any, access: any) => {
    if (!documento?.file_id) {
      setPreviewUrl(null);
      return;
    }

    if (docData?.preview_url) {
      setPreviewUrl(docData.preview_url);
      return;
    }

    if (docData?.s3_url) {
      setPreviewUrl(docData.s3_url);
      return;
    }

    if (access?.requires_credentials) {
      setPreviewError(access?.message || 'Visualização indisponível sem credenciais da AWS configuradas.');
      setPreviewUrl(null);
      return;
    }

    if (access?.can_download) {
      setLoadingPreview(true);
      setPreviewError(null);
      try {
        const response = await fetch(`http://localhost:8001/files/${documento.file_id}/download`);
        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }
        const data = await response.json();
        setPreviewUrl(data.download_url);
      } catch (error) {
        console.error('Erro ao gerar link de visualização:', error);
        setPreviewError('Não foi possível gerar o link do documento.');
      } finally {
        setLoadingPreview(false);
      }
    } else {
      setPreviewUrl(null);
    }
  };

  const loadDocumentDetails = async () => {
    if (!documento?.file_id) return;

    setLoadingDetails(true);
    try {
      const response = await fetch(`http://localhost:8001/files/${documento.file_id}/metadata`);
      if (response.ok) {
        const details = await response.json();
        const docData = details?.document ? {
          ...details.document,
          text_content_available: details.document?.text_content_available ?? (details.document?.text_content_length ?? 0) > 0,
        } : details;

        setDocumentDetails(docData);
        setDocumentAccess(details?.access || null);
        setPreviewError(details?.access?.message || null);

        await ensurePreviewUrl(docData, details?.access);

        if (docData?.text_content_available) {
          await loadOcrText();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do documento:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadOcrText = async () => {
    if (!documento?.file_id) return;

    setLoadingOcrText(true);
    try {
      const response = await fetch(`http://localhost:8001/files/${documento.file_id}/ocr-text`);
      if (response.ok) {
        const data = await response.json();
        setOcrText(data);
      }
    } catch (error) {
      console.error('Erro ao carregar texto OCR:', error);
    } finally {
      setLoadingOcrText(false);
    }
  };

  // Carregar detalhes quando o modal abrir
  React.useEffect(() => {
    if (isOpen && documento) {
      loadDocumentDetails();
    }

    // Reset states when modal closes
    if (!isOpen) {
      setDocumentDetails(null);
      setOcrText(null);
      setDocumentAccess(null);
      setPreviewUrl(null);
      setPreviewError(null);
    }
  }, [isOpen, documento]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{documento?.original_name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {loadingDetails ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando detalhes...</p>
              </div>
            </div>
          ) : documentDetails ? (
            <div className="h-full flex flex-col space-y-4 p-4">
              {/* Metadados do documento */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span> {documentDetails.file_type || '—'}
                </div>
                <div>
                  <span className="font-medium">Tamanho:</span> {documentDetails.size_bytes ? (documentDetails.size_bytes / 1024 / 1024).toFixed(1) + ' MB' : '—'}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {documentDetails.processing_status || '—'}
                </div>
                <div>
                  <span className="font-medium">Acessos:</span> {documentDetails.access_count ?? documento?.access_count ?? 0}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Enviado em:</span> {documentDetails.uploaded_at ? new Date(documentDetails.uploaded_at).toLocaleString('pt-BR') : '—'}
                </div>
              </div>

              {documentAccess?.message && (
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{documentAccess.message}</span>
                </div>
              )}

              {/* Badges de status */}
              <div className="flex gap-2">
                {documentDetails.text_content_available && (
                  <Badge variant="outline">OCR Processado</Badge>
                )}
                {documentDetails.has_embedding && (
                  <Badge variant="outline">Busca Semântica Habilitada</Badge>
                )}
              </div>

              {/* Preview do documento */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Visualização</h4>
                  {previewUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(previewUrl, '_blank', 'noopener')}
                    >
                      Abrir em nova aba
                    </Button>
                  )}
                </div>
                <div className="flex-1 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {loadingPreview ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      Gerando visualização...
                    </div>
                  ) : previewUrl ? (
                    documentDetails.file_type?.startsWith('image/') ? (
                      <img src={previewUrl} alt={documentDetails.original_name} className="max-h-full max-w-full object-contain" />
                    ) : documentDetails.file_type === 'application/pdf' ? (
                      <iframe src={`${previewUrl}#view=FitH`} className="w-full h-full" title="Preview do documento" />
                    ) : (
                      <div className="text-center p-6">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-3">Pré-visualização indisponível para este tipo de arquivo.</p>
                        <Button size="sm" onClick={() => window.open(previewUrl, '_blank', 'noopener')}>
                          Abrir documento
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-6 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3" />
                      <p>{previewError || 'Nenhuma visualização disponível para este documento.'}</p>
                      {documentAccess?.can_download && (
                        <Button size="sm" className="mt-3" onClick={() => ensurePreviewUrl(documentDetails, documentAccess)}>
                          Tentar novamente
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Texto OCR */}
              {documentDetails.text_content_available && (
                <div className="flex-1 flex flex-col min-h-0">
                  <h4 className="font-medium mb-2">Texto Extraído (OCR)</h4>
                  {loadingOcrText ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                      <span className="text-sm text-muted-foreground">Carregando texto...</span>
                    </div>
                  ) : ocrText ? (
                    <div className="flex-1 bg-background border rounded-lg p-4 overflow-auto">
                      <pre className="text-sm whitespace-pre-wrap break-words">
                        {ocrText.text_content}
                      </pre>
                      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                        <p>Caracteres: {ocrText.text_length}</p>
                        {ocrText.logistics_entities && ocrText.logistics_entities.length > 0 && (
                          <p>Entidades logísticas identificadas: {ocrText.logistics_entities.length}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Não foi possível carregar o texto</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!documentDetails.text_content_available && (
                <div className="text-xs text-muted-foreground">
                  Nenhum texto estruturado foi extraído deste documento.
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Visualização do documento</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Não foi possível carregar os detalhes
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Orders() {
  const [filtro, setFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [orderSelecionada, setOrderSelecionada] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const { toast } = useToast();

  const { user: authUser, isAdmin } = useAuth();
  const {
    orders,
    loading,
    error,
    refetch,
    totalOrders
  } = useOrders();

  // Aplicar filtros localmente às orders carregadas
  const ordersFiltradas = useMemo(() => {
    return orders.filter(order => {
      const matchFiltro = order.title.toLowerCase().includes(filtro.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(filtro.toLowerCase());
      const matchStatus = statusFiltro === "todos" || order.status === statusFiltro;
      const matchTipo = tipoFiltro === "todos" || order.order_type === tipoFiltro;

      return matchFiltro && matchStatus && matchTipo;
    });
  }, [orders, filtro, statusFiltro, tipoFiltro]);

  const handleViewDetails = (order: any) => {
    setOrderSelecionada(order);
    setDetailsModalOpen(true);
  };

  const estatisticas = useMemo(() => ({
    total: totalOrders,
    created: orders.filter(o => o.status === "created").length,
    in_progress: orders.filter(o => o.status === "in_progress").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  }), [orders, totalOrders]);

  // Verificação de permissão de administrador
  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-4">
            Esta página é exclusiva para administradores do sistema.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Central de Orders</h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Package className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Visualização administrativa - Todas as operações do sistema
            </p>
            <p className="text-sm text-muted-foreground">
              Logado como: {authUser?.name} ({authUser?.user_type})
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{estatisticas.total}</p>
                  <p className="text-xs text-muted-foreground">Total de Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{estatisticas.created}</p>
                  <p className="text-xs text-muted-foreground">Criadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{estatisticas.in_progress}</p>
                  <p className="text-xs text-muted-foreground">Em Andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{estatisticas.delivered}</p>
                  <p className="text-xs text-muted-foreground">Entregues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou cliente..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="created">Criado</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="domestic">Doméstico</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetch()}>
                Atualizar Lista
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({ordersFiltradas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordersFiltradas.map((order) => {
                const { icon: TipoIcon, color: tipoColor } = getOrderTypeIcon(order.order_type);

                return (
                  <div
                    key={order.order_id}
                    className="p-4 border border-border rounded-lg hover:shadow-md transition-all duration-200 bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-muted`}>
                          <TipoIcon className={`w-6 h-6 ${tipoColor}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{order.title}</h3>
                            <Badge className={`${getStatusColor(order.status)} text-xs`}>
                              {order.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {order.order_type}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">{order.customer_name}</p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="w-3 h-3" />
                              <span>{order.documents_count || 0} documentos</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Building className="w-3 h-3" />
                              <span>ID: {order.order_id.slice(0, 8)}...</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {ordersFiltradas.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  {loading ? (
                    <div>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Carregando orders...</p>
                    </div>
                  ) : error ? (
                    <div>
                      <p>Erro ao carregar orders</p>
                      <p className="text-sm">{error}</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                        Tentar Novamente
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p>Nenhuma order encontrada</p>
                      <p className="text-sm">Tente ajustar os filtros de busca</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalhes */}
        <OrderDetailsModal
          order={orderSelecionada}
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          onViewDocument={(doc: any) => {
            setDocumentoSelecionado(doc);
            setViewerOpen(true);
          }}
        />

        {/* Document Viewer Modal */}
        <DocumentViewer
          documento={documentoSelecionado}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
