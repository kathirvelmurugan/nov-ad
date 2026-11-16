import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

LOCAL = r'c:\myapps\nov-ad\scripts\_update_admin_name.py'
REMOTE = '/tmp/_update_admin_name.py'

print("=== UPLOADING ===")
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=30)

sftp = c.open_sftp()
with open(LOCAL, 'rb') as f:
    sftp.putfo(f, REMOTE)
sftp.close()
print("  Done")

print("\n=== EXECUTING ===")
s, o, e = c.exec_command(
    'echo "@Opinion007" | sudo -S python3 /tmp/_update_admin_name.py 2>&1',
    get_pty=True
)

while True:
    line = o.readline()
    if not line:
        break
    print(line.rstrip())

err = e.read().decode('utf-8', errors='replace')
if err.strip():
    print(f"STDERR: {err.strip()}")

c.close()
print("\n=== DONE ===")