# Spec Kit テンプレート — AI as a Judge 評価レポート

> **評価日**: 2026-07-13
> **評価対象**: `worktrees/h1nakamu_speckit` 全ファイル精読
> **評価観点**: 汎用性・ウォーターフォール整合・AI駆動度・保守性

---

## 総合スコア：62 / 100　→　**不合格**

| 観点 | スコア | コメント |
|---|---|---|
| ① フロー設計 | 16/20 | コマンドが揃い handoffs も設定済み。骨格は完成。 |
| ② AI命令の精度 | 13/20 | コマンドとテンプレートの矛盾、固有技術の混在が判断を揺らす。 |
| ③ ウォーターフォール整合 | 8/20 | ガイドはあるが実働するテンプレート（テスト・承認・変更管理）が欠如。 |
| ④ 汎用性・移植性 | 13/20 | 思想は汎用的だが、具体技術・ドメイン固有の記述が随所に残る。 |
| ⑤ 保守性・一貫性 | 12/20 | 言語不統一、プレースホルダー未解決、書式崩れが信頼性を下げている。 |

---

## 合否判断の根拠

合格ライン **70点** に対して **62点** のため不合格。点数の問題というより、**CRITICAL 判定の欠陥が3つある**ことが不合格の直接理由。1つでも CRITICAL があれば合格にはならない。

| 判定軸 | 判断 | 理由 |
|---|---|---|
| 「動くか」 | △ 条件付き | 現プロジェクト（書籍販売アプリ）では動く。汎用テンプレートとしては動かない箇所がある |
| 「矛盾がないか」 | ✗ NG | `speckit.plan.md` の命令と `plan-template.md` の内容が直接矛盾している |
| 「本番投入できるか」 | ✗ NG | `constitution.md` にプレースホルダーと `※要修正` が残ったまま |
| 「ウォーターフォールとして完結しているか」 | ✗ NG | テスト計画書・承認記録・変更要求書のテンプレートがない |

---

## エグゼクティブサマリー

### 良いところ

- Spec Kit の仕様駆動フロー（specify → clarify → plan → tasks → implement → analyze）が正しく揃っている。骨格は機能する。
- 憲法・要件定義書・技術選定書の「人間が決める／AIが生成する」責任分担の思想が明確で、汎用テンプレートとして再利用しやすい設計になっている。
- `docs/` のガイド群（waterfall / brownfield / lint-preset）に出典URLと「確証が取れなかった情報」の明示があり、誠実な情報品質管理ができている。

### 問題点

- ウォーターフォールを謳っているが、テストフェーズの成果物・承認ゲートがほぼ未定義。
- `constitution.md` に未解決プレースホルダーと `※要修正` 注記が残っており、そのまま本番利用できない。
- `CLAUDE.md` の命名規則とスコープ外リストが書籍販売アプリ固有の内容のまま。
- `plan-template.md` のソースコード構造が Next.js + Express.js 固定で、他技術スタックで使えない。
- `speckit.plan.md` が「技術を選ばない」と宣言しているのに、`plan-template.md` 側で技術スタックを決め打ちしており矛盾している。
- `speckit.implement.md` が `.gitignore` を Node.js/TypeScript 固定で検証する命令を持っており、言語非依存でない。

---

## 詳細所見

### CRITICAL（リリース前に必須対処）

#### C-1: constitution.md に未解決プレースホルダーと ※要修正 が残存
- **対象**: `.specify/memory/constitution.md`
- **内容**: `[組織名]`、`[例: 80%]`、`[標準的なCSSルール]`、`[WCAG 2.1 AA]`（角括弧のまま）、`※要修正` が複数残っている。憲法は最優先ルールとして CLAUDE.md から `@` インポートされるため、AI がこれらを実際の制約として解釈してしまうリスクがある。
- **対処**: プレースホルダーを実値または「未定義（プロジェクトで記入）」という明示的な表現に置き換える。

#### C-2: plan-template.md のソースコード構造が Next.js+Express 固定
- **対象**: `.specify/templates/plan-template.md`
- **内容**: `backend/src/models/`、`frontend/src/components/` という具体的なディレクトリツリーがハードコード。「Structure Decision: Web application (Next.js frontend + Express.js backend)」と書かれており、他技術スタックのプロジェクトに適用すると AI がこの構造を前提に計画を生成してしまう。
- **対処**: 選択肢形式（Option 1: Single project / Option 2: Web app / Option 3: Mobile+API）に変更し、具体技術名を除去する。

#### C-3: speckit.plan.md の「技術を選ばない」宣言と plan-template.md の決め打ちが矛盾
- **対象**: `.claude/commands/speckit.plan.md` & `.specify/templates/plan-template.md`
- **内容**: コマンドファイルは「Do NOT select technology」と明示しているのに、参照先テンプレートには Next.js / Express.js 固定の構造が書かれている。AI はテンプレートをコピーして埋めるため、コマンドの制約よりテンプレートの内容が優先されてしまう。
- **対処**: テンプレート側を技術非依存の形式に修正し、コマンドとテンプレートの一貫性を確保する。

### HIGH（ウォーターフォール運用に影響）

#### H-1: テストフェーズの成果物テンプレートが存在しない
- **対象**: `docs/` 全体
- **内容**: `waterfall-preset-guide.md` にはテストフェーズがあるが、テスト計画書・テスト報告書・テスト結果承認記録に対応するテンプレートが一切ない。
- **対処**: `docs/test-plan-template.md`（テスト計画）、`docs/review-gate-template.md`（フェーズ承認記録）を新規作成する。

#### H-2: 各フェーズの完了定義（DoD）が未定義
- **対象**: `docs/waterfall-preset-guide.md`
- **内容**: 承認ゲートの存在は言及されているが、「何をもって完了とするか」の判定基準が書かれていないため、誰が見ても同じ判断を下せない。
- **対処**: 各フェーズに DoD チェックリストを追加する。

#### H-3: 変更管理プロセスが言及のみで実体がない
- **対象**: `docs/waterfall-preset-guide.md`
- **内容**: 「計画確定後の要件変更は変更管理プロセス（別途、変更要求書）を経由させる」と書かれているが、変更要求書テンプレートが存在しない。
- **対処**: `docs/change-request-template.md`（変更要求書）を作成する。

### MEDIUM（汎用性・保守性に影響）

#### M-1: CLAUDE.md の命名規則・スコープ外リストが書籍アプリ固有
- **対象**: `CLAUDE.md`
- **内容**: 「BookCard.tsx」「cartUtils.ts」「CartItem」「Order」という具体例、およびスコープ外リストが書籍販売アプリのもの。
- **対処**: 命名規則の例を汎用的な記号に置き換え、スコープ外リストを「プロジェクトで記入」形式にする。

#### M-2: speckit.implement.md の .gitignore 検証が Node.js 固定
- **対象**: `.claude/commands/speckit.implement.md`
- **内容**: Node.js/TypeScript と Docker のパターン固定で検証する命令がある。汎用テンプレートとして Python や Java プロジェクトに使うと不適切な検証が走る。
- **対処**: `plan.md` の技術スタックを参照し、その言語に対応するパターンを確認する動的な命令に書き換える。

#### M-3: requirements-template.md に版管理・承認欄がない
- **対象**: `docs/requirements-template.md`
- **内容**: ウォーターフォールでは要件定義書は正式ドキュメントとして版管理・承認が必要だが、変更履歴テーブルも承認欄もない。
- **対処**: 変更履歴テーブルとフェーズゲート承認欄を追加する。

#### M-4: テンプレートが英語、他ドキュメントが日本語で言語不統一
- **対象**: `.specify/templates/` 配下（英語）と `docs/`、`CLAUDE.md`（日本語）
- **内容**: AI が生成する成果物の言語が揺れると、レビューや検索効率が下がる。
- **対処**: テンプレート言語をプロジェクトで統一する方針を `constitution.md` または `docs/overview.md` に明記する。

### LOW（品質向上）

#### L-1: constitution.md セクション7「設計ルール」の書式が不揃い
- **対象**: `.specify/memory/constitution.md`
- **内容**: セクション1〜6はスペース区切りの箇条書きだが、セクション7は `-基本設計書について`（ハイフン後スペースなし）と書式が崩れている。
- **対処**: 他セクションと同様のフォーマットに統一する。

#### L-2: speckit.checklist.md が docs/ のガイドを参照していない
- **対象**: `.claude/commands/speckit.checklist.md`
- **内容**: `waterfall-preset-guide.md` や `requirements-template.md` がフェーズゲートの基準として存在しているのに、チェックリスト生成コマンドからそれらへの参照がない。
- **対処**: `docs/waterfall-preset-guide.md` の DoD を参照してフェーズゲートチェックリストを生成できる旨を明記する。

---

## 推奨する対応優先順位

| # | 対応内容 | 対象ファイル | 難度 |
|---|---|---|---|
| 1 | `constitution.md` のプレースホルダー・※要修正を解消する | `.specify/memory/constitution.md` | 低 |
| 2 | `plan-template.md` を技術非依存の選択肢形式に戻す | `.specify/templates/plan-template.md` | 低 |
| 3 | `CLAUDE.md` の命名規則・スコープ外リストを汎用化する | `CLAUDE.md` | 低 |
| 4 | テスト計画・フェーズ承認・変更要求書テンプレートを新規作成 | `docs/` 新規3ファイル | 中 |
| 5 | `requirements-template.md` に変更履歴・承認欄を追加 | `docs/requirements-template.md` | 低 |
| 6 | `waterfall-preset-guide.md` に各フェーズの DoD を追加 | `docs/waterfall-preset-guide.md` | 中 |
| 7 | `speckit.implement.md` の gitignore 検証を動的化 | `.claude/commands/speckit.implement.md` | 低 |
