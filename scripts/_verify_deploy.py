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

print("=== index.html (check new build references) ===")
run(f'docker exec {CONTAINER} cat /app/dist/index.html')

print("\n=== CLEANING STALE CHUNKS ===")
# Keep only our new build files
NEW_FILES = 'index-DPCehIea.js index-DPkvGveg.css vendor-icons-1u4iYbqd.js vendor-livekit-Bjkx6DX0.js vendor-react-BXDnpwRI.js'
run(f'docker exec {CONTAINER} sh -c "cd /app/dist/assets && ls | grep -v -E \"^({NEW_FILES.replace(" ", "|")})$\" | xargs rm -f"')

print("\n=== AFTER CLEANUP ===")
run(f'docker exec {CONTAINER} ls /app/dist/assets/')

# Test that the server is serving the page
print("\n=== TESTING SERVER RESPONSE ===")
run(f'docker exec {CONTAINER} curl -s -o /dev/null -w "%{{http_code}}" http://localhost:80/ 2>/dev/null || echo "curl not available"')

c.close()