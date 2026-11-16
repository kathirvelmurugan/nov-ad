import paramiko, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CONTAINER = 'alo-frontend'
NGINX_HTML = '/usr/share/nginx/html'

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=30)

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

# Check if tar.gz exists in container
print("=== CHECK TARBALL ===")
run(f'docker exec {CONTAINER} ls -la /tmp/dist_update.tar.gz')

# Clear old files and extract new ones
print("\n=== CLEARING OLD dist/ ===")
run(f'docker exec {CONTAINER} rm -rf {NGINX_HTML}/assets {NGINX_HTML}/index.html {NGINX_HTML}/favicon.svg')

print("\n=== EXTRACTING NEW BUILD ===")
run(f'docker exec {CONTAINER} tar -xzf /tmp/dist_update.tar.gz -C {NGINX_HTML}')

print("\n=== VERIFYING ===")
run(f'docker exec {CONTAINER} ls -la {NGINX_HTML}/')
run(f'docker exec {CONTAINER} ls {NGINX_HTML}/assets/')

# Cleanup
run(f'docker exec {CONTAINER} rm /tmp/dist_update.tar.gz')

c.close()
print("\n=== DONE === All changes deployed to nginx at port 3000")