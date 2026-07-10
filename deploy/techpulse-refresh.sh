#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/globalpilot}"
TECHPULSE_DIR="${TECHPULSE_DIR:-${APP_DIR}/youtube-ai-tech-aggregator}"
RSS_RECENT_HOURS="${RSS_RECENT_HOURS:-168}"

cd "$TECHPULSE_DIR"

if [ -f "${APP_DIR}/.env.production" ]; then
  set -a
  # shellcheck disable=SC1091
  . "${APP_DIR}/.env.production"
  set +a
fi

RSS_RECENT_HOURS="$RSS_RECENT_HOURS" node pipeline/run-real-preview.mjs
npm run prelaunch

echo "TechPulse refresh complete: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
