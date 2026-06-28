# GlobalPilot

个人品牌与内容网站，使用 Next.js + Markdown 构建。

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## 发布新文章

在 `content/blog` 新建 Markdown 文件，文件名建议使用：

```text
YYYY-MM-DD-your-slug.md
```

Frontmatter 示例：

```markdown
---
title: 文章标题
date: 2026-06-22
description: 一句话摘要，用于列表页和 SEO。
tags: [AI, Website]
---

# 正文标题

正文内容……
```

文件名中的日期前缀不会出现在网址里。例如：

```text
content/blog/2026-06-22-ai-website-builder.md
→ /blog/ai-website-builder
```

## Obsidian 写作与发布

首次设置：

1. 在 Obsidian 选择「打开本地仓库为库」，打开本项目根目录 `个人网站建设`。
2. 在「第三方插件」中安装并启用 **Obsidian Git**。
3. 在 Obsidian Git 设置中开启 `Pull updates on startup`，并将自动备份间隔设为需要的分钟数；也可以始终手动执行 `Obsidian Git: Commit-and-sync`。
4. 内置 Templates 核心插件已启用，模板目录已设为 `content/templates`。

每次发布：

1. 在 `content/blog` 新建文件，命名为 `YYYY-MM-DD-english-slug.md`。
2. 执行「Templates: Insert template」，选择 `Blog Post`。
3. 写完后填写摘要和标签；图片放进 `public/images`，正文使用 `![说明](/images/文件名.jpg)`。
4. 在项目终端运行 `npm run validate:content`，确认格式通过。
5. 点击 Obsidian Git 的 Commit-and-sync。GitHub 收到提交后，Vercel 会自动构建上线。

文章文件名中的英文 slug 就是最终网址，一旦发布尽量不要修改，否则旧链接会失效。

## Vercel 部署

1. 将本仓库推送至 GitHub。
2. 在 Vercel 导入仓库。
3. Framework Preset 选择 Next.js，其余保持默认。
4. 配置 `.env.example` 中需要的环境变量，至少设置正式的 `NEXT_PUBLIC_SITE_URL`。
5. 在 Vercel 添加自定义域名，再将 Cloudflare DNS 指向 Vercel 给出的记录。

发布前执行完整检查：

```bash
npm run check
```

站点已提供 `/sitemap.xml`、`/robots.txt`、`/feed.xml`、文章结构化数据、Open Graph 图片和安全响应头。联系邮箱通过 `NEXT_PUBLIC_CONTACT_EMAIL` 配置。

## VPS + Caddy 部署（当前推荐）

项目已包含生产 Docker 镜像、Compose、Caddy HTTPS 和 GitHub Actions 自动部署。域名默认使用 `globalpilot.attodigitalhk.com`。

完整首次部署步骤见 [`deploy/README.md`](deploy/README.md)。核心链路：

```text
Obsidian → GitHub main → 内容校验/构建 → SSH VPS → Docker Compose → Caddy HTTPS
```

不需要 Vercel，也不需要 Cloudflare代理。GoDaddy 的 A 记录直接指向 VPS 公网 IP 即可。

## Mac mini Ollama + Qwen + Telegram

复制环境变量模板：

```bash
cp .env.example .env.local
```

### 1. 在 Mac mini 安装模型

```bash
ollama pull qwen3:8b
```

让 Ollama 接受局域网连接（之后重启 Ollama App）：

```bash
launchctl setenv OLLAMA_HOST "0.0.0.0:11434"
```

在 Mac mini 的系统设置中给 Ollama 放行防火墙，并在路由器中为 Mac mini 固定局域网 IP。不要将 `11434` 端口直接暴露到公网。

### 2. 配置网站

在 `.env.local` 中填写：

- `OLLAMA_BASE_URL`：例如 `http://192.168.1.100:11434`，换成 Mac mini 的实际 IP。
- `OLLAMA_MODEL`：默认 `qwen3:8b`。
- `TELEGRAM_BOT_TOKEN`：在 Telegram 中通过 `@BotFather` 创建机器人获得。
- `TELEGRAM_CHAT_ID`：接收网站聊天记录的私聊或群组 ID。

局域网内先测试：

```bash
curl http://MAC_MINI_IP:11434/api/tags
```

将 Bot 加入目标群组后，访客每轮对话都会把访客消息及 AI 回答同步到 Telegram。未配置 Telegram 时 AI 聊天仍可工作。

### 3. Vercel 部署注意

Vercel 无法访问 `192.168.x.x` 局域网地址。如果网站部署在 Vercel，需要在 Mac mini 上建立 Cloudflare Tunnel，并用 Cloudflare Access Service Token 保护 Ollama；随后把公网 Tunnel 地址设为 `OLLAMA_BASE_URL`，把 Service Token 填入 `CF_ACCESS_CLIENT_ID` 和 `CF_ACCESS_CLIENT_SECRET`。Ollama 本身没有公网鉴权，不要创建一个无保护的公开 Tunnel。
