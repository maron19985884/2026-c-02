---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
handoffs:
  - label: Analyze For Consistency
    agent: speckit.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: speckit.implement
    prompt: Start the implementation in phases
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

2. **Load design documents** from `FEATURE_DIR`:
   - **Required**: `plan.md` (tech stack, structure), `spec.md` (user stories with priorities)
   - **Optional**: `data-model.md`, `contracts/`, `research.md`, `quickstart.md`

3. **Execute task generation**:
   - Extract tech stack and project structure from `plan.md`
   - Extract user stories with priorities (P1, P2, P3…) from `spec.md`
   - Map entities (from `data-model.md`) to user stories
   - Map contracts (from `contracts/`) to user stories
   - Generate tasks organized by user story

4. **Generate `tasks.md`**: Use `.specify/templates/tasks-template.md` as structure:
   - Phase 1: Setup
   - Phase 2: Foundational (blocking prerequisites)
   - Phase 3+: One phase per user story (priority order)
   - Final Phase: Polish & cross-cutting concerns

5. **Report**: Output path to `tasks.md` and summary of total tasks, parallel opportunities, and MVP scope.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

### Checklist Format (REQUIRED)

Every task MUST follow this format:
```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Examples**:
- ✅ `- [ ] T001 Create project structure per implementation plan`
- ✅ `- [ ] T005 [P] Implement [middleware] in [path per plan.md Structure Decision]`
- ✅ `- [ ] T012 [P] [US1] Create [Entity] model in [path per plan.md Structure Decision]`
- ❌ `- [ ] Create [Entity] model` (missing ID and Story label)
- ❌ `T001 [US1] Create model` (missing checkbox)

File paths in generated tasks MUST come from the actual Project Structure documented in `plan.md`'s Structure Decision — never assumed. Do not default to a `backend/`+`frontend/` split unless `plan.md` actually describes one.

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites — MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3…)
  - Within each story, order tasks by dependency, using only the layers that actually appear in `plan.md`'s Project Structure (e.g., data/model layer → business logic layer → interface/API layer → presentation layer). Skip any layer `plan.md` doesn't define — e.g., generate no frontend/presentation tasks if `plan.md`'s structure has none.
- **Final Phase**: Polish & Cross-Cutting Concerns
