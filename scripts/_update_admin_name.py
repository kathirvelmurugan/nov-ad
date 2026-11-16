#!/usr/bin/env python3
"""Update Super Admin name in platform_users from Adrian Lewis to Rehmaan."""
import subprocess

sql = """
UPDATE platform_users SET full_name = 'Rehmaan' WHERE user_id = 'staff-ad-01' AND full_name = 'Adrian Lewis';
"""

proc = subprocess.run(
    ["sudo", "docker", "exec", "-i", "alo-postgres", "psql", "-U", "alo_admin", "-d", "alodoctor"],
    input=sql, capture_output=True, text=True
)

if proc.returncode == 0:
    out = (proc.stdout or "").strip()
    if out:
        print(out)
    print("SUCCESS: Super Admin name updated to Rehmaan in database.")
else:
    print(f"ERROR: {proc.stderr.strip()}")