<!--
SYNC IMPACT REPORT
==================
Version change: (none — initial fill) → 1.0.0
Modified principles: N/A (initial authoring from template)
Added sections:
  - Core Principles (I–V)
  - Tech Stack Constraints
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md  ✅ No changes needed — Constitution Check section is generic
  - .specify/templates/spec-template.md  ✅ No changes needed — scope/requirements structure aligns
  - .specify/templates/tasks-template.md ✅ No changes needed — task categories align with principles
  - .specify/templates/commands/         ✅ No commands directory found — skipped
Follow-up TODOs: None — all placeholders resolved.
-->

# オンライン書店 Constitution

## Core Principles

### I. Purchase-Flow First

All features MUST serve the five-screen purchase journey defined in `user_requirements.md`:
商品一覧 → 商品詳細 → カート → 注文フォーム → 注文完了.
Features outside this scope (login, payment processing, inventory management, admin panel,
reviews, search/filter) MUST NOT be implemented. Every task MUST map to at least one
user requirement (U-01 through U-18).

### II. Full-Stack Separation with Typed Contracts

Frontend (Next.js/React) and Backend (Express REST API) MUST communicate exclusively via
HTTP JSON. Shared data shapes MUST be defined as TypeScript interfaces. Direct database
access from the frontend is prohibited. The backend exposes REST endpoints; the frontend
consumes them through a dedicated API service layer — not inline fetch calls scattered
across components.

### III. Type Safety Throughout

TypeScript MUST be used on both frontend and backend with `strict` mode enabled. `any`
types are prohibited unless a third-party library provides no alternative. All API
responses MUST be typed end-to-end — loose `object` or untyped JSON are not acceptable
at module boundaries.

### IV. Docker-First Environment

All development, testing, and validation MUST run inside Docker containers via
`docker compose`. Environment variables MUST be managed through `.env` files (never
hardcoded). The three services (frontend :3000, backend :4000, MySQL :3306) MUST remain
independently buildable and healthy before any feature work is considered complete.

### V. Simplicity and Scope Discipline

Implement only what `user_requirements.md` requires. YAGNI applies strictly — no
abstractions, patterns, or infrastructure beyond what current user stories demand.
Complexity MUST be justified in the `plan.md` Complexity Tracking table before being
introduced. Three similar lines are preferable to a premature abstraction.

## Tech Stack Constraints

- **Frontend**: Next.js 14, React 18, TypeScript 5 — Pages Router preferred; App Router
  requires explicit justification.
- **Backend**: Node.js 20, Express 4, TypeScript 5, mysql2 3.
- **Database**: MySQL 8.0 — schema changes MUST be SQL migration files tracked in `mysql/`.
- **Containerization**: Docker + docker-compose; the `development` build target is used
  locally; any production deployment MUST switch to the `production` target.
- **Dependency additions** require team consensus and MUST be documented in the relevant
  `plan.md` before being introduced.

## Development Workflow

- All work begins with a feature branch: `git checkout -b feature/<description>` or
  `fix/<description>` or `chore/<description>`.
- Each feature MUST have a `spec.md` and `plan.md` before implementation begins.
- PRs target `main`; the Constitution Check in `plan.md` MUST pass before merge.
- Environment validation: `http://localhost:3000` serves the frontend;
  `http://localhost:4000/health` returns `{"status":"ok"}`.
- Commits follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

## Governance

This Constitution supersedes all other development practices. Amendments require:

1. A pull request updating this file with a version bump and rationale.
2. Updates to any affected templates under `.specify/templates/`.
3. A Sync Impact Report (HTML comment at the top of this file) documenting what changed.

All PRs MUST include a Constitution Check section in `plan.md` verifying compliance with
principles I–V. Complexity beyond these principles MUST be justified in `plan.md`'s
Complexity Tracking table. `user_requirements.md` is the authoritative scope reference.

**Version**: 1.0.0 | **Ratified**: 2026-06-30 | **Last Amended**: 2026-06-30
