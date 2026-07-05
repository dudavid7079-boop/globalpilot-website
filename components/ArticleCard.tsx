import type { Post } from "@/lib/posts";
import TrackedLink from "@/components/TrackedLink";

export default function ArticleCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={`article-card ${featured ? "featured" : ""}`}>
      <div className="card-top">
        <span className="eyebrow">{post.tags[0]}</span><span className="arrow">↗</span>
      </div>
      <div>
        <h3><TrackedLink href={`/blog/${post.slug}`} eventName="article_click" eventData={{ slug: post.slug, featured }}>{post.title}</TrackedLink></h3>
        <p>{post.description}</p>
      </div>
      <div className="meta"><time>{post.date.replaceAll("-", ".")}</time><span>{post.readTime} read</span></div>
    </article>
  );
}
