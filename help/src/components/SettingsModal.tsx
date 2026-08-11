import React, { useState } from "react";
import { AppSettings } from "../types";
import { X, Settings, Zap, ShieldCheck, User, Building, Trash2, Download, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClearHistory: () => void;
  onExportHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearHistory,
  onExportHistory,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!formData.webhookUrl) {
      setTestStatus({
        loading: false,
        success: false,
        message: "Por favor, insira uma URL de Webhook válida.",
      });
      return;
    }

    setTestStatus({ loading: true });
    try {
      const res = await fetch("/api/webhook-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.webhookUrl }),
      });
      const data = await res.json();
      setTestStatus({
        loading: false,
        success: data.success,
        message: data.message,
      });
    } catch {
      setTestStatus({
        loading: false,
        success: false,
        message: "Erro de conexão ao testar o webhook.",
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-200" />
            <div>
              <h2 className="font-bold text-base">Configurações do HelpDesk IA</h2>
              <p className="text-xs text-indigo-200">Modo de IA, Webhook N8N e preferências</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Engine Mode Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Motor de Resposta do Helpdesk:
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: "ai" })}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  formData.mode === "ai"
                    ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs sm:text-sm">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Gemini AI (Nativo)
                  </span>
                  {formData.mode === "ai" && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Resposta inteligente imediata com Gemini 3.6 Flash em Português.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: "webhook" })}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  formData.mode === "webhook"
                    ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs sm:text-sm">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    n8n Webhook
                  </span>
                  {formData.mode === "webhook" && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Encaminha mensagens para seu fluxo n8n (ex: ngrok / servidor).
                </p>
              </button>
            </div>
          </div>

          {/* Webhook URL Input */}
          <div className="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span>URL do Webhook do n8n / Ngrok</span>
              <span className="text-[10px] text-slate-400 font-normal">POST Request</span>
            </label>
            <input
              type="text"
              placeholder="http://localhost:5678/webhook/helpdesk-ia"
              value={formData.webhookUrl}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus.loading}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {testStatus.loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Testar Conexão</span>
              </button>

              {testStatus.message && (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    testStatus.success ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {testStatus.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  {testStatus.message}
                </span>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Identificação do Solicitante:
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Nome Completo</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.userFullName}
                    onChange={(e) => setFormData({ ...formData, userFullName: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Departamento / Setor</label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.userDepartment}
                    onChange={(e) => setFormData({ ...formData, userDepartment: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chat History Controls */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gerenciar Histórico:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportHistory}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Conversa
              </button>

              <button
                type="button"
                onClick={onClearHistory}
                className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Chat
              </button>
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-xs transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
