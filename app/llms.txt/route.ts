import { getAllPosts } from "@/lib/posts";
import { services } from "@/lib/services";
import { englishServices } from "@/lib/services-en";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

function line(title: string, url: string, description?: string) {
  return `- [${title}](${url})${description ? `: ${description}` : ""}`;
}

export function GET() {
  const posts = getAllPosts();
  const body = [
    "# GlobalPilot",
    "",
    "> GlobalPilot is Justin's AI-native personal brand and digital operating system for AI websites, automation workflows, local AI, Obsidian publishing, SEO, GEO, and global growth.",
    "",
    "## Core pages",
    "",
    line("Home", siteConfig.url, siteConfig.description),
    line("English landing page", `${siteConfig.url}/en`, "English overview of GlobalPilot services for global audiences."),
    line("Services", `${siteConfig.url}/services`, "AI websites, AI automation, and global growth services."),
    line("Blog", `${siteConfig.url}/blog`, "Field notes about AI products, automation, indie building, SEO, GEO, and global growth."),
    line("AI Chat", `${siteConfig.url}/chat`, "AI concierge connected to local Ollama/Qwen and Telegram follow-up."),
    "",
    "## Chinese service pages",
    "",
    ...services.map((service) => line(service.shortTitle, `${siteConfig.url}/services/${service.slug}`, service.description)),
    "",
    "## English service pages",
    "",
    ...englishServices.map((service) => line(service.shortTitle, `${siteConfig.url}/en/services/${service.slug}`, service.description)),
    "",
    "## Latest articles",
    "",
    ...posts.slice(0, 10).map((post) => line(post.title, `${siteConfig.url}/blog/${post.slug}`, post.description)),
    "",
    "## Machine-readable feeds",
    "",
    line("Sitemap", `${siteConfig.url}/sitemap.xml`),
    line("RSS feed", `${siteConfig.url}/feed.xml`),
    line("Full LLM context", `${siteConfig.url}/llms-full.txt`),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
