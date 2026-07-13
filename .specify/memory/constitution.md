# プロジェクト憲法（Constitution）テンプレート

> Spec Kit公式の位置づけ: `/speckit.constitution` により生成・更新される、
> コード品質・テスト基準・UX一貫性・パフォーマンス要件・技術的意思決定ルールなど
> チームの長期的な原則を記録するファイル。単一機能の要件ではなく、
> チーム全体の合意事項を書く場所として公式に位置づけられています。
> 出典: https://knightli.com/en/2026/05/25/github-spec-kit-spec-driven-development/

## 1. コード品質原則（Code Quality）
- [組織名] のコードは、静的解析（Lint）で **エラー0件** を必須とする。警告(Warning)の扱いはプロジェクト単位でpresetに定義する。
- Lintツールは言語・スタックにより異なる（例: JavaScript/TypeScript → ESLint、Python → Ruff、Java → Checkstyle）。具体的なルールセットは本ファイルに直接書かず、`docs/lint-preset-guide.md` の手順でpreset化し、`.specify/templates/overrides/` または独自presetパッケージとして管理する。
- Lint基準の変更は本憲法の改訂手続き（レビュー＋承認）を経て反映する。

## 2. テスト基準（Testing Standards）
- [ここに組織のテストカバレッジ基準・必須テスト種別を記載]

## 3. UX一貫性（UX Consistency）
- [ここにデザインシステム・UI原則を記載]

## 4. パフォーマンス要件（Performance）
- [ここにレスポンスタイム・スケーラビリティ要件を記載]

## 5. 技術的意思決定ルール（Technical Decision Rules）
- 新規依存ライブラリ導入時は `/speckit.plan` フェーズで理由を明記する。
- AI駆動開発（vibe coding / AI駆動開発 / 仕様駆動開発）のいずれの手法を採るかは、機能の複雑度に応じてチームで判断する。

## 6. 開発方法論の運用ルール（Waterfall / Brownfield）
- 本プロジェクトを **ウォーターフォールで運用する場合**: 各フェーズ（要件定義／設計／実装／テスト／リリース）ごとに承認ゲートを設け、`docs/waterfall-preset-guide.md` の対応表に従って `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` の各出力を正式ドキュメントとして承認フローに乗せる。
- 本プロジェクトが **既存システムの改修（Brownfield）である場合**: システム全体をspec化せず、`docs/brownfield-guide.md` に従い、改修範囲のみを対象とした狭いspec（`docs/change-spec-template.md`参照）を作成する。既存の設計書・規約は本憲法に転記せず、参照リンクのみを記載する。

---
💡 このファイルは公式テンプレートの雛形です。[組織名]・[プロジェクト名] を実際の値に置き換え、
セクション2〜4は貴社の基準に合わせて記入してください。
