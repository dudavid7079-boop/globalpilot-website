import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default function Home() {
  const posts = getAllPosts();
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="status"><i /> Independent builder · Based in Shanghai</div>
          <h1>Make ideas<br/><em>travel further.</em></h1>
          <p className="hero-intro">我是 Justin，专注 AI 产品、自动化与全球增长。这里记录我如何把一个想法，从草图推向更大的世界。</p>
          <div className="hero-actions"><Link className="button dark" href="/blog">Read my notes <span>→</span></Link><a className="text-link" href="#about">More about me ↓</a></div>
        </div>
        <div className="orbit" aria-label="GlobalPilot 抽象地球图形">
          <div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/>
          <div className="planet"><span>GLOBAL</span><strong>PILOT</strong><small>31.2304° N<br/>121.4737° E</small></div>
          <div className="satellite one">✦</div><div className="satellite two">AI</div><div className="satellite three">↗</div>
          <p>Ideas without borders</p>
        </div>
      </section>

      <section className="ticker" aria-label="关注领域"><span>AI PRODUCTS</span><b>✦</b><span>AUTOMATION</span><b>✦</b><span>GLOBAL GROWTH</span><b>✦</b><span>BUILDING IN PUBLIC</span></section>

      <section className="section notes">
        <div className="section-heading"><div><span className="kicker">01 / FIELD NOTES</span><h2>Latest thinking,<br/>fresh from the workbench.</h2></div><Link href="/blog">View all articles <span>↗</span></Link></div>
        <div className="article-grid"><ArticleCard post={posts[0]} featured />{posts.slice(1, 3).map((post) => <ArticleCard key={post.slug} post={post} />)}</div>
      </section>

      <section className="about" id="about">
        <span className="kicker">02 / ABOUT</span>
        <div className="about-grid">
          <h2>Builder by instinct.<br/><em>Explorer by choice.</em></h2>
          <div><p>我喜欢把复杂技术变成简单产品，也相信最好的增长来自真正解决问题。</p><p>GlobalPilot 是我的数字工作台：关于 AI、独立开发与中国创意如何走向全球。</p><a href={`mailto:${siteConfig.email}`} className="button orange">Start a conversation <span>↗</span></a></div>
        </div>
        <div className="principles"><div><b>01</b><span>Think clearly</span></div><div><b>02</b><span>Build quickly</span></div><div><b>03</b><span>Share openly</span></div></div>
      </section>

      <section className="newsletter"><span className="kicker">THE OCCASIONAL DISPATCH</span><h2>Good ideas, no noise.</h2><p>不定期分享正在研究、构建和反思的事。</p><a href={`mailto:${siteConfig.email}?subject=Subscribe`} className="button light">Join the dispatch <span>→</span></a></section>
    </main>
  );
}
