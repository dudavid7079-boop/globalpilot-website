import ArticleCard from "@/components/ArticleCard";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type TagPageProps = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);
  if (posts.length === 0) return {};

  const title = `${decodedTag} articles`;
  const description = `GlobalPilot 关于 ${decodedTag} 的文章合集，覆盖 AI 产品、自动化、SEO、GEO、网站建设与全球增长。`;

  return {
    title,
    description,
    alternates: { canonical: `/blog/tag/${encodeURIComponent(decodedTag)}` },
    openGraph: { title: `${title} — GlobalPilot`, description, url: `/blog/tag/${encodeURIComponent(decodedTag)}` },
    twitter: { card: "summary_large_image", title: `${title} — GlobalPilot`, description },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);
  if (posts.length === 0) notFound();

  const tagUrl = `${siteConfig.url}/blog/tag/${encodeURIComponent(decodedTag)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${tagUrl}#collection`,
        name: `${decodedTag} articles`,
        description: `GlobalPilot topic cluster for ${decodedTag}.`,
        url: tagUrl,
        inLanguage: posts.some((post) => post.lang === "en") ? ["zh-CN", "en"] : "zh-CN",
      },
      {
        "@type": "ItemList",
        "@id": `${tagUrl}#itemlist`,
        itemListElement: posts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: post.title,
          description: post.description,
          url: `${siteConfig.url}/blog/${post.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${tagUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
          { "@type": "ListItem", position: 3, name: decodedTag, item: tagUrl },
        ],
      },
    ],
  };

  return (
    <main className="blog-page tag-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="blog-hero">
        <Link href="/blog" className="back">← All field notes</Link>
        <span className="kicker">TOPIC CLUSTER</span>
        <h1>{decodedTag}</h1>
        <p>围绕 {decodedTag} 的文章合集。这个页面会随着 Obsidian 新文章发布自动更新，帮助读者和搜索引擎理解 GlobalPilot 的主题结构。</p>
      </section>
      <section className="blog-list">
        <div className="filter-row">
          <span>{posts.length} articles</span>
          <span>GlobalPilot / {decodedTag}</span>
        </div>
        <div className="article-grid all">
          {posts.map((post, index) => <ArticleCard key={post.slug} post={post} featured={index === 0} />)}
        </div>
      </section>
    </main>
  );
}
