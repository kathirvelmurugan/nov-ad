#!/usr/bin/env python3
"""
github_deploy_key.py - register the VPS deploy public key on the GitHub repo.

Reads the PAT from the git-ignored .env.local and the public key from the VPS
over SSH. The private key never leaves the server and no secret is printed.

Usage:
    python scripts/github_deploy_key.py            # add key with write access
    python scripts/github_deploy_key.py --list     # show existing deploy keys
"""
import json
import os
import sys
import urllib.request
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vps_ssh import load_env, connect, run, ENV_PATH  # noqa: E402

TITLE = "vps-alo-direct-push"


def gh(method, path, token, payload=None):
    url = "https://api.github.com" + path
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "Bearer " + token)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    req.add_header("User-Agent", "nov-ad-deploy-setup")
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


def main():
    env = load_env(ENV_PATH)
    token = env.get("GITHUB_PERSONAL_ACCESS_TOKEN")
    if not token:
        sys.exit("GITHUB_PERSONAL_ACCESS_TOKEN missing in .env.local")

    # Derive owner/repo from the configured remote URL.
    repo_url = env.get("GITHUB_REPO_URL") or "https://github.com/kathirvelmurugan/nov-ad.git"
    slug = repo_url.split("github.com")[-1].strip(":/").removesuffix(".git")
    if slug.count("/") != 1:
        sys.exit(f"Cannot parse owner/repo from {repo_url}")
    print(f"repo: {slug}")

    client = connect(env)
    try:
        code, out, err = run(client, "cat ~/.ssh/github_novad.pub")
        pubkey = out.strip()
        if code != 0 or not pubkey.startswith("ssh-"):
            sys.exit("Could not read public key from VPS: " + err.strip())
    finally:
        client.close()

    if "--list" in sys.argv:
        status, body = gh("GET", f"/repos/{slug}/keys", token)
        print(f"HTTP {status}")
        for k in body if isinstance(body, list) else []:
            print(f"  id={k['id']} read_only={k['read_only']} title={k['title']}")
        return

    status, body = gh("GET", f"/repos/{slug}/keys", token)
    if status == 200 and any(k.get("title") == TITLE for k in body):
        print(f"Deploy key '{TITLE}' already registered - nothing to do.")
        return
    if status != 200:
        print(f"HTTP {status} listing keys: {body.get('message')}")
        if status in (401, 403, 404):
            sys.exit(
                "PAT cannot manage deploy keys (needs admin:public_key / repo scope).\n"
                "Add this key manually at https://github.com/" + slug + "/settings/keys\n"
                "with 'Allow write access' ticked:\n\n" + pubkey
            )

    status, body = gh(
        "POST", f"/repos/{slug}/keys", token,
        {"title": TITLE, "key": pubkey, "read_only": False},
    )
    if status == 201:
        print(f"OK - deploy key registered (id={body.get('id')}, write access enabled).")
    else:
        print(f"HTTP {status}: {body.get('message')}")
        print("Add manually with write access:\n\n" + pubkey)
        sys.exit(1)


if __name__ == "__main__":
    main()