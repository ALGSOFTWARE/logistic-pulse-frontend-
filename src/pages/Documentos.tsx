import React, { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import { useUsers } from "@/hooks/useUsers";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Filter,
  Calendar,
  User,
  Truck,
  Package,
  Plus,
  Search,
  MoreVertical,
  History,
  Mail,
  MessageSquare,
  Database,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

// Dados carregados dinamicamente do MongoDB via API

const getDocumentIcon = (tipo: string) => {
  switch (tipo) {
    case "CT-e":
      return { icon: Truck, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" };
    case "AWB":
      return { icon: Package, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" };
    case "BL":
      return { icon: FileText, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" };
    case "NF-e":
      return { icon: Calendar, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" };
    default:
      return { icon: FileText, color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300" };
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Validado":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Pendente Validação":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Rejeitado":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getOrigemIcon = (origem: string) => {
  switch (origem) {
    case "manual":
      return { icon: Upload, color: "text-blue-500" };
    case "api":
      return { icon: Database, color: "text-green-500" };
    case "chat":
      return { icon: MessageSquare, color: "text-purple-500" };
    case "email":
      return { icon: Mail, color: "text-orange-500" };
    default:
      return { icon: FileText, color: "text-gray-500" };
  }
};

const DocumentUploadModal = ({ isOpen, onClose, onUploadSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  onUploadSuccess: () => void;
}) => {
  const { toast } = useToast();
  const [uploadMethod, setUploadMethod] = useState("manual");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState("other");
  const { uploadDocument } = useDocuments();
  const { users } = useUsers();
  
  // Para demonstração, usar primeiro usuário disponível
  const currentUser = users[0];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !currentUser) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo e certifique-se de que há um usuário logado",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    try {
      const success = await uploadDocument(selectedFile, currentUser.id, documentCategory);
      
      if (success) {
        toast({
          title: "Upload realizado com sucesso!",
          description: `Arquivo ${selectedFile.name} foi enviado e está sendo processado.`,
        });
        setSelectedFile(null);
        onUploadSuccess();
        onClose();
      } else {
        toast({
          title: "Erro no upload",
          description: "Não foi possível enviar o arquivo. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Erro inesperado durante o upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload de Documentos</DialogTitle>
        </DialogHeader>
        
        <Tabs value={uploadMethod} onValueChange={setUploadMethod}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Arraste arquivos aqui ou clique para selecionar</p>
              <p className="text-sm text-muted-foreground mt-2">
                Formatos suportados: PDF, PNG, JPG, XML (máx. 10MB)
              </p>
              <input 
                type="file" 
                accept=".pdf,.png,.jpg,.jpeg,.xml"
                onChange={handleFileSelect}
                className="hidden" 
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button className="mt-4" type="button">Selecionar Arquivos</Button>
              </label>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  
                  <div className="mt-3 space-y-2">
                    <Select value={documentCategory} onValueChange={setDocumentCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Categoria do documento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cte">CT-e</SelectItem>
                        <SelectItem value="bl">BL</SelectItem>
                        <SelectItem value="invoice">NF-e</SelectItem>
                        <SelectItem value="photo">Foto</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={handleUpload} 
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? "Enviando..." : "Fazer Upload"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <strong>IA Automática:</strong> Nosso sistema identificará automaticamente o tipo de documento e o associará à jornada correta.
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Integração via API</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Configure a integração automática com seus sistemas ERP/TMS
              </p>
              <div className="space-y-2">
                <Input placeholder="URL do Webhook" />
                <Input placeholder="Token de Autenticação" />
              </div>
              <Button className="mt-3">Configurar Integração</Button>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Upload via Chat</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Envie documentos diretamente no chat e nossa IA processará automaticamente
              </p>
              <Button>Ir para o Chat</Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Upload via E-mail</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Envie documentos para o e-mail dedicado da sua conta
              </p>
              <div className="bg-background p-3 rounded border">
                <code className="text-sm">documentos@sua-empresa.logisticaai.com.br</code>
              </div>
              <Button className="mt-3">Configurar E-mail</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const DocumentViewer = ({ documento, isOpen, onClose }: { documento: any; isOpen: boolean; onClose: () => void }) => {
  const { getDocumentDetails } = useDocuments();
  const [documentDetails, setDocumentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const loadDocumentDetails = async () => {
    if (!documento?.file_id) return;
    
    setLoadingDetails(true);
    try {
      const details = await getDocumentDetails(documento.file_id);
      setDocumentDetails(details);
    } catch (error) {
      console.error('Erro ao carregar detalhes do documento:', error);
    } finally {
      setLoadingDetails(false);
    }
  };
  
  // Carregar detalhes quando o modal abrir
  React.useEffect(() => {
    if (isOpen && documento) {
      loadDocumentDetails();
    }
  }, [isOpen, documento]);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{documento?.numero}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
          {loadingDetails ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando detalhes...</p>
            </div>
          ) : documentDetails ? (
            <div className="w-full p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tipo:</span> {documentDetails.file_type}
                  </div>
                  <div>
                    <span className="font-medium">Tamanho:</span> {(documentDetails.size_bytes / 1024 / 1024).toFixed(1)} MB
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {documentDetails.processing_status}
                  </div>
                  <div>
                    <span className="font-medium">Acessos:</span> {documentDetails.access_count}
                  </div>
                </div>
                
                {documentDetails.text_content_available && (
                  <div>
                    <p className="font-medium mb-2">Texto extraído disponível via OCR</p>
                    <Badge variant="outline">OCR Processado</Badge>
                  </div>
                )}
                
                {documentDetails.has_embedding && (
                  <Badge variant="outline">Busca Semântica Habilitada</Badge>
                )}
                
                <div className="text-center pt-4">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Preview do documento</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Visualizador completo será implementado
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Visualização do documento</p>
              <p className="text-sm text-muted-foreground mt-2">
                Não foi possível carregar os detalhes
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Documentos() {
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [origemFiltro, setOrigemFiltro] = useState("todos");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const { toast } = useToast();
  
  // Hooks para dados reais
  const { users } = useUsers();
  const currentUser = users[0]; // Para demonstração, usar primeiro usuário
  const { 
    documents, 
    loading, 
    error, 
    refetch, 
    downloadDocument, 
    deleteDocument,
    totalDocuments,
    hasMore,
    loadMore
  } = useDocuments({
    user_id: currentUser?.id
  });

  // Aplicar filtros localmente aos documentos carregados
  const documentosFiltrados = useMemo(() => {
    return documents.filter(doc => {
      const matchFiltro = doc.numero.toLowerCase().includes(filtro.toLowerCase()) ||
                         doc.cliente.toLowerCase().includes(filtro.toLowerCase());
      const matchTipo = tipoFiltro === "todos" || doc.tipo === tipoFiltro;
      const matchStatus = statusFiltro === "todos" || doc.status === statusFiltro;
      const matchOrigem = origemFiltro === "todos" || doc.origem_upload === origemFiltro;
      
      return matchFiltro && matchTipo && matchStatus && matchOrigem;
    });
  }, [documents, filtro, tipoFiltro, statusFiltro, origemFiltro]);

  const handleDownload = async (doc: any) => {
    try {
      const downloadUrl = await downloadDocument(doc.file_id || doc.id);
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
        toast({
          title: "Download Iniciado",
          description: `Baixando ${doc.numero}...`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro no Download",
        description: "Não foi possível fazer o download do arquivo.",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async (doc: any) => {
    if (!currentUser) return;
    
    if (confirm(`Tem certeza que deseja deletar o documento ${doc.numero}?`)) {
      const success = await deleteDocument(doc.file_id || doc.id, currentUser.id);
      if (success) {
        toast({
          title: "Documento removido",
          description: `${doc.numero} foi removido com sucesso.`,
        });
      } else {
        toast({
          title: "Erro ao remover",
          description: "Não foi possível remover o documento.",
          variant: "destructive"
        });
      }
    }
  };

  const handleView = (doc: any) => {
    setDocumentoSelecionado(doc);
    setViewerOpen(true);
  };

  const estatisticas = useMemo(() => ({
    total: totalDocuments,
    validados: documents.filter(d => d.status === "Validado").length,
    pendentes: documents.filter(d => d.status === "Pendente Validação" || d.status === "Processando").length,
    rejeitados: documents.filter(d => d.status === "Rejeitado").length,
  }), [documents, totalDocuments]);

  return (
    <AppLayout>
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Central de Documentos</h1>
            <p className="text-muted-foreground">Gerencie todos os documentos da jornada logística</p>
          </div>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{estatisticas.total}</p>
                  <p className="text-xs text-muted-foreground">Total de Documentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{estatisticas.validados}</p>
                  <p className="text-xs text-muted-foreground">Validados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{estatisticas.pendentes}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{estatisticas.rejeitados}</p>
                  <p className="text-xs text-muted-foreground">Rejeitados</p>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número ou cliente..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="CT-e">CT-e</SelectItem>
                  <SelectItem value="NF-e">NF-e</SelectItem>
                  <SelectItem value="AWB">AWB</SelectItem>
                  <SelectItem value="BL">BL</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="Validado">Validado</SelectItem>
                  <SelectItem value="Pendente Validação">Pendente</SelectItem>
                  <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={origemFiltro} onValueChange={setOrigemFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Origens</SelectItem>
                  <SelectItem value="manual">Upload Manual</SelectItem>
                  <SelectItem value="api">Via API</SelectItem>
                  <SelectItem value="chat">Via Chat</SelectItem>
                  <SelectItem value="email">Via E-mail</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download em Massa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos ({documentosFiltrados.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentosFiltrados.map((doc) => {
                const { icon: TipoIcon, color: tipoColor } = getDocumentIcon(doc.tipo);
                const { icon: OrigemIcon, color: origemColor } = getOrigemIcon(doc.origem_upload);
                
                return (
                  <div
                    key={doc.id}
                    className="p-4 border border-border rounded-lg hover:shadow-md transition-all duration-200 bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tipoColor}`}>
                          <TipoIcon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{doc.numero}</h3>
                            <Badge className={`${getStatusColor(doc.status)} text-xs`}>
                              {doc.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              v{doc.versao}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">{doc.cliente}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span className="truncate">{doc.uploadPor}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <OrigemIcon className={`w-3 h-3 ${origemColor}`} />
                              <span className="capitalize">{doc.origem_upload}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{doc.visualizacoes} visualizações</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(doc)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(doc)}
                        >
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {documentosFiltrados.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  {loading ? (
                    <div>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Carregando documentos...</p>
                    </div>
                  ) : error ? (
                    <div>
                      <p>Erro ao carregar documentos</p>
                      <p className="text-sm">{error}</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                        Tentar Novamente
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p>Nenhum documento encontrado</p>
                      <p className="text-sm">Tente ajustar os filtros de busca ou faça upload de um documento</p>
                    </div>
                  )}
                </div>
              )}
              
              {hasMore && documentosFiltrados.length > 0 && (
                <div className="text-center mt-4">
                  <Button variant="outline" onClick={loadMore} disabled={loading}>
                    {loading ? "Carregando..." : "Carregar Mais"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <DocumentUploadModal 
          isOpen={uploadModalOpen} 
          onClose={() => setUploadModalOpen(false)}
          onUploadSuccess={() => {
            refetch();
            setUploadModalOpen(false);
          }}
        />
        
        <DocumentViewer
          documento={documentoSelecionado}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </div>
    </AppLayout>
  );
}