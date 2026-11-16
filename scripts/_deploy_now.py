import paramiko, sys, io, os, tarfile, tempfile, time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = r'c:\myapps\nov-ad'
DIST_DIR = os.path.join(ROOT, 'dist')
SERVER_DIR = os.path.join(ROOT, 'server')
CONFIG_DIR = os.path.join(ROOT, 'config')
REMOTE_TGZ = '/tmp/deploy_novad.tar.gz'
CONTAINER = 'alo-preview-sarat'
VPS_HOST = '93.127.134.206'
VPS_USER = 'administrator'
VPS_PASS = '@Opinion007'

print("=== PACKING dist/ + server/ + config/ ===")
tmp = tempfile.NamedTemporaryFile(suffix='.tar.gz', delete=False)
tmp.close()
with tarfile.open(tmp.name, 'w:gz') as tar:
    # dist/
    for root, dirs, files in os.walk(DIST_DIR):
        for f in files:
            full = os.path.join(root, f)
            arcname = os.path.join('dist', os.path.relpath(full, DIST_DIR))
            tar.add(full, arcname=arcname)
    print(f"  dist/ packed")
    # server/
    for root, dirs, files in os.walk(SERVER_DIR):
        for f in files:
            full = os.path.join(root, f)
            arcname = os.path.join('server', os.path.relpath(full, SERVER_DIR))
            tar.add(full, arcname=arcname)
    print(f"  server/ packed")
    # config/
    for root, dirs, files in os.walk(CONFIG_DIR):
        for f in files:
            full = os.path.join(root, f)
            arcname = os.path.join('config', os.path.relpath(full, CONFIG_DIR))
            tar.add(full, arcname=arcname)
    print(f"  config/ packed")
print(f"  Total: {os.path.getsize(tmp.name) / 1024:.1f} KB")

print("\n=== CONNECTING TO VPS ===")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=22, username=VPS_USER, password=VPS_PASS, timeout=30)

def run(cmd, desc=''):
    prefix = f"  $ {desc or cmd}"
    print(prefix)
    stdin, stdout, stderr = client.exec_command(f'echo "{VPS_PASS}" | sudo -S {cmd}', get_pty=True)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    for line in out.split('\n'):
        if line.strip():
            print(f"    {line.strip()}")
    if err and 'password for' not in err.lower():
        for line in err.split('\n'):
            if line.strip() and 'sudo' not in line.lower():
                print(f"    ERR: {line.strip()}")

# 1. Upload tarball
print("\n=== UPLOADING ===")
sftp = client.open_sftp()
with open(tmp.name, 'rb') as f:
    sftp.putfo(f, REMOTE_TGZ)
sftp.close()
print("  Upload complete")

# 2. Extract on VPS
run('mkdir -p /tmp/deploy_novad')
run(f'tar -xzf {REMOTE_TGZ} -C /tmp/deploy_novad', 'extract tarball')

# 3. Copy dist assets into container
print("\n=== DEPLOYING dist/ ===")
run(f'docker exec {CONTAINER} rm -rf /app/dist/assets /app/dist/index.html /app/dist/favicon.svg')
run(f'docker cp /tmp/deploy_novad/dist/. {CONTAINER}:/app/dist/', 'copy dist to container')

# 4. Copy server files into container
print("\n=== DEPLOYING server/ ===")
run(f'docker cp /tmp/deploy_novad/server/. {CONTAINER}:/app/server/', 'copy server to container')

# 5. Copy config files into container
print("\n=== DEPLOYING config/ ===")
run(f'docker exec {CONTAINER} mkdir -p /app/config')
run(f'docker cp /tmp/deploy_novad/config/. {CONTAINER}:/app/config/', 'copy config to container')

# 6. Restart container
print("\n=== RESTARTING ===")
run(f'docker restart {CONTAINER}')
time.sleep(5)

# 7. Verify
print("\n=== VERIFYING ===")
run(f'docker exec {CONTAINER} ls /app/dist/assets/ | head -5', 'dist assets')
run(f'docker exec {CONTAINER} sh -c "grep -o index-[A-Za-z0-9]*\.js /app/dist/index.html" 2>/dev/null', 'active bundle hash')
run(f'docker exec {CONTAINER} ls /app/server/', 'server files')
run(f'docker exec {CONTAINER} ls /app/config/', 'config files')
run(f'docker ps --filter name={CONTAINER} --format "{{.Status}}"', 'container status')

# 8. Cleanup
run(f'rm -rf /tmp/deploy_novad {REMOTE_TGZ}')

# 9. Verify HTTP
print("\n=== HTTP CHECK ===")
stdin, stdout, stderr = client.exec_command('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:80 --header "Host: ad.howtostart.in"')
code = stdout.read().decode('utf-8', errors='replace').strip()
print(f"  HTTP status: {code}")

client.close()
os.unlink(tmp.name)
print("\n=== DEPLOY COMPLETE ===")
print("  Visit https://ad.howtostart.in (hard refresh: Ctrl+Shift+R)")