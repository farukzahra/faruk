#!/usr/bin/env python3
"""
Configure GitHub Actions secrets for farukzahra/faruk via REST API.

Usage:
  set GITHUB_TOKEN=ghp_...   # PAT with repo scope
  python scripts/setup-github-secrets.py

Optional env vars (will prompt if missing):
  VPS_HOST, VPS_USER, VPS_PORT, VPS_SSH_KEY, DEPLOY_PATH

Notes:
  - GitHub never returns secret values; cannot copy from another repo automatically.
  - If financeiro already has the same secrets, reuse the same values here.
"""

from __future__ import annotations

import base64
import getpass
import json
import os
import sys
import urllib.error
import urllib.request

try:
    from nacl import encoding, public
except ImportError:
    print("Install dependency: pip install pynacl", file=sys.stderr)
    sys.exit(1)

OWNER = "farukzahra"
REPO = "faruk"
API = "https://api.github.com"


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
            "User-Agent": "faruk-setup-secrets",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


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
    print(f"  ok  secret {name}")


def set_variable(token: str, name: str, value: str) -> None:
    api_request(
        "POST",
        f"/repos/{OWNER}/{REPO}/actions/variables",
        token,
        {"name": name, "value": value},
    )
    print(f"  ok  variable {name}")


def prompt(name: str, secret: bool = False, default: str = "") -> str:
    env = os.environ.get(name, "").strip()
    if env:
        return env
    label = f"{name}"
    if default:
        label += f" [{default}]"
    if secret:
        value = getpass.getpass(f"{label}: ")
    else:
        value = input(f"{label}: ").strip()
    return value or default


def main() -> int:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        token = getpass.getpass("GitHub PAT (repo scope): ").strip()
    if not token:
        print("GITHUB_TOKEN is required.", file=sys.stderr)
        return 1

    try:
        key = api_request("GET", f"/repos/{OWNER}/{REPO}/actions/secrets/public-key", token)
    except urllib.error.HTTPError as err:
        print(f"GitHub API error: {err.read().decode()}", file=sys.stderr)
        return 1

    key_id = key["key_id"]
    public_key = key["key"]

    print(f"Configuring secrets for {OWNER}/{REPO} ...")

    vps_host = prompt("VPS_HOST")
    vps_user = prompt("VPS_USER", default="root")
    vps_port = prompt("VPS_PORT", default="22")
    deploy_path = prompt("DEPLOY_PATH", default="/var/www/faruk")
    vps_ssh_key = prompt("VPS_SSH_KEY", secret=True)

    required = {
        "VPS_HOST": vps_host,
        "VPS_SSH_KEY": vps_ssh_key,
    }
    optional = {
        "VPS_USER": vps_user,
        "VPS_PORT": vps_port,
        "DEPLOY_PATH": deploy_path,
    }

    for name, value in required.items():
        if not value:
            print(f"Missing required value: {name}", file=sys.stderr)
            return 1
        set_secret(token, name, value, key_id, public_key)

    for name, value in optional.items():
        if value:
            set_secret(token, name, value, key_id, public_key)

    print("\nDone. Test with: Actions -> Deploy VPS -> Run workflow")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
