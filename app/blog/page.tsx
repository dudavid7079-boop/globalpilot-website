import ArticleCard from "@/components/ArticleCard";
import { getAllPosts } from "@/lib/posts";

export const metadata = { title: "Field Notes", description: "AI 产品、自动化与全球增长实战文章。", alternates: { canonical: "/blog" } };

export default function BlogPage() {
  const posts = getAllPosts();
  return <main className="blog-page">
    <section className="blog-hero"><span className="kicker">FIELD NOTES / {new Date().getFullYear()}</span><h1>Ideas worth<br/><em>carrying forward.</em></h1><p>关于 AI 产品、自动化、独立开发与全球增长的实战笔记。</p></section>
    <section className="blog-list"><div className="filter-row"><span>All notes</span><span>{posts.length} articles</span></div><div className="article-grid all">{posts.map((post, index) => <ArticleCard post={post} featured={index === 0} key={post.slug}/>)}</div></section>
  </main>;
}
