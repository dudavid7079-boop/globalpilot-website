#!/usr/bin/env sh
set -eu

if [ -f .env.production ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.production
  set +a
fi

APP_PORT="${APP_PORT:-3000}"

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

TECHPULSE_PORT="${TECHPULSE_PORT:-8103}"
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

docker image prune -f
