#!/usr/bin/env sh
# Sync Gmail OAuth from local .env → GitHub Secrets → VPS + restart.
# Run after: npm run google:auth
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== 1. Test refresh token ==="
node -e "
require('dotenv').config();
const { createOAuth2Client } = require('./lib/gmail');
createOAuth2Client().getAccessToken()
  .then(t => { if (!t.token) throw new Error('no access token'); console.log('OK: access token obtained'); })
  .catch(e => { console.error('FAIL:', e.message); process.exit(1); });
"

echo "=== 2. GitHub Secrets ==="
python scripts/setup-google-secrets.py

echo "=== 3. VPS .env + restart ==="
DEPLOY_KEY="${DEPLOY_KEY:-../financeiro/planos/vps-secrets/deploy_key}"
VPS_HOST="${VPS_HOST:-66.23.231.218}"
VPS_USER="${VPS_USER:-root}"

# shellcheck source=/dev/null
set -a
. ./.env
set +a

ssh -i "$DEPLOY_KEY" -o StrictHostKeyChecking=accept-new "$VPS_USER@$VPS_HOST" \
  "GMAIL_USER='$GMAIL_USER' GOOGLE_CLIENT_ID='$GOOGLE_CLIENT_ID' GOOGLE_CLIENT_SECRET='$GOOGLE_CLIENT_SECRET' GOOGLE_REFRESH_TOKEN='$GOOGLE_REFRESH_TOKEN' PORT='${PORT:-3000}' sh -s" <<'REMOTE'
set -eu
cd /opt/faruk
cat > .env <<EOF
GMAIL_USER=${GMAIL_USER}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_REFRESH_TOKEN=${GOOGLE_REFRESH_TOKEN}
PORT=${PORT}
EOF
pkill -f 'node server.js' 2>/dev/null || true
sleep 1
nohup node server.js >> /var/log/faruk.log 2>&1 &
sleep 2
ps aux | grep 'node server.js' | grep -v grep || (echo 'Node failed to start' >&2; exit 1)
echo 'VPS restarted'
REMOTE

echo "=== Done. Test: POST https://www.faruk.dev.br/api/send-resume ==="
