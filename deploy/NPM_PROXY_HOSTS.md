# Nginx Proxy Manager Proxy Hosts

生产路径固定为：

```text
公网 DNS / FRP 入口
  -> Nginx Proxy Manager
  -> VM 本机端口
```

## 1. GlobalPilot 个人网站 / 博客

```text
Domain Names: globalpilot.attodigitalhk.com
Scheme: http
Forward Hostname / IP: VM 地址或 FRP 暴露给 NPM 的地址
Forward Port: 3000
Websockets Support: On
Block Common Exploits: On
```

SSL:

```text
Request a new SSL Certificate
Force SSL: On
HTTP/2 Support: On
```

## 2. TechPulse 科技脉动

```text
Domain Names: techpulse.attodigitalhk.com
Scheme: http
Forward Hostname / IP: VM 地址或 FRP 暴露给 NPM 的地址
Forward Port: 8103
Websockets Support: Off
Block Common Exploits: On
```

SSL:

```text
Request a new SSL Certificate
Force SSL: On
HTTP/2 Support: On
```

## 3. DNS

两个域名都指向 NPM 所在的公网入口 IP：

```text
globalpilot.attodigitalhk.com -> NPM_PUBLIC_IP
techpulse.attodigitalhk.com   -> NPM_PUBLIC_IP
```

如果 NPM 通过 FRP 访问 VM，DNS 仍然指向 NPM 公网入口，而不是 VM 内网地址。

## 4. VM 端口

`.env.production` 推荐保持：

```env
APP_BIND=127.0.0.1
APP_PORT=3000
TECHPULSE_BIND=127.0.0.1
TECHPULSE_PORT=8103
```

如果 NPM 不在同一台 VM，而是通过 FRP/内网访问 VM，需要把 bind 改为：

```env
APP_BIND=0.0.0.0
TECHPULSE_BIND=0.0.0.0
```

同时用防火墙或 FRP 规则只允许 NPM 入口访问这两个端口。
