import urllib.request
import urllib.parse
import re
import http.cookiejar
import sys
import os

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. GET /register
print("Fetching /register...")
resp = opener.open('http://127.0.0.1:8000/register')
html = resp.read().decode('utf-8')

token_match = re.search(r'name="_token" value="([^"]+)"', html)
if not token_match:
    token_match = re.search(r'name=\'_token\' value=\'([^\']+)\'', html)

if not token_match:
    print("Token not found in HTML!")
    sys.exit(1)

csrf = token_match.group(1)
print(f"CSRF token obtained: {csrf[:10]}...")

# 2. POST /register
admin_pw = os.environ.get('COOLIFY_ADMIN_PASSWORD')
if not admin_pw:
    print("Set COOLIFY_ADMIN_PASSWORD environment variable first (never hardcode secrets).")
    sys.exit(1)

payload = {
    '_token': csrf,
    'name': 'ALO Administrator',
    'email': 'admin@howtostart.in',
    'password': admin_pw,
    'password_confirmation': admin_pw
}

data = urllib.parse.urlencode(payload).encode('utf-8')

req = urllib.request.Request('http://127.0.0.1:8000/register', data=data, headers={
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'http://127.0.0.1:8000/register',
    'User-Agent': 'Mozilla/5.0'
})

try:
    resp2 = opener.open(req)
    print("Registration response URL:", resp2.geturl())
    print("Registration status code:", resp2.getcode())
    print("Successfully registered admin account!")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} {e.reason}")
    print(e.read().decode('utf-8')[:500])
