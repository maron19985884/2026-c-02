---
description: Generate a change request document when requirements, scope, or design changes occur after a phase has been approved. Output is AI-generated; human approval required before applying changes.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).
`$ARGUMENTS` should describe the change (e.g., "検索機能を追加したい" or "ログイン要件を削除する").

## 目的

フェーズ確定後に変更が発生した場合に **変更要求書を AI が生成**する。
生成後は人間がレビューし、承認を得てから `spec.md` / `plan.md` / `tasks.md` に変更を反映する。

> **重要**: 変更要求書の承認なしに `spec.md`・`plan.md`・`tasks.md` を直接修正してはならない。
> これはウォーターフォール運用の変更管理プロセスのゲートである（`docs/waterfall-preset-guide.md` 参照）。

## Pre-Execution Checks

- Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

## Outline

1. **Understand the change**: Parse `$ARGUMENTS` to extract:
   - What is changing (機能・要件・スコープ・技術)
   - Why it is changing (理由・背景)
   - If `$ARGUMENTS` is empty: ask the user "どのような変更が発生しましたか？（例: 検索機能の追加、ログイン要件の削除）"

2. **Load current state** for impact analysis:
   - `requirements.md`: current requirements
   - `FEATURE_DIR/spec.md`: current spec (if exists)
   - `FEATURE_DIR/plan.md`: current design (if exists)
   - `FEATURE_DIR/tasks.md`: current task list (if exists)

3. **Generate change request** using `docs/change-request-template.md` as the output structure:
   - Section 1 (基本情報): Auto-assign next CR number by scanning `docs/changes/CR-*.md`; fill date, FEATURE_DIR
   - Section 2 (変更の概要): Fill from `$ARGUMENTS`
   - Section 3 (変更前後の比較): Quote relevant sections from current artifacts; show proposed after-state
   - Section 4 (影響分析):
     - Scope impact: compare change against `requirements.md` scope
     - Effort: estimate based on changed tasks (from `tasks.md`)
     - Technical impact: check if `tech-stack.md` change is required
     - Risk: identify risks from the change
   - Section 5 (対応方針): Leave checkboxes blank for human decision
   - Section 6 (承認): Leave blank for human to sign

4. **Output**: Write to `docs/changes/CR-[NNN]-[short-slug].md`.
   - Add header note: `> **生成元**: /speckit.change (AI生成) — 内容を確認の上、承認を得てから変更を適用すること`
   - Create `docs/changes/` directory if it does not exist.

5. **Report**: Output path to generated file and summary of detected impact areas.

## Key Rules

- Do NOT apply any changes to `spec.md`, `plan.md`, `tasks.md` or any other artifact. This command only generates the change request document.
- Do NOT modify `docs/change-request-template.md` itself.
- 技術選定書（`tech-stack.md`）への記入・変更は人間のみが実施する（憲法§5参照）。
- 影響分析の工数見積もりは参考値として明示し、`<!-- 参考値: 実際の見積もりは人間が確認すること -->` を付ける。
