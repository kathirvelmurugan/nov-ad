import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=15)

def run(cmd):
    s, o, e = c.exec_command(cmd)
    out = o.read().decode('utf-8', errors='replace')
    err = e.read().decode('utf-8', errors='replace')
    if err:
        print(f"  stderr: {err.strip()}")
    return out

def sudo(cmd):
    return run(f"echo '@Opinion007' | sudo -S {cmd}")

print("=== PREVIEW CONTAINER INSPECT ===")
print(sudo('docker inspect alo-preview-sarat --format "Status: {{.State.Status}} | Image: {{.Config.Image}} | Ports: {{range $p, $v := .NetworkSettings.Ports}}{{$p}} -> {{(index $v 0).HostPort}} {{end}} | Networks: {{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}"'))

print("=== BUILDER CONTAINER INSPECT ===")
print(sudo('docker inspect alo-builder --format "Status: {{.State.Status}} | Image: {{.Config.Image}}"'))

print("=== TRAEFIK DYNAMIC CONFIG (routing) ===")
print(sudo('cat /data/coolify/proxy/dynamic/alodoctor.yaml 2>/dev/null || echo NOT_FOUND'))

print("=== LIVE INDEX.HTML (top 20 lines) ===")
print(run('curl -s https://ad.howtostart.in | head -20'))

print("=== PREVIEW-SARAT SOURCE ===")
print(run('ls /data/alodoctor/preview-sarat/ 2>/dev/null && echo "---" && cd /data/alodoctor/preview-sarat 2>/dev/null && git log --oneline -3 && git branch -a'))
print("If no output above, checking docker source...")
print(sudo('docker inspect alo-preview-sarat --format "{{range .Config.Env}}{{println .}}{{end}}" | grep -i source || echo no-source-env'))

print("=== WHAT IS ON PORT 3000? ===")
print(sudo('ss -tlnp | grep -E "3000|80|443"'))

c.close()