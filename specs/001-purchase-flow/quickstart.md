# Quickstart: オンライン書店 購買フロー — 検証ガイド

**Feature**: specs/001-purchase-flow
**Date**: 2026-06-30
**Purpose**: 実装完了後の動作検証シナリオ

---

## 前提条件

- Docker Desktop インストール済み
- リポジトリをクローン済み
- `.env` ファイルが存在する（`cp .env.example .env` で作成）

---

## 起動手順

```bash
# 1. Dockerコンテナを起動
docker compose up --build

# 2. 起動確認
# フロントエンド: http://localhost:3000
# バックエンドAPI: http://localhost:4000/health → {"status":"ok"}
# MySQL: docker compose exec mysql mysql -u appuser -ppassword appdb
```

---

## 検証シナリオ

### S-01: 商品一覧の表示（US1 P1）

**対応要件**: FR-001, FR-002, SC-002, SC-006

1. ブラウザで `http://localhost:3000` を開く
2. **確認**: 書籍がグリッド形式で複数表示される
3. **確認**: 各書籍に書影・タイトル・著者・価格が表示される
4. **確認**: 3秒以内に画面が表示される

```bash
# APIレベルの確認
curl http://localhost:4000/books
# → Book配列のJSONが返る（5件以上）
```

---

### S-02: 商品詳細の表示（US2 P2）

**対応要件**: FR-003, FR-004

1. 商品一覧の任意の書籍をクリック
2. **確認**: URL が `/books/1`（書籍IDを含む）に遷移する
3. **確認**: 書影・タイトル・著者・価格・説明文がすべて表示される
4. **確認**: 「カートに追加」ボタンが表示される

```bash
# APIレベルの確認
curl http://localhost:4000/books/1
# → Book JSONが返る

curl http://localhost:4000/books/99999
# → 404 {"error":"Not found"}
```

---

### S-03: カートへの追加（US2 P2）

**対応要件**: FR-005, FR-006

1. 商品詳細画面で「カートに追加」ボタンをクリック
2. **確認**: 商品一覧画面（またはカート）に戻れる
3. 別の書籍を詳細→カートに追加
4. **確認**: カートに複数の書籍が追加されている

---

### S-04: カートの管理（US3 P3）

**対応要件**: FR-007, FR-008, FR-009, FR-010, FR-011, SC-003

1. カート画面を開く（`http://localhost:3000/cart`）
2. **確認**: 追加した書籍の書名・単価・数量・小計・合計が表示される
3. 数量を変更する（例: 1→2）
4. **確認**: 1秒以内に小計と合計が更新される
5. 書籍の削除ボタンを押す
6. **確認**: 書籍が削除され合計が即時更新される
7. 「注文手続きへ」ボタンを押す
8. **確認**: `/checkout` に遷移する

---

### S-05: 注文フォームの入力と確定（US4 P4）

**対応要件**: FR-012, FR-013, FR-014, FR-015, SC-001, SC-004

1. 注文フォーム画面（`http://localhost:3000/checkout`）を開く
2. **確認**: 注文商品と合計金額が同画面に表示される
3. **NG確認（空送信）**: 何も入力せず「注文する」を押す
   - **確認**: エラーメッセージが表示され、画面遷移しない
4. **NG確認（メール形式不正）**: メールアドレスに `test` と入力して送信
   - **確認**: 形式エラーが表示される
5. **OK確認（正常送信）**: 全項目を正しく入力して「注文する」を押す
   - 氏名: 任意の名前
   - 住所: 任意の住所
   - メールアドレス: `test@example.com`

---

### S-06: 注文完了画面（US4 P4）

**対応要件**: FR-016, FR-017, SC-005, SC-006

1. 正常送信後、自動的に `/order-complete?orderNumber=ORD-XXXXXX` に遷移する
2. **確認**: 注文完了メッセージが表示される
3. **確認**: 注文番号（ORD-XXXXXX 形式）が表示される
4. 「商品一覧に戻る」リンクをクリック
5. **確認**: 商品一覧画面（`/`）に遷移する

```bash
# APIレベルの確認
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "テスト 太郎",
    "address": "東京都渋谷区1-1-1",
    "email": "test@example.com",
    "items": [{"bookId": 1, "quantity": 1, "unitPrice": 2800}],
    "totalAmount": 2800
  }'
# → {"orderNumber":"ORD-000001"}
```

---

### S-07: エッジケース検証

**対応要件**: Edge Cases（spec.md）

```bash
# 1. 空カートでcheckoutに直接アクセス
# → カート画面にリダイレクトされること
# ブラウザで http://localhost:3000/checkout を直接開く（カートが空の状態）

# 2. バリデーションエラー（必須項目欠損）
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"","address":"","email":"","items":[],"totalAmount":0}'
# → 400 {"error":"..."}

# 3. メール形式エラー
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"テスト","address":"東京","email":"invalid","items":[{"bookId":1,"quantity":1,"unitPrice":2800}],"totalAmount":2800}'
# → 400 {"error":"Invalid email format"}
```

---

## 全シナリオ合格基準

| シナリオ | 合格条件 |
|---------|---------|
| S-01 | 書籍一覧がグリッドで表示、3秒以内 |
| S-02 | 詳細5項目が全表示、API 404正常動作 |
| S-03 | カートへの追加と一覧戻りが動作 |
| S-04 | 数量変更・削除・合計更新が1秒以内 |
| S-05 | バリデーションエラーが正常表示、正常送信が成功 |
| S-06 | ORD-XXXXXXが表示、一覧へ戻れる |
| S-07 | 空カートリダイレクト、APIバリデーション400正常 |

すべてのシナリオが合格したら実装完了とみなす。

---

## データ型の参照

- エンティティ設計 → [data-model.md](./data-model.md)
- APIエンドポイント仕様 → [contracts/api-contracts.md](./contracts/api-contracts.md)
- TypeScript型定義 → [contracts/api-types.ts](./contracts/api-types.ts)
