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
        'title': 'feat(coordinator): surface copiable consultant magic link and direct WhatsApp dispatch action',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/components/screens/CoordinatorPortalView.tsx`

Model: `qwen3.8-max`
Role: Senior Telehealth Operations Engineer

### Problem Statement:
When the ALO Coordinator verifies payment and moves a case to Stage 5 (WITH_CONSULTANT), the Coordinator needs to provide the International Consultant (in India) with immediate, frictionless access. Currently, the generated Consultant Magic Link is not visibly surfaced to the Coordinator.

### Requirements:
1. In `src/components/screens/CoordinatorPortalView.tsx`:
   - When activeCase is at `WITH_CONSULTANT` (or when payment is verified):
     - Generate the secure Magic Link URL:
       `${window.location.origin}/?magic_token=ML-${activeCase.id}-${Date.now().toString(36)}&caseId=${activeCase.id}&consultant=${encodeURIComponent(activeCase.consultant?.name || 'Consultant')}`
     - Display a dedicated "Consultant Access Dispatch (بوابة إرسال رابط الاستشاري)" card in the Coordinator dashboard:
       - Displays the full generated magic link in a styled monospace input box.
       - A prominent "📋 Copy Magic Link (نسخ الرابط)" button with visual copy feedback.
       - A "📲 Send via WhatsApp (إرسال عبر الواتساب)" button that opens a pre-composed WhatsApp message:
         `https://wa.me/?text=${encodeURIComponent('ALO Telehealth Dossier Dispatch: Please review case ' + (activeCase.caseNumber || activeCase.id) + ' via secure link: ' + magicUrl)}`
2. Bilingual Arabic RTL / English LTR with clean Cairo styling (#007B6E / #00C6AE).
3. Zero TypeScript errors.
"""
    },
    {
        'title': 'feat(workflow): enforce intermediate sub-stage persistence and micro-step validation',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/hooks/useClinicalWorkflowState.ts`
Additional Target: `src/hooks/useWorkflowStageTransitions.ts`

Model: `qwen3.8-max`
Role: Clinical Workflow State Architect

### Problem Statement:
Clinical cases often pause at intermediate "half-stages" (e.g., partial vitals recorded by nurse, draft focus questions by doctor, or draft opinion by consultant). If the user refreshes mid-stage, these micro-states must be preserved rather than reset to stage baseline.

### Requirements:
1. Ensure explicit sub-stage flags are preserved and persisted on every case update:
   - `triageComplete: boolean`
   - `referralApproved: boolean`
   - `focusQuestions: string[]`
   - `invoiceIssued: boolean`
   - `secondOpinionSubmitted: boolean`
   - `consultantNotes: string`
   - `saudiEndorsement: any`
2. When updating case fields, merge them immutably into `case_data` and trigger atomic backend sync.
3. Zero TypeScript errors.
"""
    },
    {
        'title': 'refactor(cases): decouple hardcoded doctor and consultant defaults from new patient cases',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/hooks/workflowConstants.ts`
Additional Target: `src/hooks/useClinicalWorkflowState.ts`

Model: `qwen3.8-max`
Role: Production Data Modeling Architect

### Problem Statement:
`DEFAULT_CONSULTANT` ("Dr. Pradeep Kumar") and `DEFAULT_TREATING_DOCTOR` ("د. عبدالله الشمري") are currently attached to all new draft cases by default. In live production, doctors and consultants must be assigned dynamically based on patient hospital selection and coordinator routing.

### Requirements:
1. In `src/hooks/workflowConstants.ts`:
   - Keep `DEFAULT_CONSULTANT` and `DEFAULT_TREATING_DOCTOR` only as optional reference templates, not automatic pre-fills.
2. In `createFreshDraftIntake` (`useClinicalWorkflowState.ts`):
   - New patient cases start with `treatingDoctor: undefined` and `consultant: undefined`.
   - Treating doctor is populated when the patient selects their hospital or when the Saudi doctor claims review.
   - Consultant is populated when the Coordinator assigns the referral.
3. Zero TypeScript errors.
"""
    },
    {
        'title': 'sec(rbac): standardize role codes CO (Coordinator) vs CN (Consultant) across matrix and router',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/router/ScreenRouter.tsx`
Additional Target: `src/data/rbacMatrix.ts`

Model: `qwen3.8-max`
Role: Healthcare Access Control Engineer

### Problem Statement:
Ambiguity between single-letter role codes (e.g. 'C' used interchangeably for Coordinator and Consultant, 'K' used for Consultant) creates confusion in access checks and router switches.

### Requirements:
1. Standardize role mappings:
   - ALO Coordinator is `CO` (supporting legacy `C` fallback).
   - International Consultant is `CN` (supporting legacy `K` fallback).
2. In `ScreenRouter.tsx`:
   - Both `CO` and `C` route strictly to `CoordinatorPortalView`.
   - Both `CN` and `K` route strictly to `ConsultantMobileView`.
3. In `rbacMatrix.ts`:
   - Ensure permissions for `CO` and `CN` are distinct and unambiguous.
4. Zero TypeScript errors.
"""
    },
    {
        'title': 'sec(session): implement atomic workspace cache wipe on user logout for shared clinical stations',
        'labels': ['ai-generate'],
        'body': """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/hooks/workflow/useWorkflowUIState.ts`
Additional Target: `src/App.tsx`

Model: `qwen3.8-max`
Role: Hospital Device Security Architect

### Problem Statement:
Hospital nurses and doctors frequently share physical workstations and tablets. When a staff member logs out, residual active case IDs, draft notes, or patient subview pointers must not bleed into the subsequent user's login.

### Requirements:
1. In `handleLogout`:
   - Atomically wipe all session-identifying and case-caching keys:
     - `alo_user_session_v3.0`
     - `alo_active_case_id_v3.0`
     - `alo_patient_subview_v3.0`
     - `alo_clinical_cases_v3.0`
     - All temporary draft intake keys.
   - Reset React state: `cases = []`, `activeCaseId = ''`, `userSession = null`.
   - Redirect cleanly to the public login / landing view.
2. Zero TypeScript errors.
"""
    }
]

url = 'https://api.github.com/repos/kathirvelmurugan/nov-ad/issues'

for idx, issue_data in enumerate(issues, start=1):
    req = urllib.request.Request(url, data=json.dumps(issue_data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            print(f"[{idx}/5] SUCCESS: Issue #{res['number']} created: {res['title']}")
            print(f"       URL: {res['html_url']}")
    except Exception as e:
        print(f"[{idx}/5] ERROR: {e}")
    
    if idx < len(issues):
        print("       Waiting 2 seconds before triggering next channel...")
        time.sleep(2)

print("\nAll 5 hardening issues successfully dispatched with 2s intervals!")
