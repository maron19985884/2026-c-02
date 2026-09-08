# ウォーターフォール運用ガイド（Spec Kit preset化）

## 結論
Spec Kit公式のpreset／extension機構と、プロジェクト固有のテンプレート・コマンドを組み合わせることで、Spec Kitのコア（Spec→Plan→Tasks→Implement）を変更せずに、ウォーターフォール型の運用へ適応できます。

ただし、本リポジトリで確認できるのは、preset機能を利用するための手順と、ウォーターフォール向けのテンプレート・コマンドを組み合わせた運用設計です。GitHub公式が完成済みのWaterfall presetを配布していることや、本リポジトリでWaterfall presetの適用が完了していることを示す証跡は確認できません。

## 理由
公式READMEには、presetの用途例として、規制上のトレーサビリティを満たすためのspecテンプレートの再構成、Agile・Kanban・Waterfallなどの開発方法論へのワークフロー適応、計画段階への必須セキュリティレビューゲートの追加が挙げられています。また、複数のpreset／extensionを優先度付きで重ねて適用する仕組みも説明されています。

ただし、これらはpreset機構の用途例であり、GitHub公式がWaterfall preset本体を提供していることを意味しません。公式情報を引用する場合は、対象リリースまたはコミットと該当箇所を併記し、利用時点で内容を再確認してください。

### 公式出典（確認済み）

以下は、2026-08-26 に確認した `github/spec-kit` の `main` ブランチのコミット `0c8e31ff0a98c362696c2edb6a1bb25a37f68544` における該当箇所です。

- [Spec Kit README — Making Spec Kit Your Own: Extensions & Presets](https://github.com/github/spec-kit/blob/0c8e31ff0a98c362696c2edb6a1bb25a37f68544/README.md#-making-spec-kit-your-own-extensions--presets)
- [Spec Kit README — Extensions: Add New Capabilities](https://github.com/github/spec-kit/blob/0c8e31ff0a98c362696c2edb6a1bb25a37f68544/README.md#extensions--add-new-capabilities)
- [Spec Kit README — Presets: Customize Existing Workflows](https://github.com/github/spec-kit/blob/0c8e31ff0a98c362696c2edb6a1bb25a37f68544/README.md#presets--customize-existing-workflows)
- [Spec Kit README — Preset commands and Waterfall use case](https://github.com/github/spec-kit/blob/0c8e31ff0a98c362696c2edb6a1bb25a37f68544/README.md#presets--customize-existing-workflows)

READMEには、presetの例としてWaterfallへの適応、必須セキュリティレビューゲート、`specify preset search`、`specify preset add <preset-name>`、複数presetの優先度付きスタックが記載されています。一方、この出典はpreset機構の説明であり、GitHub公式が完成済みのWaterfall presetを配布していることを示すものではありません。

## Spec Kitフェーズ ↔ ウォーターフォールフェーズ対応表

| ウォーターフォールフェーズ | Spec Kitコマンド | 主な成果物（🧑 人間 / 🤖 AI） | 承認ゲート |
|---|---|---|---|
| 要件定義 | 要件定義書（人間）→ `/speckit.specify` → `/speckit.clarify` → `/speckit.review` | 🧑 `requirements.md` ／ 🤖 `spec.md`、`docs/reviews/phase1-*.md` | AI生成の承認記録に人間が署名 |
| 基本設計・詳細設計 | 技術選定書（人間）→ `/speckit.plan` → `/speckit.design basic` → `/speckit.design detail` → `/speckit.design table` → `/speckit.review` | 🧑 `tech-stack.md` ／ 🤖 `plan.md`、`basic-design.md`、`detailed-design.md`、`table-definition.md`、`docs/reviews/phase2-*.md` | AI生成設計書に人間が承認署名 |
| 実装計画 | `/speckit.tasks` → `/speckit.analyze` → `/speckit.review` | 🤖 `tasks.md`、`docs/reviews/phase3-*.md` | AI生成の承認記録に人間が署名 |
| 実装 | `/speckit.implement` | 🤖 ソースコード | コードレビュー＋Lint品質ゲート（`.github/workflows/quality-gate.yml`） |
| テスト | `/speckit.testplan` → 単体・結合・受け入れテスト実施 → `/speckit.review` | 🤖 `test-plan.md`、`docs/reviews/phase5-*.md` ／ 🧑 テスト実施結果 | AI生成テスト計画を承認 → テスト結果に人間が署名 |
| リリース | デプロイ → `/speckit.review` | 🤖 `docs/reviews/phase6-*.md` | リリース承認 |

## 各フェーズの完了定義（Definition of Done）

> 各フェーズの詳細な完了条件（成果物確認チェックリスト）は `.specify/templates/review-gate-template.md` の「2. 成果物確認チェックリスト」を**唯一の正**とする。ここでは重複を避けるため、そのチェックリストと承認署名の2条件のみを示す。詳細な項目を追加・変更する場合は `review-gate-template.md` 側を更新すること（本ファイル側は更新不要）。

### 要件定義フェーズ DoD
- [ ] `review-gate-template.md` の「要件定義フェーズ」欄が全項目満たされていること
- [ ] フェーズゲート承認記録（`docs/reviews/phase1-*.md`）の要件定義フェーズ欄が承認済みであること

### 設計フェーズ DoD
- [ ] `review-gate-template.md` の「設計フェーズ」欄が全項目満たされていること
- [ ] フェーズゲート承認記録の設計フェーズ欄が承認済みであること

### 実装計画フェーズ DoD
- [ ] `review-gate-template.md` の「実装計画フェーズ」欄が全項目満たされていること
- [ ] フェーズゲート承認記録の実装計画欄が承認済みであること

### 実装フェーズ DoD
- [ ] `review-gate-template.md` の「実装フェーズ」欄が全項目満たされていること
- [ ] フェーズゲート承認記録の実装欄が承認済みであること

### テストフェーズ DoD
- [ ] `review-gate-template.md` の「テストフェーズ」欄が全項目満たされていること
- [ ] フェーズゲート承認記録のテスト欄が承認済みであること

### リリースフェーズ DoD
- [ ] `review-gate-template.md` の「リリースフェーズ」欄が全項目満たされていること
- [ ] フェーズゲート承認記録のリリース欄が承認済みであること

## 具体的な実装方法
1. **承認ゲート用preset／extensionの作成**: 各フェーズ完了時に「承認者・承認日・承認条件」を記載する必須セクションを、対象となるテンプレートやコマンドに追加する。既存の挙動・テンプレートを上書きする場合はpreset、新しいコマンドや処理を追加する場合はextensionを使用する。
   ```
   specify preset search
   specify preset add <company-waterfall-preset>
   ```
   これらはpreset機能を利用するためのコマンド例である。本リポジトリの `feature/oono_test1` ブランチではコマンド例の記載を確認できるが、`company-waterfall-preset` の実体、追加の成功ログ、適用前後の差分までは確認できない。そのため、導入時は対象環境で実行結果を記録すること。
2. **フェーズを後退させない運用ルール**: ウォーターフォールでは前フェーズへの後戻りを抑制するため、`/speckit.clarify` を `/speckit.plan` の前に必ず実行する。計画確定後に要件変更が発生した場合は、変更管理プロセス（`.specify/templates/change-request-template.md`）を経由させ、影響範囲に応じて関連成果物を再生成・再承認する。
3. **ドキュメント成果物の正式化**: 人間が用意した「要件定義書」「技術選定書」を入力とし、そこから生成された `specs/<feature>/spec.md`（詳細仕様）・`plan.md`（設計）・`tasks.md`（作業計画）を正式な承認フローに乗せる。成果物はMarkdownのまま版管理し、必要に応じてWord／PDFへ変換する。入力ドキュメントと生成物の両方を版管理し、承認記録と関連付けて証跡とする。

## ドキュメント一覧

| ドキュメント | 誰が作るか | コマンド / 担当 | フェーズ |
|---|---|---|---|
| `requirements.md` | **人間** | 手作業で記入 | 要件定義 |
| `tech-stack.md` | **人間** | 手作業で記入（AI編集禁止。雛形は `docs/inputs/tech-stack-template.md`） | 設計 |
| `specs/[###]/spec.md` | AI | `/speckit.specify` | 要件定義 |
| `specs/[###]/plan.md` | AI | `/speckit.plan` | 設計 |
| `specs/[###]/basic-design.md` | AI | `/speckit.design basic` | 設計 |
| `specs/[###]/detailed-design.md` | AI | `/speckit.design detail` | 設計 |
| `specs/[###]/table-definition.md` | AI | `/speckit.design table` | 設計 |
| `specs/[###]/tasks.md` | AI | `/speckit.tasks` | 実装計画 |
| `specs/[###]/test-plan.md` | AI | `/speckit.testplan` | テスト |
| `docs/reviews/phase[N]-*.md` | AI（署名は人間） | `/speckit.review` | 全フェーズ |
| `docs/changes/CR-[NNN]-*.md` | AI（承認は人間） | `/speckit.change [変更の概要]` | 全フェーズ |

## 💡 補足
- **Spec Kitの位置づけ**: Spec KitはSDD（仕様駆動開発）の思想に基づき、仕様を「実装後も更新され続ける生きた文書」として扱います。ウォーターフォールの「フェーズ確定後は原則変更しない」という運用にする場合は、承認ゲートと変更管理を追加する必要があります。Spec Kit本体がウォーターフォール専用モードを持っているわけではありません。
- **AIの役割**: `/speckit.review` は、成果物の存在確認やレビュー記録の下書き生成を行う補助機能です。内容の業務妥当性、承認、署名、リスク受容をAIが確定するものではありません。最終的な承認は人間が行います。
- **実装フェーズの扱い**: 実装フェーズを正式なフェーズゲートに含める場合は、コードレビュー、Lint、テスト、カバレッジなどの確認結果をレビュー記録に含め、実装完了時にも人間の承認を取得します。実装をCIとコードレビューだけで管理する場合は、対応表とDoDの記載をその方針に統一してください。
- **落とし穴**: 複数人開発の場合、`/speckit.tasks` で生成されるタスクの粒度（1タスクあたり1〜2ファイル程度）が細かすぎることがあります。要員アサインは `tasks.md` をベースに、PM側で人単位・工程単位に再編成する運用が必要です。
- **検証状況**: `feature/oono_test1` ブランチの `docs/guides/lint-preset-guide.md` に、`specify preset search` と `specify preset add <company-preset-name>` のコマンド例が記載されています。一方、Waterfall presetの実体、実行成功ログ、適用前後の差分は同ブランチ内で確認できません。したがって、本ガイドで確認済みとするのはpreset機能の利用手順であり、Waterfall presetの導入完了ではありません。
