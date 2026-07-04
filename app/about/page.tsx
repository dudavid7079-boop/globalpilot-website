import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const stack = ["Next.js", "Obsidian", "GitHub", "Docker", "Nginx Proxy Manager", "Ollama", "Qwen", "Telegram", "Tailscale", "n8n / Dify"];
const principles = [
  { title: "先把问题讲清楚", text: "我更关心一个系统是否解决真实问题，而不是堆了多少工具。" },
  { title: "小步上线，持续迭代", text: "先做能运行的版本，再用真实反馈修正页面、流程和自动化。" },
  { title: "尽量可控，尽量简单", text: "能用 Markdown 和 Git 解决的事，不急着上复杂后台；能本地跑的模型，不盲目依赖云。" },
];

export const metadata: Metadata = {
  title: "About Justin",
  description: "了解 Justin 与 GlobalPilot：关于 AI 产品、自动化、个人品牌网站和全球增长的数字工作台。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero-page">
        <span className="kicker">ABOUT / GLOBALPILOT</span>
        <h1>Builder by instinct.<br/><em>Explorer by choice.</em></h1>
        <p>我是 Justin。GlobalPilot 是我的个人品牌网站，也是一个公开样板：我在这里把 AI、自动化、内容发布和全球增长，做成一套真正能运行的系统。</p>
      </section>

      <section className="about-story">
        <div>
          <span className="kicker">WHY THIS EXISTS</span>
          <h2>我想让想法更快变成可验证的东西。</h2>
        </div>
        <div>
          <p>很多好想法卡住，不是因为技术不够，而是因为没有一个可以持续表达、发布、接线索和迭代的系统。</p>
          <p>GlobalPilot 的目标很简单：把复杂技术变成清晰产品，把零散工具变成工作流，把中文创意带到更大的市场。</p>
          <p>这个网站本身就是案例：Obsidian 写文章，GitHub 管版本，VM 自动部署，Mac mini 跑本地 Qwen，Telegram 接收线索。</p>
        </div>
      </section>

      <section className="about-principles-page">
        {principles.map((item, index) => (
          <article key={item.title}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="about-stack">
        <span className="kicker">CURRENT STACK</span>
        <h2>Tools I trust enough<br/>to put in production.</h2>
        <div>{stack.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      <section className="about-work">
        <div>
          <span className="kicker">WHAT I CAN HELP WITH</span>
          <h2>From idea to operating system.</h2>
        </div>
        <ul>
          <li>为个人品牌、顾问和独立产品搭建 AI 官网与内容系统</li>
          <li>用 n8n、Dify、Telegram、Ollama 串联业务自动化流程</li>
          <li>设计面向海外市场的内容、SEO 和获客路径</li>
          <li>把项目从“能演示”推进到“能长期运行”</li>
        </ul>
      </section>

      <section className="service-cta compact">
        <span className="kicker">START SMALL</span>
        <h2>Bring the messy version.<br/>That is usually enough.</h2>
        <p>如果你正在做网站、AI 自动化或出海获客，可以先用 GlobalPilot AI 梳理想法；如果值得继续，我会在 Telegram 后台看到上下文。</p>
        <div className="cta-pair">
          <Link className="button dark" href="/chat">Talk to GlobalPilot AI <span>→</span></Link>
          <a className="button orange" href={`mailto:${siteConfig.email}?subject=About GlobalPilot`}>Email Justin <span>↗</span></a>
        </div>
      </section>
    </main>
  );
}
