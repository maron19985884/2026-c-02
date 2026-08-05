---
description: Create or update the project constitution from interactive or provided principle inputs.
handoffs:
  - label: Build Specification
    agent: speckit.specify
    prompt: Implement the feature specification based on the updated constitution. I want to build...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

You are updating the project constitution at `.specify/memory/constitution.md`.

1. Load the existing constitution at `.specify/memory/constitution.md`.
   - Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]` or `[例: ...]`
   - If file is missing, note an error — do NOT create a new one here

2. Collect/derive values for placeholders:
   - Use user input if supplied; otherwise infer from repo context
   - `CONSTITUTION_VERSION` must increment (MAJOR / MINOR / PATCH)
   - Dates must be ISO format YYYY-MM-DD

3. Draft the updated constitution:
   - Replace every placeholder with concrete text
   - Keep heading hierarchy intact
   - Ensure each principle is declarative, testable, and free of vague language

4. Validate before final output:
   - No remaining unexplained bracket tokens
   - Version line matches report
   - Principles use MUST/SHOULD language appropriately

5. Write the completed constitution back to `.specify/memory/constitution.md`

6. Output final summary:
   - New version and bump rationale
   - Any files flagged for manual follow-up
   - Suggested commit message

Do not create a new template; always operate on the existing `.specify/memory/constitution.md`.
