---
description: Identify underspecified areas in the current feature spec by asking up to 5 targeted clarification questions and encoding answers back into the spec.
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

**Goal**: Detect and reduce ambiguity in the active feature specification and record clarifications directly in the spec file.

Run this BEFORE invoking `/speckit.plan`. If the user explicitly skips clarification, warn that downstream rework risk increases.

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root. Parse `FEATURE_DIR` and `FEATURE_SPEC`. Abort if parsing fails.

2. Load the spec file. Perform a structured ambiguity scan across these categories:
   - Functional Scope & Behavior
   - Domain & Data Model
   - Interaction & UX Flow
   - Non-Functional Quality Attributes (performance, security, availability)
   - Integration & External Dependencies
   - Edge Cases & Failure Handling
   - Constraints & Tradeoffs
   - Terminology & Consistency

3. Generate up to **5 prioritized clarification questions** (internally). Each question must be answerable with:
   - A short multiple-choice selection (2–5 options), OR
   - A one-word / short-phrase answer (≤5 words)

4. **Sequential questioning loop** (one question at a time):
   - Present recommended option prominently: `**Recommended:** Option [X] — <reasoning>`
   - Render options as a Markdown table
   - After user answers, record in working memory and move to next question
   - Stop when all critical ambiguities resolved, user signals "done", or 5 questions asked

5. **Integration after EACH accepted answer**:
   - Ensure a `## Clarifications` section exists (create if missing)
   - Under it, create `### Session YYYY-MM-DD` subheading
   - Append bullet: `- Q: <question> → A: <final answer>`
   - Apply clarification to the most appropriate spec section
   - Save the spec file after each integration

6. Report completion: questions asked, path to updated spec, sections touched, coverage summary.

**Behavior rules**:
- Never exceed 5 total questions
- If no meaningful ambiguities found, respond: "No critical ambiguities detected" and suggest proceeding
- If spec file is missing, instruct user to run `/speckit.specify` first

Context for prioritization: $ARGUMENTS
