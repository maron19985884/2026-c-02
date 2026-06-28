<!--
  SYNC IMPACT REPORT
  ==================
  Version change: (template) → 1.0.0
  New principles:
    I.  仕様準拠 (Specification Compliance)
    II. 人間最終判断 (Human-in-the-Loop)
    III. セキュリティ第一 (Security First)
    IV. 破壊的操作禁止 (Non-Destructive Operations)
    V.  スコープ厳守 (Scope Discipline)
  Added sections:
    - 開発制約 (Development Constraints)
    - 開発ワークフロー (Development Workflow)
  Modified principles: N/A (initial population)
  Removed sections: All template placeholders replaced
  Templates reviewed:
    ✅ .specify/templates/plan-template.md  — Constitution Check section already present
    ✅ .specify/templates/spec-template.md  — Requirements/FR format compatible
    ✅ .specify/templates/tasks-template.md — Phase structure compatible
  Follow-up TODOs: None (all placeholders resolved)
-->

# 個人運営オンライン書店 Constitution

## Core Principles

### I. 仕様準拠 (Specification Compliance)

AIエージェントを含むすべての実装者は、`docs/specs/spec.md` および
`docs/requirements/requirements.md` に記載された仕様の範囲内でのみ実装を行わなければ
ならない (MUST)。

- 仕様書に記載のない機能・画面・APIを無断で追加してはならない (MUST NOT)。
- 不明点や仕様の欠落が見つかった場合は、推測で実装せず
  「確認が必要です: [内容]」と明示し、作業を停止しなければならない (MUST)。
- 生成物に不確かな箇所がある場合は `<!-- 要確認: [理由] -->` を付与すること (MUST)。

### II. 人間最終判断 (Human-in-the-Loop)

最終的な採否・レビュー・承認は必ず人間が行わなければならない (MUST)。

- AIエージェントはコード・設計書・テストの提案と生成を行うが、
  コミット・マージ・デプロイの最終実行判断は人間が行う (MUST)。
- レビューは最低1名の Approve が必要 (MUST)。
- AIが自動で本番環境に変更を適用してはならない (MUST NOT)。

### III. セキュリティ第一 (Security First)

機密情報はコードに直書きしてはならない (MUST NOT)。

- DB接続情報・APIキー・パスワードはすべて `.env` ファイルで管理すること (MUST)。
- `.env` はバージョン管理に含めてはならない (MUST NOT)。
- マジックナンバーは禁止。定数化するか、意味を明記するコメントを付与すること (MUST)。

### IV. 破壊的操作禁止 (Non-Destructive Operations)

データの削除・破壊を伴う操作は、提案のみを行い実行コマンドを生成してはならない
(MUST NOT)。

- `DELETE` / `DROP` / `TRUNCATE` 等のDDL・DMLを直接生成することを禁止する (MUST NOT)。
- ファイルの大量削除・強制上書きを伴う操作は実行前にユーザー確認を必須とする (MUST)。
- 破壊的 git 操作 (`reset --hard`, `push --force` 等) も同様に確認を必要とする (MUST)。

### V. スコープ厳守 (Scope Discipline)

本システムは購買フロー5画面に特化し、スコープ外機能の実装を禁止する (MUST NOT)。

**スコープ内5画面**: 商品一覧 / 商品詳細 / カート / 注文フォーム / 注文完了

**スコープ外(実装禁止)**:
ログイン・会員管理 / 決済処理 / 在庫管理 / 管理画面 / レビュー・評価 /
検索・フィルター / 送料計算

- YAGNI 原則を厳守し、将来的な拡張を見越した抽象化を無断で導入してはならない
  (MUST NOT)。
- 設計の複雑化は仕様上の明確な理由がある場合のみ許可し、
  `plan.md` の Complexity Tracking に記録すること (MUST)。

## 開発制約 (Development Constraints)

**技術スタック（変更には憲法改定が必要）**

| レイヤー | 技術 | バージョン |
|---|---|---|
| 言語 | TypeScript | 最新安定版 |
| フロントエンド | Next.js | 14 |
| バックエンド | Express | 4 |
| データベース | MySQL | 8.0 |
| インフラ | Docker Compose | — |

**ポート規約**: frontend=3000 / backend=4000 / mysql=3306

**命名規則**

| 対象 | 規則 | 例 |
|---|---|---|
| ファイル名 | スネークケース | `invoice_loader.ts` |
| クラス名 | パスカルケース | `BookRepository` |
| 関数・変数名 | キャメルケース | `getBookById()` |
| 定数 | 大文字スネークケース | `MAX_RETRY_COUNT` |
| DBテーブル物理名 | スネークケース | `order_header` |
| DBカラム物理名 | スネークケース | `book_id` |

**非機能要件（下限値）**

- 画面遷移・API応答: 3秒以内 (MUST)
- 型チェック: `tsc` でエラーゼロを維持すること (MUST)

## 開発ワークフロー (Development Workflow)

**ブランチ戦略**: `main` / `feature/xxx`

**コミットメッセージプレフィックス**: `feat:` / `fix:` / `chore:` / `docs:`

**AIエージェント使用フロー（推奨）**

```
/speckit-constitution  → 憲法の確認・更新
/speckit-specify       → 機能仕様書の作成・更新
/speckit-clarify       → 仕様の明確化（任意）
/speckit-plan          → 実装計画の生成
/speckit-tasks         → タスクリストの生成
/speckit-implement     → 実装の実行
/speckit-analyze       → 整合性チェック
```

**コードレビュー基準**

- 最低1名の Approve が必要 (MUST)
- セキュリティ要件（原則 III）の遵守確認を必須とする (MUST)
- 本憲法の全原則への適合をチェックすること (MUST)

## Governance

本憲法はすべての設計・実装・レビュー判断において最優先ルールとして適用される。

**改定手続き**

1. 改定案をプルリクエストとして提出する
2. チームメンバー全員のレビューと最低1名の Approve を得る
3. 改定内容を本ファイルに反映し、バージョンをインクリメントする
4. 影響するテンプレート・CLAUDE.md を同一PRで更新する

**バージョニングポリシー**

- MAJOR: 原則の削除・後方非互換な再定義
- MINOR: 原則・セクションの追加または大幅拡張
- PATCH: 文言修正・誤字脱字・非意味的な変更

**コンプライアンスレビュー**: 各スプリント終了時または仕様変更時に本憲法との整合性を確認すること。

**Version**: 1.0.0 | **Ratified**: 2026-06-28 | **Last Amended**: 2026-06-28
