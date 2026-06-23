import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content/blog");

type Frontmatter = { title?: unknown; date?: unknown; description?: unknown; tags?: unknown };

function normalizePost(file: string, data: Frontmatter, content: string): Post {
  const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
  if (!slug || typeof data.title !== "string" || !data.title.trim()) throw new Error(`${file}: 缺少 title`);
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${file}: date 必须为 YYYY-MM-DD`);
  if (typeof data.description !== "string" || !data.description.trim()) throw new Error(`${file}: 缺少 description`);
  if (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === "string")) throw new Error(`${file}: tags 必须为字符串数组`);
  return { slug, title: data.title.trim(), date, description: data.description.trim(), tags: data.tags, readTime: `${Math.max(3, Math.ceil(content.length / 500))} min` };
}

export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readTime: string;
  content?: string;
};

export function getAllPosts(): Post[] {
  return fs.readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const source = fs.readFileSync(path.join(postsDirectory, file), "utf8");
      const { data, content } = matter(source);
      return normalizePost(file, data, content);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug: string): Promise<Post | null> {
  const match = fs.readdirSync(postsDirectory).find((file) => file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "") === slug);
  if (!match) return null;
  const source = fs.readFileSync(path.join(postsDirectory, match), "utf8");
  const { data, content } = matter(source);
  const processed = await remark().use(html).process(content);
  return { ...normalizePost(match, data, content), content: processed.toString() };
}
