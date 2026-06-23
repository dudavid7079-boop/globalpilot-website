import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
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
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="GlobalPilot 首页">
            <span className="brand-mark">G</span><span>GlobalPilot</span>
          </Link>
          <nav aria-label="主导航">
            <Link href="/blog">Articles</Link>
            <Link href="/chat">AI Chat</Link>
            <Link href="/#about">About</Link>
            <a className="nav-cta" href={`mailto:${siteConfig.email}`}>Let’s talk <span>↗</span></a>
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
