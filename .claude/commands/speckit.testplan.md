---
description: Generate a test plan document from spec.md and tasks.md after implementation. Output is AI-generated; human approval required before testing begins.
handoffs:
  - label: Generate Review Gate Record
    agent: speckit.review
    prompt: Generate the test phase review gate record
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## 目的

`/speckit.implement` 完了後、テストフェーズ開始前に **テスト計画書を AI が生成**する。
生成後は人間がレビューし、承認を得てからテストを開始する。

## Pre-Execution Checks

- Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

## Outline

1. **Load context**:
   - **Required**: `FEATURE_DIR/spec.md` — Acceptance Criteria, User Stories
   - **Required**: `FEATURE_DIR/tasks.md` — implemented tasks and phases
   - **Required**: `FEATURE_DIR/plan.md` — tech stack (testing framework, environment)
   - **If exists**: `tech-stack.md` — test tool decisions

2. **Generate test plan** using `.specify/templates/test-plan-template.md` as the output structure:
   - Section 1 (テスト対象): Fill from spec.md and FEATURE_DIR context
   - Section 2 (テスト種別): Determine test types based on constitution §2 and spec.md priorities
     - Mark unit tests as "実施する" if there is any business logic (mandatory per constitution §2)
     - Mark integration/E2E based on feature priority (高 → 実施を検討, 中/低 → 判断による)
   - Section 3 (合否判定基準): Fill from constitution §2 and spec.md Success Criteria
   - Section 4 (テストケース一覧): Generate test cases from spec.md Acceptance Scenarios (Given/When/Then)
     - Each Acceptance Scenario → at least one TC row
     - Include edge cases from spec.md
   - Section 5 (テスト環境): Fill from plan.md Technical Context
   - Section 6 (バグ管理方針): Use template defaults unless $ARGUMENTS specifies otherwise
   - Section 7 (承認): Leave blank for human to fill

3. **Output**: Write to `FEATURE_DIR/test-plan.md`.
   - Add header note: `> **生成元**: /speckit.testplan (AI生成) — 内容を確認の上、承認してからテストを開始すること`

4. **Report**: Output path to `test-plan.md`, total test case count, and coverage summary by user story.

## Key Rules

- Do NOT start testing. This command only generates the plan document.
- Mark any section that cannot be determined from available artifacts as `<!-- 要確認: [理由] -->`.
- Do NOT modify `.specify/templates/test-plan-template.md` itself — only write to `FEATURE_DIR/test-plan.md`.
- テストフレームワークは `tech-stack.md` の記載に従う。未記載の場合は `<!-- 要確認: 技術選定書にテストフレームワークが記載されていません -->` を付ける。
