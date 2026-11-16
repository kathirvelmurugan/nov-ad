#!/usr/bin/env bash
# ==============================================================================
# vps_git_setup.sh - runs ON the VPS as the repo owner (administrator).
#
# Enables `git push` from the server using the deploy key, WITHOUT changing the
# fetch URL. CI fetches over HTTPS from `origin`; only the push URL becomes SSH.
# Idempotent: safe to re-run.
# ==============================================================================
set -euo pipefail

REPO=/data/alodoctor/preview-sarat
SLUG=kathirvelmurugan/nov-ad
KEY=~/.ssh/github_novad

echo '=== ssh client config ==='
mkdir -p ~/.ssh; chmod 700 ~/.ssh
touch ~/.ssh/config; chmod 600 ~/.ssh/config
if ! grep -q 'IdentityFile ~/.ssh/github_novad' ~/.ssh/config; then
  printf 'Host github.com\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/github_novad\n  IdentitiesOnly yes\n' >> ~/.ssh/config
  echo 'added github.com host block'
else
  echo 'host block already present'
fi

echo
echo '=== github host key ==='
if ! ssh-keygen -F github.com >/dev/null 2>&1; then
  ssh-keyscan -t ed25519,rsa github.com >> ~/.ssh/known_hosts 2>/dev/null
  echo 'host key added'
else
  echo 'host key already trusted'
fi

echo
echo '=== push URL (fetch stays HTTPS for CI) ==='
cd "$REPO"
git remote set-url --push origin "git@github.com:${SLUG}.git"
git remote -v

echo
echo '=== commit identity ==='
echo "user.name : $(git config user.name || echo UNSET)"
echo "user.email: $(git config user.email || echo UNSET)"

echo
echo '=== auth test ==='
ssh -T -o BatchMode=yes git@github.com 2>&1 | head -3 || true

echo
echo '=== push dry-run ==='
git push --dry-run origin feature-sarat 2>&1 | head -10 || true