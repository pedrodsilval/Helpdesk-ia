import React, { useState, useEffect } from "react";
import { Ticket } from "../types";
import { X, Ticket as TicketIcon, Send, User, AlertCircle, CheckCircle2 } from "lucide-react";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "status">) => void;
  initialTitle?: string;
  initialCategory?: string;
  userFullName: string;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  onCreateTicket,
  initialTitle = "",
  initialCategory = "Rede e Internet",
  userFullName,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [priority, setPriority] = useState<Ticket["priority"]>("Média");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(userFullName || "Usuário TI");

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
    if (initialCategory) setCategory(initialCategory);
    if (userFullName) setUser(userFullName);
  }, [initialTitle, initialCategory, userFullName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onCreateTicket({
      title: title.trim(),
      category,
      priority,
      description: description.trim(),
      user: user.trim() || "Usuário TI",
    });

    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TicketIcon className="w-5 h-5 text-indigo-200" />
            <div>
              <h2 className="font-bold text-base">Abrir Chamado Técnico (N2)</h2>
              <p className="text-xs text-indigo-200">Envie o problema para a fila de suporte especialista</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Solicitante / Nome
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Título do Chamado / Resumo
            </label>
            <input
              type="text"
              placeholder="Ex: Wi-Fi caindo constantemente no 3º andar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Rede e Internet">🌐 Rede e Internet</option>
                <option value="Impressoras">🖨️ Impressoras</option>
                <option value="Login e Acesso">🔑 Login e Acesso</option>
                <option value="Hardware">💻 Hardware e Equipamentos</option>
                <option value="E-mail e Office">📧 E-mail e Office</option>
                <option value="Geral">Outros Assuntos</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Ticket["priority"])}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Baixa">🟢 Baixa (Dúvida / Solicitação)</option>
                <option value="Média">🟡 Média (Afeta 1 usuário)</option>
                <option value="Alta">🔴 Alta (Setor parado / Urgente)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Descrição Detalhada do Problema
            </label>
            <textarea
              rows={4}
              placeholder="Descreva o que aconteceu, mensagens de erro exibidas, testes já realizados e localização..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Criar Chamado</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
