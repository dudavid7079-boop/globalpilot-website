import type { Metadata } from "next";
import TrackedLink from "@/components/TrackedLink";
import { englishServices } from "@/lib/services-en";

export const metadata: Metadata = {
  title: "GlobalPilot in English",
  description: "AI websites, automation workflows, and global SEO/GEO strategy for founders, consultants, and small teams.",
  alternates: {
    canonical: "/en",
    languages: {
      "zh-CN": "/",
      en: "/en",
    },
  },
  openGraph: {
    title: "GlobalPilot in English",
    description: "AI websites, automation workflows, and global SEO/GEO strategy for founders, consultants, and small teams.",
    url: "/en",
  },
};

const proof = ["Next.js websites", "Obsidian publishing", "Local Ollama / Qwen", "Telegram lead alerts"];

export default function EnglishHomePage() {
  return (
    <main className="en-page" lang="en">
      <section className="service-hero en-hero">
        <span className="kicker">GLOBALPILOT / ENGLISH</span>
        <h1>Build an AI-native<br/><em>growth system.</em></h1>
        <p>GlobalPilot helps founders, consultants, and lean teams turn websites, AI workflows, and content into a practical system for global growth.</p>
        <div className="hero-actions">
          <TrackedLink className="button dark" href="/en/services/ai-website-builder" eventName="cta_click" eventData={{ location: "en_hero", action: "ai_website" }}>Start with AI website <span>→</span></TrackedLink>
          <TrackedLink className="text-link" href="/chat" eventName="cta_click" eventData={{ location: "en_hero", action: "chat" }}>Talk to GlobalPilot AI ↗</TrackedLink>
        </div>
      </section>

      <section className="proof-strip" aria-label="GlobalPilot English capabilities">
        {proof.map((item, index) => (
          <div key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </section>

      <section className="section services">
        <div className="section-heading">
          <div>
            <span className="kicker">WHAT GLOBALPILOT BUILDS</span>
            <h2>Small systems that<br/>can actually run.</h2>
          </div>
          <TrackedLink href="/blog/seo-geo-guide" eventName="section_link_click" eventData={{ location: "en_services", action: "seo_geo" }}>Read about SEO / GEO <span>↗</span></TrackedLink>
        </div>
        <div className="offer-grid">
          {englishServices.map((service, index) => (
            <TrackedLink className="offer-card" href={`/en/services/${service.slug}`} eventName="service_card_click" eventData={{ location: "en_offer_grid", service: service.slug }} key={service.slug}>
              <span>{String(index + 1).padStart(2, "0")} · {service.label}</span>
              <h3>{service.shortTitle}</h3>
              <p>{service.description}</p>
            </TrackedLink>
          ))}
        </div>
      </section>

      <section className="service-cta compact">
        <span className="kicker">FROM IDEA TO OPERATING SYSTEM</span>
        <h2>Bring the messy version.<br/>That is usually enough.</h2>
        <p>Describe your product, workflow, or market in the AI chat. If it is worth a deeper conversation, the context can be routed to Telegram for human follow-up.</p>
        <div className="cta-pair">
          <TrackedLink className="button dark" href="/chat" eventName="cta_click" eventData={{ location: "en_cta", action: "chat" }}>Talk to GlobalPilot AI <span>→</span></TrackedLink>
          <TrackedLink className="button orange" href="/services" eventName="cta_click" eventData={{ location: "en_cta", action: "cn_services" }}>中文服务页 <span>↗</span></TrackedLink>
        </div>
      </section>
    </main>
  );
}
