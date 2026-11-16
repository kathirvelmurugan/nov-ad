import paramiko, sys, io, os, tarfile, tempfile

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DIST_DIR = r'c:\myapps\nov-ad\dist'
REMOTE_TGZ = '/tmp/dist_update.tar.gz'
CONTAINER = 'alo-preview-sarat'
DIST_PATH = '/app/dist'

print("=== PACKING dist/ ===")
tmp = tempfile.NamedTemporaryFile(suffix='.tar.gz', delete=False)
tmp.close()
with tarfile.open(tmp.name, 'w:gz') as tar:
    for root, dirs, files in os.walk(DIST_DIR):
        for f in files:
            full = os.path.join(root, f)
            arcname = os.path.relpath(full, DIST_DIR)
            tar.add(full, arcname=arcname)
            print(f"  + {arcname}")
print(f"  Packed: {os.path.getsize(tmp.name) / 1024:.1f} KB")

print("\n=== UPLOADING TO VPS ===")
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=30)

sftp = c.open_sftp()
with open(tmp.name, 'rb') as f:
    sftp.putfo(f, REMOTE_TGZ)
sftp.close()
print("  Done")

def run(cmd):
    print(f"  $ {cmd}")
    s, o, e = c.exec_command(f'echo "@Opinion007" | sudo -S {cmd}', get_pty=True)
    out = o.read().decode('utf-8', errors='replace').strip()
    err = e.read().decode('utf-8', errors='replace').strip()
    for line in out.split('\n'):
        if line.strip():
            print(f"    {line.strip()}")
    if err and 'password for' not in err.lower():
        for line in err.split('\n'):
            if line.strip() and 'sudo' not in line.lower():
                print(f"    ERR: {line.strip()}")

print(f"\n=== COPYING TO {CONTAINER} ===")
run(f'docker cp {REMOTE_TGZ} {CONTAINER}:/tmp/dist_update.tar.gz')

print("\n=== CLEARING OLD + EXTRACTING NEW ===")
run(f'docker exec {CONTAINER} rm -rf {DIST_PATH}/assets/* {DIST_PATH}/index.html {DIST_PATH}/favicon.svg')
run(f'docker exec {CONTAINER} tar -xzf /tmp/dist_update.tar.gz -C {DIST_PATH}')
run(f'docker exec {CONTAINER} rm /tmp/dist_update.tar.gz')

print("\n=== VERIFYING ===")
run(f'docker exec {CONTAINER} ls -la {DIST_PATH}/')
run(f'docker exec {CONTAINER} ls {DIST_PATH}/assets/')
run(f'docker exec {CONTAINER} head -3 {DIST_PATH}/index.html')

# Cleanup VPS
run(f'rm {REMOTE_TGZ}')

c.close()
os.unlink(tmp.name)
print("\n=== DEPLOYED to alo-preview-sarat === Ready at https://ad.howtostart.in")