#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/waimai-picker}"
SERVICE_NAME="${SERVICE_NAME:-waimai-picker-api}"
RELEASE_ARCHIVE="${1:-}"
RELEASE_ID="${2:-manual-$(date +%Y%m%d%H%M%S)}"
LOCK_FILE="${LOCK_FILE:-/tmp/waimai-picker-deploy.lock}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8787/api/health}"
DATABASE_FILE="$APP_DIR/apps/api/prisma/prod.db"
BACKUP_DIR="$APP_DIR/backups"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Another deployment is already running."
  exit 1
fi

if [ -n "$RELEASE_ARCHIVE" ]; then
  if [ ! -f "$RELEASE_ARCHIVE" ]; then
    echo "Release archive not found: $RELEASE_ARCHIVE"
    exit 1
  fi

  mkdir -p "$APP_DIR" "$BACKUP_DIR"

  if [ -f "$DATABASE_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/prod-before-${RELEASE_ID}.db"
    if command -v sqlite3 >/dev/null 2>&1; then
      sqlite3 "$DATABASE_FILE" ".backup '$BACKUP_FILE'"
    else
      cp "$DATABASE_FILE" "$BACKUP_FILE"
    fi
    echo "Database backup created: $BACKUP_FILE"
  fi

  tar -xzf "$RELEASE_ARCHIVE" -C "$APP_DIR"

  if [ ! -f "$APP_DIR/apps/api/dist/src/index.js" ]; then
    echo "Prebuilt API entrypoint is missing from the release archive."
    exit 1
  fi
  if [ ! -f "$APP_DIR/apps/miniapp/dist/build/h5/index.html" ]; then
    echo "Prebuilt H5 entrypoint is missing from the release archive."
    exit 1
  fi
fi

cd "$APP_DIR"

npm ci

if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.production.example apps/api/.env
  echo "Created apps/api/.env. Edit it before exposing the service publicly."
fi

npm run api:prisma:generate
npm run api:db:deploy

if [ -z "$RELEASE_ARCHIVE" ]; then
  npm run api:build
  npm --workspace apps/miniapp run build:h5
else
  echo "Using API and H5 artifacts built by GitHub Actions."
fi

if systemctl cat "${SERVICE_NAME}.service" >/dev/null 2>&1; then
  sudo -n systemctl restart "$SERVICE_NAME"
  sudo -n systemctl --no-pager --full status "$SERVICE_NAME" || true

  for attempt in $(seq 1 12); do
    if curl --fail --silent --show-error "$HEALTH_URL" >/dev/null; then
      echo "Deployment ${RELEASE_ID} is healthy."
      if [ -n "$RELEASE_ARCHIVE" ]; then
        rm -f "$RELEASE_ARCHIVE"
      fi
      exit 0
    fi
    echo "Health check attempt ${attempt}/12 failed; retrying in 5 seconds."
    sleep 5
  done

  echo "Deployment failed health checks. Recent service logs:"
  sudo -n journalctl -u "$SERVICE_NAME" -n 80 --no-pager || true
  exit 1
else
  echo "Systemd service ${SERVICE_NAME}.service is not installed."
  exit 1
fi
