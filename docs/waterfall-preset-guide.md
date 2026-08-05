# ウォーターフォール運用ガイド（Spec Kit preset化）

## 結論
Spec Kit公式は、presetによって「Agile、Kanban、Waterfallなど、利用中の開発方法論にワークフローを適応させる」ことを明示的にサポートしています。
そのため、Spec Kitのコア（Spec→Plan→Tasks→Implement）を変更せず、**フェーズゲートをpresetとして追加する**ことでウォーターフォール運用が可能です。
出典: https://github.com/github/spec-kit

## 理由
公式READMEには、presetの用途例として「規制トレーサビリティを要求するようspecテンプレートを再構成する」「利用中の方法論（Agile/Kanban/Waterfallなど）にワークフローを適応させる」「計画に必須のセキュリティレビューゲートを追加する」ことが明記されています。また、複数のpresetを優先度付きで積み重ねる（スタック）ことも公式にサポートされています。
出典: https://github.com/github/spec-kit

## Spec Kitフェーズ ↔ ウォーターフォールフェーズ対応表

| ウォーターフォールフェーズ | Spec Kitコマンド | 主な成果物 | 承認ゲート |
|---|---|---|---|
| 要件定義 | 要件定義書（人間）→ `/speckit.specify` → `/speckit.clarify` | `requirements.md`、`spec.md` | 要件定義書レビュー・承認（顧客/PM）|
| 基本設計・詳細設計 | 技術選定書（人間）→ `/speckit.plan` | `tech-stack-template.md`、`plan.md`、`data-model.md`、`contracts/` | 設計レビュー・承認（アーキテクト/リーダー） |
| 実装計画 | `/speckit.tasks` → `/speckit.analyze` | `tasks.md` | タスク一覧レビュー（PM/リーダー） |
| 実装 | `/speckit.implement` | ソースコード | コードレビュー＋Lint品質ゲート（`.github/workflows/quality-gate.yml`） |
| テスト | テスト計画書（人間）→ 単体・結合・受け入れテスト実施 | `test-plan-template.md`、テスト結果 | テスト結果レビュー・承認 |
| リリース | デプロイ | — | リリース承認 |

## 各フェーズの完了定義（Definition of Done）

### 要件定義フェーズ DoD
- [ ] `requirements.md` が全セクション記入済みであること
- [ ] `/speckit.specify` により `spec.md` が生成されていること
- [ ] `/speckit.clarify` による曖昧さ解消が完了していること（または「曖昧さなし」と確認済み）
- [ ] スコープ内・スコープ外が明確に定義されていること
- [ ] 受け入れ基準（Acceptance Criteria）が全機能要件に対して記載されていること
- [ ] `requirements.md` の承認欄に PM / 顧客代表の承認が記録されていること

### 設計フェーズ DoD
- [ ] `docs/tech-stack-template.md` が全セクション記入済みであること
- [ ] `/speckit.plan` により `plan.md` が生成されていること
- [ ] `data-model.md` にエンティティ・フィールド・関係が定義されていること
- [ ] `contracts/` にAPI仕様（エンドポイント・リクエスト・レスポンス）が定義されていること
- [ ] `constitution.md` の Constitution Check をパスしていること
- [ ] フェーズゲート承認記録（`docs/review-gate-template.md`）の設計フェーズ欄が承認済みであること

### 実装計画フェーズ DoD
- [ ] `/speckit.tasks` により `tasks.md` が生成されていること
- [ ] `/speckit.analyze` による整合性チェックが完了していること
- [ ] CRITICAL・HIGH の指摘事項がすべて解消されていること
- [ ] フェーズゲート承認記録の実装計画欄が承認済みであること

### 実装フェーズ DoD
- [ ] `tasks.md` の全タスクが完了（`[x]`）していること
- [ ] Lint エラーが 0 件であること
- [ ] テストカバレッジが `constitution.md` セクション2の目標値以上であること
- [ ] コードレビューが完了していること
- [ ] フェーズゲート承認記録の実装欄が承認済みであること

### テストフェーズ DoD
- [ ] `docs/test-plan-template.md` の Exit Criteria を全て満たしていること
- [ ] 重大バグ（Critical / High）が 0 件であること
- [ ] テスト結果が記録・保管されていること
- [ ] フェーズゲート承認記録のテスト欄が承認済みであること

### リリースフェーズ DoD
- [ ] テストフェーズの承認が完了していること
- [ ] リリース手順書が存在し、手順が検証済みであること
- [ ] ロールバック手順が定義されていること
- [ ] フェーズゲート承認記録のリリース欄が承認済みであること

## 具体的な実装方法
1. **承認ゲート用preset作成**: 各フェーズ完了時に「承認者・承認日・承認条件」を記載する必須セクションをspec/plan/tasksテンプレートに追加するpresetを作成する。
   ```
   specify preset add <company-waterfall-preset>
   ```
2. **フェーズを後退させない運用ルール**: ウォーターフォールでは前フェーズへの後戻りを最小化する前提のため、`/speckit.clarify` を `/speckit.plan` 前に必ず実行し、計画確定後の要件変更は変更管理プロセス（`docs/change-request-template.md`）を経由させる。
3. **ドキュメント成果物の正式化**: 人間が用意した「要件定義書」「技術選定書」を入力とし、そこから生成された `specs/<feature>/spec.md`（詳細仕様）・`plan.md`（設計）・`tasks.md`（作業計画）を正式承認フローに乗せる（Markdownのままでも、必要であればWord/PDFへ変換）。入力ドキュメントと生成物の両方を版管理し、承認の証跡とする。

## ドキュメント一覧

| ドキュメント | 誰が作るか | フェーズ |
|---|---|---|
| `requirements.md` | 人間 | 要件定義 |
| `docs/tech-stack-template.md` | 人間 | 設計 |
| `docs/test-plan-template.md` | 人間 | テスト |
| `docs/review-gate-template.md` | 人間（フェーズごと） | 全フェーズ |
| `docs/change-request-template.md` | 人間（変更発生時） | 全フェーズ |
| `specs/[###]/spec.md` | `/speckit.specify` | 要件定義 |
| `specs/[###]/plan.md` | `/speckit.plan` | 設計 |
| `specs/[###]/tasks.md` | `/speckit.tasks` | 実装計画 |

## 💡 Claude補足
- **注意点**: Spec Kit自体はSDD（仕様駆動開発）の思想に基づき、仕様を「実装後も更新され続ける生きた文書」として扱う設計です。ウォーターフォールの「フェーズ確定後は原則変更しない」という運用にする場合は、上記のように承認ゲートをpreset側で追加する運用ルールが必要であり、Spec Kit本体がウォーターフォール専用モードを持っているわけではありません。
- **落とし穴**: 複数人開発の場合、`/speckit.tasks`で生成されるタスクの粒度（1タスクあたり1〜2ファイル程度）が細かすぎることがあります。要員アサインは`tasks.md`をベースに、PM側で人単位・工程単位に再編成する運用が必要です。
- **確証が取れなかった情報**: 「Waterfall」という単語が公式presetの用途例として明記されていることは確認できましたが、GitHub公式が配布する完成済みの「Waterfall preset」自体が存在するかどうかは、2026年7月13日時点の検索結果では確認できませんでした。公式情報が確認できないため断定できません。自社でpresetとして作成することを推奨します。
