# ALO Doctor — Workspace Architectural Rules
# Applies to every coding session in this project (2026NOV02_ALO_IMPLEMENTATION)

## 🏗️ Component Architecture Invariant

**RULE: App.tsx MUST stay under 300 lines. Any new screen, feature, or workflow MUST be extracted into a dedicated component file.**

### Mandatory File Structure (Phase 2+)
Every new piece of functionality goes into one of these categories — NEVER inline into App.tsx:

```
src/
├── App.tsx                          ← MAX 300 lines: Only imports, state init, and <AppLayout>
├── hooks/
│   └── useClinicalWorkflowState.ts  ← All useState, useEffect, handleXxx logic
├── router/
│   └── ScreenRouter.tsx             ← All renderScreen() / route decision logic
├── layout/
│   └── AppLayout.tsx                ← Top ribbon, Stage bar, WhatsApp drawer, GuideModal
└── components/
    └── screens/                     ← One file per screen/view
        ├── DoctorReviewView.tsx
        ├── OpinionTelehealthView.tsx
        ├── PatientStatusTimelineView.tsx
        ├── PatientHomeView.tsx
        ├── PatientIntakeView.tsx
        ├── CoordinatorPortalView.tsx
        ├── NurseTriageView.tsx
        ├── ConsultantMobileView.tsx
        ├── PartnerServicesView.tsx
        ├── PaymentCheckoutView.tsx
        ├── FollowUpChatView.tsx
        └── AdminSettingsView.tsx
```

### Coding Rules

1. **New screen?** → Always create `src/components/screens/NewScreenView.tsx`, import in `ScreenRouter.tsx`
2. **New state variable?** → Goes into `useClinicalWorkflowState.ts`, not App.tsx
3. **New handler (handleXxx)?** → Goes into `useClinicalWorkflowState.ts`
4. **New layout element (ribbon, toast, modal)?** → Goes into `AppLayout.tsx`
5. **Never** add more than ~10 lines of JSX directly into App.tsx
6. **Never** add inline logic or conditional rendering into App.tsx

### Component File Size Limits
| File | Max Lines |
|------|-----------|
| `App.tsx` | 300 |
| Any screen component | 600 |
| Any hook | 400 |
| Any utility/service | 200 |

> If a component exceeds its limit, split it into sub-components in a subfolder
> (e.g., `screens/doctor/` for sub-panels of DoctorReviewView).

### Existing Debt (Phase 2 — do in order)
1. Extract `useClinicalWorkflowState.ts` from App.tsx lines 100–550
2. Extract `ScreenRouter.tsx` from App.tsx lines 620–815
3. Extract `AppLayout.tsx` from App.tsx lines 850–991
4. App.tsx becomes: `<AppLayout> + useClinicalWorkflowState() + ScreenRouter`

---

## 🩺 Clinical Workflow Invariants (do not regress)

- Universal In-Person Exam flag (`inPersonExamRequired`) must appear on **both** Written Opinion and Video screens
- LiveKit WebRTC room connects to `wss://alo-6mx1e8u4.livekit.cloud`
- Stage sequence: INTAKE → NURSE_CHECK → DOCTOR_REVIEW → AWAITING_PAYMENT → WITH_CONSULTANT → OPINION_READY → PARTNER_SERVICES → FOLLOW_UP_21_DAYS → CLOSED
- `patientSubView` values: `'landing' | 'intake' | 'timeline' | 'telehealth'`

---

## 🔐 Name & Data Scrubbing

- Never use "Kathirvel" in code, commits, or UI
- Personas: `Adrian Lewis (Operations Lead)`, `Emmanuel Arcon Gonzalez`, `David Nunez`, `Marcus Vance`, `V. Prasanth`
- Pricing: always ±5% variance, never exact sensitive figures
