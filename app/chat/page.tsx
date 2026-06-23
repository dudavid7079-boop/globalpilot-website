import type { Metadata } from "next";
import ChatClient from "@/components/ChatClient";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "和 GlobalPilot AI 助手聊聊产品、自动化与全球增长。",
  alternates: { canonical: "/chat" },
};

export default function ChatPage() {
  return (
    <main className="chat-page">
      <section className="chat-intro">
        <span className="kicker">GLOBALPILOT / AI CONCIERGE</span>
        <h1>What are you<br/><em>building next?</em></h1>
        <p>告诉我你的想法、卡点或目标。本地 Qwen 会帮你梳理下一步；需要真人跟进时，对话会安全地转到 Telegram 后台。</p>
        <div className="chat-trust">
          <div><b>01</b><span>AI 即时分析</span></div>
          <div><b>02</b><span>Telegram 后台同步</span></div>
          <div><b>03</b><span>真人可继续跟进</span></div>
        </div>
      </section>
      <ChatClient />
    </main>
  );
}
