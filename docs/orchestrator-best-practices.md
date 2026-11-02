# ALO DOCTOR — Cloud AI Orchestration & Engineering Best Practices

## Executive Summary
This document captures the battle-tested engineering standards, performance optimizations, and orchestration protocols established for the **ALO DOCTOR Platform (v2.4 Saudi Edition)**. It serves as an architectural blueprint for coordinating autonomous AI swarms (Alibaba Cloud Qwen `qwen3.8-max` workers on GitHub Actions) governed by Antigravity as the Chief Orchestrator.

---

## 1. Cloud AI Worker & Model Configuration

### 1.1 Dedicated Token Plan Gateway
Alibaba Cloud operates two distinct gateway infrastructures:
- **Pay-as-you-go keys (`sk-ws-...`)**: Route to regional endpoints (`ap-southeast-1.maas.qwencloudapi.com` or `dashscope-intl.aliyuncs.com`).
- **Prepaid Token Plan keys (`sk-sp-...`)**: Must strictly connect to the dedicated Token Plan endpoint:
  ```
  https://token-plan.maas.qwencloudapi.com/compatible-mode/v1
  ```
  *Attempting to call regional endpoints with a `sk-sp-...` key will trigger `HTTP 401: Invalid API Key`.*

### 1.2 The "Thinking" Penalty & `enable_thinking: false`
By default, `qwen3.8-max` acts as a deep-reasoning model, generating 4,000 to 8,000 speculative internal tokens before outputting user-facing code.
- **Latency impact**: At ~18 tokens/sec, speculative thinking adds 210–270 seconds of dead time per call.
- **Optimization**: For deterministic code translation tasks (UI components, TypeScript interfaces, Tailwind styling), speculative thinking is unnecessary. Passing `"enable_thinking": false` drops latency from **~400 seconds to 5.8 seconds (a 50x speedup)**.
- **Standard Payload**:
  ```json
  {
    "model": "qwen3.8-max",
    "temperature": 0.2,
    "max_tokens": 4096,
    "enable_thinking": false,
    "stream": true
  }
  ```

### 1.3 Server-Sent Events (SSE) & Instant Socket Teardown
- **Headers Timeout Fix**: Without streaming, Node.js `fetch` (via `undici`) enforces a 300-second `headersTimeout` (`UND_ERR_HEADERS_TIMEOUT`). SSE streaming (`stream: true`) opens HTTP headers in 1.7 seconds, eliminating gateway timeouts.
- **Immediate Termination on `[DONE]`**: When the upstream gateway finishes sending tokens, it sends `data: [DONE]`. The stream parser **must break the loop immediately** upon detecting `[DONE]` rather than waiting for the TCP socket FIN packet (`done === true`), which otherwise lingers for 5 to 6 minutes due to HTTP keep-alive timeouts.

---

## 2. Swarm Orchestration & Concurrency Governance

### 2.1 Branch-Per-Issue Pattern
When running concurrent cloud workers on GitHub Actions, having multiple runners push directly to `main` causes race conditions and `[rejected] fetch first` non-fast-forward merge errors.
- **Rule**: Each worker branches off and pushes exclusively to its own dedicated branch:
  ```bash
  BRANCH_NAME="ai-issue-${{ github.event.issue.number }}"
  git checkout -b "$BRANCH_NAME"
  git push origin "$BRANCH_NAME" --force
  ```
- **Role of Orchestrator**: The Orchestrator gathers the isolated branches, validates TypeScript compilation (`tsc --noEmit`), harmonizes shared models, and executes an atomic release merge to `main`.

### 2.2 Concurrency Bounding (Wave Scheduling)
To prevent `HTTP 429: Too Many Requests` on API gateways:
- Group tasks into waves matching the gateway's concurrent session ceiling.
- For Alibaba Token Plan (max 4 concurrent streams):
  - **Wave 1**: Issues #4, #5, #6, #7 (Peak = 4 streams).
  - **Wave 2**: Issues #8, #9, #10 (Peak = 3 streams).

---

## 3. Telemetry & Smart Polling Cadence

### 3.1 The Anti-Pattern: 3-Second Polling
Checking a cloud runner every 3 seconds while an LLM generates a 2,000-line file:
- Wastes GitHub API quota (5,000 requests/hr limit).
- Introduces excessive CPU context-switching and terminal spam.
- Provides zero actionable insight (the job is still in progress).

### 3.2 The Best Practice: Hybrid Token-Velocity Cadence
1. **Initial Warm-Up Sleep**: Sleep for 45–60 seconds upfront with zero API queries (LLMs require at least 30 seconds to compile and stream full components).
2. **30-Second Check Cadence**: Check status every 30 to 45 seconds thereafter.
3. **In-Runner Token Metering**: The runner logs token velocity:
   ```
   [Qwen Telemetry] 500 tokens (24 tok/s) ... 1500 tokens ... [DONE] in 41s
   ```
4. **Issue Audit Comment**: Automatically post run metrics to the GitHub Issue:
   ```markdown
   🤖 **Alibaba AI Agent Telemetry Report**:
   - **Model**: `qwen3.8-max` (SSE Streaming)
   - **Tokens Generated**: 2,410 tokens
   - **Generation Duration**: 42.4s (56.8 tok/s)
   - **Branch**: `ai-issue-8`
   - **Status**: Ready for Orchestrator Merge
   ```

---

## 4. Saudi Clinical UI & Data Isolation Standards

### 4.1 Pinterest "Clinical Calm" Design System
- **Background Canvas**: `#F8FAFC` (Light Slate) / `#0A1118` (Luminous Dark).
- **Surface Cards**: `#FFFFFF` with subtle shadows (`shadow-sm`, `rounded-2xl`).
- **Brand Navy**: `#0F233C` (Headers, high-contrast typography).
- **Medical Teal**: `#007B6E` (Primary actions, active states, progress indicators).
- **Mint Accents**: `#E6FAF7` (Badges, tags, positive indicators).
- **WhatsApp Green**: `#25D366` (Floating message notifications, CTAs).

### 4.2 Medical BiDi Isolation (`unicode-bidi: isolate`)
In Arabic RTL interfaces, Latin medical terms ($AVA = 0.65\text{ cm}^2$), drug names (e.g., *Atorvastatin 40mg*), and laboratory figures must never flip visual order or punctuation.
- **Rule**: All raw medical entries, numbers, and Latin phrases must be wrapped in:
  ```css
  .medical-term {
    unicode-bidi: isolate;
    direction: ltr;
    display: inline-block;
  }
  ```

### 4.3 English Latin ASCII URL & Domain Enforcement
- **Domain Names & Routes**: Must strictly remain in English Latin ASCII (`ad.howtostart.in`, `/cases/ALOS-2026-0841`, `wa.me/...`).
- **Prohibition**: Never percent-encode Arabic text into browser route paths (e.g., avoids `%D8%B3%D8%A7%D9%84%D9%85`), which corrupts bookmarks, server routing, and DNS resolution.
- **Separation of Content vs. Route**: UI static labels and buttons adapt to Arabic, while URL parameters and endpoints remain English Latin.

### 4.4 Real-Time WhatsApp Notification Toasts
- Every clinical stage transition triggers a floating notification toast (`WhatsAppToast.tsx`).
- Displays the official Meta template code (`W01`–`W20`), recipient number (`+966 50 123 4567`), and bilingual message preview.
- Provides a **1-click "Advance Flow"** button to proceed through the demo seamlessly, plus a drawer toggle for full template inspection.

### 4.5 Zero-Gating Testing Philosophy
- The universal 11-role Top Profile Switcher remains permanently available for demo and validation.
- All actions save against real relational entity IDs (`patient_id`, `doctor_id`) from Day 1 so enabling production authentication requires zero schema changes.

---

## 5. Summary Checklist for Future AI Tasks

- [ ] Connect `sk-sp-...` keys to `https://token-plan.maas.qwencloudapi.com/compatible-mode/v1`.
- [ ] Pass `"enable_thinking": false` and `stream: true` for pure code generation.
- [ ] Break SSE loop immediately on `data: [DONE]`.
- [ ] Push to isolated branch `ai-issue-<N>` rather than `main`.
- [ ] Use 30-second polling intervals with 60-second warm-up sleep.
- [ ] Verify `npm run typecheck` (`tsc --noEmit`) before merging to `main`.
- [ ] Deploy atomically to VPS via `/data/alodoctor/nov-ad/deploy_nov_ad.sh`.
