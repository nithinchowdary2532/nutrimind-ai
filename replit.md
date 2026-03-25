# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Anthropic Claude (via Replit AI Integrations proxy)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── nutrimind-ai/       # React + Vite frontend (NutriMind AI)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-anthropic-ai/  # Anthropic AI client + batch utils
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Application: NutriMind AI

An AI-powered nutrition & diet analysis platform with:

1. **Dashboard** — daily summary (calories, protein, hydration, streak) + weekly bar chart + macro progress bars
2. **Meal Log** — analyze meals with Claude AI (calories, macros, health score, tips)
3. **AI Insights** — 4 AI-generated weekly insight cards (warnings, positives, info)
4. **AI Coach** — Claude-powered conversational chat with SSE streaming
5. **Wearable Sync** — wearable metrics (steps, active cals, sleep, heart rate) + AI commentary

### API Routes

- `GET /api/nutrition/meals` — list meals
- `POST /api/nutrition/meals` — analyze meal with Claude AI
- `DELETE /api/nutrition/meals/:id` — delete meal
- `GET /api/nutrition/insights` — AI-generated weekly insights
- `GET /api/nutrition/wearable` — wearable metrics
- `GET /api/anthropic/conversations` — list conversations
- `POST /api/anthropic/conversations` — create conversation
- `GET /api/anthropic/conversations/:id` — get conversation with messages
- `DELETE /api/anthropic/conversations/:id` — delete conversation
- `GET /api/anthropic/conversations/:id/messages` — list messages
- `POST /api/anthropic/conversations/:id/messages` — send message (SSE stream)

## Database Schema

Tables: `meals`, `insights`, `wearable`, `conversations`, `messages`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/nutrimind-ai` (`@workspace/nutrimind-ai`)

React + Vite frontend. Pages: Dashboard, MealLog, Insights, Coach, Wearable.
- Sidebar navigation (collapses to top tabs on mobile)
- Uses React Query for API calls, Recharts for charts
- SSE streaming for AI coach chat

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with routes for nutrition and AI.
- `pnpm --filter @workspace/api-server run dev` — run the dev server

### `lib/integrations-anthropic-ai` (`@workspace/integrations-anthropic-ai`)

Pre-configured Anthropic SDK client via Replit AI Integrations proxy.
- Env vars: `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`, `AI_INTEGRATIONS_ANTHROPIC_API_KEY`

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.
- `pnpm --filter @workspace/db run push` — push schema to database

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec + Orval codegen config.
- `pnpm --filter @workspace/api-spec run codegen` — regenerate client hooks and Zod schemas
