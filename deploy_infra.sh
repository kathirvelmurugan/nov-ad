#!/usr/bin/env bash
set -e

echo "=== 1. PREPARING DATA DIRS & PERMISSIONS ==="
mkdir -p /data/alodoctor/postgres_data /data/alodoctor/minio_data /data/alodoctor/minio_data/alo-medical-scans
chown -R 65532:65532 /data/alodoctor/minio_data
mv /tmp/docker-compose.infra.yml /data/alodoctor/docker-compose.yml

echo "=== 2. STARTING POSTGRES & MINIO CONTAINERS ==="
cd /data/alodoctor
docker compose pull
docker compose up -d

echo "=== 3. WAITING FOR SERVICES TO BE HEALTHY ==="
sleep 8
docker compose ps

echo "=== 4. TESTING POSTGRES CONNECTIVITY ==="
docker exec -i alo-postgres pg_isready -U alo_admin -d alodoctor

echo "=== 5. CHECKING MINIO CONSOLE STATUS ==="
curl -I -s http://127.0.0.1:9001 | head -5

echo "=== INFRASTRUCTURE READY ==="
