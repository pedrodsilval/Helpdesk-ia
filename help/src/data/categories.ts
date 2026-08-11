import { CategoryPreset } from "../types";

export const CATEGORIES: CategoryPreset[] = [
  {
    id: "rede",
    name: "1 - 🌐 Rede e Internet",
    icon: "Wifi",
    callback_data: "cat_rede",
    description: "Wi-Fi indisponível, cabo desconectado, DNS ou VPN corporativa",
    commonIssues: [
      "Sem acesso à internet ou Wi-Fi caindo",
      "Lentidão na rede interna ou servidores",
      "VPN corporativa não conecta ou dá erro de chave",
      "Limpar cache DNS (ipconfig /flushdns)"
    ]
  },
  {
    id: "impressora",
    name: "2 - 🖨️ Impressoras",
    icon: "Printer",
    callback_data: "cat_impressora",
    description: "Fila de impressão trancada, impressora offline ou papel atolado",
    commonIssues: [
      "Impressora aparece como 'Offline'",
      "Documento trancado na fila de impressão (Spooler)",
      "Atolamento de papel ou falta de toner",
      "Configurar nova impressora de rede"
    ]
  },
  {
    id: "login",
    name: "3 - 🔑 Login e Acesso",
    icon: "Key",
    callback_data: "cat_login",
    description: "Reset de senha, conta de usuário bloqueada ou autenticação 2FA",
    commonIssues: [
      "Esqueci minha senha do Windows / Active Directory",
      "Usuário bloqueado por tentativas incorretas",
      "Problema no aplicativo de Autenticação 2FA (MFA)",
      "Solicitar permissão de acesso a pasta compartilhada"
    ]
  },
  {
    id: "hardware",
    name: "4 - 💻 Hardware e Desempenho",
    icon: "Monitor",
    callback_data: "cat_hardware",
    description: "Lentidão, tela azul (BSOD), computador desligando ou periféricos",
    commonIssues: [
      "Computador muito lento ou travando",
      "Tela Azul do Windows (BSOD)",
      "Teclado, mouse ou segundo monitor sem funcionar",
      "Superaquecimento ou barulho na ventoinha"
    ]
  },
  {
    id: "email",
    name: "5 - 📧 E-mail e Software",
    icon: "Mail",
    callback_data: "cat_email",
    description: "Outlook desconectado, caixas de entrada lotadas, licenças de software",
    commonIssues: [
      "Outlook desconectado do servidor Exchange/365",
      "Caixa de e-mail cheia (cota excedida)",
      "Erro de ativação de licença no Pacote Office",
      "Instalação de programas homologados"
    ]
  },
  {
    id: "ticket",
    name: "6 - 🎫 Abrir Chamado de TI",
    icon: "Ticket",
    callback_data: "create_ticket",
    description: "Escalonar solicitação para um técnico humano N2/N3",
    commonIssues: [
      "Problema não resolvido pelas etapas automáticas",
      "Necessidade de substituição de equipamento",
      "Manutenção presencial agendada"
    ]
  }
];

export const INITIAL_KNOWLEDGE_BASE = [
  {
    id: "kb-1",
    category: "Rede e Internet",
    title: "Como limpar o Cache DNS e Renovar o IP no Windows",
    solution: "1. Abra o Prompt de Comando (cmd) como Administrador.\n2. Digite `ipconfig /flushdns` e pressione Enter.\n3. Digite `ipconfig /release` e depois `ipconfig /renew`.\n4. Reinicie seu navegador.",
    tags: ["dns", "ip", "rede", "windows"]
  },
  {
    id: "kb-2",
    category: "Impressoras",
    title: "Como Reiniciar o Serviço de Spooler de Impressão",
    solution: "1. Pressione Windows + R, digite `services.msc` e dê Enter.\n2. Procure por 'Spooler de Impressão'.\n3. Clique com botão direito e selecione 'Reiniciar'.\n4. Se preferir pelo CMD (Admin): digite `net stop spooler` e depois `net start spooler`.",
    tags: ["impressora", "spooler", "travada"]
  },
  {
    id: "kb-3",
    category: "Login e Acesso",
    title: "Desbloqueio de Conta por Tentativas Incorretas",
    solution: "Se você errou a senha 3 vezes, a conta pode ser bloqueada por segurança durante 15 minutos. Caso persistir, use o portal Self-Service Reset ou contate a equipe via chamado com validação de identidade.",
    tags: ["senha", "login", "bloqueio"]
  },
  {
    id: "kb-4",
    category: "E-mail e Software",
    title: "Outlook não envia/recebe mensagens em modo offline",
    solution: "1. No Outlook, vá para a guia 'Enviar / Receber'.\n2. Verifique se o botão 'Trabalhar Offline' está desmarcado.\n3. Feche e abra o Outlook novamente.",
    tags: ["outlook", "email", "office"]
  }
];
