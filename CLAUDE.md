# CLAUDE.md — Spec Kit 仕様駆動開発テンプレート

> このファイルは Claude Code 起動時の振る舞いと、フェーズ別ルールへの導線を定義する。
> プロジェクト固有の内容（命名規則・スコープ外機能等）は
> 各セクションの指示に従って記入してから使用すること。

---

## 最優先ルール（憲法）

@.specify/memory/constitution.md

---

## 要件定義書

@requirements.md

---

## 技術選定書

@tech-stack.md

---

## Claude の基本姿勢

- 要件定義書（`requirements.md`）・憲法・技術選定書に記載のない内容を勝手に追加しない
- 不明点は推測せず「確認が必要です: [内容]」と伝えてから停止する
- 生成した成果物に不確かな箇所がある場合は `<!-- 要確認: [理由] -->` を付ける
- 最終判断（レビュー・合否・採否）は必ず人間が行う

---

## フェーズ別コマンド

| フェーズ | 主な成果物 | Spec Kit コマンド |
|---|---|---|
| 仕様化 | `specs/[###]/spec.md` | `/speckit.specify` |
| 仕様曖昧さ解消 | （対話形式） | `/speckit.clarify` |
| 設計 | `specs/[###]/plan.md` | `/speckit.plan` |
| 設計書生成 | `basic-design.md` / `detailed-design.md` / `table-definition.md` | `/speckit.design` |
| タスク分解 | `specs/[###]/tasks.md` | `/speckit.tasks` |
| 実装 | ソースコード（tech-stack.md 参照） | `/speckit.implement` |
| テスト計画 | `specs/[###]/test-plan.md` | `/speckit.testplan` |
| フェーズ承認 | `docs/reviews/review-gate.md` | `/speckit.review` |
| 変更要求 | `docs/changes/change-request.md` | `/speckit.change` |
| 整合性確認 | 分析レポート | `/speckit.analyze` |

### コマンド使用手順

```
# 初回のみ（憲法の読み込み・更新）
/speckit.constitution

# 仕様化フェーズ
/speckit.specify   ← 要件・仕様を確認して機能仕様を固める
/speckit.clarify   ← 仕様の曖昧な部分を明確化する

# 設計フェーズ
/speckit.plan      ← 技術計画（API設計・DB設計）を生成
/speckit.design    ← 基本設計書・詳細設計書・テーブル定義書を生成（ウォーターフォールの場合）

# 開発フェーズ
/speckit.tasks     ← 実装タスクを分解
/speckit.implement ← タスク単位でコード生成

# テスト・整合性チェック
/speckit.testplan  ← テスト計画書を生成
/speckit.analyze   ← 実装と仕様の整合性を確認
/speckit.checklist ← 要件品質チェックリストを生成

# フェーズゲート・変更管理（ウォーターフォールの場合）
/speckit.review    ← フェーズ完了の承認記録を生成
/speckit.change    ← 仕様変更の変更要求書を生成
```

---

## 共通コーディング規約

命名規則・禁止事項・スコープ外機能は `tech-stack.md`（技術選定書 兼 開発規約）の §7〜§9 に記載します。
`CLAUDE.md` には直接記入しないでください。

> 参照: [`tech-stack.md`](tech-stack.md) §7 命名規則 / §8 プロジェクト固有の禁止事項 / §9 スコープ外機能
