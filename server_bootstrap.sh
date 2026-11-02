#!/usr/bin/env bash
set -e

echo "=== 1. CONFIGURING 4GB SWAP ==="
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    grep -q 'vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf
else
    echo "Swapfile already exists."
fi
free -h

echo "=== 2. UPDATING REPOSITORIES & INSTALLING PACKAGES ==="
export DEBIAN_FRONTEND=noninteractive
apt update -y
apt install -y fail2ban ufw curl wget git htop ca-certificates

echo "=== 3. CONFIGURING FAIL2BAN (INTRUSION DEFENSE) ==="
cat << 'EOF' > /etc/fail2ban/jail.local
[DEFAULT]
bantime  = 86400
findtime = 600
maxretry = 5

[sshd]
enabled = true
port    = 22
mode    = aggressive
backend = systemd
EOF

systemctl enable fail2ban
systemctl restart fail2ban
fail2ban-client status sshd || true

echo "=== 4. CONFIGURING UFW FIREWALL ==="
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 8000/tcp comment 'Coolify'
ufw --force enable
ufw status verbose

echo "=== SERVER HARDENING COMPLETED SUCCESSFULLY ==="
