import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { getAllPosts } from "@/lib/posts";
import { services } from "@/lib/services";
import { siteConfig } from "@/lib/site";

const workflow = ["Obsidian 写作", "GitHub 同步", "VM / NPM 发布", "AI Chat 接入 Telegram"];

export default function Home() {
  const posts = getAllPosts();
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="status"><i /> Independent builder · Based in Shanghai</div>
          <h1>Make ideas<br/><em>travel further.</em></h1>
          <p className="hero-intro">我是 Justin，专注 AI 产品、自动化与全球增长。GlobalPilot 是我的个人品牌与实验室：把内容、工具和真实业务线放到一个可以持续发布的网站里。</p>
          <div className="hero-actions"><Link className="button dark" href="/chat">Talk to AI <span>→</span></Link><a className="text-link" href="#services">Explore services ↓</a></div>
        </div>
        <div className="orbit" aria-label="GlobalPilot 抽象地球图形">
          <div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/>
          <div className="planet"><span>GLOBAL</span><strong>PILOT</strong><small>31.2304° N<br/>121.4737° E</small></div>
          <div className="satellite one">✦</div><div className="satellite two">AI</div><div className="satellite three">↗</div>
          <p>Ideas without borders</p>
        </div>
      </section>

      <section className="ticker" aria-label="关注领域"><span>AI PRODUCTS</span><b>✦</b><span>AUTOMATION</span><b>✦</b><span>GLOBAL GROWTH</span><b>✦</b><span>BUILDING IN PUBLIC</span></section>

      <section className="section services" id="services">
        <div className="section-heading">
          <div><span className="kicker">01 / WHAT I BUILD</span><h2>From fuzzy idea<br/>to working system.</h2></div>
          <Link href="/services">View services <span>↗</span></Link>
        </div>
        <div className="offer-grid">
          {services.map((offer, index) => (
            <Link className="offer-card" href={`/services/${offer.slug}`} key={offer.label}>
              <span>{String(index + 1).padStart(2, "0")} · {offer.label}</span>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
            </Link>
          ))}
        </div>
        <div className="workflow-strip" aria-label="内容发布与咨询转化流程">
          {workflow.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className="section notes">
        <div className="section-heading"><div><span className="kicker">02 / FIELD NOTES</span><h2>Latest thinking,<br/>fresh from the workbench.</h2></div><Link href="/blog">View all articles <span>↗</span></Link></div>
        <div className="article-grid"><ArticleCard post={posts[0]} featured />{posts.slice(1, 3).map((post) => <ArticleCard key={post.slug} post={post} />)}</div>
      </section>

      <section className="about" id="about">
        <span className="kicker">03 / ABOUT</span>
        <div className="about-grid">
          <h2>Builder by instinct.<br/><em>Explorer by choice.</em></h2>
          <div><p>我喜欢把复杂技术变成简单产品，也相信最好的增长来自真正解决问题。</p><p>GlobalPilot 是我的数字工作台：关于 AI、独立开发与中国创意如何走向全球。这里的每篇文章、每个工具入口，都服务于一个目标：让想法更快被验证。</p><a href={`mailto:${siteConfig.email}`} className="button orange">Start a conversation <span>↗</span></a></div>
        </div>
        <div className="principles"><div><b>01</b><span>Think clearly</span></div><div><b>02</b><span>Build quickly</span></div><div><b>03</b><span>Share openly</span></div></div>
      </section>

      <section className="newsletter"><span className="kicker">READY TO SHIP?</span><h2>Good ideas need a runway.</h2><p>如果你正在做 AI 产品、官网、自动化或出海获客，我们可以从一次简短诊断开始。</p><div className="cta-pair"><Link href="/chat" className="button light">Ask GlobalPilot AI <span>→</span></Link><a href={`mailto:${siteConfig.email}?subject=GlobalPilot consultation`} className="button light ghost">Email Justin <span>↗</span></a></div></section>
    </main>
  );
}
