import paramiko, sys, io, os, tarfile, tempfile

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DIST_DIR = r'c:\myapps\nov-ad\dist'
REMOTE_TGZ = '/tmp/dist_update.tar.gz'
CONTAINER = 'alo-frontend'
CONTAINER_PATH = '/app/dist'

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
size_kb = os.path.getsize(tmp.name) / 1024
print(f"  Packed: {size_kb:.1f} KB")

print("\n=== UPLOADING TO VPS ===")
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=30)

sftp = c.open_sftp()
with open(tmp.name, 'rb') as f:
    sftp.putfo(f, REMOTE_TGZ)
sftp.close()
print("  Done")

print("\n=== DEPLOYING TO DOCKER CONTAINER ===")
cmds = [
    f'echo "@Opinion007" | sudo -S docker exec {CONTAINER} rm -rf {CONTAINER_PATH}/*',
    f'echo "@Opinion007" | sudo -S docker cp {REMOTE_TGZ} {CONTAINER}:/tmp/dist_update.tar.gz',
    f'echo "@Opinion007" | sudo -S docker exec {CONTAINER} tar -xzf /tmp/dist_update.tar.gz -C {CONTAINER_PATH}',
    f'echo "@Opinion007" | sudo -S docker exec {CONTAINER} rm /tmp/dist_update.tar.gz',
    f'echo "@Opinion007" | sudo -S docker exec {CONTAINER} ls {CONTAINER_PATH}/assets/',
]

for cmd in cmds:
    print(f"  $ {cmd}")
    s, o, e = c.exec_command(cmd, get_pty=True)
    out = o.read().decode('utf-8', errors='replace').strip()
    err = e.read().decode('utf-8', errors='replace').strip()
    if out:
        for line in out.split('\n'):
            print(f"    {line}")
    if err and 'sudo' not in err.lower():
        print(f"    ERR: {err}")

c.close()
os.unlink(tmp.name)
print("\n=== DONE ===")