export const siteConfig = {
  name: "GlobalPilot",
  title: "GlobalPilot — Build beyond borders",
  description: "Justin 关于 AI 产品、自动化、独立开发与全球增长的实战笔记。",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://globalpilot.com").replace(/\/$/, ""),
  author: "Justin",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@globalpilot.com",
};
