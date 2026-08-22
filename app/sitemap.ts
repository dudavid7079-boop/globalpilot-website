import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { services } from "@/lib/services";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/services", changeFrequency: "monthly" as const, priority: 0.85 },
    { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/chat", changeFrequency: "monthly" as const, priority: 0.65 },
    { path: "/en", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/llms.txt", changeFrequency: "weekly" as const, priority: 0.4 },
    { path: "/llms-full.txt", changeFrequency: "weekly" as const, priority: 0.35 },
  ].map((page) => ({ url: `${siteConfig.url}${page.path}`, lastModified: new Date(), changeFrequency: page.changeFrequency, priority: page.priority }));
  const servicePages = services.map((service) => ({ url: `${siteConfig.url}/services/${service.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.75 }));
  const englishServicePages = services.map((service) => ({ url: `${siteConfig.url}/en/services/${service.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.72 }));
  const tagPages = getAllTags().map((tag) => ({ url: `${siteConfig.url}/blog/tag/${encodeURIComponent(tag)}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.58 }));
  const posts = getAllPosts().map((post) => ({ url: `${siteConfig.url}/blog/${post.slug}`, lastModified: new Date(`${post.date}T00:00:00+08:00`), changeFrequency: "monthly" as const, priority: 0.7 }));
  return [...pages, ...servicePages, ...englishServicePages, ...tagPages, ...posts];
}
