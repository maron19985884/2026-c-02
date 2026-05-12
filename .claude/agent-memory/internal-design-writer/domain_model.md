---
name: domain-model
description: 書店アプリのエンティティ・業務ルール・注文番号フォーマット・カート管理方針
metadata:
  type: project
---

# ドメインモデル

## エンティティ関係
- products (1) --- (多) order_items
- orders   (1) --- (多) order_items
- カートはDBテーブルなし: localStorage で管理 (前提A)

## 注文番号フォーマット
`ORD-` + 10桁ゼロ埋めID (例: ORD-0000000001) (前提G)
生成タイミング: INSERT後に取得した lastInsertId をフォーマットして orders.order_number にUPDATE

## 業務ルール
- 価格はすべて税込み表示、バックエンドで税率計算しない (前提F)
- order_items に title/price をスナップショット保存 (商品変更対策)
- 数量「-」ボタンは quantity=1 のとき disabled (前提B)
- カートが空のとき「注文手続きへ進む」を disabled
- 注文完了画面への order_number 受け渡しは URL クエリパラメータ (前提D)
- メール送信はスコープ外 (前提C)

**Why:** external_design.md §9.2 前提条件より
**How to apply:** バックエンド処理フロー・フロントエンド状態管理設計に反映する
