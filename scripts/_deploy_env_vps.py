import base64
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
env_path = ROOT / ".env"
deploy_key = ROOT.parent / "financeiro" / "planos" / "vps-secrets" / "deploy_key"

lines = [
    line
    for line in env_path.read_text(encoding="utf-8").splitlines()
    if line.startswith(
        (
            "GMAIL_USER=",
            "GOOGLE_CLIENT_ID=",
            "GOOGLE_CLIENT_SECRET=",
            "GOOGLE_REFRESH_TOKEN=",
            "PORT=",
        )
    )
]
content = "\n".join(lines) + "\n"
b64 = base64.b64encode(content.encode()).decode()

remote = (
    f"echo {b64} | base64 -d > /opt/faruk/.env && "
    "cd /opt/faruk && "
    "pkill -f 'node server.js' 2>/dev/null || true; "
    "sleep 1; "
    "nohup node server.js >> /var/log/faruk.log 2>&1 & "
    "sleep 2; "
    "ps aux | grep 'node server.js' | grep -v grep; "
    "tail -5 /var/log/faruk.log"
)

result = subprocess.run(
    [
        "ssh",
        "-i",
        str(deploy_key),
        "-o",
        "StrictHostKeyChecking=accept-new",
        "root@66.23.231.218",
        remote,
    ],
    text=True,
    capture_output=True,
)
print(result.stdout)
if result.stderr:
    print(result.stderr, file=sys.stderr)
sys.exit(result.returncode)
