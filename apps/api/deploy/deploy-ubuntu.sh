#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/waimai-picker}"
SERVICE_NAME="${SERVICE_NAME:-waimai-picker-api}"

cd "$APP_DIR"

npm ci

if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.production.example apps/api/.env
  echo "Created apps/api/.env. Edit it before exposing the service publicly."
fi

npm run api:prisma:generate
npm run api:db:deploy
npm run api:build

if systemctl list-unit-files | grep -q "^${SERVICE_NAME}.service"; then
  sudo systemctl restart "$SERVICE_NAME"
  sudo systemctl --no-pager --full status "$SERVICE_NAME"
else
  echo "Build complete. Install apps/api/deploy/waimai-picker-api.service.example as ${SERVICE_NAME}.service to run with systemd."
fi