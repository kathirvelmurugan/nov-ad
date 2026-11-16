import paramiko, sys, io, os, tarfile, tempfile

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DIST_DIR = r'c:\myapps\nov-ad\dist'
REMOTE_TGZ = '/tmp/dist_update.tar.gz'
CONTAINER = 'alo-frontend'
NGINX_HTML = '/usr/share/nginx/html'

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

print("\n=== COPYING INTO CONTAINER ===")
run(f'docker cp {REMOTE_TGZ} {CONTAINER}:/tmp/dist_update.tar.gz')

print("\n=== DEPLOYING TO NGINX ===")
run(f'docker exec {CONTAINER} rm -rf {NGINX_HTML}/assets {NGINX_HTML}/index.html {NGINX_HTML}/favicon.svg')
run(f'docker exec {CONTAINER} tar -xzf /tmp/dist_update.tar.gz -C {NGINX_HTML}')
run(f'docker exec {CONTAINER} rm /tmp/dist_update.tar.gz')

print("\n=== VERIFYING ===")
run(f'docker exec {CONTAINER} ls -la {NGINX_HTML}/')
run(f'docker exec {CONTAINER} ls {NGINX_HTML}/assets/')

# Cleanup VPS temp
run(f'rm {REMOTE_TGZ}')

c.close()
os.unlink(tmp.name)
print("\n=== DONE === Changes live at http://93.127.134.206:3000")