# Sync Gmail OAuth from local .env -> GitHub Secrets -> VPS + restart.
# Run after: npm run google:auth
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "=== 1. Test refresh token ==="
node -e "require('dotenv').config(); const {createOAuth2Client}=require('./lib/gmail'); createOAuth2Client().getAccessToken().then(t=>{if(!t.token)throw new Error('no access token'); console.log('OK: access token obtained')}).catch(e=>{console.error('FAIL:', e.message); process.exit(1)})"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== 2. GitHub Secrets ==="
python scripts/setup-google-secrets.py
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== 3. VPS .env + restart ==="
$deployKey = if ($env:DEPLOY_KEY) { $env:DEPLOY_KEY } else { "C:\repo\financeiro\planos\vps-secrets\deploy_key" }
$vpsHost = if ($env:VPS_HOST) { $env:VPS_HOST } else { "66.23.231.218" }
$vpsUser = if ($env:VPS_USER) { $env:VPS_USER } else { "root" }

$envLines = Get-Content .env | Where-Object { $_ -match '^(GMAIL_USER|GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|GOOGLE_REFRESH_TOKEN|PORT)=' }
$envContent = ($envLines -join "`n") + "`n"
$tmpEnv = Join-Path $PSScriptRoot "tmp-vps.env"
$tmpSh = Join-Path $PSScriptRoot "tmp-vps-restart.sh"
[System.IO.File]::WriteAllText($tmpEnv, $envContent.Replace("`r`n", "`n"))
$sh = @"
cd /opt/faruk
node -e "require('dotenv').config(); const {createOAuth2Client}=require('./lib/gmail'); createOAuth2Client().getAccessToken().then(()=>console.log('VPS_TOKEN_OK')).catch(e=>{console.log('VPS_TOKEN_FAIL', e.message); process.exit(1)})"
pkill -f 'node server.js' 2>/dev/null || true
sleep 1
nohup node server.js >> /var/log/faruk.log 2>&1 &
sleep 2
ps aux | grep 'node server.js' | grep -v grep
tail -3 /var/log/faruk.log
"@
[System.IO.File]::WriteAllText($tmpSh, $sh.Replace("`r`n", "`n"))

scp -i $deployKey -o StrictHostKeyChecking=accept-new $tmpEnv "${vpsUser}@${vpsHost}:/opt/faruk/.env"
if ($LASTEXITCODE -ne 0) { exit 1 }
scp -i $deployKey $tmpSh "${vpsUser}@${vpsHost}:/tmp/restart-faruk.sh"
if ($LASTEXITCODE -ne 0) { exit 1 }
ssh -i $deployKey -o StrictHostKeyChecking=accept-new "${vpsUser}@${vpsHost}" "sh /tmp/restart-faruk.sh"
$sshExit = $LASTEXITCODE
Remove-Item -Force $tmpEnv, $tmpSh -ErrorAction SilentlyContinue
if ($sshExit -ne 0) { exit $sshExit }

Write-Host "=== Done. Test: POST https://www.faruk.dev.br/api/send-resume ==="
