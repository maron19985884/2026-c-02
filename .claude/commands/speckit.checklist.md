---
description: Generate a custom checklist for the current feature based on user requirements.
---

> **他コマンドとの違い**: 本コマンドは**要件定義書（`spec.md`）の書き方の質**（網羅性・明確さ・一貫性・カバー範囲・測定可能性）を検証する。**フェーズの成果物が揃っているか・承認されているか**（Definition of Done）は検証しない。フェーズゲートの完了判定は `/speckit.review` を使うこと。

## Checklist Purpose: "Unit Tests for Requirements"

Checklists are **unit tests for requirements writing** — they validate the quality, clarity, and completeness of requirements. They do NOT verify implementation behavior.

- ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
- ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- ❌ "Verify the button clicks correctly" (implementation test — WRONG)

## User Input

```text
$ARGUMENTS
```

## Execution Steps

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

2. **Clarify intent**: Derive up to 3 contextual clarifying questions from user phrasing and spec signals. Skip any already answered in `$ARGUMENTS`.

3. **Load feature context** from `FEATURE_DIR`:
   - `spec.md`: Feature requirements and scope
   - `plan.md` (if exists): Technical details
   - `tasks.md` (if exists): Implementation tasks

4. **Generate checklist**:
   - Create `FEATURE_DIR/checklists/` if it doesn't exist
   - Use short descriptive filename (e.g., `ux.md`, `api.md`, `security.md`)
   - If file does NOT exist: create new, number items from CHK001
   - If file EXISTS: append, continuing from last CHK ID
   - Never delete existing content

   **Every item MUST**:
   - Question the REQUIREMENTS themselves, not the implementation
   - Include quality dimension: `[Completeness]`, `[Clarity]`, `[Consistency]`, `[Coverage]`, `[Measurability]`
   - Reference spec section `[Spec §X.Y]` or use markers: `[Gap]`, `[Ambiguity]`, `[Conflict]`

   **Pattern**: `"Are [requirement type] defined/specified for [scenario]? [Quality Dimension, Spec §X]"`

5. **Report**: Output path to checklist, item count, and summary of focus areas.
