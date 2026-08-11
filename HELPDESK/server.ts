import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Default system instruction for HelpDesk IA
const SYSTEM_INSTRUCTION = `Você é o "HelpDesk IA", um assistente virtual especialista em Suporte de TI de nível N1/N2 para empresas.
Sua missão é ajudar os usuários a resolverem problemas técnicos de forma rápida, eficiente e amigável em Português do Brasil (pt-BR).

Diretrizes de Atendimento:
1. Responda em Português (pt-BR) claro, objetivo e estruturado.
2. Quando relevante, forneça um passo a passo numérico fácil de seguir.
3. Se houver comandos técnicos (ex: ipconfig /flushdns, ping, sfc /scannow, restart spooler), formate em blocos de código markdown.
4. Ao final das suas respostas de solução, sugira de 2 a 4 opções rápidas relevantes para o usuário dar continuidade ou perguntar se resolveu.
5. Se o problema não for resolvido com os passos simples ou for grave (ex: hardware danificado, queda de servidor, troca de peças, troca de senha corporativa restrita), sugira a criação de um Chamado (Ticket de TI) e forneça a opção de abrir o chamado.

Você SEMPRE deve responder em formato JSON estrito quando solicitado ou utilizar a estrutura abaixo caso vá gerar opções.
Se for texto normal, pode enviar um objeto JSON com:
{
  "reply": "Texto da resposta detalhada formatada em Markdown...",
  "options": [
    { "text": "1 - Sim, resolveu meu problema", "callback_data": "resolved_yes" },
    { "text": "2 - Não resolveu, preciso de mais ajuda", "callback_data": "resolved_no" },
    { "text": "3 - 🎫 Criar Chamado para Suporte N2", "callback_data": "create_ticket" }
  ],
  "suggestedTicket": {
    "needed": false,
    "category": "Rede e Internet",
    "priority": "Média",
    "title": "Resumo do problema"
  }
}`;

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "HelpDesk IA API" });
});

// Chat API proxy para o webhook do n8n
app.post("/api/chat", async (req, res) => {
  try {
    const { message, callback_data, history = [], customWebhookUrl, mode = "webhook", sessionId } = req.body;
    const webhookUrl = customWebhookUrl || process.env.N8N_WEBHOOK_URL || "";

    if (!webhookUrl) {
      return res.status(400).json({
        reply: "⚠️ Nenhum webhook do n8n foi configurado. Defina a URL no modal de configurações ou na variável de ambiente N8N_WEBHOOK_URL.",
        options: [
          { text: "1 - 🌐 Rede e Internet", callback_data: "cat_rede" },
          { text: "2 - 🖨️ Impressoras", callback_data: "cat_impressora" },
          { text: "3 - 🔑 Login e Acesso", callback_data: "cat_login" },
        ],
      });
    }

    const payload: any = {
      action: callback_data || "chat",
      message: message || "",
      callback_data: callback_data || "",
      history,
      sessionId: sessionId || "user-1",
    };

    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookRes.ok) {
      const text = await webhookRes.text();
      return res.status(502).json({
        reply: `❌ Falha ao chamar o webhook do n8n. Status ${webhookRes.status}: ${text}`,
        options: [
          { text: "1 - 🌐 Rede e Internet", callback_data: "cat_rede" },
          { text: "2 - 🖨️ Impressoras", callback_data: "cat_impressora" },
          { text: "3 - 🔑 Login e Acesso", callback_data: "cat_login" },
        ],
      });
    }

    const responseText = await webhookRes.text();
    let result: any;
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      // n8n returned non-JSON (plain text response)
      return res.json({ reply: responseText || "Resposta recebida do servidor sem conteúdo." });
    }

    if (Array.isArray(result) && result.length > 0) {
      result = result[0].json || result[0];
    }

    if (typeof result === "string") {
      return res.json({ reply: result });
    }

    if (result?.message && typeof result.message === "object" && typeof result.message.text === "string") {
      result.reply = result.reply || result.message.text;
    }

    result.reply =
      result.reply ||
      result.text ||
      result.response ||
      result.output ||
      (typeof result.message === "string" ? result.message : undefined);

    if (!Array.isArray(result.options) && Array.isArray(result.buttons)) {
      result.options = result.buttons;
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      reply: "❌ Ocorreu um erro ao processar sua solicitação com o HelpDesk IA. Por favor, tente novamente.",
      options: [
        { text: "1 - 🌐 Tentar Novamente (Rede)", callback_data: "cat_rede" },
        { text: "2 - 🖨️ Impressoras", callback_data: "cat_impressora" },
        { text: "3 - 🔑 Acesso e Senhas", callback_data: "cat_login" },
      ],
    });
  }
});

// Proxy to test custom N8N/Webhook connections from settings
app.post("/api/webhook-test", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: "URL do webhook não fornecida." });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const testRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "ping", text: "Teste de conexão do HelpDesk IA" }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (testRes.ok) {
      return res.json({ success: true, status: testRes.status, message: "Conexão estabelecida com sucesso com o webhook!" });
    } else {
      return res.json({ success: false, status: testRes.status, message: `O servidor retornou o status HTTP ${testRes.status}.` });
    }
  } catch (err: any) {
    return res.json({ success: false, message: `Erro ao conectar: ${err.message || "Servidor inacessível ou Timeout"}` });
  }
});

// Vite server / Static files configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    // SPA fallback: serve index.html for all non-API routes
    app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let html = (await import("fs")).readFileSync(
          path.resolve(process.cwd(), "index.html"),
          "utf-8"
        );
        html = await vite.transformIndexHtml(url, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HelpDesk IA running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
