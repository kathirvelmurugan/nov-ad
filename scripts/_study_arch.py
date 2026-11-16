import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('93.127.134.206', port=22, username='administrator', password='@Opinion007')

def run(cmd):
    safe = 'echo "@Opinion007" | sudo -S ' + cmd
    stdin, stdout, stderr = client.exec_command(safe)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if err and 'password for' not in err.lower() and 'sudo' not in err.lower():
        print(f'  stderr: {err.strip()[:200]}')
    return out

print("=" * 60)
print("ARCHITECTURE STUDY: ad.howtostart.in")
print("=" * 60)

# 1. All containers
print("\n--- ALL RUNNING CONTAINERS ---")
out = run('docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"')
print(out)

# 2. Traefik routing
print("\n--- TRAEFIK ROUTING (who serves ad.howtostart.in?) ---")
out = run('docker exec coolify-proxy cat /etc/traefik/dynamic/alodoctor.yaml 2>/dev/null || echo "no alodoctor.yaml"')
print(out)

# Also check coolify proxy config
print("\n--- TRAEFIK DYNAMIC CONFIGS ---")
out = run('docker exec coolify-proxy ls /etc/traefik/dynamic/ 2>/dev/null')
print(out)

# 3. alo-frontend container details
print("\n--- alo-frontend: image, ports, volumes ---")
out = run('docker inspect alo-frontend --format "Image: {{.Config.Image}}\nPorts: {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}\nVolumes: {{range .Mounts}}{{.Source}}->{{.Destination}} {{end}}\nRestartPolicy: {{.HostConfig.RestartPolicy.Name}}"')
print(out)

# 4. alo-frontend nginx config
print("\n--- alo-frontend: nginx config ---")
out = run("docker exec alo-frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo 'no default.conf'")
print(out)

# 5. alo-frontend: what files are served?
print("\n--- alo-frontend: served files (root listing) ---")
out = run('docker exec alo-frontend ls -la /usr/share/nginx/html/')
print(out)

print("\n--- alo-frontend: index.html hash ---")
out = run('docker exec alo-frontend sh -c "grep -o \"index-[A-Za-z0-9]*\.js\" /usr/share/nginx/html/index.html" 2>/dev/null')
print(f'Active bundle: {out}')

# 6. alo-preview-sarat container details
print("\n--- alo-preview-sarat: image, ports ---")
out = run('docker inspect alo-preview-sarat --format "Image: {{.Config.Image}}\nPorts: {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}\nCmd: {{.Config.Cmd}}"')
print(out)

print("\n--- alo-preview-sarat: index.html hash ---")
out = run('docker exec alo-preview-sarat sh -c "grep -o \"index-[A-Za-z0-9]*\.js\" /app/dist/index.html" 2>/dev/null')
print(f'Active bundle: {out}')

# 7. Check if there's a volume mount that overrides the container files
print("\n--- HOST: any nginx/html volume mounts? ---")
out = run('ls -la /data/alodoctor/ 2>/dev/null')
print(out)

print("\n--- HOST: /var/lib/docker/volumes for alo-frontend? ---")
out = run('docker volume ls 2>/dev/null')
print(out)

client.close()