import os, time, tarfile, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import paramiko

HOST = '93.127.134.206'
PORT = 22
USER = 'administrator'
PASSWORD = '@Opinion007'

print("1. Creating tarball (dist + server)...")
with tarfile.open("dist.tar.gz", "w:gz") as tar:
    if os.path.exists("dist"):
        tar.add("dist", arcname="dist")
    if os.path.exists("server"):
        tar.add("server", arcname="server")
print("   [OK] dist.tar.gz created")

print("2. Connecting to VPS...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)

def run_sudo(cmd):
    stdin, stdout, stderr = client.exec_command(f'echo "{PASSWORD}" | sudo -S {cmd}')
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

print("3. Uploading archive...")
sftp = client.open_sftp()
sftp.put("dist.tar.gz", "/tmp/dist.tar.gz")
sftp.close()
print("   [OK] Uploaded")

print("4. Extracting & syncing...")
run_sudo("rm -rf /tmp/deploy && mkdir -p /tmp/deploy && tar -xzf /tmp/dist.tar.gz -C /tmp/deploy")
run_sudo("docker cp /tmp/deploy/dist/. alo-preview-sarat:/app/dist/")
run_sudo("cp -r /tmp/deploy/dist/* /data/alodoctor/preview-sarat/dist/")
run_sudo("docker cp /tmp/deploy/server/. alo-preview-sarat:/app/server/")
run_sudo("cp -r /tmp/deploy/server/* /data/alodoctor/preview-sarat/server/")
print("   [OK] Synced to container + host volume")

print("5. Restarting container...")
out, err = run_sudo("docker restart alo-preview-sarat")
print(f"   {out}")
time.sleep(4)

print("6. Verifying...")
status, _ = run_sudo("docker ps --filter name=alo-preview-sarat --format '{{.Status}}'")
print(f"   Container: {status}")

# Check bundle hash
out, _ = run_sudo("docker exec alo-preview-sarat cat /app/dist/index.html")
m = re.search(r'index-([^"\s]+)\.js', out)
if m:
    print(f"   Active JS: index-{m.group(1)}.js")
    if 'BikwOIbv' in m.group(1):
        print("   [MATCH] Our fix build is LIVE!")
    else:
        print(f"   [MISMATCH] Expected BikwOIbv")

# Check container logs
out, _ = run_sudo("docker logs --tail 3 alo-preview-sarat 2>&1")
for line in out.split('\n'):
    if line.strip():
        clean = line.encode('ascii', errors='replace').decode('ascii')
        print(f"   LOG: {clean[:120]}")

client.close()
print("\n=== DEPLOY COMPLETE ===")