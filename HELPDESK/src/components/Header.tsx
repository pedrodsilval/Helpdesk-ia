import React from "react";
import { AppSettings, Ticket } from "../types";
import { Headset, Settings, BookOpen, Ticket as TicketIcon, Smartphone, Monitor, ShieldCheck, Zap } from "lucide-react";

interface HeaderProps {
  settings: AppSettings;
  tickets: Ticket[];
  onOpenSettings: () => void;
  onOpenTickets: () => void;
  onOpenKnowledgeBase: () => void;
  isMobileView: boolean;
  onToggleMobileView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  tickets,
  onOpenSettings,
  onOpenTickets,
  onOpenKnowledgeBase,
  isMobileView,
  onToggleMobileView,
}) => {
  const openTicketsCount = tickets.filter((t) => t.status !== "Resolvido").length;

  return (
    <header className="bg-indigo-700 text-white px-4 py-3 sm:px-6 shadow-md border-b border-indigo-800 flex items-center justify-between shrink-0">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shadow-inner">
            <Headset className="w-6 h-6" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-indigo-700 animate-pulse"></span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base sm:text-lg tracking-tight leading-tight">
              HelpDesk IA
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-indigo-100 border border-white/10 flex items-center gap-1">
              {settings.mode === "webhook" ? (
                <>
                  <Zap className="w-3 h-3 text-amber-300" />
                  n8n Webhook
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Gemini AI
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-indigo-200 hidden sm:block">
            Suporte de TI Inteligente 24/7 &bull; N1/N2
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Knowledge Base */}
        <button
          onClick={onOpenKnowledgeBase}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/10"
          title="Base de Conhecimento e Soluções Rápidas"
        >
          <BookOpen className="w-4 h-4 text-indigo-200" />
          <span className="hidden md:inline">Base de Conhecimento</span>
        </button>

        {/* Tickets Manager */}
        <button
          onClick={onOpenTickets}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/10 relative"
          title="Gerenciar Chamados de TI"
        >
          <TicketIcon className="w-4 h-4 text-indigo-200" />
          <span className="hidden md:inline">Chamados</span>
          {openTicketsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-indigo-950 font-bold text-[10px]">
              {openTicketsCount}
            </span>
          )}
        </button>

        {/* Mobile View Switcher */}
        <button
          onClick={onToggleMobileView}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 transition-colors border border-white/10 hidden sm:flex items-center gap-1 text-xs"
          title={isMobileView ? "Expandir para Painel Completo" : "Visualizar no Modo Celular"}
        >
          {isMobileView ? (
            <>
              <Monitor className="w-4 h-4" />
              <span className="hidden lg:inline">Painel</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4" />
              <span className="hidden lg:inline">Modo Celular</span>
            </>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 transition-colors border border-white/10"
          title="Configurações e N8N Webhook"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
