# Umami 访问统计

GlobalPilot 推荐使用自托管 Umami 查看网站访问。

目标架构：

```text
analytics.globalpilot.attodigitalhk.com
→ Nginx Proxy Manager
→ VM:3001
→ Umami
```

网站统计脚本：

```text
https://analytics.globalpilot.attodigitalhk.com/script.js
```

## 1. 在 VM 启动 Umami

```bash
cd /opt/globalpilot
git pull --ff-only origin main
cp deploy/umami.env.example .env.umami
nano .env.umami
```

把下面两项改成强随机字符串：

```text
UMAMI_DB_PASSWORD=
UMAMI_APP_SECRET=
```

可以用下面命令生成：

```bash
openssl rand -hex 32
```

如果 Nginx Proxy Manager 和 Umami 不在同一台机器，或 NPM 需要通过 VM IP / FRP 访问 Umami，把：

```text
UMAMI_BIND=127.0.0.1
```

改成：

```text
UMAMI_BIND=0.0.0.0
```

启动：

```bash
docker compose -f compose.umami.yml --env-file .env.umami up -d
docker compose -f compose.umami.yml --env-file .env.umami ps
```

本机测试：

```bash
curl -I http://127.0.0.1:3001
```

## 2. Nginx Proxy Manager 配置

新增 Proxy Host：

```text
Domain Names: analytics.globalpilot.attodigitalhk.com
Scheme: http
Forward Hostname / IP: VM 地址或 FRP 暴露给 NPM 的地址
Forward Port: 3001
Websockets Support: On
Block Common Exploits: On
```

SSL 页面：

```text
Request a new SSL Certificate
Force SSL: On
HTTP/2 Support: On
```

GoDaddy DNS 中添加：

```text
Type: A
Name: analytics
Value: NPM 公网入口 IP
```

如果 `globalpilot.attodigitalhk.com` 和 `analytics.globalpilot.attodigitalhk.com` 都由同一个 NPM 入口管理，它们应指向同一个 NPM 公网 IP。

## 3. 初始化 Umami

打开：

```text
https://analytics.globalpilot.attodigitalhk.com
```

默认账号通常为：

```text
Username: admin
Password: umami
```

第一次登录后立刻修改密码。

然后创建网站：

```text
Name: GlobalPilot
Domain: globalpilot.attodigitalhk.com
```

Umami 会生成 `Website ID`。

## 4. 回填到 GlobalPilot 网站

编辑 VM 上的网站环境变量：

```bash
cd /opt/globalpilot
nano .env.production
```

填写：

```env
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://analytics.globalpilot.attodigitalhk.com/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=从 Umami 后台复制的网站 ID
TECHPULSE_UMAMI_SCRIPT_URL=https://analytics.globalpilot.attodigitalhk.com/script.js
TECHPULSE_UMAMI_WEBSITE_ID=TechPulse 对应的网站 ID，也可复用上面的 ID
```

然后重建网站：

```bash
docker compose -f compose.npm.yml --env-file .env.production up -d --build
```

如果只更新 TechPulse 静态站，可执行：

```bash
./deploy/vm-deploy-npm.sh
```

部署脚本会生成 `youtube-ai-tech-aggregator/analytics-config.local.json`，该文件不提交到 Git，只在服务器本机提供 Umami 配置。

也可以等待下一次 GitHub 更新触发自动部署。

## 5. 建议观察的指标

- 首页访问量
- `/services` 与具体服务页访问量
- `/blog/seo-geo-guide` 等文章访问量
- `/chat` 页面访问量
- 来源网站与国家/地区
- 新老访客变化
- TechPulse `video_original_click`：点击 YouTube 原站
- TechPulse `video_backup_route_click`：点击备用播放线路
- TechPulse `source_channel_click`：查看来源频道
- TechPulse `pricing_waitlist_click` / `subscription_save_click`：会员和订阅转化

后续可以再增加事件追踪，例如：

- 点击 Chat
- 点击 Email
- 点击服务详情
- 进入文章后点击 CTA
