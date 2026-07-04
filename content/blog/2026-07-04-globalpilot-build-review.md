---
title: GlobalPilot 建站复盘：从个人品牌网站到本地 AI 聊天系统
date: 2026-07-04
description: 复盘 GlobalPilot 从 Next.js 网站、Obsidian 发布流、VM 部署，到 Mac mini Ollama 与 Telegram 线索通知的完整搭建过程。
tags: [AI, Website, Automation]
---

# GlobalPilot 建站复盘：从个人品牌网站到本地 AI 聊天系统

GlobalPilot 一开始不是一个“大项目”，只是一个很简单的目标：搭一个可以长期运营的个人品牌网站。

但真正做下来以后，它逐渐变成了一套完整的小型数字基础设施：

- 有首页、Blog、服务页和 AI Chat
- 可以通过 Obsidian 写文章
- 推送到 GitHub 后自动部署到 VM
- 用 Nginx Proxy Manager 处理 HTTPS
- 用 Mac mini 上的 Ollama + Qwen 提供本地 AI 能力
- 用 Telegram 接收聊天线索和系统通知

这篇文章复盘整个搭建过程，也记录我为什么选择这套架构。

## 为什么不用复杂 CMS

最开始的问题是：Blog 应该怎么发布？

我不想为了写文章打开一个复杂后台，也不想把内容锁在 Notion、微信公众号或某个 SaaS 平台里。最理想的工作流应该是：

```text
Obsidian 写文章
↓
Commit-and-sync
↓
GitHub
↓
网站自动更新
```

所以内容层选择 Markdown，文章放在：

```text
content/blog
```

每篇文章就是一个 `.md` 文件，带上 frontmatter：

```markdown
---
title: 文章标题
date: 2026-07-04
description: 一句话摘要
tags: [AI, Website]
---
```

这个选择的好处是简单、可迁移、可版本管理。它不像传统 CMS 那样有很多后台概念，也不像纯社交平台那样难以沉淀搜索资产。

## 网站技术栈

网站本体使用 Next.js。原因很直接：

- 适合做静态内容和动态 API
- Blog、服务页、RSS、sitemap 都容易处理
- `/chat` 可以直接接后端 API
- Docker 部署比较成熟

最终网站包含这些核心页面：

```text
/
/blog
/blog/[slug]
/services
/services/ai-website-builder
/services/ai-automation
/services/global-growth
/chat
/feed.xml
/sitemap.xml
```

首页负责建立品牌印象，Blog 负责长期 SEO，Services 负责解释服务方向，Chat 负责接住即时咨询。

## 为什么选择 VM + Nginx Proxy Manager

一开始也考虑过 Vercel。Vercel 对 Next.js 很友好，但这个项目有一个特殊点：AI 模型运行在本地 Mac mini 上。

如果网站放在 Vercel，它无法直接访问家里或办公室局域网里的 Ollama，需要额外做公网 tunnel 和权限保护。相比之下，我已经有 VM 和 Nginx Proxy Manager，所以最终选择：

```text
访客
↓
globalpilot.attodigitalhk.com
↓
Nginx Proxy Manager
↓
VM:3000
↓
Next.js app
```

VM 上只运行网站容器，HTTPS 和反向代理交给 Nginx Proxy Manager。这样结构更贴合已有基础设施，也避免在项目里重复跑 Caddy。

## 自动部署：从 GitHub 推送到 VM 主动拉取

理想状态是 GitHub Actions 直接 SSH 到 VM 部署。但实际环境里，SSH 是通过 FRP 暴露的，MacBook 可以连接，GitHub-hosted runner 却不一定能稳定访问。

所以部署方案改成 VM 主动拉取：

```text
GitHub main 更新
↓
VM systemd timer 每 5 分钟检查
↓
发现新提交
↓
git pull
↓
docker compose build
↓
健康检查通过
```

这个方式更适合 FRP/NPM 架构，因为不需要 GitHub 从外部连进 VM。VM 自己能访问 GitHub，就可以完成部署。

目前自动部署频率设为 5 分钟。它不会每次都重建，只有发现远程提交变化时才会执行部署。

## 本地 AI：Mac mini + Ollama + Qwen

AI Chat 没有接 OpenAI API，而是接了 Mac mini 上的 Ollama。

当前模型是：

```text
qwen3:8b
```

连接链路是：

```text
网站 /chat
↓
VM Next.js API
↓
Tailscale
↓
Mac mini Ollama
↓
Qwen 回复
```

Ollama 通过 macOS `launchd` 常驻运行，监听：

```text
0.0.0.0:11434
```

但这个端口没有暴露到公网，只通过 Tailscale 给 VM 访问。这样既能利用本地硬件，也避免把 Ollama 直接暴露到互联网。

## Telegram 作为后台接线索

AI Chat 的每轮对话会同步到 Telegram。

后来又加了一层线索判断：

- 如果用户留下邮箱、Telegram、微信或电话，会自动识别
- 如果用户提到预算、报价、合作、咨询，会提高线索分数
- Telegram 通知会标记 `HOT LEAD`、`WARM LEAD` 或普通 `CHAT`

这样 Telegram 不只是“消息备份”，而是一个轻量 CRM 入口。

对我来说，最有价值的是：访客可以先跟 AI 聊，AI 帮他整理问题；当对方真的有意向时，我在 Telegram 后台看到的是一段更完整的上下文。

## 监控与稳定性

网站上线后，最怕的不是功能少，而是不知道它什么时候坏。

所以 VM 上加了两个 systemd timer：

```text
globalpilot-auto-deploy.timer
globalpilot-health-check.timer
```

前者负责自动部署，后者负责检查本地 app health endpoint：

```text
http://127.0.0.1:3000/api/health
```

如果检查失败，会通过 Telegram 发告警；恢复后也会发恢复通知。

公网域名监控更适合用 UptimeRobot 或 Better Stack 这类外部监控工具，因为 VM 自己访问自己的公网域名时，可能遇到 Nginx Proxy Manager 或网络回环限制，容易误报。

## 这套架构适合谁

这套方案不是给所有人用的。如果只是想最快上线一个静态网站，Vercel 仍然是非常好的选择。

但如果你同时满足这些条件，它就很有吸引力：

- 已经有 VM 或 VPS
- 想用 Obsidian 管理内容
- 想保留 Markdown 和 Git 历史
- 想接本地模型，而不是完全依赖云 API
- 想用 Telegram 作为轻量后台
- 希望网站、内容、AI、自动化在一套系统里协同

GlobalPilot 本身就是这套方法的第一个案例。

## 最大的收获

这次搭建让我重新确认了一件事：

> 网站不是页面集合，而是一套持续运行的业务系统。

它不只是“看起来专业”，还要能写内容、能发布、能被搜索、能接咨询、能通知、能监控、能恢复。

真正有价值的不是某个单点技术，而是这些环节连起来以后，形成一个低成本、可持续、自己可控的工作流。

下一步，我会继续把 GlobalPilot 当作一个公开样板：一边运营，一边把 AI 网站、自动化和全球增长的方法写下来。
