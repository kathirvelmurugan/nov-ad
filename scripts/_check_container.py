import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('93.127.134.206', port=22, username='administrator', password='@Opinion007')

def run(cmd):
    safe = 'echo "@Opinion007" | sudo -S ' + cmd
    stdin, stdout, stderr = client.exec_command(safe)
    return stdout.read().decode().strip(), stderr.read().decode().strip()

# Check container files
print('=== Container /app/dist listing ===')
out, err = run('docker exec alo-frontend ls -la /app/dist/')
print(out)
print()

print('=== Index.html JS hash ===')
out, err = run('docker exec alo-frontend sh -c "grep -o index-[A-Za-z0-9]*\.js /app/dist/index.html || echo not-found"')
print(out)

# Check if there are old cached files
print()
print('=== All JS files in dist/assets ===')
out, err = run('docker exec alo-frontend sh -c "ls /app/dist/assets/index-*.js 2>/dev/null || echo no-js-files"')
print(out)

client.close()