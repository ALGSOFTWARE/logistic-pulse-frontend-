import { useState, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { DocumentModal } from "./DocumentModal";
import { DocumentDetailModal } from "./DocumentDetailModal";
import { SmartMenu, type MenuAction } from "./SmartMenu";
import { MessageInterpreter, type InterpretationResult } from "./MessageInterpreter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useAIContext } from "@/hooks/useAIContext";
import { apiService, type ChatMessage as ApiChatMessage } from "@/services/api";

export type DocumentType = "CTE" | "AWL" | "BL" | "MANIFESTO" | "NF";

export interface Message {
  id: string;
  type: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
  attachments?: {
    type: DocumentType;
    name: string;
    url: string;
  }[];
}

export const ChatContainer = () => {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSmartMenuOpen, setIsSmartMenuOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const interpreter = new MessageInterpreter();
  
  // Initialize AI context management
  const {
    userContexts,
    globalContexts,
    createUserContext,
    updateUserContext,
    saveConversationEntry,
    getMergedContext,
    getActiveContextForSession
  } = useAIContext(currentUser?.id);

  // Get user profile (fallback for demo)
  const userProfile = currentUser ? {
    name: currentUser.name,
    company: "MIT Tracking",
    role: currentUser.user_type === 'admin' ? 'Administrador' : 
          currentUser.user_type === 'funcionario' ? 'Funcionário' : 'Cliente'
  } : {
    name: "Eduardo Silva", 
    company: "Mercosul Line",
    role: "Operador Logístico"
  };

  // Inicializar sessão de chat
  useEffect(() => {
    initChatSession();
  }, []);

  const initChatSession = async () => {
    try {
      // Check if user is authenticated in MIT system
      if (!currentUser || !currentUser.id) {
        // Show login prompt for MIT system
        const loginMessage: Message = {
          id: "login-required",
          type: "system",
          content: `🔐 Autenticação Necessária

Para usar o chat, você precisa fazer login no sistema localhost:8080.

**Credenciais de teste:**
📧 Email: joao@exemplo.com, pedro@exemplo.com, maria@exemplo.com
🔑 Senha: mit2024

👉 [Clique aqui para fazer login](/login)

Após fazer login, volte a esta página.`,
          timestamp: new Date(),
        };

        setMessages([loginMessage]);
        return;
      }

      // Import gatekeeperApi and use MIT token
      const { gatekeeperApi } = await import("@/services/gatekeeperApi");

      // Initialize with MIT authentication
      const user = gatekeeperApi.initFromMITStorage();
      if (!user) {
        throw new Error('Não foi possível usar token MIT para autenticação');
      }

      // Create authenticated session using MIT token
      const sessionResponse = await gatekeeperApi.createChatSession("Chat Inteligente");

      if (sessionResponse.success) {
        setSessionId(sessionResponse.session_id);

        // Criar contexto de curto prazo para esta sessão (usando mock para evitar 404)
        if (currentUser?.id && createUserContext) {
          const contextExpiry = new Date();
          contextExpiry.setHours(contextExpiry.getHours() + 8); // 8 horas

          await createUserContext({
            context_type: 'SHORT_TERM',
            content: {
              session_started: new Date().toISOString(),
              user_profile: userProfile,
              active_session_id: sessionResponse.session_id,
              chat_preferences: {
                language: 'pt-BR',
                assistance_level: 'intermediate'
              }
            },
            session_id: sessionResponse.session_id,
            expires_at: contextExpiry.toISOString()
          });
        }

        loadWelcomeMessage();
      } else {
        throw new Error(sessionResponse.message || 'Erro ao criar sessão');
      }

    } catch (error) {
      console.error("Erro ao inicializar sessão:", error);
      toast({
        title: "Erro de Autenticação",
        description: "Não foi possível conectar com o sistema de chat. Verifique sua autenticação.",
        variant: "destructive"
      });

      // Show error message
      const errorMessage: Message = {
        id: "error",
        type: "system",
        content: `❌ Erro de Conexão

Não foi possível conectar com o sistema de chat.
Verifique se:
1. Você está logado no sistema (/login)
2. O servidor Gatekeeper está funcionando (porta 8001)
3. Tente recarregar a página`,
        timestamp: new Date(),
      };

      setMessages([errorMessage]);
    }
  };

  const loadWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: "welcome",
      type: "system", 
      content: `Olá ${userProfile.name}, vejo que você é ${userProfile.role} da ${userProfile.company}. Bem-vindo ao Smart Tracking Chat! 

Posso te ajudar a:
• Consultar documentos logísticos (CT-e, NF-e, BL, Manifesto)
• Verificar status de cargas e entregas
• Localizar documentos por número de embarque
• Esclarecer dúvidas sobre suas operações

Como posso ajudá-lo hoje?`,
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  };

  // Mock data para demonstração
  const mockDocuments = [
    {
      id: "doc-1",
      type: "CTE" as DocumentType,
      number: "CTE-ABC123-2024",
      status: "Processado" as const,
      client: "Mercosul Line",
      embarque: "EMB-2024-001",
      rota: {
        origem: "São Paulo - SP",
        destino: "Porto Alegre - RS", 
        status: "Em trânsito",
        proximaParada: "Curitiba - PR"
      },
      dataRecebimento: new Date(Date.now() - 86400000),
      arquivo: {
        nome: "CTE-ABC123-2024.pdf",
        tamanho: "245 KB",
        url: "#"
      },
      historico: [
        {
          data: new Date(Date.now() - 86400000),
          acao: "Documento recebido via API",
          usuario: "Sistema Automatizado"
        },
        {
          data: new Date(Date.now() - 82800000),
          acao: "Documento validado",
          usuario: "Ana Silva"
        }
      ],
      metadados: {
        transportadora: "Expresso Logística",
        valor: "R$ 2.450,00",
        peso: "1.250 kg"
      }
    }
  ];

  const findDocument = (query: string): any | null => {
    return mockDocuments.find(doc => 
      doc.number.toLowerCase().includes(query.toLowerCase()) ||
      doc.embarque.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(doc.number.toLowerCase().split('-')[1])
    );
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !sessionId) {
      return;
    }

    // Mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Import gatekeeperApi dynamically
      const { gatekeeperApi } = await import("@/services/gatekeeperApi");

      // Send to Gatekeeper API with authentication
      const response = await gatekeeperApi.sendChatMessage({
        message: content,
        session_id: sessionId,
        agent_name: "LogisticsAgent"
      });

      if (response.success) {
        // Agent response message
        const agentMessage: Message = {
          id: response.message_id,
          type: "agent",
          content: response.content,
          timestamp: new Date(response.timestamp),
          attachments: response.attachments || []
        };

        setMessages(prev => [...prev, agentMessage]);

        // Show notification for attachments
        if (response.attachments && response.attachments.length > 0) {
          toast({
            title: "Documentos encontrados",
            description: `${response.attachments.length} documento(s) anexado(s) à resposta.`
          });
        }
      } else {
        // Error response from API
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content: `❌ Erro: ${response.message || 'Não foi possível processar sua mensagem'}`,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);

        toast({
          title: "Erro na Mensagem",
          description: response.message || "Erro ao processar mensagem",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

      // Fallback error message
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: "❌ Desculpe, houve um problema ao processar sua mensagem. Verifique se você está autenticado e tente novamente.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, fallbackResponse]);

      toast({
        title: "Erro de Conexão",
        description: "Verifique sua autenticação e conexão com o servidor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartMenuAction = (action: MenuAction, inputs?: Record<string, string>) => {
    let finalPrompt = action.suggestedPrompt;
    
    // Construir prompt baseado nos inputs das etapas
    if (inputs && Object.keys(inputs).length > 0) {
      const values = Object.values(inputs).filter(Boolean);
      if (values.length > 0) {
        finalPrompt = `${action.suggestedPrompt}: ${values.join(" - ")}`;
      }
    }
    
    // Enviar como se fosse uma mensagem do usuário
    handleSendMessage(finalPrompt);
    
    toast({
      title: "Ação executada",
      description: `${action.title} foi processado com sucesso.`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onOpenDocuments={() => setIsDocumentModalOpen(true)} />
      <ChatMessages messages={messages} />
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onOpenSmartMenu={() => setIsSmartMenuOpen(true)}
        isLoading={isLoading}
      />
      
      <DocumentModal 
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
      />
      
      <DocumentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        document={selectedDocument}
      />
      
      <SmartMenu
        isVisible={isSmartMenuOpen}
        onClose={() => setIsSmartMenuOpen(false)}
        onActionSelect={handleSmartMenuAction}
      />
    </div>
  );
};