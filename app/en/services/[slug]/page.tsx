import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TrackedLink from "@/components/TrackedLink";
import { englishServices, getEnglishService } from "@/lib/services-en";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return englishServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getEnglishService(slug);
  if (!service) return {};
  return {
    title: service.shortTitle,
    description: service.description,
    alternates: {
      canonical: `/en/services/${service.slug}`,
      languages: {
        "zh-CN": `/services/${service.slug}`,
        en: `/en/services/${service.slug}`,
      },
    },
    openGraph: { title: `${service.shortTitle} — GlobalPilot`, description: service.description, url: `/en/services/${service.slug}` },
    twitter: { card: "summary_large_image", title: `${service.shortTitle} — GlobalPilot`, description: service.description },
  };
}

export default async function EnglishServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getEnglishService(slug);
  if (!service) notFound();

  const url = `${siteConfig.url}/en/services/${service.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.title,
        alternateName: service.shortTitle,
        description: service.description,
        provider: { "@type": "Person", name: siteConfig.author, url: `${siteConfig.url}/about` },
        areaServed: "Global",
        serviceType: service.label,
        url,
        offers: { "@type": "Offer", availability: "https://schema.org/InStock", url },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "English", item: `${siteConfig.url}/en` },
          { "@type": "ListItem", position: 3, name: service.shortTitle, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: service.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <main className="service-detail en-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="service-detail-hero">
        <Link className="back" href="/en">← English home</Link>
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

      <section className="service-faq" aria-labelledby="english-service-faq-title">
        <div>
          <span className="kicker">FAQ</span>
          <h2 id="english-service-faq-title">Questions buyers ask before they build.</h2>
        </div>
        <div className="faq-list">
          {service.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="service-cta compact">
        <span className="kicker">NEXT STEP</span>
        <h2>Turn the idea<br/>into a working system.</h2>
        <p>Use the AI chat to describe your product, workflow, or growth challenge. The conversation can be routed to Telegram if it is worth a human follow-up.</p>
        <div className="cta-pair">
          <TrackedLink className="button dark" href="/chat" eventName="cta_click" eventData={{ location: "en_service_detail_cta", action: "chat", service: service.slug }}>Talk to GlobalPilot AI <span>→</span></TrackedLink>
          <TrackedLink className="button orange" href={`/services/${service.slug}`} eventName="cta_click" eventData={{ location: "en_service_detail_cta", action: "cn_page", service: service.slug }}>中文页面 <span>↗</span></TrackedLink>
        </div>
      </section>
    </main>
  );
}
