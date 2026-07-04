"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const starters = ["帮我评估一个 AI 产品想法", "如何让产品进入海外市场？", "我想自动化一个重复流程"];
const conversionPrompts = [
  "请帮我整理一份给 Justin 的需求摘要",
  "我想留下联系方式，请告诉我需要提供什么",
];

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "你好，我是 GlobalPilot AI。你正在构建什么？给我一点背景，我们一起把下一步想清楚。" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef("");

  useEffect(() => {
    sessionRef.current = sessionStorage.getItem("globalpilot-chat-session") || crypto.randomUUID();
    sessionStorage.setItem("globalpilot-chat-session", sessionRef.current);
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10), sessionId: sessionRef.current }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "暂时无法连接 AI");
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "连接失败，请稍后重试");
    } finally { setLoading(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void sendMessage(input); }
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(input); }
  }

  return (
    <section className="chat-shell" aria-label="AI 对话">
      <header className="chat-bar">
        <div className="agent-avatar">GP</div>
        <div><strong>GlobalPilot AI</strong><span><i /> Mac mini · local Qwen</span></div>
        <span className="chat-secure">PRIVATE SESSION</span>
      </header>
      <div className="chat-messages" ref={scrollRef} aria-live="polite">
        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
            <span className="message-label">{message.role === "assistant" ? "GP / AI" : "YOU"}</span>
            <p>{message.content}</p>
          </div>
        ))}
        {messages.length === 1 && <div className="chat-starters">{starters.map((starter) => <button onClick={() => void sendMessage(starter)} key={starter}>{starter}<span>↗</span></button>)}</div>}
        {messages.filter((message) => message.role === "user").length >= 2 && !loading && (
          <div className="chat-starters compact">
            {conversionPrompts.map((prompt) => <button onClick={() => void sendMessage(prompt)} key={prompt}>{prompt}<span>→</span></button>)}
          </div>
        )}
        {loading && <div className="message assistant typing"><span className="message-label">GP / THINKING</span><p><i/><i/><i/></p></div>}
      </div>
      {error && <div className="chat-error" role="alert">{error}</div>}
      <form className="chat-composer" onSubmit={submit}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} maxLength={2000} rows={2} placeholder="说说你的想法，或留下邮箱 / Telegram / 微信…" aria-label="输入消息" disabled={loading}/>
        <button type="submit" disabled={!input.trim() || loading} aria-label="发送消息">↑</button>
        <small>ENTER TO SEND · SHIFT + ENTER FOR NEW LINE</small>
      </form>
    </section>
  );
}
