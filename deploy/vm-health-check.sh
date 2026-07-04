#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/globalpilot}"
LOCAL_HEALTH_URL="${LOCAL_HEALTH_URL:-http://127.0.0.1:3000/api/health}"
PUBLIC_HEALTH_URL="${PUBLIC_HEALTH_URL:-https://globalpilot.attodigitalhk.com/api/health}"
STATE_FILE="${STATE_FILE:-/tmp/globalpilot-health-state}"

cd "$APP_DIR"

if [ -f .env.production ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.production
  set +a
fi

notify() {
  message="$1"
  if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
    echo "$message"
    return 0
  fi

  curl --fail --silent --show-error \
    -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{\"chat_id\":\"${TELEGRAM_CHAT_ID}\",\"text\":\"${message}\",\"disable_web_page_preview\":true}" >/dev/null
}

check_url() {
  name="$1"
  url="$2"
  curl --fail --silent --show-error --max-time 15 "$url" >/dev/null || {
    echo "$name failed: $url"
    return 1
  }
}

status="ok"
details=""

if ! output="$(check_url "local app" "$LOCAL_HEALTH_URL" 2>&1)"; then
  status="failed"
  details="${details}
- ${output}"
fi

if ! output="$(check_url "public site" "$PUBLIC_HEALTH_URL" 2>&1)"; then
  status="failed"
  details="${details}
- ${output}"
fi

previous="unknown"
[ -f "$STATE_FILE" ] && previous="$(cat "$STATE_FILE")"

if [ "$status" = "failed" ]; then
  echo "failed" > "$STATE_FILE"
  if [ "$previous" != "failed" ]; then
    notify "🚨 GlobalPilot health check failed${details}"
  fi
  exit 1
fi

echo "ok" > "$STATE_FILE"
if [ "$previous" = "failed" ]; then
  notify "✅ GlobalPilot recovered: local app and public site are healthy."
fi

echo "GlobalPilot health check ok."
