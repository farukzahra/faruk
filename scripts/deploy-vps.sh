#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/faruk}"
DEPLOY_REF="${DEPLOY_REF:-origin/main}"

cd "$APP_DIR"

git fetch --all --prune
git reset --hard "$DEPLOY_REF"

echo "Deploy concluido em $APP_DIR ($DEPLOY_REF)"
