#!/usr/bin/env sh
set -eu

APP_PORT="${APP_PORT:-3000}"

docker compose -f compose.npm.yml --env-file .env.production up -d --build --remove-orphans
docker compose -f compose.npm.yml --env-file .env.production ps

curl --fail --silent --show-error "http://127.0.0.1:${APP_PORT}/api/health"
printf '\n'

docker image prune -f
