# Contracts: カート画面

本機能は新規のREST APIエンドポイントを追加しない。

- カート内容の取得・数量変更・削除は、すべてフロントエンドの `CartContext`（`localStorage` 保持、`005-book-detail-page` で確立済み）に対するクライアントサイドの状態操作として完結する（`research.md` D-01）。
- バックエンド（`backend/`）・MySQLスキーマへの変更は本機能に含まれない。
- 「注文手続きへ」ボタンはページ遷移（`Link href="/order"`）のみを行い、注文フォーム画面自体のAPI（注文作成等）は別機能（REQ-012〜REQ-015相当）のスコープであり、本機能では呼び出さない（`research.md` D-04）。
