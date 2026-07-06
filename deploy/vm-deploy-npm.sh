#!/usr/bin/env sh
set -eu

APP_PORT="${APP_PORT:-3000}"

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
