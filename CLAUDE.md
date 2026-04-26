# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack web app scaffold with three Docker services:

| Service | Stack | Port |
|---|---|---|
| frontend | Next.js 14 + TypeScript | 3000 |
| backend | Express.js + TypeScript | 4000 |
| mysql | MySQL 8 | 3306 |

## Setup

```bash
cp .env.example .env
docker compose up --build
```

Verify:
- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/health
- MySQL: `docker compose exec mysql mysql -u appuser -ppassword appdb`

Subsequent starts (no code changes): `docker compose up`

Stop: `docker compose down`

## Development Commands

All dev work runs inside Docker. To run commands directly on the host, `cd` into the relevant subdirectory first.

**Backend** (`backend/`):
```bash
npm run dev    # ts-node-dev with hot reload (used inside container)
npm run build  # tsc → dist/
npm start      # node dist/index.js
```

**Frontend** (`frontend/`):
```bash
npm run dev    # next dev
npm run build  # next build
npm start      # next start
```

## Architecture

```
docker-compose.yml          # orchestrates all three services
├── frontend/               # Next.js App Router (src/app/)
│   ├── src/app/page.tsx    # root route
│   ├── src/app/layout.tsx  # root layout (lang="ja")
│   └── src/app/products/   # products routes (stub)
├── backend/
│   └── src/index.ts        # Express entry point; add routes here
└── mysql/
    └── init/01_init.sql    # runs on first container start (auto-executed by MySQL entrypoint)
```

**Inter-service communication**: services talk via Docker network `app-network` using service names as hostnames (e.g., backend connects to MySQL at `mysql:3306`). The frontend calls the backend at `NEXT_PUBLIC_API_URL` which is `http://localhost:4000` from the browser perspective.

**Hot reload in development**: both frontend and backend mount their source directories as volumes, so file changes on the host are reflected inside containers immediately without rebuilding.

**Database init**: SQL files placed in `mysql/init/` are executed alphabetically on the first `docker compose up`. To re-run them, delete the `mysql_data` Docker volume (`docker compose down -v`).

## Key Environment Variables

Defined in `.env` (copied from `.env.example`):

| Variable | Default | Used by |
|---|---|---|
| `DB_NAME` | appdb | backend, mysql |
| `DB_USER` | appuser | backend, mysql |
| `DB_PASSWORD` | password | backend, mysql |
| `MYSQL_ROOT_PASSWORD` | rootpassword | mysql |
| `NEXT_PUBLIC_API_URL` | http://localhost:4000 | frontend (browser) |

## TypeScript Config Notes

- Backend: `commonjs` modules, outputs to `dist/`, strict mode
- Frontend: Next.js bundler resolution, path alias `@/*` → `src/*`, strict mode
