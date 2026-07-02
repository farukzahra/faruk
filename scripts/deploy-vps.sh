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

if ! command -v npm >/dev/null 2>&1; then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y npm
fi

npm ci --omit=dev
npm ci --prefix frontend
npm run build --prefix frontend

if command -v pm2 >/dev/null 2>&1; then
  pm2 restart faruk --update-env 2>/dev/null || pm2 start server.js --name faruk
  pm2 save 2>/dev/null || true
else
  pkill -f "node $APP_DIR/server.js" 2>/dev/null || true
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
