import React, { useState } from "react";
import { INITIAL_KNOWLEDGE_BASE } from "../data/categories";
import { X, Search, BookOpen, ChevronRight, Copy, Check, Send } from "lucide-react";

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskArticle: (questionText: string) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onAskArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredArticles = INITIAL_KNOWLEDGE_BASE.filter(
    (art) =>
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.solution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-200" />
            <div>
              <h2 className="font-bold text-base">Base de Conhecimento de TI</h2>
              <p className="text-xs text-indigo-200">Guias de autoatendimento e procedimentos padrão</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar soluções (ex: rede, impressora, dns, outlook)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Articles List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm font-medium">Nenhum artigo encontrado para "{searchTerm}"</p>
              <p className="text-xs mt-1">Você pode digitar seu problema no chat para a IA buscar mais soluções.</p>
            </div>
          ) : (
            filteredArticles.map((art) => (
              <div
                key={art.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-indigo-300 transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(art.id, `${art.title}\n\n${art.solution}`)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      title="Copiar Solução"
                    >
                      {copiedId === art.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onAskArticle(`Como resolver: ${art.title}?`);
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs rounded border border-indigo-200 transition-colors flex items-center gap-1"
                      title="Perguntar no Chat"
                    >
                      <Send className="w-3 h-3" />
                      <span>Usar no Chat</span>
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{art.title}</h3>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {art.solution}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {art.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
