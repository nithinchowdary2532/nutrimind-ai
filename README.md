<div align="center">

# 🧠 NutriMind AI

### Intelligent Nutrition & Diet Analysis Platform

**AI-powered meal analysis, macro tracking, conversational coaching, and smart weekly insights — all in one clean, modern interface.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-1D9E75?style=for-the-badge)](https://asset-manager--chowdarynithin1.replit.app)
[![GitHub](https://img.shields.io/badge/GitHub-nithinchowdary2532-185FA5?style=for-the-badge&logo=github)](https://github.com/nithinchowdary2532/nutrimind-ai)
[![License](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](LICENSE)

</div>

---

## 🌐 Live Demo

**👉 [https://asset-manager--chowdarynithin1.replit.app](https://asset-manager--chowdarynithin1.replit.app)**

---

## ✨ Features

### 🍽️ AI Meal Analyzer
Describe any meal in plain text and instantly receive:
- Estimated **calories, protein, carbs, fats, and fiber**
- A **health score out of 10**
- Personalized **nutritional insights** and **improvement tips**
- Powered by **Claude AI (claude-sonnet-4-6)**

### 📊 Nutrition Dashboard
Your daily health at a glance:
- Summary cards: **Calories, Protein, Hydration, Streak**
- Color-coded **macro progress bars** (protein, carbs, fats, fiber)
- **Weekly calorie trend chart** with a 2,000 kcal goal line

### 🤖 AI Nutrition Coach
A conversational coach that knows your full food log:
- Real-time **SSE streaming** responses from Claude AI
- **Quick-ask prompts**: meal plans, energy tips, goal checks
- Full **session memory** — every message builds on the last
- Personalized to your exact macros, meals, and goals

### 💡 Smart Weekly Insights
Auto-generated analysis cards including:
- ⚠️ Protein gaps and micronutrient deficiencies
- 💧 Hydration warnings
- ✅ Positive reinforcement and wins
- ℹ️ Actionable nutrition tips

### ⌚ Wearable Sync Panel
View synced device metrics with AI commentary:
- **Steps, Active Calories, Sleep Hours, Heart Rate**
- AI explanation of how activity affects your nutrition needs

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Backend** | Node.js, Express 5 |
| **Database** | PostgreSQL + Drizzle ORM |
| **AI** | Anthropic Claude (claude-sonnet-4-6) |
| **API Contract** | OpenAPI 3.1 + Orval codegen |
| **State Management** | TanStack React Query |
| **Monorepo** | pnpm workspaces |

---

## 📁 Project Structure

```
nutrimind-ai/
├── artifacts/
│   ├── api-server/          # Express 5 API server
│   │   └── src/routes/
│   │       ├── nutrition.ts  # Meal, insights, wearable endpoints
│   │       └── anthropic.ts  # AI coach chat endpoints (SSE)
│   └── nutrimind-ai/        # React + Vite frontend
│       └── src/
│           ├── pages/
│           │   ├── Dashboard.tsx
│           │   ├── MealLog.tsx
│           │   ├── Insights.tsx
│           │   ├── Coach.tsx
│           │   └── Wearable.tsx
│           └── components/
│               └── layout/AppLayout.tsx
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 spec + Orval config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod validation schemas
│   ├── db/                  # Drizzle ORM schema + DB connection
│   └── integrations-anthropic-ai/  # Anthropic AI client
└── pnpm-workspace.yaml
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database
- Anthropic API key (or Replit AI Integrations)

### Installation

```bash
# Clone the repository
git clone https://github.com/nithinchowdary2532/nutrimind-ai.git
cd nutrimind-ai

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Fill in: DATABASE_URL, AI_INTEGRATIONS_ANTHROPIC_BASE_URL, AI_INTEGRATIONS_ANTHROPIC_API_KEY
```

### Database Setup

```bash
# Push schema to database
pnpm --filter @workspace/db run push
```

### Development

```bash
# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (in a separate terminal)
pnpm --filter @workspace/nutrimind-ai run dev
```

### Codegen (after OpenAPI spec changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/nutrition/meals` | List logged meals |
| `POST` | `/api/nutrition/meals` | Analyze & log a new meal (Claude AI) |
| `DELETE` | `/api/nutrition/meals/:id` | Remove a meal |
| `GET` | `/api/nutrition/insights` | Get AI weekly insights |
| `GET` | `/api/nutrition/wearable` | Get wearable metrics + AI commentary |
| `GET` | `/api/anthropic/conversations` | List coach conversations |
| `POST` | `/api/anthropic/conversations` | Create new conversation |
| `POST` | `/api/anthropic/conversations/:id/messages` | Send message (SSE stream) |

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `meals` | Logged meals with full macro breakdown |
| `insights` | AI-generated weekly insight cards |
| `wearable` | Synced device metrics |
| `conversations` | AI coach chat sessions |
| `messages` | Individual chat messages |

---

## 🎨 Design Principles

- **Flat, clean health-tech aesthetic** — no gradients, no heavy shadows
- **Color palette**: Deep blue `#185FA5` + Fresh green `#1D9E75`
- **Fully mobile responsive** — sidebar collapses to top tab bar on small screens
- **Keyboard accessible** — Enter key submits forms and chat messages
- **Graceful error handling** — loading skeletons, empty states, retry logic

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Built with ❤️ by [Nithin Chowdary](https://github.com/nithinchowdary2532)

**[🚀 Try it live →](https://asset-manager--chowdarynithin1.replit.app)**

</div>
