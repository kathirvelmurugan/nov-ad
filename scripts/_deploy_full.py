import paramiko, os, time

HOST = '93.127.134.206'
PORT = 22
USER = 'administrator'
PASSWORD = '@Opinion007'

print("=== CONNECTING ===")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASSWORD)

def run_sudo(cmd):
    print(f"  $ {cmd}")
    stdin, stdout, stderr = client.exec_command(f'echo "{PASSWORD}" | sudo -S {cmd}')
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        for line in out.split('\n'):
            print(f"    {line.strip()}")
    if err and 'password for' not in err.lower():
        for line in err.split('\n'):
            if line.strip() and 'sudo' not in line.lower():
                print(f"    ERR: {line.strip()}")
    return out

# 1. Upload the tarball
print("\n=== UPLOADING dist.tar.gz ===")
sftp = client.open_sftp()
sftp.put("dist.tar.gz", "/tmp/dist.tar.gz")
sftp.close()
print("  Done")

# 2. Extract into staging directory on VPS
print("\n=== EXTRACTING ===")
run_sudo("rm -rf /tmp/deploy && mkdir -p /tmp/deploy && tar -xzf /tmp/dist.tar.gz -C /tmp/deploy")

# 3. Synchronize BOTH container filesystem and host persistent volume
print("\n=== SYNCING TO CONTAINER + HOST VOLUME ===")
run_sudo("docker cp /tmp/deploy/dist/. alo-preview-sarat:/app/dist/")
run_sudo("mkdir -p /data/alodoctor/preview-sarat/dist && cp -r /tmp/deploy/dist/* /data/alodoctor/preview-sarat/dist/")
run_sudo("docker cp /tmp/deploy/server/. alo-preview-sarat:/app/server/")
run_sudo("mkdir -p /data/alodoctor/preview-sarat/server && cp -r /tmp/deploy/server/* /data/alodoctor/preview-sarat/server/")

# 4. Restart container to flush memory cache
print("\n=== RESTARTING CONTAINER ===")
run_sudo("docker restart alo-preview-sarat")
time.sleep(3)

# 5. Verify the active bundle hash
print("\n=== VERIFYING ===")
ip = run_sudo('docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" alo-preview-sarat').strip()
print(f"  Container IP: {ip}")

# Get the running index.html to verify
result = run_sudo(f"docker exec alo-preview-sarat cat /app/dist/index.html")
if 'index-DPCehIea.js' in result:
    print("  VERIFIED: Active bundle matches our new build (index-DPCehIea.js)")
elif result:
    import re
    js_match = re.search(r'index-([^"]+)\.js', result)
    if js_match:
        print(f"  ACTIVE JS: index-{js_match.group(1)}.js")
else:
    print("  Could not verify bundle")

# Cleanup
run_sudo("rm /tmp/dist.tar.gz /tmp/deploy -rf 2>/dev/null || true")

client.close()
print("\n=== DEPLOYMENT COMPLETE ===")
print("  Test at: https://ad.howtostart.in")