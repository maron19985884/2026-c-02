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

## ユーザー要件

@user_requirements.md

---

## 技術選定書

@docs/tech-stack-template.md

---

## Claude の基本姿勢

- 要件定義書・憲法・技術選定書に記載のない内容を勝手に追加しない
- 不明点は推測せず「確認が必要です: [内容]」と伝えてから停止する
- 生成した成果物に不確かな箇所がある場合は `<!-- 要確認: [理由] -->` を付ける
- 最終判断（レビュー・合否・採否）は必ず人間が行う

---

## フェーズ別コマンド

| フェーズ | 主な成果物 | Spec Kit コマンド |
|---|---|---|
| 仕様化 | `specs/[###]/spec.md` | `/speckit.specify` |
| 設計 | `specs/[###]/plan.md` | `/speckit.plan` |
| タスク分解 | `specs/[###]/tasks.md` | `/speckit.tasks` |
| 実装 | ソースコード（tech-stack-template.md 参照） | `/speckit.implement` |
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

# 開発フェーズ
/speckit.tasks     ← 実装タスクを分解
/speckit.implement ← タスク単位でコード生成

# テスト・整合性チェック
/speckit.analyze   ← 実装と仕様の整合性を確認
/speckit.checklist ← 要件品質チェックリストを生成
```

---

## 共通コーディング規約

> **プロジェクト開始時に記入する。** 技術選定書（`docs/tech-stack-template.md`）の
> 技術スタックが確定してから以下を埋めること。

### 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| ファイル名（UIコンポーネント等） | パスカルケース | `BookCard.tsx`, `AddToCartButton.tsx` |
| ファイル名（ユーティリティ等） | キャメルケース | `bookRepository.ts`, `apiClient.ts` |
| 変数・関数名 | キャメルケース | `listForSale`, `bookId` |
| 型・クラス・インターフェース名 | パスカルケース | `Book`, `BookSummary` |

<!-- 002-book-catalog-detail の plan.md（Structure Decision）で決めた慣例をプロジェクト全体のルールとして採用 -->

### 禁止事項

<!-- 以下はすべてのプロジェクト共通。プロジェクト固有の禁止事項は下に追記する -->

- マジックナンバーの直書き禁止（定数化またはコメントで意味を明記）
- 機密情報（パスワード・APIキー）のコード直書き禁止
- 仕様書に記載のない機能の無断追加禁止
- 破壊的 DDL（`DROP`/`TRUNCATE` 等）の直接生成禁止

<!-- プロジェクト固有の禁止事項をここに追記する -->
<!-- 例: TypeScript any 型の多用禁止 -->
<!-- 例: DELETE 文の直接生成禁止 -->

### スコープ外機能（実装禁止）

<!-- requirements.md「2. 対象業務・スコープ」の「対象外」セクションを転記（2026-08-16時点） -->

- ログイン・会員管理
- 決済処理
- 在庫管理
- 管理画面
- レビュー・評価
- 検索・フィルター
