# Spec Kit 開発フロー

## コマンド一覧

| # | コマンド | 内容 |
|---|---|---|
| 1 | `/speckit-constitution` | 開発原則の定義。テスト方針・技術スタック・コード規約などプロジェクトの「憲法」を作る |
| 2 | `/speckit-specify <説明>` | 要件から仕様書を生成。`spec.md` と `feature.json` が作られる |
| 3 | `/speckit-plan` | 仕様をもとに設計を生成。DBテーブル・APIエンドポイント・画面構成・型定義が作られる |
| 4 | `/speckit-tasks` | 設計を実装タスクに分解。`tasks.md` として作業単位が一覧化される |
| 5 | `/speckit-implement` | タスクを順番に実装。コード生成・動作確認まで自動で行う |

## 全体の流れ

```
/speckit-constitution
        ↓
/speckit-specify <機能説明>   → spec.md + feature.json
        ↓
/speckit-plan                 → 設計ドキュメント群（API・DB・型定義）
        ↓
/speckit-tasks                → tasks.md
        ↓
/speckit-implement            → 実装・動作確認
```

## 注意点

- 各ステップの成果物が次のステップの入力になるため、**順番通りに実行する**こと
- `/speckit-specify` はコマンドの後に機能説明を日本語で記述できる
- `/speckit-plan` は `feature.json` が存在しないと実行できない（`/speckit-specify` を先に完了させること）
