import { getAllPosts } from "@/lib/posts";
import { services } from "@/lib/services";
import { englishServices } from "@/lib/services-en";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();
  const sections = [
    "# GlobalPilot full LLM context",
    "",
    `Site: ${siteConfig.url}`,
    `Author: ${siteConfig.author}`,
    `Contact: ${siteConfig.email}`,
    "",
    "## Positioning",
    "",
    "GlobalPilot helps founders, consultants, creators, and small teams build AI-native websites, automation workflows, local AI systems, Obsidian publishing pipelines, and global SEO/GEO content systems.",
    "",
    "## Services",
    "",
    ...services.flatMap((service) => [
      `### ${service.title}`,
      "",
      `URL: ${siteConfig.url}/services/${service.slug}`,
      "",
      service.description,
      "",
      `Outcome: ${service.outcome}`,
      "",
      `Deliverables: ${service.deliverables.join("; ")}`,
      "",
    ]),
    "## English services",
    "",
    ...englishServices.flatMap((service) => [
      `### ${service.title}`,
      "",
      `URL: ${siteConfig.url}/en/services/${service.slug}`,
      "",
      service.description,
      "",
      `Outcome: ${service.outcome}`,
      "",
      `Deliverables: ${service.deliverables.join("; ")}`,
      "",
    ]),
    "## Articles",
    "",
    ...posts.flatMap((post) => [
      `### ${post.title}`,
      "",
      `URL: ${siteConfig.url}/blog/${post.slug}`,
      `Language: ${post.lang}`,
      `Date: ${post.date}`,
      `Tags: ${post.tags.join(", ")}`,
      "",
      post.description,
      "",
    ]),
  ];

  return new Response(sections.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
