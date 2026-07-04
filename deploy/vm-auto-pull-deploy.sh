#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/globalpilot}"
BRANCH="${BRANCH:-main}"
LOCK_FILE="/tmp/globalpilot-auto-deploy.lock"

cd "$APP_DIR"

if ! mkdir "$LOCK_FILE" 2>/dev/null; then
  echo "Another deploy is already running."
  exit 0
fi
trap 'rmdir "$LOCK_FILE"' EXIT

git fetch origin "$BRANCH"

LOCAL_SHA="$(git rev-parse HEAD)"
REMOTE_SHA="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then
  echo "GlobalPilot is already up to date: $LOCAL_SHA"
  exit 0
fi

echo "Deploying GlobalPilot: $LOCAL_SHA -> $REMOTE_SHA"
git pull --ff-only origin "$BRANCH"
chmod +x deploy/vm-deploy-npm.sh
./deploy/vm-deploy-npm.sh
