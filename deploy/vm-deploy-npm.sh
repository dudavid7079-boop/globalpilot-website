#!/usr/bin/env sh
set -eu

if [ -f .env.production ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.production
  set +a
fi

APP_PORT="${APP_PORT:-3000}"
TECHPULSE_PORT="${TECHPULSE_PORT:-8103}"
TECHPULSE_PUBLIC_URL="${TECHPULSE_PUBLIC_URL:-https://techpulse.attodigitalhk.com}"
TECHPULSE_RELEASE_MARKER="${TECHPULSE_RELEASE_MARKER:-20260712-product-radar-v2}"
TECHPULSE_UMAMI_SCRIPT_URL="${TECHPULSE_UMAMI_SCRIPT_URL:-${NEXT_PUBLIC_UMAMI_SCRIPT_URL:-}}"
TECHPULSE_UMAMI_WEBSITE_ID="${TECHPULSE_UMAMI_WEBSITE_ID:-${NEXT_PUBLIC_UMAMI_WEBSITE_ID:-}}"

cat > youtube-ai-tech-aggregator/analytics-config.local.json <<EOF
{
  "scriptUrl": "${TECHPULSE_UMAMI_SCRIPT_URL}",
  "websiteId": "${TECHPULSE_UMAMI_WEBSITE_ID}"
}
EOF

docker compose -f compose.npm.yml --env-file .env.production up -d --build
docker compose -f compose.techpulse.yml --env-file .env.production up -d
docker compose -f compose.npm.yml --env-file .env.production ps
docker compose -f compose.techpulse.yml --env-file .env.production ps

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

for attempt in $(seq 1 20); do
  if curl --fail --silent --show-error "http://127.0.0.1:${TECHPULSE_PORT}/health.json" >/dev/null; then
    break
  fi
  if [ "$attempt" -eq 20 ]; then
    printf 'TechPulse health check failed after %s attempts\n' "$attempt" >&2
    exit 1
  fi
  sleep 2
done

verify_products_release() {
  url="$1"
  label="$2"
  page="$(curl --fail --silent --show-error "${url}/products.html?release=${TECHPULSE_RELEASE_MARKER}")"
  if ! printf '%s' "$page" | grep -Fq "$TECHPULSE_RELEASE_MARKER"; then
    printf '%s products page is stale: expected release marker %s at %s/products.html\n' \
      "$label" "$TECHPULSE_RELEASE_MARKER" "$url" >&2
    return 1
  fi
  printf '%s products page verified: %s\n' "$label" "$TECHPULSE_RELEASE_MARKER"
}

verify_products_release "http://127.0.0.1:${TECHPULSE_PORT}" "Local TechPulse"

if ! verify_products_release "$TECHPULSE_PUBLIC_URL" "Public TechPulse"; then
  printf '%s\n' \
    "Local files are current, but the public domain is serving another target or a stale proxy cache." \
    "Check the Nginx Proxy Manager forward host/port and the FRP mapping for ${TECHPULSE_PUBLIC_URL}." >&2
  exit 1
fi

docker image prune -f
