import paramiko, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

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

print("=== ALO-PREVIEW-SARAT CONTAINER ===")
run('docker inspect alo-preview-sarat --format "Image: {{.Config.Image}} | Cmd: {{.Config.Cmd}} | WorkingDir: {{.Config.WorkingDir}} | Ports: {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}"')
run('docker exec alo-preview-sarat ps aux 2>/dev/null || echo "cannot exec"')
run('docker exec alo-preview-sarat ls -la / 2>/dev/null | head -10')

print("\n=== ALO-BUILDER CONTAINER ===")
run('docker inspect alo-builder --format "Image: {{.Config.Image}} | Cmd: {{.Config.Cmd}} | WorkingDir: {{.Config.WorkingDir}}"')
run('docker exec alo-builder ps aux 2>/dev/null || echo "cannot exec"')
run('docker exec alo-builder ls /app/ 2>/dev/null | head -10')

print("\n=== NGINX CONFIG FILES ===")
run('docker exec alo-frontend ls /etc/nginx/conf.d/')
run('docker exec alo-frontend cat /etc/nginx/nginx.conf')

print("\n=== TRAEFIK DYNAMIC CONFIG ===")
run('cat /data/coolify/proxy/dynamic/alodoctor.yaml 2>/dev/null || echo "not found"')

c.close()