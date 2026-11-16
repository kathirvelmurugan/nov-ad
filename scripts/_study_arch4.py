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

print("=== SERVER INDEX.JS - static serving + API ===")
run('docker exec alo-preview-sarat grep -n "static\|dist\|express.static" /app/server/index.js')

print("\n=== Check if builder has our STAGE_CONFIG changes ===")
run('docker exec alo-builder grep -c "STAGE_CONFIG" /app/src/components/screens/superadmin/SuperAdminCasesTab.tsx 2>/dev/null || echo "0"')

print("\n=== Check if builder has our Latest Activity widget ===")
run('docker exec alo-builder grep -c "latestCase" /app/src/components/screens/SuperAdminPortalView.tsx 2>/dev/null || echo "0"')

c.close()