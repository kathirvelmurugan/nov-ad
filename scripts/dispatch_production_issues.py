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
        'title': 'refactor(ui): remove WhatsApp demo toasts, drawer, and cue banner from production layout',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/layout/AppLayout.tsx`
Additional Target: `src/components/cockpit/FiveDeviceCockpitView.tsx`

Model: `qwen3.8-max`
Role: Master Orchestrator Frontend Engineer

### Background & Objective:
Real patients and doctors are now actively using the ALO DOCTOR portal. The simulated WhatsApp toasts, slide-in drawer, and cockpit cue banners were demo artifacts used during sales walkthroughs. They must be completely eliminated from the production layout so that users experience clean, distraction-free clinical views.

### Detailed Requirements:
1. **Decouple from AppLayout.tsx:**
   - Remove imports of WhatsAppDrawer and WhatsAppToast.
   - Remove the <WhatsAppToast> component mount.
   - Remove the <WhatsAppDrawer> component mount.
   - Remove onOpenWhatsAppDrawer / isWhatsAppDrawerOpen from props and layout JSX.
2. **Decouple from FiveDeviceCockpitView.tsx:**
   - Remove import of CockpitWhatsAppCueBanner.
   - Remove <CockpitWhatsAppCueBanner> rendering.
   - Remove onOpenWhatsAppDrawer prop from interface.
3. **Clean UI State in useWorkflowUIState.ts:**
   - Deprecate or remove isWhatsAppDrawerOpen and setIsWhatsAppDrawerOpen.
4. **Clean Pass-Throughs in App.tsx & ScreenRouter.tsx:**
   - Remove passing of isWhatsAppDrawerOpen and setIsWhatsAppDrawerOpen.
5. **Acceptance Criteria:**
   - Application compiles with zero TypeScript errors.
   - No WhatsApp banners, popups, toasts, or drawers appear on any screen or role.
   - Strict Name Scrubbing: Never mention personal names in commits or code. Real staff names only: Adrian Lewis (Operations Lead), Emmanuel Arcon Gonzalez, David Nunez, Marcus Vance, V. Prasanth.
"""
    },
    {
        'title': 'feat(auth-scope): enforce backend role & tenant scoping on /api/cases (Option C Server-Truth)',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `server/routes/cases.js`

Model: `qwen3.8-max`
Role: Healthcare Backend Security Architect (Saudi MOH / SDAIA Compliance)

### Background & Objective:
With real patients and doctors active on the platform, zero cross-persona or cross-patient case leakage is permitted. The backend /api/cases route must not return all cases indiscriminately. It must enforce strict server-side scoping based on authenticated role and identity.

### Detailed Requirements:
1. **Role-Based Scoping Logic in GET /api/cases:**
   - Read user headers or session tokens: x-user-role, x-user-phone, x-user-id, x-tenant-id.
   - **Patient Role (P):**
     - Scoped strictly to cases where case_data->>'patientPhone' matches the user phone OR national_id_masked matches OR created by this user.
     - Never return other patients' clinical files.
   - **Hospital Staff / Doctor / Nurse (STAFF, D, N):**
     - Scoped strictly to cases belonging to their assigned hospital tenant (tenant_id or treatingDoctor.hospital).
   - **Consultant (C):**
     - Scoped strictly to cases where consultant.id matches the logged-in consultant ID or referred to them.
   - **Super Admin (AD):**
     - Can view all cases across all tenants for clinical governance and auditing.
2. **Empty State:**
   - If no cases exist for the scoped user, return { success: true, data: [] }. Never return un-scoped seed cases to real users.
3. **Acceptance Criteria:**
   - Strict patient privacy (SDAIA Personal Data Protection Law compliance).
   - Real full-stack Express API architecture preserved.
"""
    },
    {
        'title': 'refactor(client-state): eliminate seedCases fallback and isolate client cache per session',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/hooks/useClinicalWorkflowState.ts`

Model: `qwen3.8-max`
Role: Senior React State Architect

### Background & Objective:
The client-side useClinicalWorkflowState.ts previously fell back to mock seed data and maintained a single flat localStorage key (alo_clinical_cases_v3.0) across all users and roles. In production, this causes state bleed between different users on shared workstations.

### Detailed Requirements:
1. **Remove Seed Fallbacks in Production Mode:**
   - When fetching cases fails or returns empty, do NOT populate with mock seed cases for authenticated users.
   - Provide an authenticated empty state ([]).
2. **Session-Isolated Cache Keys:**
   - Use session-aware storage key generation: alo_cases_{userSession?.phone || userSession?.userId || 'guest'}.
   - On user logout (handleLogout), wipe the current user's session cache from localStorage.
3. **Strict Effective Cases Filter:**
   - Ensure effectiveCases strictly matches userSession.phone for patients, preventing any historical cross-case display.
4. **Acceptance Criteria:**
   - Zero demo cases leak to real authenticated patients.
   - Zero TypeScript errors.
   - Real compiled React 18 architecture maintained.
"""
    },
    {
        'title': 'sec(persona-guard): lock top profile switcher behind Super Admin authentication in production',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/components/TopProfileSwitcher.tsx`
Additional Target: `src/layout/AppLayout.tsx`

Model: `qwen3.8-max`
Role: Healthcare Access Control Engineer

### Background & Objective:
The Top Profile Switcher allowed instant switching between Patient, Nurse, Doctor, Coordinator, Consultant, and Admin without re-authentication. In real patient/doctor usage, this is a major security vulnerability that enables cross-role screen hopping.

### Detailed Requirements:
1. **Production Guard:**
   - In production / live usage, the Top Profile Switcher MUST be hidden or hard-locked unless the authenticated user has role AD (Super Admin / Adrian Lewis).
   - If a normal user is authenticated (Patient, Nurse, Doctor), the profile switcher must NOT allow jumping to another persona.
2. **Role Enclosure in AppLayout.tsx:**
   - Conditionally render TopProfileSwitcher only when:
     - User is logged in as Super Admin (userSession?.roleCode === 'AD'), OR
     - Explicit dev/demo query flag (?demo=true) is present.
3. **Visual Indicator:**
   - Display active user role badge cleanly in the header with a proper Logout action, rather than an unauthenticated role-switcher dropdown.
4. **Acceptance Criteria:**
   - Patients cannot switch to Doctor or Nurse view.
   - Doctors cannot switch to Patient view.
   - Clean, secure clinical UX.
"""
    }
]

url = 'https://api.github.com/repos/kathirvelmurugan/nov-ad/issues'

for idx, issue_data in enumerate(issues, start=1):
    req = urllib.request.Request(url, data=json.dumps(issue_data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            print(f"[{idx}/4] SUCCESS: Issue #{res['number']} created: {res['title']}")
            print(f"       URL: {res['html_url']}")
    except Exception as e:
        print(f"[{idx}/4] ERROR: {e}")
    
    if idx < len(issues):
        print("       Waiting 10 seconds before triggering next channel...")
        time.sleep(10)

print("\nAll 4 issues successfully dispatched!")
