#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const defaultKey = "897932c3-89e0-416a-8700-0c5c5a36f0df";
const key = process.env.INDEXNOW_KEY || defaultKey;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://globalpilot.attodigitalhk.com").replace(/\/$/, "");
const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const dryRun = process.argv.includes("--dry-run") || process.env.INDEXNOW_DRY_RUN === "true";

function readSlugsFromBlog() {
  const blogDir = path.join(root, "content", "blog");
  if (!fs.existsSync(blogDir)) return [];
  return fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, ""))
    .filter(Boolean)
    .map((slug) => `/blog/${slug}`);
}

function readServiceSlugs() {
  const serviceFile = path.join(root, "lib", "services.ts");
  if (!fs.existsSync(serviceFile)) return [];
  const source = fs.readFileSync(serviceFile, "utf8");
  return Array.from(source.matchAll(/slug:\s*"([^"]+)"/g), (match) => match[1]);
}

function buildUrlList() {
  const paths = [
    "/",
    "/about",
    "/services",
    "/blog",
    "/chat",
    "/en",
    "/feed.xml",
    "/sitemap.xml",
    ...readServiceSlugs().flatMap((slug) => [`/services/${slug}`, `/en/services/${slug}`]),
    ...readSlugsFromBlog(),
  ];
  return Array.from(new Set(paths)).map((urlPath) => `${siteUrl}${urlPath === "/" ? "" : urlPath}`);
}

async function submit() {
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
    throw new Error("INDEXNOW_KEY must be 8-128 characters and only contain letters, numbers, and hyphens.");
  }

  const urlList = buildUrlList();
  const host = new URL(siteUrl).host;
  const keyLocation = `${siteUrl}/${key}.txt`;
  const body = { host, key, keyLocation, urlList };

  console.log(`Submitting ${urlList.length} URLs to IndexNow for ${host}`);
  if (dryRun) {
    console.log(JSON.stringify(body, null, 2));
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  console.log(`IndexNow response: ${response.status} ${response.statusText}`);
  if (text.trim()) console.log(text.trim());

  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow submission failed with status ${response.status}`);
  }
}

submit().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
