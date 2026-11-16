import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('93.127.134.206', port=22, username='administrator', password='@Opinion007')

def run(cmd):
    safe = 'echo "@Opinion007" | sudo -S ' + cmd
    stdin, stdout, stderr = client.exec_command(safe)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if err and 'password' not in err.lower():
        print(f'  {err.strip()[:200]}')
    return out

# 1. Stop and remove alo-frontend (zombie nginx container)
print('=== Removing alo-frontend (old nginx, port 3000) ===')
out = run('docker stop alo-frontend')
print(f'  stop: {out}')
out = run('docker rm alo-frontend')
print(f'  rm: {out}')

# 2. Stop and remove alo-builder (idle build container)
print('=== Removing alo-builder (idle node:20-alpine) ===')
out = run('docker stop alo-builder')
print(f'  stop: {out}')
out = run('docker rm alo-builder')
print(f'  rm: {out}')

# 3. Remove old alo-frontend image
print('=== Removing old alo-frontend:latest image ===')
out = run('docker rmi alo-frontend:latest 2>&1 || echo "image kept or already gone"')
print(f'  rmi: {out}')

# 4. Prune build cache
print('=== Pruning build cache ===')
out = run('docker builder prune -f 2>&1 || echo "no build cache to prune"')
print(f'  prune: {out[:200]}')

# 5. Verify
print()
print('=== VERIFY: remaining containers ===')
out = run('docker ps --format "{{.Names}}"')
for name in out.split('\n'):
    name = name.strip()
    if name:
        print(f'  {name}')

client.close()
print()
print('Done. Only alo-preview-sarat + infrastructure remain.')