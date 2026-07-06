# GlobalPilot 网站建设与运维手册

本文档记录 GlobalPilot 个人品牌网站已经完成的工作，以及日常发布、部署、监控和排障的关键操作。

> 重要原则：不要把 `.env.production`、`.env.umami`、SSH 私钥、Telegram Bot Token、Umami 密码、Ollama 内网地址等敏感信息提交到 GitHub。

## 1. 当前系统总览

### 1.1 已上线地址

- 主站：`https://globalpilot.attodigitalhk.com`
- 访问统计：`https://analytics.globalpilot.attodigitalhk.com`
- 健康检查：`https://globalpilot.attodigitalhk.com/api/health`

### 1.2 当前架构

```text
Obsidian
  ↓
Git / GitHub main
  ↓
VM systemd timer 每 5 分钟检查更新
  ↓
Docker Compose 重建 Next.js app
  ↓
Nginx Proxy Manager / OpenResty
  ↓
https://globalpilot.attodigitalhk.com
```

AI Chat 链路：

```text
网站 /chat
  ↓
Next.js /api/chat
  ↓
Tailscale
  ↓
Mac mini Ollama + Qwen
  ↓
AI 回复用户
  ↓
Telegram Bot 同步线索给 Justin
```

访问统计链路：

```text
用户访问主站
  ↓
Umami script.js
  ↓
analytics.globalpilot.attodigitalhk.com
  ↓
VM:3001 Umami
  ↓
Umami Dashboard
```

### 1.3 已完成模块

- Next.js 个人品牌网站
- 首页、About、Services、Service Detail、Blog、Article Detail、Chat 页面
- Markdown Blog 内容系统
- Obsidian 写作与 Git 同步工作流
- GitHub 仓库版本管理
- VM Docker 部署
- Nginx Proxy Manager HTTPS 反向代理
- VM 每 5 分钟自动拉取部署
- Mac mini Ollama + Qwen 本地 AI
- Telegram Bot 线索同步
- VM 健康检查与 Telegram 告警
- 自托管 Umami 访问统计
- Umami 转化事件追踪
- SEO 基础：Sitemap、Robots、RSS、OpenGraph、文章结构化数据

## 2. 项目目录说明

```text
app/                       Next.js App Router 页面与 API
components/                复用组件，例如 ChatClient、ArticleCard、TrackedLink
content/blog/              Markdown 博客文章
content/templates/         Obsidian 文章模板
deploy/                    部署、systemd、Umami、Mac mini Ollama 配置
docs/                      运维和项目手册
lib/                       站点配置、文章解析、服务数据
public/                    静态资源
compose.npm.yml            VM + Nginx Proxy Manager 模式的网站容器
compose.umami.yml          Umami 访问统计容器
Dockerfile                 Next.js 生产镜像
```

## 3. 日常写文章与发布

### 3.1 在 Obsidian 新建文章

文章目录：

```text
content/blog/
```

文件命名建议：

```text
YYYY-MM-DD-english-slug.md
```

示例：

```text
2026-07-05-seo-geo-guide.md
```

最终访问地址会去掉日期前缀：

```text
/blog/seo-geo-guide
```

### 3.2 Frontmatter 示例

```markdown
---
title: 什么是网站 SEO 和 GEO？
date: 2026-07-05
description: 解释 SEO 与 GEO 的区别、联系和实施策略。
tags:
  - SEO
  - GEO
  - AI
---

# 什么是网站 SEO 和 GEO？

正文内容……
```

### 3.3 发布流程

```text
Obsidian 写文章
  ↓
Obsidian Git: Commit-and-sync
  ↓
GitHub main 收到更新
  ↓
VM 5 分钟内自动拉取
  ↓
Docker 重建
  ↓
网站上线
```

本地发布前建议运行：

```bash
npm run validate:content
npm run build
```

## 4. 本地开发

进入项目目录：

```bash
cd "/Users/justindu/Documents/个人网站建设"
```

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

访问：

```text
http://localhost:3000
```

构建检查：

```bash
npm run build
```

## 5. Git 常用操作

查看状态：

```bash
git status
```

提交：

```bash
git add .
git commit -m "update site"
git push origin main
```

Obsidian Git 的 `Commit-and-sync` 本质上就是帮你完成：

```text
git pull
git add
git commit
git push
```

## 6. VM 网站运维

### 6.1 登录 VM

```bash
ssh -i ~/.ssh/globalpilot_github_actions -p 64446 daviddu@36.50.14.11
```

进入项目：

```bash
cd /opt/globalpilot
```

### 6.2 查看网站容器

```bash
docker compose -f compose.npm.yml --env-file .env.production ps
```

查看日志：

```bash
docker compose -f compose.npm.yml --env-file .env.production logs --tail=100 app
```

健康检查：

```bash
curl -i http://127.0.0.1:3000/api/health
```

公网检查：

```bash
curl -I https://globalpilot.attodigitalhk.com
curl -I https://globalpilot.attodigitalhk.com/chat
```

### 6.3 手动部署

通常不需要手动部署，因为 VM 每 5 分钟会自动检查 GitHub 更新。

如需立即部署：

```bash
cd /opt/globalpilot
./deploy/vm-auto-pull-deploy.sh
```

如果只是重建当前版本：

```bash
docker compose -f compose.npm.yml --env-file .env.production up -d --build app
```

注意：不要在主站部署命令里加 `--remove-orphans`。Umami 和主站当前共用同一个目录项目名，主站 Compose 会把 Umami 容器识别成 orphan；如果清理 orphan，会导致 `analytics.globalpilot.attodigitalhk.com` 变成 504。

### 6.4 自动部署 timer

查看 timer：

```bash
systemctl list-timers globalpilot-auto-deploy.timer --no-pager
```

查看部署日志：

```bash
journalctl -u globalpilot-auto-deploy.service -n 100 --no-pager
```

启动 / 停止：

```bash
sudo systemctl enable --now globalpilot-auto-deploy.timer
sudo systemctl stop globalpilot-auto-deploy.timer
```

当前频率：

```text
OnUnitActiveSec=5min
```

## 7. Nginx Proxy Manager 配置

主站 Proxy Host：

```text
Domain Names: globalpilot.attodigitalhk.com
Scheme: http
Forward Hostname / IP: 36.50.14.11 或 NPM 可访问的 VM 地址
Forward Port: 3000
Websockets Support: On
Block Common Exploits: On
SSL: Request a new SSL Certificate
Force SSL: On
HTTP/2 Support: On
```

Umami Proxy Host：

```text
Domain Names: analytics.globalpilot.attodigitalhk.com
Scheme: http
Forward Hostname / IP: 36.50.14.11 或 NPM 可访问的 VM 地址
Forward Port: 3001
Websockets Support: On
Block Common Exploits: On
SSL: Request a new SSL Certificate
Force SSL: On
HTTP/2 Support: On
```

DNS 在 GoDaddy 中应指向 NPM 的公网入口 IP。

## 8. Mac mini Ollama 运维

### 8.1 当前用途

Mac mini 运行 Ollama，网站通过 Tailscale 访问本地模型。

当前模型：

```text
qwen3:8b
```

### 8.2 Mac mini 本机检查

```bash
which ollama
ollama --version
curl http://127.0.0.1:11434/api/tags
```

### 8.3 VM 测试 Mac mini Ollama

在 VM 上：

```bash
curl --max-time 10 http://100.76.12.21:11434/api/tags
```

如果无响应，优先检查：

- Mac mini 是否在线
- Tailscale 是否在线
- Ollama 是否监听 `0.0.0.0:11434`
- macOS 防火墙是否放行
- `launchd` 服务是否运行

### 8.4 Mac mini Ollama 开机自启

配置文件：

```text
deploy/macmini/com.globalpilot.ollama.plist
```

安装到 Mac mini：

```bash
mkdir -p ~/Library/LaunchAgents
cp deploy/macmini/com.globalpilot.ollama.plist ~/Library/LaunchAgents/
launchctl unload ~/Library/LaunchAgents/com.globalpilot.ollama.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.globalpilot.ollama.plist
launchctl start com.globalpilot.ollama
```

检查：

```bash
launchctl list | grep globalpilot
curl http://127.0.0.1:11434/api/tags
```

日志：

```text
/tmp/globalpilot-ollama.out.log
/tmp/globalpilot-ollama.err.log
```

## 9. Telegram Bot 运维

### 9.1 用途

网站 `/chat` 每轮对话会同步到 Telegram。系统会根据内容判断线索热度，例如：

- 是否留下邮箱、Telegram、微信、电话
- 是否提到合作、预算、报价、咨询、预约
- 是否有明确项目需求

### 9.2 获取 Chat ID

先给 Bot 发消息，然后访问：

```text
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

私聊 Chat ID 通常类似：

```json
"chat":{"id":977171198,"type":"private"}
```

群组 Chat ID 通常是负数。

### 9.3 VM 环境变量

配置在：

```text
/opt/globalpilot/.env.production
```

相关项：

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

修改后重建：

```bash
cd /opt/globalpilot
docker compose -f compose.npm.yml --env-file .env.production up -d --build app
```

## 10. Umami 访问统计

### 10.1 查看面板

打开：

```text
https://analytics.globalpilot.attodigitalhk.com
```

进入：

```text
Websites → GlobalPilot
```

不要被首页 `Dashboard is empty` 迷惑。那是自定义 Dashboard，不是网站数据页。

### 10.2 当前主站接入参数

主站页面已注入：

```text
https://analytics.globalpilot.attodigitalhk.com/script.js
```

Website ID：

```text
328beeba-d6f0-42e8-86d1-2a42fcb84372
```

VM 配置文件：

```text
/opt/globalpilot/.env.production
```

相关项：

```env
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://analytics.globalpilot.attodigitalhk.com/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=328beeba-d6f0-42e8-86d1-2a42fcb84372
```

### 10.3 Umami 容器运维

```bash
cd /opt/globalpilot
docker compose -f compose.umami.yml --env-file .env.umami ps
docker compose -f compose.umami.yml --env-file .env.umami logs --tail=100 umami
docker compose -f compose.umami.yml --env-file .env.umami logs --tail=100 umami-db
curl -I http://127.0.0.1:3001
```

不要输出 `.env.umami` 内容，它包含数据库密码和应用密钥。

### 10.4 已配置事件追踪

目前网站会向 Umami 发送这些事件：

```text
nav_click
cta_click
section_link_click
service_card_click
service_list_click
pathway_click
article_click
chat_message_sent
chat_response_received
chat_contact_intent
chat_error
```

查看路径：

```text
Websites → GlobalPilot → Events
```

说明：Chat 埋点不会记录用户聊天正文，只记录事件来源、按钮位置和是否出现联系方式/咨询意图。

## 11. 健康监控

### 11.1 当前监控

VM 每 5 分钟检查本地健康接口：

```text
http://127.0.0.1:3000/api/health
```

失败和恢复会通过 Telegram 告警。

### 11.2 查看 timer

```bash
systemctl list-timers globalpilot-health-check.timer --no-pager
```

查看日志：

```bash
journalctl -u globalpilot-health-check.service -n 100 --no-pager
```

手动执行：

```bash
sudo systemctl start globalpilot-health-check.service
```

## 12. 常见问题排障

### 12.1 `npm run dev` 报 `package.json` 找不到

说明当前终端不在项目目录。

先进入项目：

```bash
cd "/Users/justindu/Documents/个人网站建设"
npm run dev
```

### 12.2 主站打不开

按顺序检查：

```bash
curl -I https://globalpilot.attodigitalhk.com
```

VM 上：

```bash
cd /opt/globalpilot
docker compose -f compose.npm.yml --env-file .env.production ps
curl -i http://127.0.0.1:3000/api/health
```

如果 VM 正常、公网不正常，重点检查 Nginx Proxy Manager 和 DNS。

### 12.3 Chat 无回复

检查：

```bash
curl --max-time 10 http://100.76.12.21:11434/api/tags
docker compose -f compose.npm.yml --env-file .env.production logs --tail=100 app
```

优先确认 Mac mini Ollama 和 Tailscale。

### 12.4 Telegram 收不到消息

检查：

- Bot Token 是否正确
- Chat ID 是否正确
- Bot 是否在目标群组内
- 群组是否允许 Bot 接收消息
- VM 是否能访问 Telegram API

### 12.5 Umami 无数据

检查：

```bash
curl -I https://analytics.globalpilot.attodigitalhk.com/script.js
curl -s https://globalpilot.attodigitalhk.com | grep analytics.globalpilot.attodigitalhk.com/script.js
```

确认 Umami 后台网站 Domain 是：

```text
globalpilot.attodigitalhk.com
```

不要写成：

```text
https://globalpilot.attodigitalhk.com/
```

### 12.6 analytics 子域名 404 或 HTTPS SNI 错误

通常是 Nginx Proxy Manager 没有给 `analytics.globalpilot.attodigitalhk.com` 配 Proxy Host 或 SSL 证书。

检查：

- DNS 是否指向 NPM 入口 IP
- NPM 是否有 analytics 的 Proxy Host
- SSL 是否申请成功
- Forward Port 是否为 `3001`

## 13. 建议的下一步

优先级从高到低：

1. 优化 `/chat` 转化流程：增加需求类型、预算范围、联系方式引导。
2. 在 Umami 里定期观察 `cta_click`、`chat_contact_intent`、`article_click`。
3. 给核心文章增加底部 CTA，例如“用 AI 诊断我的网站”。
4. 增加案例页或项目页，把 GlobalPilot 网站本身作为第一个案例。
5. 建立每周内容节奏：每周 1 篇 SEO/GEO 文章，每月复盘一次数据。
