# ALO Doctor — Workspace Architectural Rules & Multi-Agent Standard
# Applies to every coding session in this project (2026NOV02_ALO_IMPLEMENTATION)
# Last Updated: 2026-11-09 (Post-Decomposition Parity Achieved)

---

## 🏗️ 1. Multi-Agent Component Architecture Standard

### Core Invariant
**RULE: `App.tsx` MUST stay strictly under 150 lines (currently 93 lines).**
No business logic, state hooks, or inline rendering blocks are permitted in `App.tsx`. It acts solely as the top-level orchestrator wiring State Hook ➔ Layout Shell ➔ Screen Router.

```
src/
├── App.tsx                          ← [93 lines] Root Orchestrator: Wires Hook ➔ Layout ➔ Router
├── hooks/
│   └── useClinicalWorkflowState.ts  ← [503 lines] State, Handlers & localStorage Sync
├── router/
│   └── ScreenRouter.tsx             ← [250 lines] Pure Functional Screen Routing (Role + Stage)
├── layout/
│   └── AppLayout.tsx                ← [279 lines] Top Ribbon, Progress Bar, Drawer, Modals, Auth
└── components/
    └── screens/                     ← Isolated, single-responsibility screen views (≤ 500 lines)
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

---

## 📐 2. The 4-Layer Architecture Rules

| Layer | Path | Responsibility | What Goes Here | What NEVER Goes Here |
| :--- | :--- | :--- | :--- | :--- |
| **1. Orchestrator** | `src/App.tsx` | Wire dependencies | Single hook call, Layout wrapper, Router child | `useState`, `useEffect`, inline JSX screens |
| **2. State & Handlers** | `src/hooks/useClinicalWorkflowState.ts` | Business logic & data | `useState`, `useEffect`, `localStorage`, handlers (`handleXxx`) | UI JSX, markup, CSS styles |
| **3. Layout Shell** | `src/layout/AppLayout.tsx` | Presentation & overlays | Top bar, progress stepper, modals, toasts, auth gate | Business state calculations, screen interiors |
| **4. Routing Matrix** | `src/router/ScreenRouter.tsx` | Stage & Role mapping | Pure switch/if conditions mapping `(persona, stage) ➔ <View />` | State declarations, persistent storage calls |

---

## 🤖 3. Multi-Agent AI Work Allocation Protocol

When assigning coding tasks to multiple concurrent AI agents:

1. **Agent 1 (State & Business Logic)**: Works strictly inside `src/hooks/useClinicalWorkflowState.ts` or domain hooks. Modifies state signatures, API calls, and handlers.
2. **Agent 2 (Screen UI & Features)**: Works strictly inside a single file in `src/components/screens/`. Receives typed props; zero risk of breaking global state.
3. **Agent 3 (Navigation & Stage Gates)**: Works strictly inside `src/router/ScreenRouter.tsx`. Configures access rules, routing checks, and redirects.
4. **Agent 4 (Overlays & Modals)**: Works strictly inside `src/layout/AppLayout.tsx` or new modal components.

*Benefit*: Zero merge conflicts, zero prompt context truncation, and sub-30-second AI generation turns.

---

## 📏 4. Hard File Size Limits

| File Category | Max Line Count | Action If Exceeded |
| :--- | :--- | :--- |
| `App.tsx` | **150 lines** | Must extract state into hooks or UI into layout. |
| Screens (`screens/*.tsx`) | **500 lines** | Extract sub-panels into `screens/<domain>/` subfolder. |
| Workflow Hooks (`hooks/*.ts`) | **400 lines** | Split into sub-hooks (e.g. `useTelehealthState`, `useCaseAuth`). |
| Services / Clients (`services/*.ts`) | **200 lines** | Split into dedicated service endpoints. |
| Utility Components (`components/*.tsx`) | **250 lines** | Extract sub-elements into atomic components. |

---

## 🧠 5. Architecture Learning: The "Velocity Trap" vs. Decomposition

* **Phase 1 (Days 1–7): Rapid Prototyping**
  * Teams naturally code monolithically in `App.tsx` to get immediate feedback and demo screens.
* **Phase 2 (Day 8+): Production Transition**
  * Monolithic `App.tsx` becomes tech debt (1,000+ lines), causing AI context drift and slow code reviews.
  * **Solution**: Surgically decompose into the 4-layer pattern before adding complex integrations (e.g. LiveKit WebRTC, in-person exam flags).

---

## 🩺 6. Clinical Workflow Invariants (Do Not Regress)

- **Universal In-Person Exam flag (`inPersonExamRequired`)**: Must appear on **both** Written Opinion and Video screens in `DoctorReviewView.tsx`.
- **LiveKit WebRTC Cloud**: Connects to `wss://alo-6mx1e8u4.livekit.cloud` via `src/services/livekit.ts` with auto-joining Stage 6 video room.
- **Stage Progression Order**: `INTAKE_RECEIVED` ➔ `NURSE_CHECK` ➔ `DOCTOR_REVIEW` ➔ `AWAITING_PAYMENT` ➔ `WITH_CONSULTANT` ➔ `OPINION_READY` ➔ `PARTNER_SERVICES` ➔ `FOLLOW_UP_21_DAYS` ➔ `CLOSED`.
- **Session Lifespan**: 30-day verified session stored under `alo_user_session_v2.4`.

---

## 🔐 7. Strict Privacy & Anonymization Rules

- **Strict Name Scrubbing**: Never mention "Kathirvel" anywhere in code, commits, comments, or UI. Use real field names: `Adrian Lewis (Operations Lead)`, `Emmanuel Arcon Gonzalez`, `David Nunez`, `Marcus Vance`, `V. Prasanth`.
- **Pricing Neutralization**: Apply ±5% variance to all prices, quotes, and wages.

---

## ⚡ 8. Execution Velocity & Anti-Waiting Standard (Learned Protocol)

*Adopted post Universal PIN Auth session to guarantee sub-30-minute turnarounds and eliminate LLM timeout latency.*

### 1. The Context Bloat & Compaction Threshold
- **Problem**: When a conversation thread exceeds 50 tool calls / 1M tokens, every subsequent tool call suffers a 90–120s round-trip delay and risks a `stream idle timeout (5m0s)` API failure.
- **Rule**: Never run more than 30 sequential tool calls in a single thread without running `/compact` or delegating to a fresh subagent.

### 2. Two-Stage Execution Protocol (Plan All-In-One, Execute in 2 Slices)
When the user requests a multi-step or multi-role feature:
- **Slice 1 (Code & Compile — Target: 10–12 mins)**:
  - Design data schemas (`src/data/`, `src/types.ts`).
  - Implement components & hooks honoring the `< 500 lines` limit.
  - Run `npm run build` immediately. Fix any TypeScript prop errors.
  - STOP and report compile success with diff metrics.
- **Slice 2 (Verify & Deploy — Target: 10–12 mins)**:
  - Run fast Tier-1/Tier-2 logic tests first (`node` unit scripts in 1s).
  - Run Puppeteer browser E2E with explicit `data-testid` attributes and synthetic keyboard events for React inputs.
  - Run atomic git commit & push to `feature-sarat`.

### 3. Tiered Testing Architecture (Zero Headless Browser Friction)
- **Tier 1 (Instant)**: `tsc` / `npm run build` (3s) — catches 90% of missing props, types, and broken imports.
- **Tier 2 (Fast Logic)**: Node.js in-memory verification (1s) — test state reducers, role resolvers, and PIN hashing directly without opening a browser.
- **Tier 3 (Targeted E2E)**: Puppeteer smoke test (10–15s) — verify critical user journeys only. Always ensure target components have explicit `data-testid` attributes BEFORE launching Puppeteer to avoid timeout loops.

