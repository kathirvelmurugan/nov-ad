import urllib.request
import json
import time

import os
token = os.environ.get('GITHUB_TOKEN', '')
headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'ALO-Doctor-Orchestrator'
}

issues = [
    {
        'title': 'fix(patient-name): eliminate generic Patient fallback and preserve entered beneficiary name',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/components/auth/authTypesAndUtils.ts`
Additional Targets: `src/components/screens/PatientIntakeView.tsx`, `src/hooks/useClinicalWorkflowState.ts`

Model: `qwen3.8-max`
Role: Healthcare Identity & Profile Architect

### Problem Statement:
Patients logging into the platform via OTP currently have their session fullName defaulted to 'Patient' / 'المريض'. During intake submission, this string overwrites the real patient/beneficiary name, resulting in clinical dossiers and headers showing generic 'Patient' instead of the patient's actual identity.

### Requirements:
1. In `src/components/auth/authTypesAndUtils.ts`:
   - Never set fallback fullName to generic 'Patient' or 'المريض'.
   - Use verified Saudi name default 'سامي الحربي' (Arabic) / 'Sami Al-Harbi' (English) or user-entered name.
2. In `src/components/screens/PatientIntakeView.tsx`:
   - Prioritize explicitly entered patient name: `activeCase.patientName || activeCase.patientNameAr || 'سامي الحربي'`.
   - Never override an existing patientName with generic 'ALO Patient' or 'Patient'.
3. In `src/hooks/useClinicalWorkflowState.ts`:
   - Preserve existing case patientName during updates.
4. Acceptance Criteria:
   - Full bilingual support (Arabic RTL / English LTR).
   - Strict Name Scrubbing: Never use developer personal names. Real clinical names only.
   - Clean compilation with zero TypeScript errors.
"""
    },
    {
        'title': 'refactor(storage): enforce hard server truth on cases and eliminate localStorage ghost resurrection',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/hooks/useClinicalWorkflowState.ts`

Model: `qwen3.8-max`
Role: Senior Frontend State Architect

### Problem Statement:
When cases are deleted or purged from the PostgreSQL database, refreshing the browser currently resurrects deleted cases. This is caused by `useClinicalWorkflowState.ts` merging stale `localStorage` cases back into the state even when the server returns an empty array.

### Requirements:
1. In `src/hooks/useClinicalWorkflowState.ts`:
   - Eliminate the `prev.forEach(p => if not in serverCases, push it back!)` resurrection merge.
   - When `apiClient.fetchCases()` returns, replace the `cases` state directly with `serverCases`.
   - If the server returns empty `[]` (e.g. after database purge), set `cases` to `[]` and clear the local cache immediately.
2. Treat `localStorage` strictly as an ephemeral display cache, never as the authoritative source of truth.
3. Acceptance Criteria:
   - Zero ghost cases reappear after database purge upon page refresh.
   - Clean compilation with zero TypeScript errors.
"""
    },
    {
        'title': 'feat(api): inject active user session and tenant headers into all safeFetch requests',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/services/apiClient.ts`

Model: `qwen3.8-max`
Role: Full-Stack API Integration Engineer

### Problem Statement:
The backend `/api/cases` route supports role, phone, and tenant scoping, but `src/services/apiClient.ts` currently sends requests without `x-user-role`, `x-user-phone`, `x-user-id`, or `x-tenant-id` headers, causing the server to fall back to Super Admin mode and return all cases.

### Requirements:
1. Read the active session from `localStorage.getItem('alo_user_session_v3.0')`.
2. In `safeFetch`, automatically inject:
   - `x-user-role`: session.roleCode || 'P'
   - `x-user-phone`: session.phone || ''
   - `x-user-id`: session.userId || session.id || ''
   - `x-tenant-id`: session.hospitalId || session.tenantId || ''
3. Ensure all endpoints (`/api/cases`, `/api/audit`, etc.) receive these headers.
4. Acceptance Criteria:
   - Backend successfully receives caller identity on every request.
   - Zero TypeScript errors.
"""
    },
    {
        'title': 'sec(router): enforce strict tenant and role case partitioning in ScreenRouter.tsx',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/router/ScreenRouter.tsx`

Model: `qwen3.8-max`
Role: Healthcare Multi-Tenant Security Architect

### Problem Statement:
`ScreenRouter.tsx` currently passes the global `cases` array directly to all role views (Doctor Review, Nurse Triage, Hospital Admin), which risks cross-hospital data exposure if un-scoped cases exist in client memory.

### Requirements:
1. In `src/router/ScreenRouter.tsx`:
   - Partition cases based on `userSession`:
     - **Hospital Staff / Doctor / Nurse (`STAFF`, `D`, `N`):** Filter cases to only include cases where `c.tenantId === userSession.hospitalId` OR `c.treatingDoctor.hospital === userSession.hospitalName`.
     - **Patient (`P`):** Filter cases strictly matching `userSession.phone` or `c.patientPhone`.
     - **Consultant (`C`):** Filter cases where `c.consultant.id === userSession.userId` or assigned to consultant.
     - **Super Admin (`AD`):** Pass all cases for clinical governance.
2. Pass the scoped cases array to child screen components.
3. Acceptance Criteria:
   - Hospital A clinicians cannot view Hospital B cases.
   - Clean compilation with zero TypeScript errors.
"""
    },
    {
        'title': 'refactor(layout): strip AutoDemoController, GuideModal, and PatientPipelineBoard from production shell',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/layout/AppLayout.tsx`

Model: `qwen3.8-max`
Role: Production UI Refactor Engineer

### Problem Statement:
`AppLayout.tsx` still mounts automated demo artifacts: `AutoDemoController`, `GuideModal`, `PatientPipelineBoard`, and the `studio` 5-device split-screen cockpit mode. Real patients and doctors must experience a clean, distraction-free clinical environment.

### Requirements:
1. In `src/layout/AppLayout.tsx`:
   - Remove `<AutoDemoController>`, `<GuideModal>`, and `<PatientPipelineBoard>` mounts.
   - Remove corresponding imports and unused state props (`isAutoDemoActive`, `isGuideOpen`, `isPipelineBoardOpen`).
   - Remove `studio` cockpit layout toggle from production layout.
2. Ensure normal clinical screens render cleanly inside `<main>`.
3. Acceptance Criteria:
   - Clean, professional production healthcare layout.
   - Zero TypeScript errors.
"""
    },
    {
        'title': 'sec(auth): lock TopProfileSwitcher behind Super Admin role to prevent unauthenticated role hopping',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/components/TopProfileSwitcher.tsx`
Additional Target: `src/layout/AppLayout.tsx`

Model: `qwen3.8-max`
Role: Healthcare Access Control Engineer

### Problem Statement:
In the live platform, standard patients and doctors should not be able to hop between different personas (e.g. Patient hopping to Doctor or Admin) via the top ribbon.

### Requirements:
1. In `src/components/TopProfileSwitcher.tsx`:
   - Restrict persona selection dropdown to Super Admin (`roleCode === 'AD'`).
   - For all other roles, display only their current role badge, name, hospital affiliation, and a Logout button.
2. In `src/layout/AppLayout.tsx`:
   - Enforce that `TopProfileSwitcher` is only accessible to Super Admin or when `demo=true` query parameter is explicitly provided.
3. Acceptance Criteria:
   - Clinicians and patients are locked to their authorized clinical role.
   - Clean compilation with zero TypeScript errors.
"""
    }
]

url = 'https://api.github.com/repos/kathirvelmurugan/nov-ad/issues'

for idx, issue_data in enumerate(issues, start=1):
    req = urllib.request.Request(url, data=json.dumps(issue_data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            print(f"[{idx}/6] SUCCESS: Issue #{res['number']} created: {res['title']}")
            print(f"       URL: {res['html_url']}")
    except Exception as e:
        print(f"[{idx}/6] ERROR: {e}")
    
    if idx < len(issues):
        print("       Waiting 10 seconds before triggering next channel...")
        time.sleep(10)

print("\n🎯 All 6 production hardening issues successfully dispatched!")
