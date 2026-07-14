# VPS / VM 首次部署

推荐环境：Ubuntu LTS、Docker Engine、Docker Compose plugin。

当前生产路径固定为 **FRP + Nginx Proxy Manager**。本项目在 VM 上只启动应用容器和 TechPulse 静态容器，不启动 Caddy；HTTP/HTTPS、证书和公网域名统一由 Nginx Proxy Manager 处理。

## FRP + Nginx Proxy Manager 模式

适用于：

- SSH 通过 FRP 暴露；
- `globalpilot.attodigitalhk.com` 指向 NPM 所在公网入口；
- `techpulse.attodigitalhk.com` 指向同一个 NPM 公网入口；
- NPM 再反向代理到运行网站的 VM。

### 1. 克隆并配置

```bash
sudo mkdir -p /opt/globalpilot
sudo chown "$USER":"$USER" /opt/globalpilot
git clone https://github.com/dudavid7079-boop/globalpilot-website.git /opt/globalpilot
cd /opt/globalpilot
cp deploy/env.production.example .env.production
nano .env.production
```

如果 NPM 和网站容器在同一台机器：

```text
APP_BIND=127.0.0.1
APP_PORT=3000
```

如果 NPM 在另一台机器，需要通过 VM IP 或 FRP 访问网站：

```text
APP_BIND=0.0.0.0
APP_PORT=3000
```

然后用防火墙或 FRP 规则限制来源，不要把内部服务随意开放给公网。

### 2. 启动网站应用

```bash
docker compose -f compose.npm.yml --env-file .env.production up -d --build
docker compose -f compose.npm.yml ps
curl -i http://127.0.0.1:3000/api/health
```

同时启动 TechPulse 静态站：

```bash
./deploy/vm-deploy-techpulse.sh
docker compose -f compose.techpulse.yml --env-file .env.production ps
curl -I http://127.0.0.1:8103/health.json
```

### 3. Nginx Proxy Manager 配置

也可以直接按 [`NPM_PROXY_HOSTS.md`](NPM_PROXY_HOSTS.md) 配置。

新增 Proxy Host：

```text
Domain Names: globalpilot.attodigitalhk.com
Scheme: http
Forward Hostname / IP: VM 地址或 FRP 暴露给 NPM 的地址
Forward Port: 3000
Websockets Support: On
```

SSL 页面：

```text
Request a new SSL Certificate
Force SSL: On
HTTP/2 Support: On
```

DNS 应指向 NPM 的公网入口 IP，而不是一定指向 VM 本机 IP。

再新增一个 TechPulse Proxy Host：

```text
Domain Names: techpulse.attodigitalhk.com
Scheme: http
Forward Hostname / IP: VM 地址或 FRP 暴露给 NPM 的地址
Forward Port: 8103
Websockets Support: Off
Block Common Exploits: On
```

SSL 页面同样开启：

```text
Request a new SSL Certificate
Force SSL: On
HTTP/2 Support: On
```

GoDaddy DNS 中添加：

```text
Type: A
Name: techpulse
Value: NPM 公网入口 IP
TTL: Default
```

## 备用方案：Caddy 直连模式

只有当你以后不用 Nginx Proxy Manager，且 VPS 自己直接承接 80/443 流量时，才使用 `compose.yml` 和 `deploy/Caddyfile`。当前继续使用 FRP + NPM，所以生产部署跳过这一节。

### 1. 克隆并配置

```bash
sudo mkdir -p /opt/globalpilot
sudo chown "$USER":"$USER" /opt/globalpilot
git clone https://github.com/dudavid7079-boop/globalpilot-website.git /opt/globalpilot
cd /opt/globalpilot
cp deploy/env.production.example .env.production
nano .env.production
```

`.env.production` 不会提交到 Git。至少填写正式邮箱；AI Chat 上线前还需填写 Mac mini Ollama 地址。

### 2. 首次启动

```bash
docker compose --env-file .env.production up -d --build
docker compose ps
docker compose logs -f caddy
```

Caddy 直连模式会在 80/443 可访问且 DNS 正确后自动为两个站点申请并续期 HTTPS：

- `globalpilot.attodigitalhk.com`：反向代理到 Next.js 个人网站 / 博客
- `techpulse.attodigitalhk.com`：直接托管 `youtube-ai-tech-aggregator` 静态站

## 4. GitHub 自动部署

当前 Nginx Proxy Manager / FRP 模式使用 `compose.npm.yml`，GitHub Actions 会调用：

```bash
./deploy/vm-deploy-npm.sh
```

完整配置步骤见 [`AUTOMATION.md`](AUTOMATION.md)。

在一台可信电脑上创建专用部署密钥：

```bash
ssh-keygen -t ed25519 -C "globalpilot-github-actions" -f globalpilot_deploy
```

把 `globalpilot_deploy.pub` 添加到 VPS 用户的 `~/.ssh/authorized_keys`，把私钥全文保存为 GitHub Actions Secret `VPS_SSH_KEY`。

在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：

```text
VPS_HOST       VPS 公网 IP
VPS_USER       VPS SSH 用户名
VPS_PORT       SSH 端口，通常为 22
VPS_SSH_KEY    专用部署私钥全文
VPS_APP_DIR    /opt/globalpilot
```

首次手动部署验证成功后，再在同一页面的 **Variables** 添加：

```text
ENABLE_VPS_DEPLOY=true
```

在设置此变量之前，GitHub 只执行校验与构建，不会尝试连接 VPS。

此后 Obsidian Commit-and-sync 推送到 `main` 后，GitHub 会先校验和构建；成功后 SSH 到 VPS，执行 fast-forward pull 和 Docker 滚动重建。

## 5. 常用运维

```bash
cd /opt/globalpilot
docker compose ps
docker compose logs --tail=200 app
docker compose logs --tail=200 caddy
docker compose --env-file .env.production up -d --build
```

Nginx Proxy Manager 模式下，TechPulse 单独查看：

```bash
cd /opt/globalpilot
docker compose -f compose.techpulse.yml ps
docker compose -f compose.techpulse.yml logs --tail=100 techpulse
./deploy/vm-deploy-techpulse.sh
```

不要把 `.env.production`、SSH 私钥或 Ollama 的 11434 端口公开到 GitHub/公网。

TechPulse 上线后的监控、每日 Top 20 自动刷新和公网校验见 [`TECHPULSE_OPERATIONS.md`](TECHPULSE_OPERATIONS.md)。
