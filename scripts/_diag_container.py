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

# List all running containers
print('=== Running containers ===')
out, err = run('docker ps --format "{{.Names}} {{.Image}} {{.Ports}}"')
print(out)
if err:
    print('STDERR:', err)
print()

# Check alo-frontend structure
print('=== alo-frontend /app ===')
out, err = run('docker exec alo-frontend ls /app/')
print(out)
if err and 'No such container' in err:
    print('Container alo-frontend not found!')
elif err:
    print('STDERR:', err)
print()

# Check /tmp/deploy on VPS (did extraction work?)
print('=== /tmp/deploy contents ===')
out, err = run('ls /tmp/deploy/dist/ 2>/dev/null && echo "EXISTS" || echo "NOT FOUND"')
print(out)

client.close()