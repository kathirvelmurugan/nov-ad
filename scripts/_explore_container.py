import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('93.127.134.206', port=22, username='administrator', password='@Opinion007')

def run(cmd):
    safe = 'echo "@Opinion007" | sudo -S ' + cmd
    stdin, stdout, stderr = client.exec_command(safe)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

# Explore alo-frontend container structure
print('=== Container root listing ===')
out, err = run('docker exec alo-frontend ls -la /')
print(out)
print()

print('=== Find index.html anywhere in container ===')
out, err = run('docker exec alo-frontend find / -name "index.html" -type f 2>/dev/null')
print(out)
print()

print('=== Docker image history (what CMD runs) ===')
out, err = run('docker inspect alo-frontend --format "{{.Config.Cmd}}"')
print('CMD:', out)
print()

print('=== Working directory ===')
out, err = run('docker inspect alo-frontend --format "{{.Config.WorkingDir}}"')
print('WorkingDir:', out)
print()

print('=== Environment ===')
out, err = run('docker inspect alo-frontend --format "{{range .Config.Env}}{{.}}\n{{end}}"')
print(out)
print()

# Check preview container for comparison
print('=== Preview container /app ===')
out, err = run('docker exec alo-preview-sarat ls /app/')
print('Preview /app:', out)

client.close()