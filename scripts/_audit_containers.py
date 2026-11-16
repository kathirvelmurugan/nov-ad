import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('93.127.134.206', port=22, username='administrator', password='@Opinion007')

def run(cmd):
    safe = 'echo "@Opinion007" | sudo -S ' + cmd
    stdin, stdout, stderr = client.exec_command(safe)
    return stdout.read().decode('utf-8', errors='replace').strip()

print("=" * 70)
print("ALL CONTAINERS (running + stopped)")
print("=" * 70)
out = run('docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"')
print(out)
print()

print("=" * 70)
print("NETWORKS")
print("=" * 70)
out = run('docker network ls')
print(out)
print()

print("=" * 70)
print("DISK USAGE")
print("=" * 70)
out = run('docker system df')
print(out)

client.close()