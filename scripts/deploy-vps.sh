#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/faruk}"
DEPLOY_REF="${DEPLOY_REF:-origin/main}"
PORT="${PORT:-3000}"

cd "$APP_DIR"

ensure_node() {
  if command -v npm >/dev/null 2>&1; then
    return 0
  fi

  echo "Installing npm on VPS..."
  export DEBIAN_FRONTEND=noninteractive
  apt-get update
  apt-get install -y npm

  if ! command -v npm >/dev/null 2>&1; then
    echo "npm still not found after apt-get install" >&2
    exit 127
  fi
}

cat > .env <<EOF
GMAIL_USER=${GMAIL_USER:-farukz@gmail.com}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_REFRESH_TOKEN=${GOOGLE_REFRESH_TOKEN}
PORT=${PORT}
EOF

ensure_node

rm -rf node_modules frontend/node_modules

npm ci --omit=dev
npm ci --prefix frontend
npm run build --prefix frontend

PDF_PUBLIC="frontend/public/assets/Faruk Zahra - CV - Resume.pdf"
PDF_DIST="frontend/dist/assets/Faruk Zahra - CV - Resume.pdf"
if [ -f "$PDF_PUBLIC" ]; then
  mkdir -p "$(dirname "$PDF_DIST")"
  cp -f "$PDF_PUBLIC" "$PDF_DIST"
fi

if command -v pm2 >/dev/null 2>&1; then
  pm2 restart faruk --update-env 2>/dev/null || pm2 start server.js --name faruk
  pm2 save 2>/dev/null || true
else
  pkill -f "node $APP_DIR/server.js" 2>/dev/null || true
  pkill -f "node server.js" 2>/dev/null || true
  sleep 1
  nohup node server.js >> /var/log/faruk.log 2>&1 &
fi

if [ -f /etc/caddy/Caddyfile ]; then
  python3 - "$PORT" <<'PY'
import re, sys, subprocess
port = sys.argv[1]
path = "/etc/caddy/Caddyfile"
content = open(path, encoding="utf-8").read()
block = f"""faruk.dev.br, www.faruk.dev.br {{
\tencode gzip zstd
\treverse_proxy 127.0.0.1:{port}
}}"""
new = re.sub(
    r"faruk\.dev\.br, www\.faruk\.dev\.br \{.*?\n\}",
    block,
    content,
    count=1,
    flags=re.DOTALL,
)
if new != content:
    open(path, "w", encoding="utf-8").write(new)
    subprocess.run(["systemctl", "reload", "caddy"], check=False)
PY
fi

echo "Deploy concluido em $APP_DIR ($DEPLOY_REF)"
