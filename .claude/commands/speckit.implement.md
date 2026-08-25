---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
handoffs:
  - label: Generate Test Plan
    agent: speckit.testplan
    prompt: Generate the test plan for this feature
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

2. **Check checklists status** (if `FEATURE_DIR/checklists/` exists):
   - Count total/completed/incomplete items in each checklist
   - If any checklist is incomplete, display status and ask: "Some checklists are incomplete. Proceed anyway? (yes/no)"
   - Wait for user response before continuing

3. **Load implementation context**:
   - **REQUIRED**: `tasks.md` — complete task list and execution plan
   - **REQUIRED**: `plan.md` — tech stack, architecture, file structure
   - **IF EXISTS**: `data-model.md`, `contracts/`, `research.md`, `quickstart.md`

4. **Project Setup Verification**:

   Read `plan.md` → **Technical Context** section and identify the language/runtime. Then verify ignore files based on the detected stack:

   | Detected stack | Files to verify |
   |---|---|
   | Node.js / JavaScript / TypeScript | `.gitignore` (node_modules/, dist/, .env*), `.dockerignore` if Dockerfile exists |
   | Python | `.gitignore` (__pycache__/, .venv/, dist/), `.dockerignore` if Dockerfile exists |
   | Java / Kotlin | `.gitignore` (target/, build/, *.class), `.dockerignore` if Dockerfile exists |
   | Go | `.gitignore` (*.exe, vendor/, *.out), `.dockerignore` if Dockerfile exists |
   | Rust | `.gitignore` (target/, debug/), `.dockerignore` if Dockerfile exists |
   | Other | `.gitignore` with at minimum: `.env*`, `*.log`, OS files (.DS_Store, Thumbs.db) |

   **Rules**: Append missing patterns only; do not overwrite existing content. If stack is not identified in `plan.md`, apply the "Other" row as a minimum baseline.

5. **Parse `tasks.md`** and extract task phases, dependencies, and parallel markers.

6. **Execute implementation** following the task plan:
   - Phase-by-phase execution; complete each phase before the next
   - Respect dependencies: sequential tasks in order, parallel `[P]` tasks together
   - Report progress after each completed task
   - Mark completed tasks with `[x]` in `tasks.md`

7. **Completion validation**:
   - Verify all required tasks are completed
   - Check that implemented features match the original specification
   - Report final status with summary of completed work

Note: If `tasks.md` is incomplete or missing, suggest running `/speckit.tasks` first.
