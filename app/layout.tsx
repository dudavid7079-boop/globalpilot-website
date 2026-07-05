import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import TrackedLink from "@/components/TrackedLink";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: "%s — GlobalPilot" },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { type: "website", locale: "zh_CN", siteName: siteConfig.name, title: siteConfig.title, description: siteConfig.description, url: "/" },
  twitter: { card: "summary_large_image", title: siteConfig.title, description: siteConfig.description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  return (
    <html lang="zh-CN">
      <body>
        {umamiScriptUrl && umamiWebsiteId && (
          <Script
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        )}
        <header className="site-header">
          <Link className="brand" href="/" aria-label="GlobalPilot 首页">
            <span className="brand-mark">G</span><span>GlobalPilot</span>
          </Link>
          <nav aria-label="主导航">
            <TrackedLink href="/services" eventName="nav_click" eventData={{ item: "services" }}>Services</TrackedLink>
            <TrackedLink href="/blog" eventName="nav_click" eventData={{ item: "articles" }}>Articles</TrackedLink>
            <TrackedLink href="/chat" eventName="nav_click" eventData={{ item: "ai_chat" }}>AI Chat</TrackedLink>
            <TrackedLink href="/about" eventName="nav_click" eventData={{ item: "about" }}>About</TrackedLink>
            <TrackedLink className="nav-cta" href={`mailto:${siteConfig.email}`} eventName="cta_click" eventData={{ location: "nav", action: "email" }}>Let’s talk <span>↗</span></TrackedLink>
          </nav>
        </header>
        {children}
        <footer>
          <div><span className="brand-mark small">G</span> GlobalPilot</div>
          <p>Build smart. Go global. Stay human.</p>
          <span>© {new Date().getFullYear()}</span>
        </footer>
      </body>
    </html>
  );
}
