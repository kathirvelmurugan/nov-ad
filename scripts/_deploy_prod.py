import paramiko, time, os

HOST = '93.127.134.206'
USER = 'administrator'
PASSWORD = '@Opinion007'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=22, username=USER, password=PASSWORD)

def run(cmd):
    print(f'  $ {cmd}')
    safe_cmd = f'echo "{PASSWORD}" | sudo -S {cmd}'
    stdin, stdout, stderr = client.exec_command(safe_cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        for line in out.split('\n'):
            print(f'    {line.strip()}')
    if err and 'password for' not in err.lower():
        for line in err.split('\n'):
            if line.strip() and 'sudo' not in line.lower():
                print(f'    ERR: {line.strip()}')
    return out

# Upload
print('=== UPLOADING dist.tar.gz ===')
sftp = client.open_sftp()
sftp.put('dist.tar.gz', '/tmp/dist.tar.gz')
sftp.close()
print('  Done')

# Extract on VPS
print('=== EXTRACTING ===')
run('mkdir -p /tmp/deploy')
run('tar -xzf /tmp/dist.tar.gz -C /tmp/deploy')

# Copy to alo-frontend container (PRODUCTION)
print('=== DEPLOYING TO alo-frontend (PRODUCTION) ===')
run('docker cp /tmp/deploy/dist/. alo-frontend:/app/dist/')
run('docker cp /tmp/deploy/server/. alo-frontend:/app/server/')

# Restart container to flush nginx cache
print('=== RESTARTING ===')
run('docker restart alo-frontend')
time.sleep(4)

# Verify the active bundle
print('=== VERIFYING ===')
result = run('docker exec alo-frontend cat /app/dist/index.html')
if 'DE4zfyTS' in result:
    print('  VERIFIED: New bundle active (index-DE4zfyTS.js)')
elif result:
    import re
    js_match = re.search(r'index-([^"]+)\.js', result)
    if js_match:
        print(f'  ACTIVE JS: index-{js_match.group(1)}.js')
else:
    print('  Could not verify bundle')

client.close()
print('\n=== DEPLOYMENT COMPLETE ===')
print('  Production: https://ad.howtostart.in/')
print('  PhoneEntryStep with SA/IN country selector is now live.')