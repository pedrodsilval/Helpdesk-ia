import React, { useState } from "react";
import { Ticket } from "../types";
import { X, Ticket as TicketIcon, Plus, CheckCircle2, Clock, AlertCircle, User, Filter } from "lucide-react";

interface TicketsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  onUpdateTicketStatus: (ticketId: string, newStatus: Ticket["status"]) => void;
  onOpenNewTicketModal: () => void;
}

export const TicketsDrawer: React.FC<TicketsDrawerProps> = ({
  isOpen,
  onClose,
  tickets,
  onUpdateTicketStatus,
  onOpenNewTicketModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  if (!isOpen) return null;

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === "todos") return true;
    return t.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getPriorityBadge = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "Alta":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "Média":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Baixa":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusIcon = (status: Ticket["status"]) => {
    switch (status) {
      case "Aberto":
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case "Em Atendimento":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "Resolvido":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TicketIcon className="w-5 h-5 text-indigo-200" />
            <div>
              <h2 className="font-bold text-base">Chamados de TI ({tickets.length})</h2>
              <p className="text-xs text-indigo-200">Histórico de solicitações N2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="aberto">Abertos</option>
              <option value="em atendimento">Em Atendimento</option>
              <option value="resolvido">Resolvidos</option>
            </select>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenNewTicketModal();
            }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Novo Chamado
          </button>
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400">
              <TicketIcon className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-medium text-slate-600">Nenhum chamado encontrado</p>
              <p className="text-xs text-slate-400 mt-1">
                Aberturas de chamados pela IA ou pelo formulário aparecerão aqui.
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:border-slate-300 transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {ticket.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                        ticket.priority
                      )}`}
                    >
                      Prioridade {ticket.priority}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                  {ticket.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100 font-sans">
                  {ticket.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {ticket.user}
                  </span>
                  <span>{ticket.createdAt}</span>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    {getStatusIcon(ticket.status)}
                    <span>{ticket.status}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {ticket.status !== "Resolvido" && (
                      <button
                        onClick={() => onUpdateTicketStatus(ticket.id, "Resolvido")}
                        className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                      >
                        Marcar Resolvido
                      </button>
                    )}
                    {ticket.status === "Aberto" && (
                      <button
                        onClick={() => onUpdateTicketStatus(ticket.id, "Em Atendimento")}
                        className="px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                      >
                        Em Atendimento
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
