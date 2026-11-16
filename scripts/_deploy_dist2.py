import paramiko, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CONTAINER = 'alo-frontend'

print("=== CONNECTING TO VPS ===")
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=30)

def run(cmd, desc=''):
    print(f"  $ {desc or cmd}")
    s, o, e = c.exec_command(cmd, get_pty=True)
    out = o.read().decode('utf-8', errors='replace').strip()
    err = e.read().decode('utf-8', errors='replace').strip()
    for line in out.split('\n'):
        if line.strip():
            print(f"    {line.strip()}")
    if err and 'password for' not in err.lower():
        for line in err.split('\n'):
            if line.strip() and 'sudo' not in line.lower():
                print(f"    ERR: {line.strip()}")

# Check container status
print("\n=== CONTAINER STATUS ===")
run(f'echo "@Opinion007" | sudo -S docker ps -a --filter name={CONTAINER} --format "{{{{.Names}}}} {{{{.Status}}}}"', 'docker ps')

# Start container if stopped
print("\n=== STARTING CONTAINER ===")
run(f'echo "@Opinion007" | sudo -S docker start {CONTAINER}', f'docker start {CONTAINER}')

# Wait a moment
import time
time.sleep(2)

# Extract the dist files
print("\n=== EXTRACTING dist/ ===")
run(f'echo "@Opinion007" | sudo -S docker exec {CONTAINER} rm -rf /app/dist/*', 'rm old dist')
run(f'echo "@Opinion007" | sudo -S docker exec {CONTAINER} tar -xzf /tmp/dist_update.tar.gz -C /app/dist', 'extract tar.gz')
run(f'echo "@Opinion007" | sudo -S docker exec {CONTAINER} rm /tmp/dist_update.tar.gz', 'cleanup tgz')

# Verify
print("\n=== VERIFYING ===")
run(f'echo "@Opinion007" | sudo -S docker exec {CONTAINER} ls /app/dist/assets/', 'ls dist/assets/')
run(f'echo "@Opinion007" | sudo -S docker exec {CONTAINER} head -5 /app/dist/index.html', 'index.html snippet')

c.close()
print("\n=== DONE === Changes should now be live at port 3000")