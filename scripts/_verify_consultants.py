import paramiko, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('93.127.134.206', username='administrator', password='@Opinion007', timeout=30)

# 1. Check consultants exist
cmd1 = "sudo docker exec alo-postgres psql -U alo_admin -d alodoctor -c \"SELECT id, full_name, role_code FROM platform_users WHERE role_code = 'K'\""
stdin, stdout, stderr = c.exec_command(cmd1, get_pty=True)
out1 = stdout.read().decode('utf-8', errors='replace')
print('=== CONSULTANTS IN platform_users ===')
print(out1)

# 2. Check case consultant assignments
cmd2 = "sudo docker exec alo-postgres psql -U alo_admin -d alodoctor -c \"SELECT id, current_stage, stage, case_data->'consultant'->>'name' as consultant_name, case_data->'consultant'->>'center' as consultant_center FROM clinical_cases ORDER BY stage;\""
stdin, stdout, stderr = c.exec_command(cmd2, get_pty=True)
out2 = stdout.read().decode('utf-8', errors='replace')
print('=== CASE CONSULTANT ASSIGNMENTS ===')
print(out2)

c.close()
print("\n=== DONE ===")