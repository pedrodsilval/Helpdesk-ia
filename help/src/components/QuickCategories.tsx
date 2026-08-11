import React from "react";
import { CATEGORIES } from "../data/categories";
import { Wifi, Printer, Key, Monitor, Mail, Ticket } from "lucide-react";

interface QuickCategoriesProps {
  onCategoryClick: (callbackData: string, buttonText: string) => void;
}

export const QuickCategories: React.FC<QuickCategoriesProps> = ({ onCategoryClick }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Wifi":
        return <Wifi className="w-4 h-4 text-indigo-600" />;
      case "Printer":
        return <Printer className="w-4 h-4 text-emerald-600" />;
      case "Key":
        return <Key className="w-4 h-4 text-amber-600" />;
      case "Monitor":
        return <Monitor className="w-4 h-4 text-blue-600" />;
      case "Mail":
        return <Mail className="w-4 h-4 text-purple-600" />;
      case "Ticket":
        return <Ticket className="w-4 h-4 text-rose-600" />;
      default:
        return <Wifi className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2.5 overflow-x-auto scrollbar-none shrink-0">
      <div className="flex items-center gap-2 min-w-max">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
          Categorias Rápidas:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick(cat.callback_data, cat.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-indigo-900 border border-slate-200 text-xs font-medium transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
          >
            {getIcon(cat.icon)}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
