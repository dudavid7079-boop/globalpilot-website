import Link from "next/link";
import type { Post } from "@/lib/posts";

export default function ArticleCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={`article-card ${featured ? "featured" : ""}`}>
      <div className="card-top">
        <span className="eyebrow">{post.tags[0]}</span><span className="arrow">↗</span>
      </div>
      <div>
        <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
        <p>{post.description}</p>
      </div>
      <div className="meta"><time>{post.date.replaceAll("-", ".")}</time><span>{post.readTime} read</span></div>
    </article>
  );
}
