#!/bin/bash
set -e

echo "=== 1. Pulling Latest Code from GitHub ==="
mkdir -p /data/alodoctor
cd /data/alodoctor

if [ -d "nov-ad/.git" ]; then
    echo "Updating existing nov-ad repository..."
    cd nov-ad
    git fetch origin main
    git reset --hard origin/main
else
    echo "Cloning nov-ad repository..."
    git clone https://github.com/kathirvelmurugan/nov-ad.git
    cd nov-ad
fi

echo "=== 2. Building Production Docker Image ==="
docker build -t alo-frontend:latest .

echo "=== 3. Starting alo-frontend Container ==="
docker rm -f alo-frontend 2>/dev/null || true
docker run -d \
  --name alo-frontend \
  --restart always \
  --network coolify \
  -p 3000:80 \
  alo-frontend:latest

echo "=== 4. Configuring Traefik Dynamic Router for ad.howtostart.in ==="
cat << 'EOF' > /data/coolify/proxy/dynamic/alodoctor.yaml
http:
  routers:
    alodoctor-http:
      entryPoints:
        - http
      rule: "Host(`ad.howtostart.in`)"
      middlewares:
        - redirect-to-https
      service: alodoctor-service

    alodoctor-https:
      entryPoints:
        - https
      rule: "Host(`ad.howtostart.in`)"
      tls:
        certResolver: letsencrypt
      service: alodoctor-service

  services:
    alodoctor-service:
      loadBalancer:
        servers:
          - url: "http://alo-frontend:80"

  middlewares:
    redirect-to-https:
      redirectScheme:
        scheme: https
        permanent: true
EOF

echo "=== 5. Verifying Deployment ==="
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000
echo "=== Deployment Completed Successfully ==="
