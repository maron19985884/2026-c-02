# ウォーターフォール運用ガイド（Spec Kit preset化）

## 結論
Spec Kit公式は、presetによって「Agile、Kanban、Waterfallなど、利用中の開発方法論にワークフローを適応させる」ことを明示的にサポートしています。
そのため、Spec Kitのコア（Spec→Plan→Tasks→Implement）を変更せず、**フェーズゲートをpresetとして追加する**ことでウォーターフォール運用が可能です。
出典: https://github.com/github/spec-kit

## 理由
公式READMEには、presetの用途例として「規制トレーサビリティを要求するようspecテンプレートを再構成する」「利用中の方法論（Agile/Kanban/Waterfallなど）にワークフローを適応させる」「計画に必須のセキュリティレビューゲートを追加する」ことが明記されています。また、複数のpresetを優先度付きで積み重ねる（スタック）ことも公式にサポートされています。
出典: https://github.com/github/spec-kit

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
1. **承認ゲート用preset作成**: 各フェーズ完了時に「承認者・承認日・承認条件」を記載する必須セクションをspec/plan/tasksテンプレートに追加するpresetを作成する。
   ```
   specify preset add <company-waterfall-preset>
   ```
2. **フェーズを後退させない運用ルール**: ウォーターフォールでは前フェーズへの後戻りを最小化する前提のため、`/speckit.clarify` を `/speckit.plan` 前に必ず実行し、計画確定後の要件変更は変更管理プロセス（`.specify/templates/change-request-template.md`）を経由させる。
3. **ドキュメント成果物の正式化**: 人間が用意した「要件定義書」「技術選定書」を入力とし、そこから生成された `specs/<feature>/spec.md`（詳細仕様）・`plan.md`（設計）・`tasks.md`（作業計画）を正式承認フローに乗せる（Markdownのままでも、必要であればWord/PDFへ変換）。入力ドキュメントと生成物の両方を版管理し、承認の証跡とする。

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

## 💡 Claude補足
- **注意点**: Spec Kit自体はSDD（仕様駆動開発）の思想に基づき、仕様を「実装後も更新され続ける生きた文書」として扱う設計です。ウォーターフォールの「フェーズ確定後は原則変更しない」という運用にする場合は、上記のように承認ゲートをpreset側で追加する運用ルールが必要であり、Spec Kit本体がウォーターフォール専用モードを持っているわけではありません。
- **落とし穴**: 複数人開発の場合、`/speckit.tasks`で生成されるタスクの粒度（1タスクあたり1〜2ファイル程度）が細かすぎることがあります。要員アサインは`tasks.md`をベースに、PM側で人単位・工程単位に再編成する運用が必要です。
- **確証が取れなかった情報**: 「Waterfall」という単語が公式presetの用途例として明記されていることは確認できましたが、GitHub公式が配布する完成済みの「Waterfall preset」自体が存在するかどうかは、2026年7月13日時点の検索結果では確認できませんでした。公式情報が確認できないため断定できません。自社でpresetとして作成することを推奨します。
