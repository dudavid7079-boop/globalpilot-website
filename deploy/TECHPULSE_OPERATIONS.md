# TechPulse Production Operations

## Runtime data

Pipeline outputs such as `data.generated.js`, `product-data.generated.js`, and
`pipeline/*.real.json` are runtime files and are intentionally ignored by Git.
`deploy/vm-deploy-npm.sh` initializes missing files from demo/sample data before
containers start; the systemd refresh then replaces them with live data. This
keeps scheduled refreshes from making the deployment worktree dirty.

## 1. External Monitoring

Create one external monitor in UptimeRobot, Better Stack, or another uptime service:

```text
Monitor type: HTTPS
URL: https://techpulse.attodigitalhk.com/health.json
Expected status: 200
Interval: 1-5 minutes
Alert contacts: Telegram / Email
```

Optional page checks:

```text
https://techpulse.attodigitalhk.com/
https://techpulse.attodigitalhk.com/topics.html
https://techpulse.attodigitalhk.com/search.html
```

The VM internal health checker also supports public checks. In `/opt/globalpilot/.env.production`, set:

```env
PUBLIC_HEALTH_URL=https://globalpilot.attodigitalhk.com/api/health
TECHPULSE_PUBLIC_HEALTH_URL=https://techpulse.attodigitalhk.com/health.json
```

Then install or restart the health timer:

```bash
cd /opt/globalpilot
chmod +x deploy/vm-health-check.sh
sudo cp deploy/systemd/globalpilot-health-check.service /etc/systemd/system/
sudo cp deploy/systemd/globalpilot-health-check.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now globalpilot-health-check.timer
sudo systemctl start globalpilot-health-check.service
```

## 2. Daily Top 20 + Product Radar Refresh

Install the TechPulse daily refresh timer:

```bash
cd /opt/globalpilot
git pull --ff-only origin main
chmod +x deploy/techpulse-refresh.sh
sudo cp deploy/systemd/techpulse-refresh.service /etc/systemd/system/
sudo cp deploy/systemd/techpulse-refresh.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now techpulse-refresh.timer
sudo systemctl start techpulse-refresh.service
```

Check status:

```bash
systemctl list-timers techpulse-refresh.timer --no-pager
systemctl status techpulse-refresh.service --no-pager
journalctl -u techpulse-refresh.service -n 100 --no-pager
```

The refresh script runs:

```text
youtube-ai-tech-aggregator/pipeline/run-real-preview.mjs
youtube-ai-tech-aggregator/pipeline/collect-product-signals.mjs
youtube-ai-tech-aggregator/pipeline/build-products.mjs
youtube-ai-tech-aggregator/npm run prelaunch
```

`collect-product-signals.mjs` fetches GitHub and Hacker News signals for the product radar. Add these to `/opt/globalpilot/.env.production` when available:

```bash
GITHUB_TOKEN=...
PRODUCT_SIGNAL_TIMEOUT_MS=8000
```

`GITHUB_TOKEN` is optional but improves GitHub API rate limits. The current 2.0 MVP focuses on GitHub, HN, and video signals.

The VM does not need host Node.js installed. If `node` and `npm` are not available on the host, the script runs the same commands inside `node:22-alpine` with Docker.

It updates:

```text
youtube-ai-tech-aggregator/data.generated.js
youtube-ai-tech-aggregator/product-data.generated.js
youtube-ai-tech-aggregator/pipeline/product-signals.real.json
youtube-ai-tech-aggregator/pipeline/job-status.json
youtube-ai-tech-aggregator/pipeline/daily-digest.real.json
```

Because TechPulse is mounted into the static container from the host directory, no container restart is required after the JSON/JS data refresh.

If the service fails with Docker permission errors, make sure the service file was copied again after pulling latest code and then reload systemd:

```bash
sudo cp deploy/systemd/techpulse-refresh.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl reset-failed techpulse-refresh.service
sudo systemctl start techpulse-refresh.service
```

## 3. Launch Verification

Run the public verification script after NPM changes, deploys, or DNS updates:

```bash
cd /opt/globalpilot
chmod +x deploy/verify-techpulse-public.sh
TECHPULSE_PUBLIC_URL=https://techpulse.attodigitalhk.com ./deploy/verify-techpulse-public.sh
```

Expected final line:

```text
TechPulse public verification passed: https://techpulse.attodigitalhk.com
```
