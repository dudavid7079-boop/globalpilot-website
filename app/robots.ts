import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: [`${siteConfig.url}/sitemap.xml`, `${siteConfig.url}/llms.txt`, `${siteConfig.url}/llms-full.txt`],
    host: siteConfig.url,
  };
}
