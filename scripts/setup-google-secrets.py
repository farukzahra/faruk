#!/usr/bin/env python3
"""
Set Gmail API secrets on GitHub Actions from local .env.

Usage:
  1. Add GITHUB_TOKEN=ghp_... to .env (PAT with repo scope)
  2. python scripts/setup-google-secrets.py

Reads from .env: GITHUB_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
GOOGLE_REFRESH_TOKEN, GMAIL_USER (optional).
"""

from __future__ import annotations

import base64
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

try:
    from nacl import encoding, public
except ImportError:
    print("Install dependency: pip install pynacl", file=sys.stderr)
    sys.exit(1)

OWNER = "farukzahra"
REPO = "faruk"
API = "https://api.github.com"
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


def load_env(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        values[key.strip()] = value.strip()
    return values


def api_request(method: str, path: str, token: str, body: dict | None = None) -> dict:
    url = f"{API}{path}"
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "faruk-setup-google-secrets",
        },
    )
    with urllib.request.urlopen(req) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw else {}


def encrypt_secret(public_key: str, secret_value: str) -> str:
    public_key_bytes = public.PublicKey(public_key.encode(), encoding.Base64Encoder())
    sealed_box = public.SealedBox(public_key_bytes)
    encrypted = sealed_box.encrypt(secret_value.encode("utf-8"))
    return base64.b64encode(encrypted).decode("utf-8")


def set_secret(token: str, name: str, value: str, key_id: str, public_key: str) -> None:
    encrypted = encrypt_secret(public_key, value)
    api_request(
        "PUT",
        f"/repos/{OWNER}/{REPO}/actions/secrets/{name}",
        token,
        {"encrypted_value": encrypted, "key_id": key_id},
    )
    print(f"  ok  {name}")


def main() -> int:
    env = load_env(ENV_PATH)
    token = os.environ.get("GITHUB_TOKEN", "").strip() or env.get("GITHUB_TOKEN", "").strip()
    if not token:
        print("Missing GITHUB_TOKEN.", file=sys.stderr)
        print("Add GITHUB_TOKEN=ghp_... to .env (see .env.example)", file=sys.stderr)
        return 1

    secrets = {
        "GOOGLE_CLIENT_ID": env.get("GOOGLE_CLIENT_ID", ""),
        "GOOGLE_CLIENT_SECRET": env.get("GOOGLE_CLIENT_SECRET", ""),
        "GOOGLE_REFRESH_TOKEN": env.get("GOOGLE_REFRESH_TOKEN", ""),
    }
    gmail_user = env.get("GMAIL_USER", "farukz@gmail.com")

    missing = [name for name, value in secrets.items() if not value]
    if missing:
        print(f"Missing in .env: {', '.join(missing)}", file=sys.stderr)
        print("Run npm run google:auth first if GOOGLE_REFRESH_TOKEN is empty.", file=sys.stderr)
        return 1

    try:
        key = api_request("GET", f"/repos/{OWNER}/{REPO}/actions/secrets/public-key", token)
    except urllib.error.HTTPError as err:
        body = err.read().decode()
        print(f"GitHub API error ({err.code}): {body}", file=sys.stderr)
        if err.code == 401:
            print("Token invalid or expired. Create a new PAT with repo scope.", file=sys.stderr)
        return 1

    print(f"Configuring Gmail secrets on {OWNER}/{REPO} ...")
    key_id = key["key_id"]
    public_key = key["key"]

    for name, value in secrets.items():
        set_secret(token, name, value, key_id, public_key)

    if gmail_user:
        set_secret(token, "GMAIL_USER", gmail_user, key_id, public_key)

    print("\nDone. Re-run deploy: Actions -> Deploy VPS -> Run workflow")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
