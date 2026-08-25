---
description: Generate design documents (basic design, detailed design, or table definition) based on the spec and plan artifacts. Usage: /speckit.design [basic|detail|table]. Output is AI-generated; human approval required.
handoffs:
  - label: Generate Detailed Design
    agent: speckit.design
    prompt: detail
  - label: Generate Table Definition
    agent: speckit.design
    prompt: table
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).
`$ARGUMENTS` must be one of: `basic`, `detail`, `table`.
If `$ARGUMENTS` is empty or invalid, ask: "どの設計書を生成しますか？ `basic`（基本設計書）、`detail`（詳細設計書）、`table`（テーブル定義書）のいずれかを入力してください。"

## 目的

憲法§7に基づき、**設計書を AI が生成**する。HTMLベース・UML準拠の形式で出力する。
生成後は人間がレビューし、承認を得てから次フェーズへ進む。

## Pre-Execution Checks

- Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

## Template Routing

| `$ARGUMENTS` | テンプレート | 出力先 |
|---|---|---|
| `basic` | `docs/basic-design-template.md` | `FEATURE_DIR/basic-design.md` |
| `detail` | `docs/detailed-design-template.md` | `FEATURE_DIR/detailed-design.md` |
| `table` | `docs/table-definition-template.md` | `FEATURE_DIR/table-definition.md` |

## Outline

### For `basic` (基本設計書)

1. **Load context**:
   - **Required**: `FEATURE_DIR/spec.md` — functional requirements, user stories, scope
   - **Required**: `FEATURE_DIR/plan.md` — architecture, tech stack, project structure
   - **If exists**: `FEATURE_DIR/data-model.md` — entity overview
   - **If exists**: `FEATURE_DIR/contracts/` — API endpoint summary

2. **Generate basic design document** using `docs/basic-design-template.md`:
   - メタ情報: Fill from FEATURE_DIR context
   - システム概要: From spec.md overview and scope
   - アーキテクチャ概要: From plan.md; generate SVG-based component diagram (inline HTML+SVG)
   - 機能一覧: From spec.md Functional Requirements mapped to REQ-IDs
   - 画面設計: From spec.md User Stories; generate HTML+SVG screen transition diagram
   - API設計概要: Summary from contracts/ (list only; detail stays in contracts/)
   - データ概念モデル: From data-model.md; generate HTML+SVG ER diagram (entity names and relationships only)
   - 非機能設計方針: From requirements.md §4 and constitution.md

3. **Output**: Write to `FEATURE_DIR/basic-design.md` with header note:
   `> **生成元**: /speckit.design basic (AI生成) — 内容を確認の上、承認してから次フェーズへ進むこと`

### For `detail` (詳細設計書)

1. **Load context**:
   - **Required**: `FEATURE_DIR/plan.md` — file structure, tech stack
   - **Required**: `FEATURE_DIR/tasks.md` — target files and task breakdown
   - **Required**: `FEATURE_DIR/spec.md` — acceptance criteria, user stories
   - **If exists**: `FEATURE_DIR/contracts/` — API request/response schemas
   - **If exists**: `FEATURE_DIR/data-model.md` — entity field definitions

2. **Generate detailed design document** using `docs/detailed-design-template.md`:
   - メタ情報: Fill from FEATURE_DIR context
   - 修正対象ファイル一覧: From tasks.md file paths; list all new/modified files
   - モジュール詳細: For each major file — processing summary, class/function list, sequence diagram (HTML+SVG), parameter definitions (Input/Output), error handling
   - API詳細仕様: From contracts/; show request/response schemas with examples
   - DB操作詳細: From data-model.md; list SQL operations (no destructive DDL per constitution§1)

3. **Output**: Write to `FEATURE_DIR/detailed-design.md` with header note:
   `> **生成元**: /speckit.design detail (AI生成) — 内容を確認の上、承認してから実装を開始すること`

### For `table` (テーブル定義書)

1. **Load context**:
   - **Required**: `FEATURE_DIR/data-model.md` — entity names, fields, relationships
   - **Required**: `FEATURE_DIR/plan.md` — database tech stack (DB type, version)
   - **If exists**: `FEATURE_DIR/contracts/` — data schema references

2. **Generate table definition document** using `docs/table-definition-template.md`:
   - メタ情報: Fill from FEATURE_DIR context
   - テーブル一覧: One row per entity from data-model.md
   - テーブル定義詳細: For each table — column definitions (name, type, length, NOT NULL, default, remarks), indexes, constraints/foreign keys
   - ER図: Generate HTML+SVG ER diagram showing all tables and their relationships
   - DDL参考: Generate CREATE TABLE DDL (no DROP/TRUNCATE per constitution§1); mark as reference only

3. **Output**: Write to `FEATURE_DIR/table-definition.md` with header note:
   `> **生成元**: /speckit.design table (AI生成) — 内容を確認の上、DB担当者が承認してから適用すること`

## Key Rules

- すべての図（コンポーネント図・ER図・シーケンス図等）は **HTMLベースのインラインSVG** で出力する（憲法§7準拠）。
- PlantUML記法のソースを `<!-- plantuml: ... -->` としてコメントに残すこと（再生成を容易にするため）。
- `DROP` / `TRUNCATE` 等の破壊的DDLは生成しない（憲法§1参照）。
- `docs/tech-stack-template.md` への記入・変更は行わない（憲法§5参照）。
- 不明な箇所は `<!-- 要確認: [理由] -->` を付けて残す。
- 各テンプレートファイル自体は修正しない。
