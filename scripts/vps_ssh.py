#!/usr/bin/env python3
"""
vps_ssh.py — direct SSH runner for the nov-ad VPS.

Purpose: work on the server itself instead of waiting for the
push -> GitHub Actions -> docker rebuild loop.

Credentials are read from the git-ignored .env.local at the repo root.
Nothing secret is ever printed.

Usage:
    python scripts/vps_ssh.py                  # read-only state probe
    python scripts/vps_ssh.py "cmd"            # run one command
    python scripts/vps_ssh.py --sudo "cmd"     # run via sudo -S
    python scripts/vps_ssh.py --file script.sh # run a local shell script remotely
"""
import os
import sys
import posixpath

try:
    import paramiko
except ImportError:
    sys.exit("paramiko missing: python -m pip install paramiko")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(ROOT, ".env.local")


def load_env(path):
    env = {}
    if not os.path.exists(path):
        sys.exit(f"Missing {path}")
    with open(path, "r", encoding="utf-8-sig") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            env[key.strip()] = val.strip().strip('"').strip("'")
    return env


def connect(env):
    host = env.get("VPS_HOST_IP")
    user = env.get("VPS_SSH_USER")
    password = env.get("VPS_SSH_PASSWORD")
    if not (host and user and password):
        sys.exit("VPS_HOST_IP / VPS_SSH_USER / VPS_SSH_PASSWORD must be set in .env.local")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        hostname=host,
        username=user,
        password=password,
        timeout=25,
        banner_timeout=25,
        auth_timeout=25,
        look_for_keys=False,
        allow_agent=False,
    )
    return client


def run(client, command, sudo_passkey=None, timeout=900):
    if sudo_passkey:
        # Feed the sudo password on stdin; never echo it.
        command = "sudo -S -p '' bash -c " + shquote(command)
        stdin, stdout, stderr = client.exec_command(command, timeout=timeout, get_pty=False)
        stdin.write(sudo_passkey + "\n")
        stdin.flush()
        stdin.channel.shutdown_write()
    else:
        stdin, stdout, stderr = client.exec_command(command, timeout=timeout, get_pty=False)
        stdin.channel.shutdown_write()
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace")
    code = stdout.channel.recv_exit_status()
    return code, out, err


def shquote(s):
    return "'" + s.replace("'", "'\"'\"'") + "'"


PROBE = r"""
echo '=== IDENTITY ==='
whoami; hostname; uptime
echo
echo '=== TOOLCHAIN ==='
node -v 2>/dev/null || echo 'node: absent'
npm -v 2>/dev/null || echo 'npm: absent'
docker --version 2>/dev/null || echo 'docker: absent'
git --version
echo
echo '=== /data/alodoctor ==='
ls -la /data/alodoctor/ 2>/dev/null || echo 'path missing'
echo
echo '=== CONTAINERS ==='
docker ps --format '{{.Names}}|{{.Status}}|{{.Ports}}' 2>/dev/null || echo 'docker needs sudo'
echo
echo '=== REPO: preview-sarat ==='
if [ -d /data/alodoctor/preview-sarat/.git ]; then
  cd /data/alodoctor/preview-sarat
  echo "branch: $(git branch --show-current)"
  echo "head:   $(git log -1 --oneline)"
  echo 'remote:'; git remote -v | sed 's#://[^@]*@#://***@#g'
  echo 'dirty files (porcelain):'
  git status --porcelain | head -40
  echo "dirty count: $(git status --porcelain | wc -l)"
  echo 'vite base line:'; grep -n "base:" vite.config.ts || echo '  (no base: line)'
else
  echo 'not a git repo / missing'
fi
echo
echo '=== REPO: nov-ad (main) ==='
if [ -d /data/alodoctor/nov-ad/.git ]; then
  cd /data/alodoctor/nov-ad
  echo "branch: $(git branch --show-current)"
  echo "head:   $(git log -1 --oneline)"
  echo "dirty count: $(git status --porcelain | wc -l)"
else
  echo 'not a git repo / missing'
fi
echo
echo '=== GIT PUSH CREDENTIALS ON SERVER ==='
git config --global --get credential.helper || echo 'no global credential.helper'
ls -la ~/.git-credentials 2>/dev/null || echo 'no ~/.git-credentials'
ls -la ~/.ssh/ 2>/dev/null || echo 'no ~/.ssh'
echo
echo '=== DISK ==='
df -h /data /var/lib/docker 2>/dev/null | head -10
"""


def main():
    args = sys.argv[1:]
    env = load_env(ENV_PATH)
    sudo = "--sudo" in args
    if sudo:
        args.remove("--sudo")
    sudo_passkey = env.get("VPS_SUDO_PASSKEY") or env.get("VPS_SSH_PASSWORD") if sudo else None

    if "--file" in args:
        i = args.index("--file")
        local = args[i + 1]
        rest = args[i + 2:]
        with open(local, "r", encoding="utf-8") as fh:
            body = fh.read().replace("\r\n", "\n").replace("\r", "\n")
        # Positional args after --file become $1..$n inside the remote script.
        command = ("set -- " + " ".join(shquote(a) for a in rest) + "\n" + body) if rest else body
    elif args:
        command = " ".join(args)
    else:
        command = PROBE

    client = connect(env)
    try:
        code, out, err = run(client, command, sudo_passkey)
        if out:
            print(out)
        if err.strip():
            print("--- stderr ---")
            print(err)
        print(f"--- exit {code} ---")
        sys.exit(code)
    finally:
        client.close()


if __name__ == "__main__":
    main()