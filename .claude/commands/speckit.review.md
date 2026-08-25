---
description: Generate a phase gate review record for the current feature phase. Output is AI-generated; human approval (signature) required to proceed to the next phase.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).
If `$ARGUMENTS` contains a phase name (e.g., "要件定義", "設計", "実装"), generate the record for that phase.
If empty, detect the current phase from available artifacts (see step 2).

## 目的

各フェーズ完了時に **フェーズゲート承認記録を AI が生成**する。
生成後は人間がレビューし、承認署名を記入してから次フェーズへ進む。

## Pre-Execution Checks

- Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

## Outline

1. **Detect or confirm target phase**:
   - From `$ARGUMENTS` (explicit), OR
   - From `AVAILABLE_DOCS`: if `tasks.md` exists → 実装計画フェーズ, if `plan.md` exists → 設計フェーズ, if `spec.md` exists → 要件定義フェーズ
   - Confirm detected phase with user before proceeding

2. **Load context** for the detected phase:
   - `requirements.md`, `user_requirements.md` (要件定義フェーズ)
   - `FEATURE_DIR/spec.md`, `FEATURE_DIR/plan.md` (設計フェーズ)
   - `FEATURE_DIR/tasks.md`, `/speckit.analyze` output if available (実装計画フェーズ)
   - `FEATURE_DIR/test-plan.md` (テストフェーズ)

3. **Generate review gate record** using `docs/review-gate-template.md` as the output structure:
   - Section 1 (基本情報): Fill from FEATURE_DIR context and detected phase
   - Section 2 (成果物確認チェックリスト): For the detected phase only — check each item against AVAILABLE_DOCS
     - If artifact exists → `- [x]`
     - If artifact is missing → `- [ ] <!-- 要確認: [ファイル名] が見つかりません -->`
   - Section 3 (指摘事項): Leave blank (human fills during review), or populate from `/speckit.analyze` report if available
   - Section 4 (承認判定): Leave as template (human fills)
   - Section 5 (承認署名): Leave blank for human to sign

4. **Output**: Write to `docs/reviews/[phase-slug]-[YYYY-MM-DD].md`.
   - Add header note: `> **生成元**: /speckit.review (AI生成) — 内容を確認の上、承認署名を記入してから次フェーズへ進むこと`
   - Create `docs/reviews/` directory if it does not exist.

5. **Report**: Output path to generated file and checklist completion status.

## Key Rules

- Do NOT proceed to the next phase automatically. This command only generates the record.
- Do NOT modify `docs/review-gate-template.md` itself.
- 承認署名欄は必ず空欄のまま出力する（人間が記入する）。
- 指摘事項は確認できた範囲のみ記載し、不明な部分は `<!-- 要確認: [理由] -->` を付ける。
