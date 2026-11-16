import paramiko, sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(f'echo "@Opinion007" | sudo -S {cmd}')
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

# Container status
print("=== CONTAINER STATUS ===")
out, _ = run("docker ps --filter name=alo-preview-sarat --format '{{.Status}}'")
print(f"  {out}")

# Bundle hash
print("\n=== BUNDLE VERIFICATION ===")
out, _ = run("docker exec alo-preview-sarat cat /app/dist/index.html")
m = re.search(r'index-([^"\s]+)\.js', out)
if m:
    hash_part = m.group(1)
    print(f"  Active JS: index-{hash_part}.js")
    if 'DPCehIea' in hash_part:
        print("  STATUS: Our new build is LIVE!")
    else:
        print(f"  STATUS: Different hash — may need redeploy")
else:
    print("  Could not determine bundle hash")

# Server logs (last 5 lines)
print("\n=== SERVER LOGS (last 5) ===")
out, _ = run("docker logs --tail 5 alo-preview-sarat 2>&1")
for line in out.split('\n'):
    if line.strip() and 'password' not in line.lower():
        # Skip encoding-problematic chars
        clean = line.encode('ascii', errors='replace').decode('ascii')
        print(f"  {clean}")

client.close()
print("\n=== READY for Playwright test ===")