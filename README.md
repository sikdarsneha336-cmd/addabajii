# AddaBaaji - Civic Vigilance & Anonymous Safety Grid

> **Zero-Trace Anonymous Reporting & Municipal Tactical Command System**  
> Reclaiming public spaces from street harassment, predatory loitering, and dark spots through privacy-first citizen reporting and rapid civic dispatch.

---

## 📌 Overview

**AddaBaaji** is a dual-portal civic safety and tactical command platform engineered to tackle public harassment and unsafe urban corridors. It provides citizens with a zero-trace reporting workflow that completely strips device identifiers and photo EXIF metadata, while equipping law enforcement and municipal authorities with an actionable tactical dispatch command center.

---

## ✨ Key Features

### 🛡️ 1. Citizen Anonymous Reporting Portal
- **Zero-Trace Privacy Protocol**:
  - Automatically sanitizes uploaded photos: strips camera serial numbers, device hashes, ISO details, and embedded GPS EXIF metadata.
  - Face obfuscation / privacy blur toggle for evidence photos.
  - Device photo upload: Select photos directly from your phone gallery, computer, or camera.
- **Audio Evidence & AI Transcription**:
  - Live microphone recording for discreet audio evidence.
  - AI-powered speech-to-text transcription powered by Google Gemini.
- **Cryptographic Tracking Vault**:
  - Every submission generates a unique, anonymous tracking token (e.g. `#AB-78942-METRO3`).
  - Citizens can look up live triage, officer assignment, and municipal work orders without creating an account or revealing their identity.
- **Emergency Camouflage Mode**:
  - Discreetly disguise the screen as a fully functional **Calculator** or **Live Weather** widget in 1 click if approached by hostile individuals.
- **Quick Distress SOS**:
  - Instant panic beacon with audible siren synthesizer and automated location broadcast.

### 🚔 2. Authority Tactical Command Center
- **Triage & Docket Dispatch**:
  - Real-time incident queue categorized by severity (Critical, Moderate, Advisory).
  - Beat officer assignment (e.g., PCR Patrol squads, NDMC electrical teams).
  - Status progression workflow: *Pending → Active → Civic Rectification → Resolved*.
- **Evidence Docket**:
  - View sanitized photos, audio waveforms, GPS pin coordinates, and ambient lux lighting levels.
  - Add official beat memos and deployment notes.
- **Strict Role Isolation**:
  - Dedicated authentication gateways ensure citizens cannot cross into police dispatch operations and vice versa.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion
- **Icons & Typography**: `@fontsource/material-symbols-outlined` (fully bundled for offline reliability), Space Grotesk, JetBrains Mono
- **Backend / API**: Node.js, Express, `tsx`
- **AI Integration**: Google Gemini API (`@google/genai`) for speech transcription
- **Sensors & APIs**: Open-Meteo Weather API, Web Audio API Synthesizer

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (comes bundled with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/addabaaji.git
cd addabaaji
```

### 2. Install Dependencies
```bash
npm install
```
*(If you encounter peer dependency conflicts with npm, use `npm install --legacy-peer-deps`)*

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
PORT=3000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> **Note**: A Gemini API key is optional for standard navigation and reporting, but required for the live audio transcription feature. You can obtain a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 📦 Production Build & Deployment

To build and run the full-stack production application:

```bash
# 1. Build optimized frontend assets
npm run build

# 2. Start the Express server
npm start
```
The server will bind to `0.0.0.0` on the specified `PORT` (defaults to `3000`), ready for containerized deployment (e.g., Google Cloud Run, Docker, AWS, Render).

---

## 📁 Project Structure

```text
├── index.html                  # HTML entry point with font fallbacks
├── server.ts                   # Production Express server & API endpoints
├── src/
│   ├── App.tsx                 # Root application state & role-based screen routing
│   ├── components/
│   │   ├── AppLogo.tsx         # SVG brand logo component
│   │   ├── AudioTranscriber.tsx# Audio recording & Gemini transcription UI
│   │   ├── CamouflageCalculator.tsx # Stealth calculator disguise
│   │   ├── CamouflageWeather.tsx    # Stealth weather widget disguise
│   │   ├── EvidencePhoto.tsx   # Resilient surveillance photo viewer with fallback
│   │   ├── Header.tsx          # Role-sensitive navigation header
│   │   ├── QuickSOSModal.tsx   # Emergency SOS synthesizer & siren
│   │   └── Footer.tsx          # Platform security badges & quick links
│   ├── data/
│   │   └── reportsStore.ts     # Pre-seeded tactical incidents & radio logs
│   ├── screens/
│   │   ├── LoginScreen.tsx     # Role selection gateway (Citizen vs. Authority)
│   │   ├── CitizenPortalScreen.tsx # Anonymous reporting form & tracking vault
│   │   └── AuthorityCommandScreen.tsx # Tactical dispatch desk & evidence viewer
│   ├── server/
│   │   ├── transcribe.ts       # Server-side Gemini audio transcription handler
│   │   └── weather.ts          # Server-side live weather proxy
│   ├── types.ts                # TypeScript interfaces (IncidentReport, UserRole, etc.)
│   └── index.css               # Tailwind CSS v4 theme, custom styles & icon fonts
├── package.json
└── tsconfig.json
```

---

## 🔒 Privacy & Safety Notice

- **No Personal Telemetry**: AddaBaaji does not store user IP addresses, browser cookies, or hardware fingerprints.
- **EXIF Stripping**: Image files uploaded via the citizen portal are scrubbed in the browser before transmission.
- **Role Isolation**: Session state is isolated so that unauthorized users cannot switch between citizen and authority portals without explicit authentication.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
