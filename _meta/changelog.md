# Spec Kit テンプレート — 変更ログ

> AI as a Judge 評価（`ai-review.md` 参照）に基づき、CRITICAL→HIGH→MEDIUM の優先順で対処した記録。
> 対処8以降は、その後の利用過程で見つかった個別の指摘への対応。

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
| 8 | 2026-08-26 | `tech-stack.md`（新規）ほか15ファイル | 新規／修正 | tech-stack-template.md の命名・配置矛盾を解消（詳細は後述） |
| 9 | 2026-08-26 | `.claude/commands/speckit.plan.md` | 修正 | Key Rules の技術参照先を `tech-stack.md` に修正 |
| 10 | 2026-08-26 | `_meta/`（新規） | 新規／移動／削除 | 雛形自身の開発履歴を docs/ から分離（詳細は後述） |
| 11 | 2026-08-26 | `docs/inputs/`（新規） | 移動 | 案件開始時に人間が記入する3ファイルを docs/inputs/ へ分離（詳細は後述） |
| 12 | 2026-08-26 | `docs/inputs/tech-stack-example.md`（新規） | 新規 | requirements-example.md と対になる技術選定書の記入例を新規作成（詳細は後述） |

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

---

## 対処8（2026-08-26）：tech-stack-template.md の命名・配置矛盾を解消

**背景**: `docs/tech-stack-template.md` は、ファイル名が `-template` サフィックス付きで `docs/` 配下にある一方、実際の運用は「コピーせず本ファイルを直接編集する」というものだった。これは `requirements.md`（ルート・実物）と `docs/requirements-template.md`（`docs/`・コピー元の空雛形）という他の全ドキュメントの命名規則と矛盾しており、さらにファイル自身のヘッダーが「本ファイルをコピーして…配置する」と書いていたのに対し、`docs/how-to-use.md`§5は「コピーは不要」と正反対の指示をしていた（矛盾が二重になっていた）。

**対処方針**: `requirements.md` と同じ構造に統一する。

| ファイル | 役割 |
|---|---|
| `tech-stack.md`（新設・ルート直下） | この案件の技術選定書の実物。人間が記入。AI編集禁止 |
| `docs/tech-stack-template.md`（維持） | 空の雛形。次の案件用のコピー元として内容を書き換えず保管する |

### 変更点

| # | 対象 | 変更内容 |
|---|---|---|
| 1 | `tech-stack.md`（新規） | `docs/tech-stack-template.md` の本文（セクション1〜6）をそのまま複製し、ヘッダーを「実物」向けに書き換え |
| 2 | `docs/tech-stack-template.md` | ヘッダーを「空の雛形・コピー元」向けに書き換え。自己矛盾していた「コピーして配置」の指示を維持しつつ、`../tech-stack.md`への参照リンクを追加 |
| 3 | `CLAUDE.md` | `@docs/tech-stack-template.md` → `@tech-stack.md` に変更（他の2つの人間記入ドキュメントと同じ形式に統一） |
| 4 | `.specify/memory/constitution.md`§5 | 参照パスを `tech-stack.md` に変更 |
| 5 | `.specify/templates/plan-template.md` | Tech Stack欄・Technical Context欄の参照パスを `tech-stack.md` に変更 |
| 6 | `.claude/commands/speckit.testplan.md` / `speckit.change.md` / `speckit.design.md` | 参照パスを `tech-stack.md` に変更 |
| 7 | `docs/how-to-use.md` | §5「技術選定書の書き方」に雛形コピー手順を追加（従来「コピーは不要」としていた記述を修正）。他11箇所の参照パスを `tech-stack.md` に変更 |
| 8 | `docs/waterfall-preset-guide.md` / `review-gate-template.md` / `change-request-template.md` / `testing-strategy-guide.md` / `requirements-template.md` / `basic-design-template.md` / `overview.md` | 参照パスを `tech-stack.md` に変更（雛形への言及が必要な箇所のみ `docs/tech-stack-template.md` を残す） |
| 9 | `.claude/commands/speckit.plan.md` | Key Rules の「Do NOT select technology — technology is defined in `requirements.md` and `constitution.md`」を「`tech-stack.md`」参照に修正。前回のAI判定（`ai-review.md` C-3）で指摘された、`speckit.plan.md`と`plan-template.md`の矛盾のうち、`plan-template.md`側のヘッダーのみ直っていた分の未対応部分 |

**修正しなかった箇所**: `IBM Bob/changelog.md`・本ファイル自身の対処1〜7の記述・`changelog-speckit-ai-driven-guide.md`・`request-speckit-guide-2026-08-25-issue16.md` — いずれも過去の意思決定を記録した履歴であり、当時は `docs/tech-stack-template.md` が正しいパスだったため書き換えない。

---

## 対処10（2026-08-26）：雛形自身の開発履歴を docs/ から分離

**背景**: `docs/ai-review.md`・`changelog.md`・`changelog-speckit-ai-driven-guide.md`・`request-speckit-guide-2026-08-25-issue16.md` は、この雛形自体をどう直してきたかという制作過程の記録であり、雛形の使い方そのものではない。`how-to-use.md`§3①は「このリポジトリをそのままコピーして新規プロジェクトを始める」運用を案内しているため、このままでは無関係な新規案件にも本プロジェクト（書籍販売アプリ）の改修履歴がまるごと複製されてしまう。また `IBM Bob/ai-review.md`・`IBM Bob/changelog.md` は `docs/` 側と内容が完全に重複していた。

**対処**:
- `docs/ai-review.md`・`changelog.md`・`changelog-speckit-ai-driven-guide.md`・`request-speckit-guide-2026-08-25-issue16.md` を、リポジトリ直下の新規フォルダ `_meta/` へ移動
- `IBM Bob/spec-kit-ai-as-a-judge.html`（`ai-review.md`のHTML版）を `_meta/ai-review.html` として移動
- `docs/`側と完全重複していた `IBM Bob/ai-review.md`・`IBM Bob/changelog.md` は削除（`IBM Bob/`フォルダ自体も消滅）
- `_meta/README.md` を新設し、このフォルダの位置づけ（雛形の使用には不要）を明記
- `docs/`配下からこれらのファイルへの参照は元々存在しなかったため、`how-to-use.md`等の修正は不要だった

---

## 対処11（2026-08-26）：案件開始時の人間入力を docs/inputs/ へ分離

**背景**: `docs/`配下は「案件開始時に一度だけコピーして使う人間入力」（`requirements-template.md`・`requirements-example.md`・`tech-stack-template.md`）と「状況に応じて読む運用ガイド」（`waterfall-preset-guide.md`等）、「AIが読んで成果物を生成するテンプレート」（`test-plan-template.md`等）、「エントリポイント」（`overview.md`・`how-to-use.md`）が混在しており、利用者が迷いやすい。まず性質が最も明確な「案件開始時の人間入力」3ファイルを分離した。

**対処**:
- `docs/requirements-template.md`・`requirements-example.md`・`tech-stack-template.md` を `docs/inputs/` へ移動
- 移動先ファイル内の相対リンク（`../tech-stack.md`→`../../tech-stack.md`、`change-request-template.md`→`../change-request-template.md`、`how-to-use.md`→`../how-to-use.md`）を修正
- 参照元（`requirements.md`・`user_requirements.md`・`tech-stack.md`・`docs/how-to-use.md`・`docs/overview.md`・`docs/waterfall-preset-guide.md`）のパスを `docs/inputs/...` に更新
- `docs/overview.md`の構成図に`inputs/`のネストを反映（他の未反映箇所はスコープ外として据え置き）

**見送った範囲**: 「AIが読んで成果物を生成するテンプレート」（`basic-design-template.md`等）を`.specify/templates/`へ統合する案、「状況依存ガイド」を`docs/guides/`へまとめる案は、参照箇所が多く（それぞれ約54箇所・約33箇所）別途合意の上で着手する。

---

## 対処12（2026-08-26）：技術選定書の記入例を新規作成

**背景**: `docs/inputs/requirements-example.md`（オンライン書店サンプルの記入済み要件定義書）は存在するのに、対になる技術選定書の記入例（`tech-stack-example.md`）が存在しなかった。要件定義書には「良い例・悪い例」に加え記入例ファイルへの参照があるのに対し、技術選定書は`how-to-use.md`§5にインラインの例（React/Node/PostgreSQL）しかなく、`requirements-example.md`とは無関係な技術選択だった。

**対処**:
- `docs/inputs/tech-stack-example.md` を新規作成。`requirements-example.md`と同じ「オンライン書店」案件を前提に、この雛形の前身プロジェクト（`feature/h1nakamu`）で実際に採用されたスタック（Next.js + Express.js + TypeScript + MySQL + Docker Compose、port 3000/4000）を記入し、`requirements-example.md`の非機能要件・制約条件と整合させた
- `tech-stack.md`・`docs/inputs/tech-stack-template.md`のヘッダーと、`docs/how-to-use.md`§5「記入例の参照先」・関連ドキュメント一覧に参照を追加
