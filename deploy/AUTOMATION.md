# GlobalPilot 自动化运维

## 1. GitHub Actions 自动部署到 VM

当前生产环境使用：

```text
GitHub main → Actions 校验构建 → SSH 到 VM → git pull → compose.npm.yml 重建
```

适配你的架构：

```text
Nginx Proxy Manager / FRP → VM:3000 → Next.js app
```

### 1.1 在 Mac 上创建 GitHub Actions 专用 SSH key

在你的 Mac 上执行：

```bash
ssh-keygen -t ed25519 -C "globalpilot-github-actions" -f ~/.ssh/globalpilot_github_actions
```

一路回车即可。它会生成：

```text
~/.ssh/globalpilot_github_actions      私钥，放到 GitHub Secret
~/.ssh/globalpilot_github_actions.pub  公钥，放到 VM
```

### 1.2 把公钥加入 VM

在 Mac 上查看公钥：

```bash
cat ~/.ssh/globalpilot_github_actions.pub
```

复制整行内容。

然后在 VM 上执行：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
```

把刚才复制的公钥追加进去，保存后执行：

```bash
chmod 600 ~/.ssh/authorized_keys
```

### 1.3 在 GitHub 仓库配置 Secrets

进入：

```text
GitHub repo → Settings → Secrets and variables → Actions → Secrets
```

添加：

```text
VPS_HOST       36.50.14.11
VPS_PORT       64446
VPS_USER       daviddu
VPS_APP_DIR    /opt/globalpilot
VPS_SSH_KEY    ~/.ssh/globalpilot_github_actions 私钥全文
```

查看私钥全文：

```bash
cat ~/.ssh/globalpilot_github_actions
```

从 `-----BEGIN OPENSSH PRIVATE KEY-----` 到 `-----END OPENSSH PRIVATE KEY-----` 全部复制。

### 1.4 开启自动部署开关

同一页面进入 **Variables**，添加：

```text
ENABLE_VPS_DEPLOY=true
```

设置前 GitHub Actions 只校验构建；设置后每次推送 `main` 都会部署到 VM。

### 1.5 首次验证

在 Mac 上测试专用 key 能否登录：

```bash
ssh -i ~/.ssh/globalpilot_github_actions -p 64446 daviddu@36.50.14.11 "cd /opt/globalpilot && ./deploy/vm-deploy-npm.sh"
```

成功后，未来 Obsidian Git `Commit-and-sync` 会触发：

```text
GitHub Actions → VM 自动拉取 → Docker 自动重建 → 网站上线
```

## 2. Mac mini Ollama 开机自启

当前网站已经通过 Tailscale 访问 Mac mini：

```text
OLLAMA_BASE_URL=http://100.76.12.21:11434
OLLAMA_MODEL=qwen3:8b
```

为了避免终端窗口关闭后 Ollama 停止，使用 macOS `launchd` 常驻运行。

### 2.1 安装 launchd 配置

在 Mac mini 上进入项目目录，或把本仓库中的 plist 复制过去，然后执行：

```bash
mkdir -p ~/Library/LaunchAgents
cp deploy/macmini/com.globalpilot.ollama.plist ~/Library/LaunchAgents/
launchctl unload ~/Library/LaunchAgents/com.globalpilot.ollama.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.globalpilot.ollama.plist
launchctl start com.globalpilot.ollama
```

如果当前终端里已有手动启动的 `ollama serve`，先按 `Ctrl + C` 停掉，或执行：

```bash
pkill ollama
launchctl start com.globalpilot.ollama
```

### 2.2 检查状态

```bash
launchctl list | grep globalpilot
curl http://127.0.0.1:11434/api/tags
curl http://100.76.12.21:11434/api/tags
```

VM 上也应成功：

```bash
curl --max-time 10 http://100.76.12.21:11434/api/tags
```

日志位置：

```text
/tmp/globalpilot-ollama.out.log
/tmp/globalpilot-ollama.err.log
```

### 2.3 停止或卸载

```bash
launchctl unload ~/Library/LaunchAgents/com.globalpilot.ollama.plist
rm ~/Library/LaunchAgents/com.globalpilot.ollama.plist
```
