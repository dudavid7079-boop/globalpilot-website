import Link from "next/link";
import { notFound } from "next/navigation";
import TrackedLink from "@/components/TrackedLink";
import { getAllPosts, getPost } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

export async function generateStaticParams() { return getAllPosts().map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, url: `/blog/${slug}`, publishedTime: post.date, authors: [siteConfig.author], tags: post.tags },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.description, datePublished: post.date, author: { "@type": "Person", name: siteConfig.author }, publisher: { "@type": "Organization", name: siteConfig.name }, mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}` };
  return <main className="post-page">
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}/>
      <Link href="/blog" className="back">← All field notes</Link>
      <header className="post-header"><div className="post-tags">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><h1>{post.title}</h1><p>{post.description}</p><div className="meta"><time>{post.date}</time><span>{post.readTime} read</span></div></header>
      <div className="post-divider"><span>✦</span></div>
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.content! }}/>
      <div className="post-end">
        <span>END NOTE</span>
        <h3>Turn the idea<br/>into a working system.</h3>
        <p>如果这篇文章正好对应你的问题，可以让 GlobalPilot AI 先帮你梳理需求；我会在 Telegram 后台看到上下文，再判断下一步怎么做最省力。</p>
        <div className="post-end-actions">
          <TrackedLink href="/chat" className="button light" eventName="cta_click" eventData={{ location: "post_end", action: "chat", slug: post.slug }}>Ask GlobalPilot AI <span>→</span></TrackedLink>
          <TrackedLink href="/blog" eventName="post_next_click" eventData={{ slug: post.slug }}>Read the next idea ↗</TrackedLink>
        </div>
      </div>
    </article>
  </main>;
}
