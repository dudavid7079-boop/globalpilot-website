#!/usr/bin/env sh
set -eu

APP_PORT="${APP_PORT:-3000}"

if [ -f .env.production ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.production
  set +a
fi

if [ -n "${NEXT_PUBLIC_UMAMI_SCRIPT_URL:-}" ] && [ -z "${NEXT_PUBLIC_UMAMI_WEBSITE_ID:-}" ]; then
  printf '%s\n' "NEXT_PUBLIC_UMAMI_SCRIPT_URL is set but NEXT_PUBLIC_UMAMI_WEBSITE_ID is empty. Refusing to deploy without analytics tracking." >&2
  exit 1
fi

if [ "${REQUIRE_TELEGRAM_SYNC:-true}" = "true" ]; then
  if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
    printf '%s\n' "REQUIRE_TELEGRAM_SYNC=true but TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is empty. Refusing to deploy without chat-to-Telegram sync." >&2
    exit 1
  fi
fi

docker compose -f compose.npm.yml --env-file .env.production up -d --build
docker compose -f compose.npm.yml --env-file .env.production ps

for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error "http://127.0.0.1:${APP_PORT}/api/health"; then
    printf '\n'
    break
  fi
  if [ "$attempt" -eq 30 ]; then
    printf 'GlobalPilot health check failed after %s attempts\n' "$attempt" >&2
    exit 1
  fi
  sleep 2
done

docker image prune -f
