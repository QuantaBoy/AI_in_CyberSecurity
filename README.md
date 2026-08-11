# 🛡️ CloudGuard Sentinel — AI in CyberSecurity

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-RLS_Enabled-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Explainable AI](https://img.shields.io/badge/XAI-Isolation_Forest-FF6F00?logo=python&logoColor=white)](#explainable-ai-xai-engine)

An enterprise-grade Security Operations Center (SOC) dashboard powered by Explainable AI (XAI) and real-time Machine Learning (Isolation Forest & Random Forest) to detect, classify, explain, and mitigate cloud authentication anomalies and insider threats.

---

## 📋 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Key Modules & Features](#-key-modules--features)
- [Explainable AI (XAI) Engine](#-explainable-ai-xai-engine)
- [Interactive Attack Simulator](#-interactive-attack-simulator)
- [Tech Stack & System Components](#-tech-stack--system-components)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Installation](#-getting-started--installation)
- [Security & Compliance Alignment](#-security--compliance-alignment)
- [Contributing & License](#-contributing--license)

---

## 🚀 Executive Overview

Modern cloud platforms handle millions of authentication requests daily. Traditional rule-based SIEM systems often flood security analysts with false positives or fail to detect sophisticated multi-vector attacks such as credential stuffing, impossible travel, and API token hijacking.

**CloudGuard Sentinel** solves this challenge by deploying lightweight, inline Machine Learning models (Isolation Forest) paired with SHAP-inspired Explainable AI (XAI) feature attribution. Security Operation Center (SOC) analysts gain instant visibility into high-risk events, complete with automated mitigation playbooks and actionable feature breakdowns.

---

## 🏗️ System Architecture

```
[ Ingested Auth Events ] ──► [ Feature Extraction ] ──► [ Isolation Forest Engine ]
                                                             │
                                                             ▼
[ Interactive SOC UI ] ◄── [ SHAP/XAI Explainer ] ◄── [ Anomaly Score Calculation ]
        │
        ├──► Admin Threat Feed & Incident Triage
        ├──► Model Telemetry & Latency Metrics (P95 < 280ms)
        ├──► Cryptographic SOC Audit Log (Supabase RLS)
        └──► Attack Simulator & Vector Injector
```

---

## ✨ Key Modules & Features

### 🛡️ 1. Real-Time SOC Admin Security Feed (`/feed`)
* **Incident Stream**: Real-time rendering of incoming security logs filtered by severity (`Critical`, `High`, `Medium`, `Low`).
* **Risk Score Badges**: Dynamic visual risk badges computed from anomaly probability scores.
* **Triage Controls**: Instant actions to **Acknowledge**, **Resolve**, or **Escalate** security incidents.
* **Instant Search & Filters**: Search by IP, user identity, action type, or country origin.

### 🤖 2. Explainable AI (XAI) Diagnostics
* **Feature Contribution Graphs**: Visualizes exact factors driving an anomaly score (e.g., *Device Fingerprint Mismatch +42%*, *Impossible Velocity +35%*).
* **Mitigation Recommendations**: Context-aware SOC playbooks (e.g., *Force Password Reset*, *Revoke OAuth Tokens*, *Enforce Hardware MFA*).

### 📈 3. AI Model Health & Telemetry Dashboard (`/model-health`)
* **Performance Metrics**: Real-time tracking of Precision, Recall, F1-Score, and ROC-AUC curve visualizers.
* **Inference Latency Monitor**: Real-time telemetry monitoring demonstrating P95 < 280ms response rates.
* **Confusion Matrix**: Interactive matrix breaking down True Positives, False Positives, True Negatives, and False Negatives.
* **Drift & Retraining**: Drift status metrics with manual model re-calibration triggers.

### 🔍 4. Immutable Security Audit Log (`/audit`)
* **Cryptographic Event Tracking**: Traceable log entries with unique Event IDs, actor attribution, and timestamps.
* **Export Capabilities**: One-click export to CSV and JSON for compliance reporting.
* **Row Level Security (RLS)**: Enforced data access controls backended by Supabase database policies.

### 👤 5. User Activity Portal (`/user-activity`) & RBAC
* **Role Switcher**: Toggle seamlessly between SOC Admin view and Standard User Portal.
* **End-User Threat Telemetry**: Users can review their login history, active sessions, risk score trends, and flagged device accesses.

---

## 🧪 Interactive Attack Simulator

CloudGuard Sentinel features a built-in Security Event Simulator allowing security engineers to benchmark detection algorithms against simulated attack vectors:

| Attack Vector | Simulated Parameters | Primary Detection Trigger |
| :--- | :--- | :--- |
| **Brute Force Attack** | 50+ failed logins in < 10 seconds | High frequency score + failure ratio |
| **Credential Stuffing** | Rapid multi-username attempts from single IP | Bot score + IP reputation drift |
| **Impossible Travel** | Logins from Tokyo & New York 15 mins apart | Geo-velocity anomaly calculation |
| **Session Hijacking** | Mid-session User-Agent and TLS fingerprint shift | Device hash mismatch |
| **API Key Abuse** | Abnormal off-hours API request burst | Time-window anomaly score |

---

## 🛠️ Tech Stack & System Components

### Frontend & UI
* **React 19**: Modern component structure with high performance rendering.
* **TypeScript 5.7**: Strict typing for event schema safety.
* **Vite 6**: High-speed build tooling and HMR support.
* **Tailwind CSS 4**: Modern UI utility framework for responsive dark/light layouts.
* **Lucide React**: Clean vector iconography for SOC dashboards.

### Machine Learning & Analytics
* **Isolation Forest**: Unsupervised anomaly detection algorithm for high-dimensional telemetry.
* **Random Forest**: Feature importance scoring and decision tree explanation.
* **XAI Engine**: Weighted SHAP attribution for security event explainability.

### Backend & Infrastructure
* **Supabase**: PostgreSQL database with Row Level Security (RLS) policies.
* **FastAPI**: Microservices integration pattern for backend inference API.

---

## 📁 Project Directory Structure

```
AI_in_CyberSecurity/
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Reusable UI components & modals
│   │   ├── EventDetailModal.tsx     # XAI feature breakdown modal
│   │   ├── EventSimulatorModal.tsx  # Attack vector injection drawer
│   │   ├── Navbar.tsx               # Top navigation bar
│   │   ├── RiskBadge.tsx            # Severity score badge component
│   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   ├── SkeletonLoader.tsx       # Loading skeleton UI
│   │   └── ToastContainer.tsx       # System notification toasts
│   ├── context/
│   │   └── SecurityContext.tsx      # Global state, RBAC & event provider
│   ├── pages/
│   │   ├── AdminFeed.tsx            # SOC Security Feed
│   │   ├── AuditTrail.tsx           # Cryptographic Audit Log
│   │   ├── ModelHealth.tsx          # ML Model Health & ROC-AUC Metrics
│   │   └── UserActivity.tsx         # End-user login activity portal
│   ├── services/
│   │   ├── eventSimulator.ts        # Attack scenario generator
│   │   ├── mlEngine.ts              # Isolation Forest anomaly scoring engine
│   │   ├── mockData.ts              # Initial SOC telemetry dataset
│   │   └── storage.ts               # Supabase & LocalStorage persist service
│   ├── types/                       # TypeScript interfaces & security schemas
│   ├── App.tsx                      # Main app route switcher & layout
│   ├── main.tsx                     # React application entry point
│   └── index.css                    # Global styles & Tailwind directives
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 💻 Getting Started & Installation

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/QuantaBoy/AI_in_CyberSecurity.git
   cd AI_in_CyberSecurity
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**
   Create a `.env` file in the root directory if connecting to a custom Supabase instance:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Launch Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production**
   ```bash
   npm run build
   ```
   The optimized production bundle will be output to the `dist/` directory.

---

## 🛡️ Security & Compliance Alignment

* **NIST Cybersecurity Framework**: Aligned with *Identify*, *Protect*, *Detect*, *Respond*, and *Recover* core pillars.
* **Zero Trust Architecture (ZTA)**: Continuous authentication evaluation per request without implicit trust.
* **GDPR & Privacy Compliance**: PII anonymization in security telemetry logs.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---
*Maintained by [QuantaBoy](https://github.com/QuantaBoy) — AI in CyberSecurity Project.*
