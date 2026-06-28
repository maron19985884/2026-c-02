# Quickstart: 注文フォームと注文確定処理の動作確認

**Feature**: 003-order-checkout
**Date**: 2026-06-28

## 前提条件

- Docker Compose が起動していること (`docker-compose up -d`)
- frontend: http://localhost:3000
- backend: http://localhost:4000
- books テーブルに1件以上のデータが存在すること
- カートに書籍が1件以上追加されていること

## シナリオ 1: 正常系（注文確定）

1. 商品一覧（`http://localhost:3000/`）を開く
2. 任意の書籍をクリックして詳細画面へ遷移する
3. 「カートに追加」をクリックして一覧に戻る
4. カート画面（`/cart`）へ遷移して「注文手続きへ」をクリック
5. 注文フォーム（`/order`）が表示されること
   - カート内の書名・単価・数量・小計が表示されていること
   - 合計金額が表示されていること
6. 氏名: `山田 太郎`、住所: `東京都渋谷区xxx-xxx`、メール: `yamada@example.com` を入力
7. 「注文する」をクリック
8. 注文完了画面（`/order/complete`）へ遷移すること
9. 注文完了メッセージと注文番号（例: `ORD-20260628-000001`）が表示されること
10. 「商品一覧へ戻る」をクリックすると `/` へ遷移すること

**期待結果**: ✅ 注文番号が表示される

## シナリオ 2: バリデーション（必須項目未入力）

1. 注文フォーム（`/order`）を開く
2. 全フィールドを空にして「注文する」をクリック
3. 氏名・住所・メールアドレスの各フィールド近くにエラーメッセージが表示されること
4. 注文完了画面へ遷移しないこと

**期待結果**: ✅ 3フィールドすべてにエラーが表示される

## シナリオ 3: バリデーション（メール形式不正）

1. 注文フォーム（`/order`）を開く
2. 氏名: `田中 花子`、住所: `大阪府xxx-xxx`、メール: `tanaka-example`（`@` なし）を入力
3. 「注文する」をクリック
4. 「メールアドレスの形式が正しくありません」というエラーが表示されること

**期待結果**: ✅ メール形式エラーのみ表示される

## シナリオ 4: 空カートリダイレクト

1. カートを空の状態で `http://localhost:3000/order` へ直接アクセス
2. カート画面（`/cart`）へリダイレクトされること

**期待結果**: ✅ `/cart` にリダイレクトされる

## API 直接テスト (curl)

```bash
# シナリオ1: 正常系
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "山田 太郎",
    "customer_address": "東京都渋谷区xxx-xxx",
    "customer_email": "yamada@example.com",
    "items": [{"book_id": 1, "quantity": 1, "unit_price": 1500}]
  }'
# 期待: 201 Created, {"order_number": "ORD-..."}

# シナリオ2: バリデーションエラー
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "",
    "customer_address": "東京都",
    "customer_email": "invalid-email",
    "items": [{"book_id": 1, "quantity": 1, "unit_price": 1500}]
  }'
# 期待: 400 Bad Request, {"errors": {...}}
```

## 参照

- API仕様: [contracts/orders-api.md](contracts/orders-api.md)
- データモデル: [data-model.md](data-model.md)
- 機能仕様: [spec.md](spec.md)
