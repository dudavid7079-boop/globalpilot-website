import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/blog", "/chat"].map((path) => ({ url: `${siteConfig.url}${path}`, lastModified: new Date(), changeFrequency: path === "/blog" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.8 }));
  const posts = getAllPosts().map((post) => ({ url: `${siteConfig.url}/blog/${post.slug}`, lastModified: new Date(`${post.date}T00:00:00+08:00`), changeFrequency: "monthly" as const, priority: 0.7 }));
  return [...pages, ...posts];
}
