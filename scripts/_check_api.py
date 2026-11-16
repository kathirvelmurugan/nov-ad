import json

with open(r'C:\Users\Admin B\.qoder\cache\projects\nov-ad-8ac54354\agent-tools\5d9a13e8\0a26ffd8.txt', 'r', encoding='utf-8') as f:
    d = json.load(f)

cases = d.get('data', d) if isinstance(d, dict) else d
print(f"API returned: {len(cases) if isinstance(cases, list) else 'not a list'}")
if isinstance(cases, list):
    for c in cases[:15]:
        cid = c.get('id', '?')
        stage = c.get('currentStage', '?')
        pname = c.get('patientName', '?')
        print(f"  {cid} | {stage} | {pname}")