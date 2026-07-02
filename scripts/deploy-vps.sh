#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/faruk}"
DEPLOY_REF="${DEPLOY_REF:-origin/main}"
PORT="${PORT:-3000}"

cd "$APP_DIR"

git fetch --all --prune
git reset --hard "$DEPLOY_REF"

cat > .env <<EOF
GMAIL_USER=${GMAIL_USER:-farukz@gmail.com}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_REFRESH_TOKEN=${GOOGLE_REFRESH_TOKEN}
PORT=${PORT}
EOF

npm install --omit=dev

if command -v pm2 >/dev/null 2>&1; then
  pm2 restart faruk --update-env 2>/dev/null || pm2 start server.js --name faruk
  pm2 save 2>/dev/null || true
else
  pkill -f "node $APP_DIR/server.js" 2>/dev/null || true
  nohup node server.js >> /var/log/faruk.log 2>&1 &
fi

echo "Deploy concluido em $APP_DIR ($DEPLOY_REF)"
