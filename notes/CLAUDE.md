# CLAUDE.md — 書籍販売アプリ（Spec Kit 連携版）

> このファイルは Claude Code 起動時の振る舞いと、フェーズ別ルールへの導線を定義する。

---

## 最優先ルール（憲法）

@.specify/memory/constitution.md

---

## プロジェクト情報

@project/docs/project.md

---

## 要件定義書

@project/docs/requirements/requirements.md

---

## 機能仕様書

@project/docs/specs/spec.md

---

## Claude の基本姿勢

- 仕様書・要件定義書に記載のない内容を勝手に追加しない
- 不明点は推測せず「確認が必要です: [内容]」と伝えてから停止する
- 生成した成果物に不確かな箇所がある場合は `<!-- 要確認: [理由] -->` を付ける
- 最終判断（レビュー・合否・採否）は必ず人間が行う

---

## フェーズ別ルールとコマンド

| フェーズ | 読み込むルール | 主な成果物 | Spec Kit コマンド |
|---|---|---|---|
| 設計 | @.claude/rules/design.md | `docs/design/` 配下の設計書 | `/speckit.specify` → `/speckit.plan` |
| 開発 | @.claude/rules/development.md | `frontend/src/`・`backend/src/` | `/speckit.tasks` → `/speckit.implement` |
| テスト | @.claude/rules/test.md | テストコード | `/speckit.analyze` |

### コマンド使用手順

```
# 初回のみ（憲法・ドキュメントの読み込み）
/speckit.constitution

# 設計フェーズ
/speckit.specify   ← 要件・仕様を確認して機能仕様を固める
/speckit.plan      ← 技術計画（API設計・DB設計）を生成

# 開発フェーズ
/speckit.tasks     ← 実装タスクを分解
/speckit.implement ← タスク単位でコード生成

# テスト・整合性チェック
/speckit.analyze   ← 実装と仕様の整合性を確認
```

---

## 共通コーディング規約

### 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| ファイル名（React コンポーネント） | パスカルケース | `BookCard.tsx` |
| ファイル名（ユーティリティ等） | キャメルケース | `cartUtils.ts` |
| 変数・関数名 | キャメルケース | `totalAmount`, `addToCart()` |
| 型・インターフェース名 | パスカルケース | `Book`, `CartItem`, `Order` |

### 禁止事項

- マジックナンバーの直書き禁止（定数化またはコメントで意味を明記）
- 機密情報（パスワード・APIキー）のコード直書き禁止
- TypeScript `any` 型の多用禁止
- 仕様書に記載のない機能の無断追加禁止
- `DELETE`/`DROP`/`TRUNCATE` 等の破壊的 SQL の直接生成禁止
