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

CONTAINER = 'alo-preview-sarat'

print(f"=== {CONTAINER} - /app/dist/ ===")
run(f'docker exec {CONTAINER} ls -la /app/dist/')
run(f'docker exec {CONTAINER} ls /app/dist/assets/')

print(f"\n=== {CONTAINER} - server/index.js (static serving) ===")
run(f'docker exec {CONTAINER} head -30 /app/server/index.js')

print(f"\n=== {CONTAINER} - dist file timestamps ===")
run(f'docker exec {CONTAINER} ls -la /app/dist/index.html')

print("\n=== BUILDER - dist/ ===")
run('docker exec alo-builder ls -la /app/dist/')
run('docker exec alo-builder ls /app/dist/assets/')

c.close()