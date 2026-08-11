import React, { useState, useEffect, useRef } from "react";
import { Message, Ticket, AppSettings } from "./types";
import { Header } from "./components/Header";
import { QuickCategories } from "./components/QuickCategories";
import { ChatMessage } from "./components/ChatMessage";
import { TypingIndicator } from "./components/TypingIndicator";
import { TicketsDrawer } from "./components/TicketsDrawer";
import { KnowledgeBaseModal } from "./components/KnowledgeBaseModal";
import { SettingsModal } from "./components/SettingsModal";
import { TicketModal } from "./components/TicketModal";
import { Send, Paperclip, Image as ImageIcon, X, Mic, RefreshCw, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

const INITIAL_BOT_MESSAGE: Message = {
  id: "msg-init",
  sender: "bot",
  text: "Olá! Sou o assistente do HelpDesk-IA. Selecione a área que você precisa de suporte hoje? Ou digite seu problema abaixo.",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  options: [
    { text: "1 - 🌐 Rede e Internet", callback_data: "cat_rede" },
    { text: "2 - 🖨️ Impressoras", callback_data: "cat_impressora" },
    { text: "3 - 🔑 Login e Acesso", callback_data: "cat_login" },
  ],
};

const DEFAULT_SETTINGS: AppSettings = {
  mode: "webhook",
  webhookUrl: "https://rafaelbg.app.n8n.cloud/webhook/helpdesk",
  soundEnabled: true,
  autoScroll: true,
  theme: "light",
  userFullName: "Usuário Suporte",
  userDepartment: "Tecnologia da Informação",
};

// Gera e armazena um ID de sessão único para o usuário.
const getSessionId = (): string => {
  let sessionId = localStorage.getItem("helpdesk_session_id");
  if (!sessionId) {
    sessionId = "user-" + Math.random().toString(36).slice(2);
    localStorage.setItem("helpdesk_session_id", sessionId);
  }
  return sessionId;
};

export default function App() {
  // Load settings and tickets from localStorage or defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("helpdesk_settings");
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("helpdesk_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fallback
      }
    }
    return [INITIAL_BOT_MESSAGE];
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem("helpdesk_tickets");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: "#TK-1001",
        title: "Erro de Spooler na Impressora do RH",
        category: "Impressoras",
        priority: "Média",
        status: "Em Atendimento",
        createdAt: "Hoje às 10:15",
        user: "Ana Souza (RH)",
        description: "A impressora aparece offline e há 5 documentos travados na fila de impressão.",
      },
    ];
  });

  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Pre-fill for Ticket Modal
  const [ticketModalInit, setTicketModalInit] = useState({ title: "", category: "Rede e Internet" });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem("helpdesk_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("helpdesk_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("helpdesk_tickets", JSON.stringify(tickets));
  }, [tickets]);

  // Auto scroll to bottom
  useEffect(() => {
    if (settings.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Handle image attachment selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Main interaction sender
  const sendToBackend = async (
    payload: { message?: string; callback_data?: string },
    userMessageObj?: Message
  ) => {
    if (userMessageObj) {
      setMessages((prev) => [...prev, userMessageObj]);
    }

    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: payload.message || "",
          callback_data: payload.callback_data || "",
          history: messages,
          customWebhookUrl: settings.webhookUrl,
          mode: settings.mode,
          sessionId: getSessionId(),
        }),
      });

      const data = await res.json();
      setIsTyping(false);

      const botMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: "bot",
        text:
          data.reply ||
          data.text ||
          data.message?.text ||
          data.response ||
          data.output ||
          "Desculpe, não consegui entender a resposta do servidor.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: data.options || data.buttons || [],
        suggestedTicket: data.suggestedTicket || data.suggested_ticket,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error communicating with server:", err);
      setIsTyping(false);

      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        sender: "bot",
        text: "⚠️ Erro de conexão com o servidor de HelpDesk. Por favor, verifique se o n8n ou o servidor backend está rodando.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        options: [
          { text: "1 - 🌐 Tentar Novamente (Rede)", callback_data: "cat_rede" },
          { text: "2 - 🖨️ Impressoras", callback_data: "cat_impressora" },
          { text: "3 - 🔑 Login e Acesso", callback_data: "cat_login" },
        ],
      };

      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleSendMessage = async () => {
    const text = inputVal.trim();
    if (!text && !attachment) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: text || "Anexo de Imagem enviado.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      imageAttachment: attachment || undefined,
    };

    setInputVal("");
    setAttachment(null);

    await sendToBackend({ message: text }, userMsg);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleCallbackClick = async (callbackData: string, buttonText: string) => {
    const userMsg: Message = {
      id: `usr-cb-${Date.now()}`,
      sender: "user",
      text: buttonText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (callbackData === "create_ticket") {
      setTicketModalInit({ title: "Suporte Solicitado via Chat", category: "Rede e Internet" });
      setIsTicketModalOpen(true);
    }

    await sendToBackend({ message: buttonText, callback_data: callbackData }, userMsg);
  };

  const handleCreateTicket = (ticketData: Omit<Ticket, "id" | "createdAt" | "status">) => {
    const newId = `#TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: Ticket = {
      ...ticketData,
      id: newId,
      status: "Aberto",
      createdAt: `Hoje às ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };

    setTickets((prev) => [newTicket, ...prev]);

    // System message confirmation in chat
    const sysMsg: Message = {
      id: `sys-${Date.now()}`,
      sender: "system",
      text: `🎫 Chamado ${newId} ("${newTicket.title}") foi criado com sucesso! Prioridade: ${newTicket.priority}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, sysMsg]);
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: Ticket["status"]) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_BOT_MESSAGE]);
  };

  const handleExportHistory = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`)
      .join("\n\n");

    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `HelpDesk_Transcricao_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-800 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 font-sans">
      {/* Outer Container or Phone Frame wrapper */}
      <div
        className={`w-full bg-slate-100 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          isMobileView
            ? "max-w-md h-[92vh] rounded-3xl border-8 border-slate-800"
            : "max-w-5xl h-[95vh] sm:rounded-2xl border border-slate-200"
        }`}
      >
        {/* Header */}
        <Header
          settings={settings}
          tickets={tickets}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTickets={() => setIsTicketsOpen(true)}
          onOpenKnowledgeBase={() => setIsKnowledgeBaseOpen(true)}
          isMobileView={isMobileView}
          onToggleMobileView={() => setIsMobileView(!isMobileView)}
        />

        {/* Quick Category Bar */}
        <QuickCategories onCategoryClick={handleCallbackClick} />

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#e5ddd5]/60 dark:bg-slate-950/40 space-y-4">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onOptionClick={handleCallbackClick}
              onCreateTicketClick={(title, category) => {
                setTicketModalInit({ title: title || "", category: category || "Rede e Internet" });
                setIsTicketModalOpen(true);
              }}
            />
          ))}

          {/* Typing indicator when waiting for AI / Webhook response */}
          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Image Attachment Preview if active */}
        {attachment && (
          <div className="bg-slate-200 px-4 py-2 border-t border-slate-300 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <img src={attachment} alt="Anexo" className="w-10 h-10 object-cover rounded border border-slate-400" />
              <span className="text-xs text-slate-700 font-medium">Imagem anexada ao problema</span>
            </div>
            <button
              onClick={() => setAttachment(null)}
              className="p-1 hover:bg-slate-300 rounded text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="bg-slate-100 p-3 sm:p-4 border-t border-slate-200/90 flex items-center gap-2 shrink-0">
          {/* File Attachment Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-slate-200 transition-colors"
            title="Anexar Captura de Tela"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input Field */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder="Digite seu problema de TI ou selecione acima..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-4 pr-10 py-3 bg-white border border-slate-300 rounded-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs placeholder-slate-400"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputVal.trim() && !attachment}
            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
            title="Enviar mensagem"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Modals & Drawers */}
      <TicketsDrawer
        isOpen={isTicketsOpen}
        onClose={() => setIsTicketsOpen(false)}
        tickets={tickets}
        onUpdateTicketStatus={handleUpdateTicketStatus}
        onOpenNewTicketModal={() => setIsTicketModalOpen(true)}
      />

      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
        onAskArticle={(query) => {
          setInputVal(query);
          setIsKnowledgeBaseOpen(false);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSet) => setSettings(newSet)}
        onClearHistory={handleClearHistory}
        onExportHistory={handleExportHistory}
      />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onCreateTicket={handleCreateTicket}
        initialTitle={ticketModalInit.title}
        initialCategory={ticketModalInit.category}
        userFullName={settings.userFullName}
      />
    </div>
  );
}
