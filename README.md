# TEND+ | Your Personalized Safe Shopping Zone

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Powered by Gemini 3](https://img.shields.io/badge/Powered%20by-Gemini%203%20Flash-blue?style=flat-square)](https://ai.google.dev)

> **World's first AI Ingredient Detective** — Find your personalized safe shopping zone with health-aware product recommendations.

Built for **Gemini 3 Hackathon** | Powered by Google Gemini 3 Flash

---

## Overview

**TEND+** is a health-aware shopping companion that helps you discover products that match your unique health profile. Whether you have allergies, take medications, or have skin sensitivities, TEND+ uses AI to filter products and identify potential trigger ingredients—so you can shop with confidence.

Using **Gemini 3 Flash Preview**, we deliver intelligent health chat, OCR product scanning, and the world's first **AI Ingredient Detective** that analyzes your product history to pinpoint suspected trigger ingredients.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| ✅ **AI Health Chatbot** | Chat with Gemini 3 about your health; it extracts and saves your profile automatically |
| 📷 **OCR Product Scanning** | Take a photo of any product label—Gemini Vision extracts ingredients instantly |
| 🛡️ **Smart Product Filtering** | Products are filtered based on your allergies, medications, and blacklist |
| 🔍 **AI Ingredient Detective** | *World's first!* Compare good vs. bad products to find suspected trigger ingredients |
| 🔐 **Encrypted Health Data** | Your sensitive health information is encrypted at rest |

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 |
| **AI** | Google Gemini 3 Flash Preview |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Clerk |
| **Styling** | Tailwind CSS 4 |
| **Rate Limiting** | Upstash Redis |

---

## 🚀 Installation

### Prerequisites

- **Node.js** 20.20.0 or higher
- **pnpm** (recommended) or npm

```bash
# Clone the repository
git clone https://github.com/your-username/tendplus.git
cd tendplus

# Install dependencies
pnpm install
# or
npm install
```

---

## ⚙️ Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | ✅ | Clerk webhook signing secret |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis token |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key ([Get one](https://ai.google.dev)) |
| `CRON_SECRET` | Optional | For Vercel cron jobs |
| `ENCRYPTION_KEY` | ✅ | 32-byte hex key for health data encryption |
| `ADMIN_EMAILS` | Optional | Comma-separated admin emails |

See [`.env.example`](.env.example) for the full list and comments.

---

## 🏃 Running the Project

```bash
# Development
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Production build
pnpm build
pnpm start
```

---

## 🤖 Gemini 3 Integration

TEND+ uses **Gemini 3 Flash Preview** in three key areas:

### 1. AI Health Chatbot

- **Endpoint:** `/api/health-chat`
- **Model:** `gemini-3-flash-preview`
- **Flow:** User chats about allergies, medications, skin concerns → Gemini extracts structured data → Health profile updated automatically
- **Context:** Always includes current health profile for personalized advice

### 2. OCR Product Scanning

- **Endpoint:** `/api/ai/ocr`
- **Model:** `gemini-3-flash-preview` (multimodal)
- **Flow:** User uploads product photo → Gemini Vision extracts ingredient list → Products and ingredients saved to database
- **Output:** JSON with `product_name`, `ingredients_list`, `confidence`

### 3. AI Ingredient Detective (Trigger Analysis)

- **Endpoint:** `/api/ai/trigger-analysis`
- **Model:** `gemini-3-flash-preview`
- **Flow:**
  1. User records "Good" products (no reaction) and "Bad" products (had reaction)
  2. System computes difference: ingredients only in "Bad" products
  3. Gemini analyzes which ingredients are likely triggers (allergies, skin irritation)
  4. Results show suspected ingredients with confidence scores

This is the **world's first** feature that uses AI to pinpoint trigger ingredients from your personal product history!

---

## 📁 Project Structure

```
tendplus/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── ai/            # Gemini AI (OCR, trigger-analysis)
│   │   │   ├── health-chat/   # AI chatbot
│   │   │   ├── trigger-analysis/
│   │   │   └── ...
│   │   ├── health/            # Health profile + AI Ingredient Detective
│   │   ├── products/          # Product catalog
│   │   └── ...
│   ├── components/
│   │   ├── health/            # HealthChatbot
│   │   ├── trigger/           # TriggerAnalysisContent, AnalysisResults
│   │   └── scan/              # CameraCapture, ManualInputForm
│   └── lib/
│       ├── supabase/
│       ├── security/           # Encryption
│       └── api/                # Rate limiter, external APIs
├── .env.example
└── ...
```

---

## 🔍 Features in Detail

### AI Ingredient Detective

When you have skin reactions or allergies, it's hard to know *which* ingredient caused it. The **AI Ingredient Detective** solves this:

1. **Record products:** Mark products as "Good" (no reaction) or "Bad" (had reaction)
2. **Run analysis:** When you have at least 1 good and 1 bad product, tap "분석 실행"
3. **AI comparison:** Gemini receives your good ingredients vs. bad ingredients
4. **Difference set:** Only ingredients in "Bad" products (not in "Good") are analyzed
5. **Suspected triggers:** Gemini returns ranked list of likely trigger ingredients with confidence scores

### How Trigger Analysis Works

```
Good Products (no reaction)  →  [A, B, C, D]
Bad Products (had reaction)  →  [A, B, E, F, G]

Difference (only in Bad)     →  [E, F, G]

Gemini AI Analysis          →  Suspected: [E, G] (confidence: 0.85)
```

---

## 📸 Screenshots

<!-- Add screenshots here -->

| Home | Health Profile | AI Ingredient Detective |
|------|----------------|-------------------------|
| <!-- Screenshot 1 --> | <!-- Screenshot 2 --> | <!-- Screenshot 3 --> |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for **Gemini 3 Hackathon**
- Powered by Google **Gemini 3 Flash**
- [Supabase](https://supabase.com) · [Clerk](https://clerk.com) · [Upstash](https://upstash.com) · [Vercel](https://vercel.com)

---

**TEND+** — Find your safe shopping zone. 🛒✨
