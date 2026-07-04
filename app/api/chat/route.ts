import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };
type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;

const SYSTEM_PROMPT = `You are GlobalPilot AI, the helpful bilingual concierge for Justin's personal brand website.
Help visitors clarify product ideas, AI automation opportunities, website strategy, and global growth plans.
Reply in the user's language. Be concise, practical, candid, and warm. Prefer 2-4 short paragraphs or a small list.
Do not claim that Justin has agreed to work with the visitor.
When the visitor shows concrete intent, ask 1-2 practical follow-up questions and invite them to leave an email, Telegram handle, WeChat ID, or preferred contact method so Justin can follow up.
If they leave contact details, acknowledge it briefly and say Justin can review the context.`;

function validMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 12) return null;
  const messages = value.filter((item): item is ChatMessage => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<ChatMessage>;
    return (candidate.role === "user" || candidate.role === "assistant") && typeof candidate.content === "string" && candidate.content.trim().length > 0 && candidate.content.length <= 2000;
  });
  return messages.length === value.length ? messages : null;
}

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "local";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

function cleanModelOutput(value: string) {
  return value
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*(思考过程|Thinking):[\s\S]*?(回答|Answer):/i, "")
    .trim();
}

function detectContact(text: string) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const telegram = text.match(/@[a-zA-Z0-9_]{5,}/)?.[0];
  const wechat = text.match(/(?:微信|wechat|weixin|wx)[:：\s]*([a-zA-Z][-_a-zA-Z0-9]{5,19})/i)?.[1];
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0];
  return { email, telegram, wechat, phone };
}

function intentScore(messages: ChatMessage[]) {
  const text = messages.map((message) => message.content).join("\n").toLowerCase();
  let score = 0;
  if (/(预算|报价|价格|多少钱|quote|price|budget)/i.test(text)) score += 2;
  if (/(合作|咨询|联系|预约|demo|call|meeting|consult|hire|work together)/i.test(text)) score += 2;
  if (/(官网|网站|自动化|agent|dify|n8n|seo|出海|获客|telegram|ollama)/i.test(text)) score += 1;
  if (Object.values(detectContact(text)).some(Boolean)) score += 3;
  if (messages.filter((message) => message.role === "user").length >= 3) score += 1;
  return score;
}

function leadLabel(score: number) {
  if (score >= 5) return "HOT LEAD";
  if (score >= 3) return "WARM LEAD";
  return "CHAT";
}

function compactTranscript(messages: ChatMessage[]) {
  return messages
    .slice(-6)
    .map((message) => `${message.role === "user" ? "Visitor" : "AI"}: ${message.content}`)
    .join("\n")
    .slice(0, 1800);
}

async function notifyTelegram(sessionId: string, messages: ChatMessage[], userMessage: string, aiMessage: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const score = intentScore(messages);
  const contact = detectContact(messages.map((message) => message.content).join("\n"));
  const contactLines = [
    contact.email && `Email: ${contact.email}`,
    contact.telegram && `Telegram: ${contact.telegram}`,
    contact.wechat && `WeChat: ${contact.wechat}`,
    contact.phone && `Phone: ${contact.phone}`,
  ].filter(Boolean);
  const text = [
    `✦ GlobalPilot ${leadLabel(score)}`,
    `Session: ${sessionId.slice(0, 12)}`,
    `Score: ${score}`,
    contactLines.length ? `Contact:\n${contactLines.join("\n")}` : `Contact: not provided`,
    ``,
    `Latest visitor message:`,
    userMessage,
    ``,
    `AI reply:`,
    aiMessage,
    ``,
    `Recent context:`,
    compactTranscript(messages),
  ].join("\n").slice(0, 4000);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!response.ok) console.error("Telegram notification failed", response.status);
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "请求太频繁，请稍后再试" }, { status: 429 });
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
    const message = cleanModelOutput(payload.message?.content || "");
    if (!message) return NextResponse.json({ error: "AI 返回了空内容" }, { status: 502 });

    const latestUserMessage = [...messages].reverse().find((item) => item.role === "user")?.content || "";
    await notifyTelegram(sessionId, messages, latestUserMessage, message).catch((error) => console.error("Telegram sync error", error));
    return NextResponse.json({ message });
  } catch (error) {
    console.error("Chat request failed", error);
    return NextResponse.json({ error: "无法连接 Mac mini 上的 Ollama，请检查地址与服务状态" }, { status: 502 });
  }
}
