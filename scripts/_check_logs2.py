import paramiko, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=30)

def run(cmd):
    s, o, e = c.exec_command(f'echo "@Opinion007" | sudo -S {cmd}')
    out = o.read().decode('utf-8', errors='replace')
    err = e.read().decode('utf-8', errors='replace')
    print(f"  $ {cmd}")
    if out.strip():
        for line in out.strip().split('\n'):
            print(f"    {line}")
    if err.strip() and 'password for' not in err:
        print(f"    ERR: {err.strip()}")
    return out

print("=== DOCKER LOGS ===")
run('docker logs alo-preview-sarat 2>&1 | tail -20')

print("\n=== CONTAINER STATUS ===")
run("docker ps -a --filter name=alo-preview-sarat --format '{{.Status}}'")

c.close()