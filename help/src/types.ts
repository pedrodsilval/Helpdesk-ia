export interface Option {
  text: string;
  callback_data: string;
  icon?: string;
}

export interface SuggestedTicket {
  needed?: boolean;
  category?: string;
  priority?: "Alta" | "Média" | "Baixa";
  title?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: "bot" | "user" | "system";
  timestamp: string;
  options?: Option[];
  suggestedTicket?: SuggestedTicket;
  imageAttachment?: string;
}

export interface Ticket {
  id: string;
  title: string;
  category: string;
  priority: "Alta" | "Média" | "Baixa";
  status: "Aberto" | "Em Atendimento" | "Resolvido";
  createdAt: string;
  user: string;
  description: string;
}

export interface CategoryPreset {
  id: string;
  name: string;
  icon: string;
  callback_data: string;
  description: string;
  commonIssues: string[];
}

export interface AppSettings {
  mode: "ai" | "webhook";
  webhookUrl: string;
  soundEnabled: boolean;
  autoScroll: boolean;
  theme: "light" | "dark" | "whatsapp";
  userFullName: string;
  userDepartment: string;
}
