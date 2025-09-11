import { useState, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { DocumentModal } from "./DocumentModal";
import { DocumentDetailModal } from "./DocumentDetailModal";
import { SmartMenu, type MenuAction } from "./SmartMenu";
import { MessageInterpreter, type InterpretationResult } from "./MessageInterpreter";
import { useToast } from "@/hooks/use-toast";
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
  const [userProfile, setUserProfile] = useState({
    name: "Eduardo Silva", 
    company: "Mercosul Line",
    role: "Operador Logístico"
  });
  
  const { toast } = useToast();
  const interpreter = new MessageInterpreter();

  // Inicializar sessão de chat
  useEffect(() => {
    initChatSession();
  }, []);

  const initChatSession = async () => {
    try {
      const session = await apiService.createChatSession("Chat Inteligente");
      setSessionId(session.session_id);
      
      // Carregar mensagem de boas-vindas
      loadWelcomeMessage();
    } catch (error) {
      console.error("Erro ao inicializar sessão:", error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar com o sistema de chat. Usando modo offline.",
        variant: "destructive"
      });
      
      // Usar modo offline/mock
      setSessionId("offline-session");
      loadWelcomeMessage();
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
  
  const [messages, setMessages] = useState<Message[]>([]);

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
      // Enviar para a API real
      const response = await apiService.sendChatMessage({
        message: content,
        session_id: sessionId,
        agent_name: "LogisticsAgent" // Padrão
      });

      // Mensagem de resposta do agente
      const agentMessage: Message = {
        id: response.message_id,
        type: "agent",
        content: response.content,
        timestamp: new Date(response.timestamp),
        attachments: response.attachments || []
      };

      setMessages(prev => [...prev, agentMessage]);

      // Se houver anexos, pode mostrar modal ou notificação
      if (response.attachments && response.attachments.length > 0) {
        toast({
          title: "Documentos encontrados",
          description: `${response.attachments.length} documento(s) anexado(s) à resposta.`
        });
      }

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      
      // Fallback para modo offline usando o interpretador original
      const interpretation = interpreter.interpret(content);
      
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: sessionId === "offline-session" 
          ? interpretation.suggestedResponse || "Desculpe, estou em modo offline. Tente novamente quando a conexão for restabelecida."
          : "Desculpe, houve um problema ao processar sua mensagem. Tente novamente em alguns instantes.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
      
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível enviar a mensagem. Verifique sua conexão.",
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