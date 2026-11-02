# nov-ad

> High-Performance Clinical Workflow, Telehealth Consultation & Partner Dispatch Platform (v2.4 Saudi Edition).

---

## 🌟 Key Features

- **Top-Level Profile Switcher**: Instant switching between 11 clinical personas without credential friction:
  - `[ Patient: Salem A. ]` `[ Saudi Doctor: Dr. Abdullah ]` `[ ALO Nurse: Noura ]` `[ Coordinator: Sarah ]` `[ Consultant: Dr. Arjun ]` `[ Lab Tech ]` `[ Pharmacist ]` `[ Physio ]` `[ Home Nurse ]` `[ Partner Admin ]` `[ ALO Admin ]`
- **10 Pre-Seeded Saudi Clinical Cases**: Starts with **Case #1 (Salem A., Severe Aortic Stenosis)** with a `[ 🎲 Next Case ]` quick-rotator.
- **⚡ Magic Auto-Fill**: One-click form population across all 9 stages—zero manual typing required during testing.
- **9-Stage Connected Clinical Lifecycle**:
  1. Intake Received (P01–P14)
  2. Nurse Check & De-Identification (N01–N07)
  3. Saudi Doctor Review & 2 Focus Questions (D01–D10)
  4. Payment Simulation & ZATCA VAT Invoice (P19–P21)
  5. Indian Consultant Review in English (K01–K07)
  6. 3-Party Telehealth Call & Bilingual Stamped Report (K08, P25, C08)
  7. Partner Referrals: Lab, Pharmacy, Physio, Home Nursing (L01, H01, T01, V01)
  8. 21-Day Post-Consultation Chat (P27–P29)
  9. Case Archival & Satisfaction Survey (W20)
- **WhatsApp Drawer Simulation**: Real-time Meta-approved templates (W01–W20) with interactive magic link buttons.
- **Dual-Storage Engine**: Real PostgreSQL 16 persistence + MinIO S3 object storage for DICOM scans, Echo loops, and bilingual PDFs.
- **Alibaba Cloud AI Integration**: Automated clinical summarization and certified English-Arabic translation via DashScope / Qwen with a strict 4-worker concurrency cap.

---

## 🚀 Quick Start

### 1. Environment Setup
```bash
cp .env.example .env
```

### 2. Install Dependencies & Run Locally
```bash
npm install
npm run dev
```

### 3. VPS & Docker Deployment
```bash
docker compose -f docker-compose.infra.yml up -d
```
