# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`
**Tech Stack**: Defined in `tech-stack.md` (do NOT re-select here)

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

> Read `tech-stack.md` and fill each field from it. Mark as NEEDS CLARIFICATION only if the field is genuinely absent from that document.

**Language/Version**: [from tech-stack.md]
**Primary Dependencies**: [from tech-stack.md]
**Storage**: [from tech-stack.md, or N/A]
**Testing**: [from tech-stack.md]
**Target Platform**: [from tech-stack.md]
**Project Type**: [e.g., web-service / cli / library / mobile-app]
**Performance Goals**: [from requirements doc, or N/A]
**Constraints**: [from requirements doc, or N/A]
**Scale/Scope**: [from requirements doc, or N/A]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on `.specify/memory/constitution.md`]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

<!--
  Choose ONE option below based on tech-stack.md. Delete unused options.
  Replace example paths with real paths for this project.
-->

```text
# Option 1: Single project (CLI / library / standalone backend)
src/
├── models/
├── services/
└── cli/         # or api/ / lib/ depending on project type

tests/
├── unit/
└── integration/
```

```text
# Option 2: Web application (frontend + backend)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

```text
# Option 3: Mobile + API
api/
└── src/

ios/     # or android/
└── src/
```

**Structure Decision**: [Document the selected option and reference the real directories above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| [violation] | [current need] | [reason] |
