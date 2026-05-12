---
name: domain-terms
description: 個人運営オンライン書店プロジェクトのドメイン用語定義（external_design.md 第10章で確立）
metadata:
  type: project
---

本プロジェクトで統一定義されたドメイン用語一覧。設計・実装・コミュニケーション全般で一貫して使用する。

| 用語 | 定義 |
|---|---|
| 書籍（商品） | 販売対象。`products` テーブルで管理。「商品」と「書籍」は同義 |
| カート | 購入検討中の書籍を一時保持する仕組み。localStorageで管理 |
| 注文 | 配送先入力後「注文する」ボタン押下で確定した購買行為。`orders` テーブルに記録 |
| 注文明細 | 注文に含まれる書籍・数量・単価の記録。`order_items` テーブルで管理 |
| 注文番号 | ORD-プレフィックス+10桁ゼロ埋めID（例: ORD-0000000001） |
| 合計金額 | 全書籍の小計合算（税込み、送料除く） |
| 小計 | 単価 × 数量 |
| 書影 | 書籍カバー画像。`products.image_url` に格納。未設定時はプレースホルダー表示 |
| スナップショット | 注文時点のタイトル・価格をorder_itemsに複製保存するパターン |
| App Router | Next.js 14のルーティング方式。`src/app/` 配下でURL定義 |
| Server Component | Next.js App Routerのデフォルト。サーバー側レンダリング |
| Client Component | `"use client"` ディレクティブ付き。カート更新等のインタラクティブ操作に使用 |
