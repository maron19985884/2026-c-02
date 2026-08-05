---
description: Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md after task generation.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Identify inconsistencies, duplications, ambiguities, and underspecified items across `spec.md`, `plan.md`, and `tasks.md` before implementation. Run only after `/speckit.tasks` has produced a complete `tasks.md`.

## Operating Constraints

**STRICTLY READ-ONLY**: Do **not** modify any files. Output a structured analysis report only.

**Constitution Authority**: `.specify/memory/constitution.md` is **non-negotiable**. Constitution conflicts are automatically CRITICAL.

## Execution Steps

### 1. Initialize Analysis Context

Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root. Derive absolute paths:
- `SPEC = FEATURE_DIR/spec.md`
- `PLAN = FEATURE_DIR/plan.md`
- `TASKS = FEATURE_DIR/tasks.md`

Abort with an error message if any required file is missing.

### 2. Load Artifacts

**From `spec.md`**: Overview, Functional Requirements, Success Criteria, User Stories, Edge Cases  
**From `plan.md`**: Architecture/stack, Data Model, Phases, Technical constraints  
**From `tasks.md`**: Task IDs, descriptions, phase grouping, parallel markers, file paths  
**From constitution**: Load `.specify/memory/constitution.md` for principle validation

### 3. Detection Passes

#### A. Duplication Detection
- Near-duplicate requirements — mark lower-quality phrasing for consolidation

#### B. Ambiguity Detection
- Vague adjectives lacking measurable criteria
- Unresolved placeholders (TODO, ???, `<placeholder>`)

#### C. Underspecification
- Requirements with verbs but missing measurable outcome
- Tasks referencing files not defined in spec/plan

#### D. Constitution Alignment
- Requirements or plan elements conflicting with a MUST principle

#### E. Coverage Gaps
- Requirements with zero associated tasks
- Tasks with no mapped requirement/story

#### F. Inconsistency
- Terminology drift (same concept named differently)
- Conflicting requirements

### 4. Severity Assignment

- **CRITICAL**: Violates constitution MUST, or requirement with zero coverage blocking baseline functionality
- **HIGH**: Duplicate/conflicting requirement, ambiguous security/performance attribute
- **MEDIUM**: Terminology drift, underspecified edge case
- **LOW**: Style/wording improvements

### 5. Analysis Report

Output a Markdown report:

```
## Specification Analysis Report

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
```

**Coverage Summary Table**, **Constitution Alignment Issues**, **Unmapped Tasks**, **Metrics**

### 6. Next Actions

- If CRITICAL: Recommend resolving before `/speckit.implement`
- If only LOW/MEDIUM: User may proceed; provide improvement suggestions

### 7. Offer Remediation

Ask: "Would you like me to suggest concrete remediation edits for the top N issues?" (Do NOT apply automatically.)
