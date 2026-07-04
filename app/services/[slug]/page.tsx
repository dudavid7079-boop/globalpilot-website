import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, services } from "@/lib/services";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.shortTitle,
    description: service.description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: `${service.shortTitle} — GlobalPilot`, description: service.description, url: `/services/${service.slug}` },
    twitter: { card: "summary_large_image", title: `${service.shortTitle} — GlobalPilot`, description: service.description },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: { "@type": "Person", name: siteConfig.author, url: siteConfig.url },
    areaServed: "Global",
    url: `${siteConfig.url}/services/${service.slug}`,
  };

  return (
    <main className="service-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="service-detail-hero">
        <Link className="back" href="/services">← All services</Link>
        <span className="kicker">{service.label}</span>
        <h1>{service.title}</h1>
        <p>{service.description}</p>
      </section>

      <section className="service-outcome">
        <span className="kicker">OUTCOME</span>
        <h2>{service.outcome}</h2>
      </section>

      <section className="service-columns">
        <div>
          <span className="kicker">BEST FOR</span>
          <ul>{service.bestFor.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <span className="kicker">DELIVERABLES</span>
          <ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="service-process">
        <span className="kicker">PROCESS</span>
        <div>
          {service.process.map((step, index) => (
            <article key={step}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <h3>{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="service-cta compact">
        <span className="kicker">NEXT STEP</span>
        <h2>Bring a messy idea.<br/>We will make it operational.</h2>
        <p>用 AI Chat 简单说一下你的业务、目标和卡点；如果适合继续合作，我会在 Telegram 后台收到线索并跟进。</p>
        <div className="cta-pair">
          <Link className="button dark" href="/chat">Talk to GlobalPilot AI <span>→</span></Link>
          <a className="button orange" href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(service.shortTitle)}`}>Email Justin <span>↗</span></a>
        </div>
      </section>
    </main>
  );
}
