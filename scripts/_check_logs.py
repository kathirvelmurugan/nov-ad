import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=30)

s, o, e = c.exec_command('echo "@Opinion007" | sudo -S docker logs --tail 40 alo-preview-sarat 2>&1')
print(o.read().decode())
err = e.read().decode()
if err.strip() and 'password' not in err.lower():
    print("STDERR:", err)
c.close()