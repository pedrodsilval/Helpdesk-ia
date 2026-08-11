import React from "react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-white text-slate-700 rounded-2xl rounded-bl-none shadow-sm border border-slate-200/80 w-fit">
      <span className="text-xs font-medium text-slate-500 mr-1.5 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
        HelpDesk IA digitação
      </span>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
      </div>
    </div>
  );
};
