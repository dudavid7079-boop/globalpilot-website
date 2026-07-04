import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: "GlobalPilot 提供 AI 官网、业务自动化与全球增长相关服务。",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <main className="services-page">
      <section className="service-hero">
        <span className="kicker">GLOBALPILOT / SERVICES</span>
        <h1>Build the system<br/><em>behind the idea.</em></h1>
        <p>从品牌网站、内容发布，到本地 AI、Telegram 通知和自动化流程，我帮你把零散工具变成可持续运行的获客系统。</p>
      </section>

      <section className="service-list">
        {services.map((service, index) => (
          <article className="service-row" key={service.slug}>
            <div>
              <span className="kicker">{String(index + 1).padStart(2, "0")} / {service.label}</span>
              <h2>{service.title}</h2>
            </div>
            <p>{service.description}</p>
            <Link href={`/services/${service.slug}`}>Explore <span>↗</span></Link>
          </article>
        ))}
      </section>

      <section className="service-cta">
        <span className="kicker">NOT SURE WHERE TO START?</span>
        <h2>Let the first conversation<br/>find the shape.</h2>
        <p>如果你还不确定需要官网、自动化还是增长策略，可以先用 AI Chat 做一次快速诊断。</p>
        <div className="cta-pair">
          <Link className="button dark" href="/chat">Start with AI <span>→</span></Link>
          <a className="button orange" href={`mailto:${siteConfig.email}?subject=GlobalPilot services`}>Email Justin <span>↗</span></a>
        </div>
      </section>
    </main>
  );
}
