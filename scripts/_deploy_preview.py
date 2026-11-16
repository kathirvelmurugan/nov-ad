import paramiko, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('93.127.134.206', port=22, username='administrator', password='@Opinion007')

def run(cmd):
    safe = 'echo "@Opinion007" | sudo -S ' + cmd
    stdin, stdout, stderr = client.exec_command(safe)
    return stdout.read().decode('utf-8', errors='replace').strip()

# Upload
print('Uploading dist.tar.gz...')
sftp = client.open_sftp()
sftp.put('dist.tar.gz', '/tmp/dist.tar.gz')
sftp.close()

# Extract
run('mkdir -p /tmp/deploy')
run('tar -xzf /tmp/dist.tar.gz -C /tmp/deploy')

# Deploy to alo-preview-sarat (actual production container)
print('Copying to alo-preview-sarat:/app/dist/')
run('docker cp /tmp/deploy/dist/. alo-preview-sarat:/app/dist/')
run('docker cp /tmp/deploy/server/. alo-preview-sarat:/app/server/')

# Restart
print('Restarting alo-preview-sarat...')
run('docker restart alo-preview-sarat')
time.sleep(4)

# Verify
result = run('docker exec alo-preview-sarat sh -c "grep -o index-[A-Za-z0-9]*\.js /app/dist/index.html" 2>/dev/null')
print(f'Active bundle: {result}')

client.close()
print('Deploy complete — hard refresh ad.howtostart.in to see SA/IN country selector')