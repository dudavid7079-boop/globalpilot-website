# VPS 首次部署

推荐环境：Ubuntu LTS、Docker Engine、Docker Compose plugin。VPS 防火墙只需开放 SSH、TCP 80、TCP/UDP 443。

## 1. GoDaddy DNS

添加 A 记录：

```text
Type: A
Name: globalpilot
Value: VPS_PUBLIC_IP
TTL: Default
```

确认 `globalpilot.attodigitalhk.com` 已解析到 VPS，再启动 Caddy。

## 2. 克隆并配置

```bash
sudo mkdir -p /opt/globalpilot
sudo chown "$USER":"$USER" /opt/globalpilot
git clone https://github.com/dudavid7079-boop/globalpilot-website.git /opt/globalpilot
cd /opt/globalpilot
cp deploy/env.production.example .env.production
nano .env.production
```

`.env.production` 不会提交到 Git。至少填写正式邮箱；AI Chat 上线前还需填写 Mac mini Ollama 地址。

## 3. 首次启动

```bash
docker compose --env-file .env.production up -d --build
docker compose ps
docker compose logs -f caddy
```

Caddy 会在 80/443 可访问且 DNS 正确后自动申请并续期 HTTPS。

## 4. GitHub 自动部署

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

不要把 `.env.production`、SSH 私钥或 Ollama 的 11434 端口公开到 GitHub/公网。
