import urllib.request
import json

url = 'https://api.github.com/repos/kathirvelmurugan/nov-ad/issues'
import os
token = os.environ.get('GITHUB_TOKEN', '')

headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'ALO-Doctor-Orchestrator'
}

body_text = """### Technical Specification for Alibaba Cloud Qwen (qwen3.8-max)

Target Component: `src/components/intake/IntakePatientBeneficiarySection.tsx`

Model: `qwen3.8-max`
Role: Senior Clinical Healthcare Frontend Architect

### Clinical Background & Industry Standards (Saudi MOH / SDAIA / NPHIES / ALO DOCTOR v2.4):
In telemedicine platforms, the user logged into the app (Account Holder with verified phone +966 5x) is often a family caregiver submitting a case for an elderly parent or dependent child. The intake form must strictly distinguish between:
1. **Self-submission ('Me' / 'نفسي'):** The logged-in account holder is the clinical patient.
2. **Family dependent ('Family' / 'أحد أفراد الأسرة'):** The logged-in user is the legal proxy/caregiver, while the medical dossier belongs to the beneficiary.

### Detailed Functional Requirements:
1. **P13 Master Toggle:**
   - Prominent segmented pill or tab toggle at the top:
     - Option A: `[ Me (نفسي) ]`
     - Option B: `[ Family / Dependent (أحد أفراد الأسرة) ]`
2. **When 'Me' is Active:**
   - Display a verified account badge showing verified National ID / Iqama, full name, and mobile number.
   - Explanatory note: "Your case will be linked to your verified national digital health record."
   - Auto-sets `caregiver: { isProxy: false }`.
3. **When 'Family' is Active:**
   - Account holder's mobile number remains the billing, WhatsApp alert, and OTP communication anchor.
   - Form fields for the Patient (Beneficiary):
     - **Patient Full Name** (Text input, required, minimum 3 chars)
     - **Patient National ID / Iqama** (10-digit numeric input, formatted)
     - **Relationship to Account Holder** (Select dropdown: Parent / والد أو والدة, Child / ابن أو ابنة, Spouse / زوج أو زوجة, Legal Guardian / وصي شرعي)
     - **Age** (Number input) & **Gender** (Radio / toggle: Male / ذكر, Female / أنثى)
     - **P04 Legal Proxy Consent Checkbox:** "I declare under Saudi Health Data Protection Law that I am the authorized legal caregiver/family proxy for this patient."
4. **Props Interface:**
   - `activeCase: ClinicalCase`
   - `isAr: boolean`
   - `userSession?: UserSession | null`
   - `onUpdateCase: (updated: Partial<ClinicalCase>) => void`
5. **Styling & Accessibility:**
   - Tailwind CSS with full dark mode support.
   - Pinterest-teal theme (`#007B6E`, `#00C6AE`, `#E6FAF7`).
   - Dual-language Arabic RTL and English LTR using Cairo font.
   - Zero hardcoded mock bypasses. Strict Name Scrubbing: zero mention of developer personal names.

Please generate the complete, production-grade TypeScript React component."""

issue_data = {
    'title': 'feat(intake): implement Me vs. Family beneficiary selection & data mapping (P04 & P13)',
    'labels': ['ai-generate'],
    'body': body_text
}

req = urllib.request.Request(url, data=json.dumps(issue_data).encode('utf-8'), headers=headers, method='POST')
try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print(f"SUCCESS: Issue #{res['number']} created at {res['html_url']}")
except Exception as e:
    print('Error creating issue:', e)
