import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are GlobalPilot AI, the helpful bilingual concierge for Justin's personal brand website.
Help visitors clarify product ideas, AI automation opportunities, website strategy, and global growth plans.
Reply in the user's language. Be concise, practical, candid, and warm. Prefer 2-4 short paragraphs or a small list.
Do not claim that Justin has agreed to work with the visitor. When human expertise would help, suggest leaving contact details or continuing with Justin.`;

function validMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 12) return null;
  const messages = value.filter((item): item is ChatMessage => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<ChatMessage>;
    return (candidate.role === "user" || candidate.role === "assistant") && typeof candidate.content === "string" && candidate.content.trim().length > 0 && candidate.content.length <= 2000;
  });
  return messages.length === value.length ? messages : null;
}

async function notifyTelegram(sessionId: string, userMessage: string, aiMessage: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const text = [`✦ GlobalPilot website chat`, `Session: ${sessionId.slice(0, 12)}`, ``, `Visitor:`, userMessage, ``, `AI:`, aiMessage].join("\n").slice(0, 4000);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!response.ok) console.error("Telegram notification failed", response.status);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = validMessages(body.messages);
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "anonymous";
    if (!messages) return NextResponse.json({ error: "消息格式无效" }, { status: 400 });
    const baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.OLLAMA_AUTH_TOKEN) headers.Authorization = `Bearer ${process.env.OLLAMA_AUTH_TOKEN}`;
    if (process.env.CF_ACCESS_CLIENT_ID) headers["CF-Access-Client-Id"] = process.env.CF_ACCESS_CLIENT_ID;
    if (process.env.CF_ACCESS_CLIENT_SECRET) headers["CF-Access-Client-Secret"] = process.env.CF_ACCESS_CLIENT_SECRET;

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(120_000),
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "qwen3:8b",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: false,
        options: { temperature: 0.6, num_predict: 700 },
      }),
    });
    const payload = await response.json() as { message?: { content?: string }; error?: string };
    if (!response.ok) {
      console.error("Ollama request failed", response.status, payload.error);
      const modelMissing = response.status === 404 || payload.error?.includes("model");
      return NextResponse.json({ error: modelMissing ? `Mac mini 尚未安装模型 ${process.env.OLLAMA_MODEL || "qwen3:8b"}` : "Mac mini AI 服务暂时无法回答" }, { status: 502 });
    }
    const message = payload.message?.content?.trim() || "";
    if (!message) return NextResponse.json({ error: "AI 返回了空内容" }, { status: 502 });

    const latestUserMessage = [...messages].reverse().find((item) => item.role === "user")?.content || "";
    await notifyTelegram(sessionId, latestUserMessage, message).catch((error) => console.error("Telegram sync error", error));
    return NextResponse.json({ message });
  } catch (error) {
    console.error("Chat request failed", error);
    return NextResponse.json({ error: "无法连接 Mac mini 上的 Ollama，请检查地址与服务状态" }, { status: 502 });
  }
}
