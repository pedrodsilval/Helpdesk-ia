import React, { useState } from "react";
import { Message, Option } from "../types";
import { Bot, User, Copy, Check, Ticket, Sparkles, ExternalLink } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  onOptionClick: (callbackData: string, buttonText: string) => void;
  onCreateTicketClick?: (title?: string, category?: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOptionClick,
  onCreateTicketClick,
}) => {
  const isBot = message.sender === "bot";
  const isSystem = message.sender === "system";
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Helper to format text with bold (**text**), inline code (`code`), and code blocks (```code```)
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeBlockBuffer: string[] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          const codeString = codeBlockBuffer.join("\n");
          elements.push(
            <div key={`code-${idx}`} className="my-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-hidden border border-slate-700">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-slate-400 text-[11px] border-b border-slate-700">
                <span>Prompt / Comando Terminal</span>
                <button
                  onClick={() => handleCopyCode(codeString)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  title="Copiar código"
                >
                  {copiedCode === codeString ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 overflow-x-auto whitespace-pre">{codeString}</pre>
            </div>
          );
          codeBlockBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        return;
      }

      // Inline formatting for line
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      const lineContent = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900 dark:text-slate-100">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs border border-slate-200 dark:border-slate-700">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      elements.push(
        <p key={`p-${idx}`} className={idx > 0 ? "mt-1.5" : ""}>
          {lineContent}
        </p>
      );
    });

    return elements;
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="px-3 py-1 bg-slate-200/80 text-slate-600 text-xs rounded-full border border-slate-300/60 shadow-xs flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>{message.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-1.5 max-w-[88%] sm:max-w-[80%] ${
        isBot ? "self-start" : "self-end"
      }`}
    >
      {/* Sender Header */}
      <div className={`flex items-center gap-1.5 text-[11px] font-medium text-slate-500 ${isBot ? "pl-1" : "pr-1 justify-end"}`}>
        {isBot ? (
          <>
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              IA
            </span>
            <span>HelpDesk IA</span>
          </>
        ) : (
          <>
            <span>Você</span>
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              U
            </span>
          </>
        )}
        <span className="text-slate-400 ml-1">{message.timestamp}</span>
      </div>

      {/* Message Bubble */}
      <div
        className={`relative p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
          isBot
            ? "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
            : "bg-indigo-600 text-white rounded-tr-xs"
        }`}
      >
        {/* Text Content */}
        <div className={isBot ? "text-slate-800" : "text-white"}>
          {renderFormattedText(message.text)}
        </div>

        {/* Attachment Image if present */}
        {message.imageAttachment && (
          <div className="mt-2.5 rounded-lg overflow-hidden border border-slate-200 shadow-xs max-w-xs">
            <img src={message.imageAttachment} alt="Anexo do suporte" className="w-full object-cover max-h-48" />
          </div>
        )}

        {/* Suggested Ticket Banner if Bot flagged it */}
        {isBot && message.suggestedTicket && message.suggestedTicket.needed && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between font-semibold text-amber-900">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-amber-600" />
                Sugestão de Abertura de Chamado
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-800 text-[10px] uppercase font-bold">
                {message.suggestedTicket.priority || "Média"}
              </span>
            </div>
            <p className="text-amber-800">
              Identificamos que este problema pode exigir intervenção técnica N2.
            </p>
            <button
              onClick={() =>
                onCreateTicketClick?.(
                  message.suggestedTicket?.title || "Suporte de TI",
                  message.suggestedTicket?.category || "Geral"
                )
              }
              className="mt-1 w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Ticket className="w-3.5 h-3.5" />
              Abrir Chamado Agora
            </button>
          </div>
        )}

        {/* Inline Option Buttons (Switches / Callbacks) */}
        {isBot && message.options && message.options.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Opções de Atendimento:
            </span>
            <div className="flex flex-col gap-1.5">
              {message.options.map((opt: Option, idx: number) => (
                <button
                  key={idx}
                  onClick={() => onOptionClick(opt.callback_data, opt.text)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-900 border border-indigo-200/80 font-medium text-xs sm:text-sm transition-all duration-150 flex items-center justify-between group active:scale-[0.99]"
                >
                  <span>{opt.text}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
