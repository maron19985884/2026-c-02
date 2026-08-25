---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs:
  - label: Create Tasks
    agent: speckit.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: speckit.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

- Check if `.specify/extensions.yml` exists. If it does, check for `hooks.before_plan` entries. If not, skip silently.

## Outline

1. **Setup**: Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse JSON for `FEATURE_SPEC`, `IMPL_PLAN`, `SPECS_DIR`, `BRANCH`.

2. **Load context**: Read `FEATURE_SPEC`, `tech-stack.md`, and `.specify/memory/constitution.md`. The plan template is already copied to `IMPL_PLAN`.

3. **Execute plan workflow**:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution — evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate `research.md` (resolve all NEEDS CLARIFICATION items)
   - Phase 1: Generate `data-model.md`, `contracts/`, `quickstart.md`
   - Update `CLAUDE.md` if new technology context is available

4. **Stop and report**: Report branch, `IMPL_PLAN` path, and generated artifacts.

## Phases

### Phase 0: Outline & Research

1. Extract unknowns from Technical Context
2. Research each unknown and consolidate findings in `research.md`:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: `research.md` with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

1. Extract entities from feature spec → `data-model.md`
2. Define interface contracts → `contracts/` (REST API endpoints, request/response schemas)
3. Create `quickstart.md` with setup and validation steps

**Output**: `data-model.md`, `contracts/*`, `quickstart.md`

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
- Do NOT select technology — technology is defined in `tech-stack.md`
