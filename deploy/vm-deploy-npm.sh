#!/usr/bin/env sh
set -eu

GLOBALPILOT_ENV_FILE="${GLOBALPILOT_ENV_FILE:-${ENV_FILE:-.env.globalpilot}}"
case "$GLOBALPILOT_ENV_FILE" in
  /*|./*|../*) ;;
  *) GLOBALPILOT_ENV_FILE="./${GLOBALPILOT_ENV_FILE}" ;;
esac
if [ ! -f "$GLOBALPILOT_ENV_FILE" ] && [ -f .env.production ]; then
  GLOBALPILOT_ENV_FILE="./.env.production"
fi

if [ ! -f "$GLOBALPILOT_ENV_FILE" ]; then
  printf 'GlobalPilot env file not found: %s\n' "$GLOBALPILOT_ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$GLOBALPILOT_ENV_FILE"
set +a

APP_PORT="${APP_PORT:-3000}"

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

ENV_FILE="$GLOBALPILOT_ENV_FILE" docker compose -f compose.npm.yml --env-file "$GLOBALPILOT_ENV_FILE" up -d --build
ENV_FILE="$GLOBALPILOT_ENV_FILE" docker compose -f compose.npm.yml --env-file "$GLOBALPILOT_ENV_FILE" ps

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

if [ -n "${INDEXNOW_KEY:-}" ]; then
  if command -v node >/dev/null 2>&1; then
    npm run seo:indexnow || printf '%s\n' "IndexNow submission failed; deployment remains healthy." >&2
  else
    docker run --rm \
      -v "$(pwd):/work" \
      -w /work \
      -e NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-}" \
      -e INDEXNOW_KEY="${INDEXNOW_KEY:-}" \
      -e INDEXNOW_ENDPOINT="${INDEXNOW_ENDPOINT:-}" \
      "${NODE_IMAGE:-node:22-alpine}" \
      node scripts/indexnow-submit.mjs || printf '%s\n' "IndexNow submission failed; deployment remains healthy." >&2
  fi
fi

docker image prune -f
