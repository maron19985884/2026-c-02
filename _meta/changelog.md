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
| 13 | 2026-08-26 | `docs/guides/`（新規） | 移動 | 状況依存の運用ガイド4本を docs/guides/ へ分離（詳細は後述） |
| 14 | 2026-08-26 | `.specify/templates/`配下7ファイル | 移動 | AI生成テンプレートを .specify/templates/ へ統合（詳細は後述） |
| 15 | 2026-08-26 | `tasks-template.md`・`speckit.tasks.md`・`detailed-design-template.md` | 修正 | Webアプリ固定パス・書籍アプリ残骸（F-2）を汎用化（詳細は後述） |

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

---

## 対処13（2026-08-26）：状況依存の運用ガイドを docs/guides/ へ分離

**背景**: `waterfall-preset-guide.md`・`brownfield-guide.md`・`lint-preset-guide.md`・`testing-strategy-guide.md`は「全案件が読むわけではなく、該当する運用形態のときだけ参照する」という共通の性質を持つ。`docs/`直下では、案件開始時に必ず記入する`docs/inputs/`配下のファイルや、AIが自動で読み込むテンプレート類と混在しており区別しにくかった。

**対処**:
- 上記4ファイルを `docs/guides/` へ移動
- `testing-strategy-guide.md`内の自己参照（`waterfall-preset-guide.md`への言及、2箇所）を相対パスに修正
- 参照元8ファイル（`docs/change-request-template.md`・`docs/review-gate-template.md`・`docs/test-plan-template.md`・`.specify/memory/constitution.md`・`.github/workflows/quality-gate.yml`・`.claude/commands/speckit.change.md`・`docs/how-to-use.md`・`docs/overview.md`）のパスを `docs/guides/...` に更新

これで `docs/` 直下は「エントリポイント」（`overview.md`・`how-to-use.md`）と、まだ未整理の「AIが読んで成果物を生成するテンプレート」7ファイルのみになった。残る③（`.specify/templates/`への統合）は参照箇所が最も多く（約54箇所）、既存の`.specify/templates/`側のファイル命名・構造との整合も検討が必要なため、着手には改めて合意を取ること。

---

## 対処14（2026-08-26）：AI生成テンプレート7本を .specify/templates/ へ統合

**背景**: `basic-design-template.md`・`detailed-design-template.md`・`table-definition-template.md`・`test-plan-template.md`・`review-gate-template.md`・`change-request-template.md`・`change-spec-template.md`は、いずれも「AIがコマンド経由で読み込み、`specs/`や`docs/reviews/`・`docs/changes/`に成果物を生成する」という役割を持つ。`.specify/templates/`には既に`spec-template.md`・`plan-template.md`・`tasks-template.md`・`checklist-template.md`という全く同じ役割のファイルが置かれており、この7ファイルがIssue #16追加時に`docs/`へ置かれたのは、Spec Kit自身が既に持つ置き場所の規約からの逸脱だった。

**対処**:
- 上記7ファイルを `.specify/templates/` へ移動
- `basic-design-template.md`・`detailed-design-template.md`・`table-definition-template.md`内の相対リンク（`../.specify/memory/constitution.md`→`../memory/constitution.md`、`how-to-use.md`→`../../docs/how-to-use.md`）と、`detailed-design-template.md`→`table-definition-template.md`・`review-gate-template.md`→`test-plan-template.md`の兄弟参照を修正
- `docs/inputs/requirements-template.md`内の2つのリンク（変更要求書・フェーズゲート承認記録）を新しい参照先に修正。このうち1つ（フェーズゲート承認記録）は対処11（docs/inputs/移動）の際に見落として壊れたままになっていたバグで、今回あわせて修正した
- 参照元7ファイル（`.claude/commands/speckit.design.md`・`speckit.testplan.md`・`speckit.review.md`・`speckit.change.md`・`.specify/memory/constitution.md`・`docs/guides/waterfall-preset-guide.md`・`docs/guides/brownfield-guide.md`・`docs/guides/testing-strategy-guide.md`・`docs/how-to-use.md`）のパスを更新
- `docs/overview.md`の構成図を更新（`change-spec-template.md`は`.specify/templates/`側へ移設として反映）

**言語方針の明確化**: `.specify/templates/`には元々英語で書かれた`spec-template.md`等（Spec Kit公式）と、日本語で書かれた本プロジェクト追加分（今回移動した7ファイル）が混在することになる。翻訳は行わず、**Spec Kit公式テンプレートは英語のまま、本プロジェクトが追加したテンプレートは日本語で統一する**方針とする。これは前回のAI判定（`ai-review.md` M-4）が指摘していた「テンプレート言語の統一方針が未決定」への回答でもある。

これで `docs/` 直下は `overview.md`・`how-to-use.md`・`guides/`・`inputs/` の4項目のみとなり、②③④すべてが完了した。

---

## 対処15（2026-08-26）：tasks-template.md 等の技術固定・書籍アプリ残骸を汎用化（F-2対応）

**背景**: `plan-template.md`は対処2でNext.js+Express決め打ちからOption 1/2/3の選択式に修正済みだったが、そこから生成される`tasks.md`・`detailed-design.md`側の雛形は直っていなかった。`tasks-template.md`は`backend/src/models/[entity1].ts`・`frontend/src/components/[Component].tsx`というWebアプリ構造を例示し、`speckit.tasks.md`のExamplesには元の書籍アプリの残骸である`backend/src/models/book.ts`・「Create Book model」がそのまま残っていた。さらに`speckit.tasks.md`のタスク生成規則は「Models → Services → Endpoints → Frontend components」という層構造を固定しており、`plan.md`でOption 1（CLI/ライブラリ）を選んだプロジェクトにもfrontend層を前提としたタスクを生成しかねなかった。

**対処**:
- `.specify/templates/tasks-template.md` のPhase 3例示タスク（T009〜T013）のファイルパスを `[path per plan.md Structure Decision]` に置き換え、「plan.mdのStructure Decisionに従う。Webアプリのbackend/frontend構成を既定にしない」旨の注記を追加
- `.claude/commands/speckit.tasks.md` のExamplesから`book.ts`・「Create Book model」を除去し、同様に汎用プレースホルダーに置き換え。タスク生成規則「Within each story」をOption 1/2/3それぞれに対応する順序（例: Option1はModels→Services→CLI/APIエントリポイント）に分岐させた
- `.specify/templates/detailed-design-template.md` の「修正対象ファイル一覧」例示行を `backend/src/...`・`frontend/src/...` の2行から `[plan.mdのStructure Decisionに基づくパス]` の1行に統合し、Option 2以外では`backend/`・`frontend/`構成を仮定しない旨を明記

**追加修正（同日）**: 上記の初回対処では `speckit.tasks.md` に「Option 1（single project）: Models→Services→CLI/APIエントリポイント／Option 2（web application）: Models→Services→Endpoints→Frontend components／Option 3（mobile+API）: API層→モバイルクライアント」という、`plan-template.md`のOption 1/2/3をそのまま複製した固定分岐を書いてしまっていた。これは`plan-template.md`が持つ列挙（閉じた3択ではなく出発点の選択肢）を`speckit.tasks.md`側にも複製することになり、片方だけ変更されると再び同種の不整合（今回のF-2そのもの）を生む設計だった。

`tasks.md`は`tech-stack.md`を直接読まず`plan.md`を読む設計のため（`tech-stack.md`自体にディレクトリ構成の情報はない）、「`plan.md`のStructure Decisionに実際に書かれている層だけを使う」という動的な参照に修正した。固定の3分類を撤廃し、`plan.md`にフロントエンド／プレゼンテーション層が無ければそのタスクを生成しない、という判断をAIに直接行わせる形にした（`speckit.tasks.md`・`tasks-template.md`・`detailed-design-template.md`の3ファイルから`Option 1/2/3`という固定文言を除去）。

---

## 対処16（2026-08-26）：speckit.plan.mdのLoad contextにtech-stack.mdを明記

**背景**: `speckit.plan.md`の「Load context」手順は`FEATURE_SPEC`と`constitution.md`を読むとだけ書かれており、`tech-stack.md`を読むことが明示されていなかった。`tech-stack.md`を読む指示は`plan-template.md`側のコメント（「Read tech-stack.md and fill each field from it」）にしかなく、コマンド本体の手順には出てきていなかった。実害はほぼないが（テンプレート側の指示で結果的に読まれる）、`plan.md`が`tech-stack.md`を入力とすることをコマンド本体でも明示すべきという指摘を受けて対応。

**対処**: `.claude/commands/speckit.plan.md`の「Load context」手順に`tech-stack.md`を追加し、「Read `FEATURE_SPEC`, `tech-stack.md`, and `.specify/memory/constitution.md`」に修正。

---

## 対処17（2026-08-26）：overview.mdの構成図でrequirements-template.mdの説明が矛盾していた点を修正

**背景**: `docs/overview.md`の「雛形の構成」図で、`requirements-template.md`が「（人間が記入）」、`tech-stack-template.md`が「（コピー元。記入は不可）」と、同じ`docs/inputs/`配下の対になるファイルなのに説明の書き方が矛盾していた。対処8で`tech-stack-template.md`について整理した「コピー元は編集せず、コピー先の実物を編集する」という規則が、`requirements-template.md`側の説明には反映されていなかった。

**対処**: 両方とも「コピー元。ルート直下の実物（`requirements.md`／`tech-stack.md`）へコピーして記入。本体の編集は不可」という同じ形式の説明に統一した。

---

## 対処18（2026-08-26）：how-to-use.mdにも同様の「コピーして編集・本体は編集不可」を明記

**背景**: 対処17でoverview.mdの矛盾を修正したが、実際の手順書であるhow-to-use.md側にも同じ問題が残っていた。§4「要件定義書の書き方」の記入手順は「`docs/inputs/requirements-template.md` を参考に `requirements.md` を記入する」という曖昧な表現で、コピーするのか参照するだけなのか、テンプレート本体を直接編集してよいのかが不明確だった。§5「技術選定書の書き方」は「コピーして...配置する」と手順は明記されていたが、「テンプレート本体は編集しない」という直接的な注記はなかった。

**対処**:
- §4の記入手順を§5と同じ「まだ無ければコピーして配置する」形式に修正し、ステップを1つ追加
- §4・§5とも、記入先ファイルを開く手順に「（`docs/inputs/...` 本体は次の案件用のコピー元なので編集しない）」を明記
- これで要件定義書・技術選定書の両方について、「どこにコピーして編集するか」「テンプレート本体は編集しないこと」がoverview.mdとhow-to-use.mdの両方で同じ言い回しに揃った

---

## 対処19（2026-08-26）：testing-strategy-guide.mdの陳腐化した記述を修正（F-4対応）

**背景**: `docs/guides/testing-strategy-guide.md`§2が「`speckit.testplan.md`は現存しない（新規追加が必要）」「`test-plan-template.md`は人間が記入する前提でAIフローに接続されていない」と書いていたが、この記述はIssue #16で`/speckit.testplan`が実装される前に書かれたもので、現在は事実と異なっていた。`how-to-use.md`から本ガイドへ誘導される導線があるため、読者が矛盾した情報に行き当たる状態だった。

**対処**:
- §2を全面更新。「テスト計画書・テストケースの生成は実装済み」であることを明記し、フロー図に`/speckit.testplan`・`/speckit.review`を追加
- 「AIで作成できるもの・できないもの」表を現状に合わせて更新。テスト計画書・テストケース生成を✅実装済みに変更し、未実装として残るのは「リスク分析の生成」（専用コマンド`speckit.risk.md`等が存在しない）のみであることを明示
- 旧「必要な変更の全体像（3層）」は、残課題がリスク分析のみになったため簡略化した「残っている拡張余地」に置き換え
- あわせて、本ガイドが層3の未実装事項として指摘していた「`speckit.implement.md`にhandoff追加」を実施。`.claude/commands/speckit.implement.md`に`/speckit.testplan`へのhandoffを追加し、他のコマンド（`speckit.tasks.md`等）と同じ形式で `/speckit.implement` 完了後に `/speckit.testplan` への導線を明示した

---

## 対処20（2026-08-26）：L-2の検討 — speckit.checklist.mdとspeckit.review.mdの役割分けを注記のみで明確化

**背景**: 前回のAI判定（`ai-review.md` L-2）は「`speckit.checklist.md`が`waterfall-preset-guide.md`のDoDを参照していない」ことを指摘していたが、精査した結果これは誤検知だった。`speckit.checklist.md`は**要件定義書（`spec.md`）の書き方の質**（網羅性・明確さ・一貫性等）を検証するコマンドで、冒頭で"do NOT verify implementation behavior"と明言している。一方DoDは**フェーズの成果物が実在し承認されているか**を確認するもので、既に`/speckit.review`（`.specify/templates/review-gate-template.md`）が担当しており、その「成果物確認チェックリスト」はDoDとほぼ同一内容になっている。両者は目的が異なる別物であり、`speckit.checklist.md`にDoD参照を追加すると「実装・成果物の状態を見ない」という自身の設計原則と矛盾するため、**L-2の対応（DoD参照の追加）は見送る**。

**対処**: 機能の混在は行わず、両コマンドの冒頭に「他コマンドとの違い」を1行注記するのみに留めた。
- `speckit.checklist.md`：要件の書き方の質を検証する旨、DoDの完了判定は`/speckit.review`を使う旨を明記
- `speckit.review.md`：成果物の実在・承認を確認する旨、要件品質のチェックは`/speckit.checklist`を使う旨を明記

---

## 対処21（2026-08-26）：quality-gate.ymlのサイレントな緑バグを解消（F-5対応・一部）

**背景**: `quality-gate.yml`はNode.js/TypeScript・Pythonの2言語にしか自動対応しておらず、`speckit.implement.md`の`.gitignore`判定表（5言語＋その他）や`testing-strategy-guide.md`のJava深掘りとは対応範囲が食い違っていた。加えて、Node.jsでもPythonでもないプロジェクト（Java/Go/Rust等）の場合、両方のLintステップの`if`条件が偽になりスキップされるだけで、**ジョブ自体は失敗せず緑になる**ことが判明した。つまり未対応言語のプロジェクトは「Lintが一つも実行されていないのにCIは緑」というサイレントな見逃し状態だった。最終ステップ「Fail on Lint Errors」も`echo`するだけで実際には何も検査しておらず、この状態を隠す一因になっていた。

**検討した選択肢**: (1) 検出言語をquality-gate.yml自体に追加（Java/Go/Rust等） (2) 検出ロジックの共通スクリプト化 (3) サンプルは現状維持しガイド側にコピー可能なブロックを用意 (4) 対応しない、に加えて長期的な代替案として `github/super-linter` 等の多言語Lint集約ツールへの乗り換えも検討したが、いずれも「対応言語を増やす／変える」という別軸の意思決定であり、それより先に「未対応言語がサイレントに緑になる」というバグ自体を直すことを優先した。

**対処**: 名前倒れだった最終ステップ「Fail on Lint Errors」を「Verify a Lint stack was detected」に置き換えた。`hashFiles('package.json') == '' && hashFiles('pyproject.toml') == ''`（＝どちらの言語判定にも該当しない）の場合に明示的に`exit 1`し、「この言語用のLintブロックが未定義」という設定不足を、コード自体のLintエラー（各言語のLintステップが個別に失敗させる、従来通りの経路）と区別できるようにした。あわせて、新しい言語ブロックを追加する際はこのif条件にも判定ファイルを追記する必要がある旨をファイル冒頭のコメントに明記した。

**見送った範囲**: Java/Go/Rust等のLintブロック追加、および多言語Lint集約ツールへの乗り換え検討は、対応言語の範囲という別の意思決定を伴うため、今回のスコープに含めず別タスクとした。
