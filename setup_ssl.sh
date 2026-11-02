#!/usr/bin/env bash
set -e

echo "=== 1. ENSURING TRAEFIK LETSENCRYPT EMAIL IS CONFIGURED ==="
if ! grep -q 'certificatesresolvers.letsencrypt.acme.email' /data/coolify/proxy/docker-compose.yml; then
    sed -i '/certificatesresolvers.letsencrypt.acme.storage/a \      - '\''--certificatesresolvers.letsencrypt.acme.email=admin@howtostart.in'\''' /data/coolify/proxy/docker-compose.yml
fi
grep 'acme' /data/coolify/proxy/docker-compose.yml

echo "=== 2. CREATING DYNAMIC ROUTER FOR ad.howtostart.in ==="
cat << 'EOF' > /data/coolify/proxy/dynamic/alodoctor.yaml
http:
  routers:
    alodoctor-http:
      entryPoints:
        - http
      rule: Host(`ad.howtostart.in`)
      middlewares:
        - redirect-to-https
      service: alodoctor-dashboard

    alodoctor-https:
      entryPoints:
        - https
      rule: Host(`ad.howtostart.in`)
      tls:
        certResolver: letsencrypt
      service: alodoctor-dashboard

  middlewares:
    redirect-to-https:
      redirectScheme:
        scheme: https
        permanent: true

  services:
    alodoctor-dashboard:
      loadBalancer:
        servers:
          - url: 'http://coolify:8080'
EOF

echo "=== 3. RESTARTING TRAEFIK CONTAINER ==="
cd /data/coolify/proxy
docker compose down && docker compose up -d

echo "=== 4. WAITING FOR LETSENCRYPT CERTIFICATE ISSUANCE ==="
sleep 8
docker logs coolify-proxy 2>&1 | grep -iE "(acme|certificate|letsencrypt|ad.howtostart.in)" || true

echo "=== 5. CHECKING ACME STORAGE ==="
ls -lh /data/coolify/proxy/acme.json
