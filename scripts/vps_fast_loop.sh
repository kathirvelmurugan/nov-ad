#!/usr/bin/env bash
# ==============================================================================
# vps_fast_loop.sh — runs ON the VPS (as root via sudo).
#
# Replaces the push -> GitHub Actions -> docker build loop with:
#   edit on server -> build in cached builder container -> hot-swap into the
#   running app container -> restart.  No image rebuild, no CI wait.
#
# Modes:
#   setup   one-time: create builder container + npm ci (cached on host repo)
#   build   npm run build inside the builder -> writes $REPO/dist
#   ship    copy dist/ + server/ into the running container and restart
#   all     build + ship + verify   (the normal inner loop)
#   status  show builder/app state and live vs built asset hash
# ==============================================================================
set -euo pipefail

REPO=/data/alodoctor/preview-sarat
APP=alo-preview-sarat
BUILDER=alo-builder
NODE_IMAGE=node:20-alpine
MODE="${1:-all}"

log() { printf '\n=== %s ===\n' "$*"; }

ensure_builder() {
  if ! docker ps -a --format '{{.Names}}' | grep -qx "$BUILDER"; then
    log "creating builder container"
    docker run -d --name "$BUILDER" --network coolify \
      -v "$REPO":/app -w /app "$NODE_IMAGE" sleep infinity >/dev/null
  fi
  if [ "$(docker inspect -f '{{.State.Running}}' "$BUILDER")" != "true" ]; then
    docker start "$BUILDER" >/dev/null
  fi
}

do_setup() {
  ensure_builder
  if [ ! -d "$REPO/node_modules" ]; then
    log "npm ci (one-time, cached into $REPO/node_modules)"
    docker exec "$BUILDER" npm ci --no-audit --no-fund
  else
    log "node_modules already cached — skipping npm ci"
  fi
  log "builder ready"
  docker exec "$BUILDER" node -v
  docker exec "$BUILDER" npm -v
}

do_build() {
  ensure_builder
  log "building dist/ (cached node_modules)"
  docker exec "$BUILDER" npm run build
  log "built assets"
  ls -1 "$REPO/dist/assets" | head -10
}

do_ship() {
  if [ ! -d "$REPO/dist" ]; then
    echo "ERROR: $REPO/dist missing — run build first" >&2
    exit 1
  fi
  log "hot-swapping dist/ + server/ into $APP"
  docker cp "$REPO/dist/." "$APP":/app/dist/
  docker cp "$REPO/server/." "$APP":/app/server/
  docker restart "$APP" >/dev/null
  sleep 3
  log "container logs"
  docker logs --tail 15 "$APP"
}

do_verify() {
  log "verify: live index.html vs built index.html"
  local built live
  built=$(grep -o 'assets/index-[^"]*\.js' "$REPO/dist/index.html" | head -1 || true)
  live=$(docker exec "$APP" grep -o 'assets/index-[^"]*\.js' /app/dist/index.html | head -1 || true)
  echo "built : ${built:-none}"
  echo "in-app: ${live:-none}"
  if [ -n "$built" ] && [ "$built" = "$live" ]; then
    echo "MATCH — running container serves the new build"
  else
    echo "MISMATCH — ship did not take effect" >&2
    return 1
  fi
  log "HTTP check through Traefik"
  curl -s -o /dev/null -w 'preview /feature-sarat/ -> %{http_code}\n' \
    -H 'Host: ad.howtostart.in' http://127.0.0.1/feature-sarat/ || true
}

do_status() {
  log "containers"
  docker ps --format '{{.Names}}|{{.Status}}' | grep -E "$APP|$BUILDER" || true
  log "repo"
  cd "$REPO"
  echo "branch: $(git branch --show-current)"
  echo "head:   $(git log -1 --oneline)"
  echo "dirty:"; git status --porcelain | head -20
  log "cached deps"
  [ -d "$REPO/node_modules" ] && du -sh "$REPO/node_modules" || echo 'node_modules: absent'
  [ -d "$REPO/dist" ] && echo 'dist: present' || echo 'dist: absent'
}

case "$MODE" in
  setup)  do_setup ;;
  build)  do_build ;;
  ship)   do_ship; do_verify ;;
  all)    do_build; do_ship; do_verify ;;
  status) do_status ;;
  *) echo "usage: $0 {setup|build|ship|all|status}" >&2; exit 2 ;;
esac