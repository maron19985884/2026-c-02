# Spec Kit テンプレート — 変更ログ

> AI as a Judge 評価（`docs/ai-review.md` 参照）に基づき、CRITICAL→HIGH→MEDIUM の優先順で対処した記録。

---

## 変更履歴

| # | 日付 | 対象ファイル | 変更種別 | 概要 |
|---|---|---|---|---|
| 1 | 2026-07-13 | `.specify/memory/constitution.md` | 修正 | プレースホルダー・※要修正を解消 |
| 2 | 2026-07-13 | `.specify/templates/plan-template.md` | 修正 | 技術非依存の選択肢形式に変更 |
| 3 | 2026-07-13 | `CLAUDE.md` | 修正 | 命名規則・スコープ外リストを汎用化 |
| 4 | 2026-07-13 | `docs/change-request-template.md` | 新規 | 変更要求書テンプレートを作成 |
| 4 | 2026-07-13 | `docs/review-gate-template.md` | 新規 | フェーズゲート承認記録テンプレートを作成 |
| 4 | 2026-07-13 | `docs/test-plan-template.md` | 新規 | テスト計画書テンプレートを作成 |
| 5 | 2026-07-13 | `docs/requirements-template.md` | 修正 | 変更履歴・承認欄を追加 |
| 6 | 2026-07-13 | `docs/waterfall-preset-guide.md` | 修正 | 各フェーズの DoD・ドキュメント一覧を追加 |
| 7 | 2026-07-13 | `.claude/commands/speckit.implement.md` | 修正 | gitignore 検証を言語動的判定に変更 |

---

## 対処1：constitution.md のプレースホルダー・※要修正を解消

**対象**: `.specify/memory/constitution.md`

### 変更点（7箇所）

| # | 変更前 | 変更後 | 理由 |
|---|---|---|---|
| 1 | ヘッダーに「以下は初期値の雛形。`[組織名]` などのプレースホルダーと `[例: ...]` の箇所を自組織の基準に置き換えて」という案内文 | 案内文を削除。「プロジェクト個別の微調整が必要な場合のみ～」の1行のみ残す | プレースホルダー解消後もこの説明が残ると「まだ雛形状態」とAIが誤解するリスクがある |
| 2 | `[組織名] のコードは` | `すべてのコードは` | 組織名プレースホルダーを除去 |
| 3 | `カバレッジ目標は [例: 80%] 以上` | `技術選定書で定義する（未定義の場合は 80% を暫定適用する）` | 単純に値を固定せず「技術選定書で上書きできる」構造にして汎用性を保つ |
| 4 | `結合テスト・E2Eテストの要否は機能の重要度に応じて判断する。　※要修正` | `重要度の基準は要件定義書の優先度（高/中/低）に従う` を追記し `※要修正` を削除 | 未解決の注記を具体的な基準に置き換える |
| 5 | `UIは[標準的なCSSルール]に準拠する` | `技術選定書で定義したCSSフレームワーク・デザインシステムに準拠する。未定義の場合はブラウザデフォルトスタイルを基準とする` | AI が「標準的なCSSルール」を独自解釈するのを防ぐ。未定義プロジェクトでもフォールバックを明記 |
| 6 | `[95パーセンタイルで1秒以内]`、`[100]`、`[水平スケール前提]` の3つの数値プレースホルダー | プロジェクトの要件定義書参照→未定義時の暫定基準という構造に統一 | 固定値を憲法に持つのではなく要件定義書との連携に切り替え |
| 7 | `-基本設計書について`（ハイフン後スペースなし、`ください`調） | `- 基本設計書について`（他セクションと同じ書式・体言止め） | 書式統一 |

---

## 対処2：plan-template.md を技術非依存の選択肢形式に修正

**対象**: `.specify/templates/plan-template.md`

### 変更点（4箇所）

| # | 変更前 | 変更後 | 理由 |
|---|---|---|---|
| 1 | ヘッダーに技術選定書への参照なし | `**Tech Stack**: Defined in docs/tech-stack-template.md (do NOT re-select here)` を追加 | `speckit.plan.md` コマンドの「技術を選ぶな」という命令をテンプレート自体にも書き込み、矛盾を解消 |
| 2 | `[e.g., TypeScript 5.x or NEEDS CLARIFICATION]` のように例示値が混在 | `[from tech-stack-template.md]` に統一し、冒頭に読み込み先の指示を追加 | AI が例示値（TypeScript、Next.js 等）を既定値として採用するのを防ぐ |
| 3 | `[Gates determined based on constitution file]`（ファイル不明） | `[Gates determined based on .specify/memory/constitution.md]`（パス明示） | 参照先を明確化 |
| 4 | Next.js + Express.js の構造が唯一の選択肢としてハードコード | Option 1（シングルプロジェクト）・Option 2（Webアプリ）・Option 3（モバイル+API）の3択形式に変更。Structure Decision もプレースホルダーに変更 | どの技術スタックでも使える汎用テンプレートに変更 |

---

## 対処3：CLAUDE.md の命名規則・スコープ外リストを汎用化

**対象**: `CLAUDE.md`

### 変更点（5箇所）

| # | 変更前 | 変更後 | 理由 |
|---|---|---|---|
| 1 | `# CLAUDE.md — 書籍販売アプリ（Spec Kit 連携版）` | `# CLAUDE.md — Spec Kit 仕様駆動開発テンプレート` | タイトルを汎用化 |
| 2 | `@` インポートが憲法・要件定義書・ユーザー要件の3点 | `@docs/tech-stack-template.md` を追加（4点に） | `plan-template.md` の変更と整合。技術選定書を Claude の起動時コンテキストに含める |
| 3 | `frontend/src/`, `backend/src/` 固定 | `ソースコード（tech-stack-template.md 参照）` | 技術スタック依存の記述を除去 |
| 4 | `BookCard.tsx`、`cartUtils.ts`、`Book`/`CartItem`/`Order` という書籍アプリ固有の具体例 | `（プロジェクトで定義）` と `（記入例: パスカルケース）` の形式に変更 | どの言語でも使える構造に変更 |
| 5 | ログイン・会員管理・決済処理等の書籍アプリ固有スコープ外リスト | `<!-- 要件定義書の「対象外」セクションを転記する -->` という記入指示コメントに変更 | プロジェクト固有の内容を除去し、記入待ちのテンプレートとして明示 |

---

## 対処4：テスト計画・フェーズ承認・変更要求書テンプレートを新規作成

### `docs/change-request-template.md`（新規）

ウォーターフォールのフェーズ確定後に要件・設計・スコープの変更が発生した場合に起票するドキュメント。

**主な構成**:
- 基本情報（変更要求番号・起票者・起票日・対象フェーズ）
- 変更前後の比較表（requirements.md / spec.md / plan.md / tasks.md 各箇所）
- 影響分析（スコープ・工数・技術・リスク）
- 対応方針（承認／否決／保留）
- 承認欄（起票者・PM / プロジェクトリーダー・顧客代表）

### `docs/review-gate-template.md`（新規）

ウォーターフォール各フェーズ完了時に記入・保管する承認記録。

**主な構成**:
- 6フェーズ分の成果物確認チェックリスト（要件定義 / 設計 / 実装計画 / 実装 / テスト / リリース）
- 指摘事項管理表（重大度・対応方針・対応期限・解消確認日）
- 承認判定（承認 / 条件付き承認 / 差し戻しの3段階）
- 承認署名欄

### `docs/test-plan-template.md`（新規）

`/speckit.implement` 完了後、テストフェーズ開始前に記入するテスト計画書。

**主な構成**:
- テスト種別と実施範囲（単体・結合・E2E・UAT・性能・セキュリティ）
- 合否判定基準（Exit Criteria）
- テストケース一覧（spec.md の Acceptance Scenarios から展開）
- テスト環境定義
- バグ管理方針（重大度定義：Critical / High / Medium / Low）
- テスト開始前の承認欄

---

## 対処5：requirements-template.md に変更履歴・承認欄を追加

**対象**: `docs/requirements-template.md`

### 変更点（3箇所）

| # | 変更前 | 変更後 |
|---|---|---|
| 1 | 変更履歴なし | 変更履歴テーブル（バージョン・日付・変更者・内容）を冒頭に追加 |
| 2 | セクション6（用語定義）で終了 | セクション7「承認（フェーズゲート）」を追加（承認者・承認日・判定の記録欄） |
| 3 | 変更管理への言及なし | 冒頭に「フェーズ確定後の変更は `change-request-template.md` を通じて管理する」旨のリンクを追加 |

---

## 対処6：waterfall-preset-guide.md に各フェーズの DoD を追加

**対象**: `docs/waterfall-preset-guide.md`

### 変更点（4箇所）

| # | 変更前 | 変更後 |
|---|---|---|
| 1 | フェーズ対応表が3列（フェーズ・コマンド・承認ゲート） | 4列に拡張（フェーズ・コマンド・**主な成果物**・承認ゲート）。テストフェーズの成果物（`test-plan-template.md`）も明記 |
| 2 | DoD（完了定義）なし | 「各フェーズの完了定義（Definition of Done）」セクションを追加。6フェーズ分のチェックリスト形式で定義 |
| 3 | ドキュメント一覧なし | 「ドキュメント一覧」表を追加（人間が作るもの vs AI が生成するものを整理） |
| 4 | 変更管理の参照先が「別途、変更要求書」（ファイル不明） | `docs/change-request-template.md` の実ファイルリンクに変更 |

---

## 対処7：speckit.implement.md の gitignore 検証を動的化

**対象**: `.claude/commands/speckit.implement.md`

### 変更点

| 変更前 | 変更後 |
|---|---|
| 「`.gitignore` に Node.js/TypeScript と Docker のパターンが含まれているか検証する」固定命令 | `plan.md` の Technical Context を読んでから言語を特定し、その言語に対応するパターンを検証する動的な判定テーブルに変更 |

**判定テーブル（6パターン対応）**:

| Detected stack | Files to verify |
|---|---|
| Node.js / JavaScript / TypeScript | `.gitignore` (node_modules/, dist/, .env*) |
| Python | `.gitignore` (__pycache__/, .venv/, dist/) |
| Java / Kotlin | `.gitignore` (target/, build/, *.class) |
| Go | `.gitignore` (*.exe, vendor/, *.out) |
| Rust | `.gitignore` (target/, debug/) |
| その他 | `.gitignore` 最低限 (.env*, *.log, .DS_Store, Thumbs.db) |
