#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/globalpilot}"
TECHPULSE_DIR="${TECHPULSE_DIR:-${APP_DIR}/youtube-ai-tech-aggregator}"
RSS_RECENT_HOURS="${RSS_RECENT_HOURS:-168}"
NODE_IMAGE="${NODE_IMAGE:-node:22-alpine}"

cd "$TECHPULSE_DIR"

ENV_FILE="${APP_DIR}/.env.production"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$ENV_FILE"
  set +a
fi

if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  RSS_RECENT_HOURS="$RSS_RECENT_HOURS" node pipeline/run-real-preview.mjs
  npm run prelaunch
elif command -v docker >/dev/null 2>&1; then
  DOCKER_ENV_ARGS=""
  if [ -f "$ENV_FILE" ]; then
    DOCKER_ENV_ARGS="--env-file $ENV_FILE"
  fi

  # shellcheck disable=SC2086
  docker run --rm \
    --user "$(id -u):$(id -g)" \
    $DOCKER_ENV_ARGS \
    -e HOME=/tmp \
    -e npm_config_cache=/tmp/.npm \
    -e RSS_RECENT_HOURS="$RSS_RECENT_HOURS" \
    -v "${TECHPULSE_DIR}:/work" \
    -w /work \
    "$NODE_IMAGE" \
    sh -lc 'node pipeline/run-real-preview.mjs && npm run prelaunch'
else
  echo "Error: node/npm are not installed and docker is not available." >&2
  exit 127
fi

echo "TechPulse refresh complete: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
