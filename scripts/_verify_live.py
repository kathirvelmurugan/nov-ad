import paramiko, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(f'echo "@Opinion007" | sudo -S {cmd}')
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out: print(out)
    if err and 'password' not in err.lower(): print(f"ERR: {err.strip()}")
    return out

time.sleep(5)
print("=== CONTAINER STATUS ===")
run("docker ps --filter name=alo-preview-sarat --format '{{.Status}}'")

print("\n=== INDEX.HTML (bundle hash) ===")
result = run("docker exec alo-preview-sarat cat /app/dist/index.html")
import re
m = re.search(r'index-([^"\s]+)\.js', result)
if m:
    print(f"  ACTIVE BUNDLE: index-{m.group(1)}.js")
    if 'DPCehIea' in m.group(1):
        print("  MATCH: Our new build is live!")
    else:
        print("  MISMATCH: Old bundle still active")

print("\n=== DIST ASSETS ===")
run("docker exec alo-preview-sarat ls /app/dist/assets/ | grep index-DPCehIea")

print("\n=== HTTP CHECK ===")
run("curl -sI http://10.0.1.10:80/ 2>/dev/null | head -5 || docker exec alo-preview-sarat wget -qO- http://localhost:80/ 2>/dev/null | head -3 || echo 'no http client'")

client.close()