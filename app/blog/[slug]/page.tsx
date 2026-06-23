import Link from "next/link";
import { notFound } from "next/navigation";
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
      <div className="post-end"><span>END NOTE</span><h3>Keep building.</h3><Link href="/blog">Read the next idea →</Link></div>
    </article>
  </main>;
}
