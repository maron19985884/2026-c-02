---
description: Create or update the feature specification from a natural language feature description.
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
  - label: Clarify Spec Requirements
    agent: speckit.clarify
    prompt: Clarify specification requirements
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

- Check if `.specify/extensions.yml` exists. If it does, check for `hooks.before_specify` entries and handle accordingly. If it does not exist, skip silently.

## Outline

The text the user typed after `/speckit.specify` **is** the feature description.

1. **Generate a concise short name** (2-4 words) for the branch from the feature description.

2. **Check branch numbering mode**: Read `.specify/init-options.json` and check `branch_numbering`.
   - If `"sequential"` or absent: run without `--timestamp`
   - If `"timestamp"`: add `--timestamp`

3. **Create the feature branch** by running:
   ```bash
   .specify/scripts/bash/create-new-feature.sh --json --short-name "<short-name>" "<feature description>"
   ```
   Parse JSON output for `BRANCH_NAME` and `SPEC_FILE`.

4. Load `.specify/templates/spec-template.md` to understand required sections.

5. Follow this execution flow:
   1. Parse user description from Input. If empty: ERROR "No feature description provided"
   2. Extract key concepts: actors, actions, data, constraints
   3. For unclear aspects, make informed guesses. Mark as `[NEEDS CLARIFICATION: specific question]` only for critical decisions (max 3 markers)
   4. Fill User Scenarios & Testing section
   5. Generate Functional Requirements (each must be testable)
   6. Define Success Criteria (measurable, technology-agnostic)
   7. Identify Key Entities (if data involved)

6. Write the specification to SPEC_FILE using the template structure.

7. **Specification Quality Validation**: Validate against:
   - No implementation details in spec
   - All mandatory sections completed
   - Requirements are testable and unambiguous
   - Success criteria are measurable and technology-agnostic
   - Edge cases identified

   If `[NEEDS CLARIFICATION]` markers remain (max 3), present options to user:
   ```markdown
   ## Question [N]: [Topic]
   **Context**: [Quote relevant spec section]
   **What we need to know**: [Specific question]
   **Suggested Answers**:
   | Option | Answer | Implications |
   |--------|--------|--------------|
   | A      | ...    | ...          |
   | B      | ...    | ...          |
   **Your choice**: _[Wait for user response]_
   ```

8. Report completion with branch name, spec file path, and readiness for `/speckit.plan`.

## Quick Guidelines

- Focus on **WHAT** users need and **WHY** — avoid HOW to implement
- Written for business stakeholders, not developers
- DO NOT create checklists embedded in the spec (use `/speckit.checklist` separately)
