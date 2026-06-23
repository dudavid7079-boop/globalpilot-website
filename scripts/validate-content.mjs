import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const directory = path.join(process.cwd(), "content/blog");
const files = fs.readdirSync(directory).filter((file) => file.endsWith(".md"));
const errors = [];
const slugs = new Set();

for (const file of files) {
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(file)) errors.push(`${file}: 文件名应为 YYYY-MM-DD-english-slug.md`);
  const { data, content } = matter(fs.readFileSync(path.join(directory, file), "utf8"));
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
  const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  if (slugs.has(slug)) errors.push(`${file}: slug 与其他文章重复`);
  slugs.add(slug);
  if (typeof data.title !== "string" || !data.title.trim()) errors.push(`${file}: 缺少 title`);
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(`${file}: date 必须为 YYYY-MM-DD`);
  if (typeof data.description !== "string" || data.description.trim().length < 10) errors.push(`${file}: description 至少 10 个字符`);
  if (!Array.isArray(data.tags) || data.tags.length === 0 || !data.tags.every((tag) => typeof tag === "string")) errors.push(`${file}: tags 至少包含一个字符串标签`);
  if (content.trim().length < 100) errors.push(`${file}: 正文过短或为空`);
}

if (errors.length) {
  console.error(`内容校验失败（${errors.length} 项）：\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`内容校验通过：${files.length} 篇文章`);
