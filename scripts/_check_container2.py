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
    if err and 'password for' not in err.lower() and 'sudo' not in err.lower():
        for line in err.split('\n'):
            if line.strip():
                print(f"    ERR: {line.strip()}")

print("=== ROOT FILESYSTEM ===")
run('docker exec alo-frontend ls -la /')
print("\n=== PROCESS LIST ===")
run('docker exec alo-frontend ps aux')
print("\n=== DOCKER INSPECT ===")
run('docker inspect alo-frontend --format "Image: {{.Config.Image}} | Cmd: {{.Config.Cmd}} | Entrypoint: {{.Config.Entrypoint}} | WorkingDir: {{.Config.WorkingDir}}"')

c.close()