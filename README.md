# CivicEye AI 👁️🏛️
### AI-Powered Civic Issue Detection & Resolution Platform
> **"See the Problem. Report It. Resolve It."**

Built for the **IDEA//FORGE Online Hackathon**  
**Official Track:** Track 1 – Civic Pulse, Digital Governance & Public Information  
**Problem Statement:** Transparent Civic Grievance & Infrastructure Triage System  

---

## 🌟 Executive Summary

**CivicEye AI** bridges the gap between citizens and municipal authorities by transforming street-level smartphone photographs into structured, prioritized, and auditable civic repair workflows. Powered by **Google Gemini Multimodal Vision**, the platform automatically triages public infrastructure defects (such as potholes, water main ruptures, unattended garbage dumps, and broken streetlights), estimates danger severity, recommends the responsible municipal department, prevents duplicate reports through geospatial calculations, and enforces full transparency from submission to verified photo proof of resolution.

---

## 🚀 Key Features

### 1. 🤖 Google Gemini Multimodal Vision AI Triage
- **Automated Issue Detection:** Real-time visual analysis of uploaded photos using `@google/genai` (supporting `gemini-2.5-flash` / `gemini-1.5-flash`).
- **Standardized Schema:** Structured JSON extraction of `isCivicIssue`, `issueType`, `severity`, `confidence`, `department`, `recommendation`, and `reason`.
- **Hallucination Protection:** Gracefully handles non-civic photos and poor image quality without inventing defects.
- **Citizen Review:** Citizens can review, edit, or confirm AI classifications before submission.

### 2. ⚡ Severity & Triage Classification
- **Critical:** Immediate public safety risk (open sinkholes, exposed high-voltage cables, major flooding).
- **High:** Significant public infrastructure failure (pothole on busy corridor, contaminated sewage leak).
- **Medium:** Standard municipal maintenance (broken curbs, moderate road wear).
- **Low:** Minor routine cosmetic upkeep.

### 3. 🏢 Smart Municipal Department Routing
- Automatically routes grievances to the relevant agency:
  - **Potholes & damaged roads:** Roads and Infrastructure Department
  - **Garbage accumulation:** Sanitation Department
  - **Water leakage:** Water Supply Department
  - **Drainage overflow:** Drainage Department
  - **Broken streetlights:** Electrical Department
  - **Pollution:** Environmental Department
  - **Infrastructure damage:** Public Works Department

### 4. 📍 Interactive OpenStreetMap & Leaflet Integration
- Pinpoint location selection with drag-and-drop marker.
- Browser Geolocation API ("Use My Location") with high accuracy.
- Public dashboard map displaying color-coded markers (Critical: Red, High: Orange, Medium: Yellow, Low: Green).

### 5. 🔍 Geospatial Duplicate Grievance Prevention
- **Haversine Distance Formula:** Proactively flags similar issues reported within 100 meters in the past 14 days.
- **Citizen Empowerment:** Non-blocking warning ensures citizens can still submit if the grievance represents a separate issue.

### 6. 👥 Three-Tier Role-Based Security & Governance
- **Citizen:** Report grievances, track status, view personal history, privacy preserved from public eyes.
- **Admin:** Central command center, manage all grievances, review AI recommendations, confirm department assignments, audit trail.
- **Department Staff:** Field operations queue filtered exclusively to their department, update progress, upload resolution proof photos.

### 7. 🌐 Bilingual Accessibility (English & Telugu)
- Seamless one-click language toggle (English / తెలుగు).
- Google Gemini produces hazard reasoning and corrective recommendations in the citizen's chosen language.

### 8. 📸 Verified Photo Proof of Resolution
- Closed-loop lifecycle: requires field squads to upload resolution photographs and repair notes before marking grievances as "Resolved".

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router DOM v7, Axios, Lucide React, Leaflet, React-Leaflet |
| **Backend** | Node.js, Express.js, REST APIs, Multer, JSON Web Tokens (JWT), Bcrypt.js, Express Rate Limit |
| **Artificial Intelligence** | Google Gemini API via official `@google/genai` SDK |
| **Database & Storage** | Supabase PostgreSQL + Supabase Storage (with resilient local store fallback) |
| **Deployment Target** | Frontend on **Vercel**, Backend on **Render** |

---

## 📁 Project Structure

```
CivicEye-AI/
│
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, CivicMap, LocationPicker, Badges)
│   │   ├── context/            # AuthContext & LanguageContext
│   │   ├── layouts/            # RootLayout with persistent navigation
│   │   ├── pages/              # Landing, Report, Citizen, Admin, Dept, Public, Track, Auth
│   │   ├── services/           # Axios API client (authService, aiService, complaintService)
│   │   ├── utils/              # Translations (EN/TE) & Constants
│   │   ├── App.jsx             # React router configuration
│   │   ├── index.css           # Modern Dark Navy & Electric Blue theme
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Client environment example
│   └── package.json
│
├── server/                     # Express.js REST API Backend
│   ├── config/                 # Gemini, Supabase, JWT configurations
│   ├── controllers/            # Auth, AI Image Analysis, Complaint controllers
│   ├── middleware/             # Auth JWT, Role Authorization, Multer Upload, Rate Limiting
│   ├── routes/                 # Express API route modules
│   ├── services/               # Gemini AI service, DB service, Storage service, Haversine duplicate service
│   ├── utils/                  # Constants & department taxonomy
│   ├── uploads/                # Local staging directory for uploaded photos
│   ├── server.js               # Express entrypoint
│   ├── test-suite.js           # Automated end-to-end integration test runner
│   ├── .env.example            # Server environment example
│   └── package.json
│
├── supabase/
│   └── schema.sql              # Supabase PostgreSQL schema, RLS policies, indexes
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🔑 Environment Variables Setup

### 1. Server Environment (`server/.env`)
Create `server/.env` based on `server/.env.example`:

```env
PORT=5000

# Google Gemini API Key from Google AI Studio (https://aistudio.google.com/)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash

# Supabase PostgreSQL & Storage Credentials (from Supabase Dashboard -> Project Settings -> API)
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_BUCKET_NAME=civic-complaints

# Security & CORS
JWT_SECRET=civiceye_super_secret_jwt_key_2026_forge
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Note:** If `GEMINI_API_KEY` or `SUPABASE_URL` are not yet configured, CivicEye AI includes a resilient local database with seeded demo complaints and users, so you can test all UI workflows, maps, admin panels, and tracking immediately! Once keys are provided, it automatically connects to live Gemini Vision and Supabase.

### 2. Client Environment (`client/.env`)
Create `client/.env` based on `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚡ Quick Start Guide (Run Locally)

### 1. Start the Backend Server
```bash
# From the project root:
cd server
npm install
npm run dev
```
*Backend runs on: `http://localhost:5000`*  
*Health Check: `http://localhost:5000/api/health`*

### 2. Start the Frontend Application
In a separate terminal:
```bash
# From the project root:
cd client
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 🧪 Run Automated End-to-End Tests
To verify all 13 core test cases (auth, upload, triage, duplicate detection, assignment, resolution proof, privacy):
```bash
cd server
node test-suite.js
```

---

## 👤 Instant Demo Credentials (For Evaluators & Judges)

You can click the **"Demo Roles"** dropdown in the navigation bar for instant one-click login, or use these credentials:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@civiceye.org` | `citizen123` | Submit grievances, track own complaints |
| **Admin** | `admin@civiceye.org` | `admin123` | Municipal triage console, assign departments, full audits |
| **Roads Dept** | `roads@civiceye.org` | `staff123` | Field squad for Roads and Infrastructure Department |
| **Sanitation Dept** | `sanitation@civiceye.org` | `staff123` | Field squad for Sanitation Department |

---

## 🗄️ Database Setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in the Supabase Dashboard.
3. Copy and run the entire script in [supabase/schema.sql](supabase/schema.sql).
4. Go to **Storage**, create a new public bucket named `civic-complaints`.
5. Copy your Project URL and `service_role` key into `server/.env`.

---

## 🚀 Free Deployment Guide

### Deploy Backend to Render (Free Web Service)
1. Push the code to a GitHub repository.
2. Sign in to [Render](https://render.com) and click **New + > Web Service**.
3. Select your repository.
4. Set **Root Directory** to `server`.
5. Set **Build Command** to `npm install`.
6. Set **Start Command** to `node server.js`.
7. In **Environment Variables**, add:
   - `PORT`: `5000`
   - `GEMINI_API_KEY`: your Google Gemini API key
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `SUPABASE_URL`: your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: your Supabase service role secret
   - `SUPABASE_BUCKET_NAME`: `civic-complaints`
   - `CLIENT_URL`: your Vercel frontend URL
   - `JWT_SECRET`: your secret string
8. Click **Deploy Web Service**.

### Deploy Frontend to Vercel (Free Frontend Host)
1. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Select your repository.
3. Set **Root Directory** to `client`.
4. Framework Preset: **Vite**.
5. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-render-backend-url.onrender.com/api`
6. Click **Deploy**.

---

## 🔮 Roadmap & Future Scope
- **Audio & Video Grievance Reports:** Architecture is already staged to accept video feeds and citizen voice notes via Gemini Live / Multimodal.
- **IoT & Drone Patrol Feeds:** Municipal edge cameras automatically submitting defect reports directly to the triage queue.
- **Automated Citizen SMS / WhatsApp Alerts:** Instant status notifications as repair squads dispatch to the location.

---

## 🏆 Hackathon Attribution
**Track:** Track 1 – Civic Pulse, Digital Governance & Public Information  
**Project:** CivicEye AI  
**Tagline:** "See the Problem. Report It. Resolve It."
