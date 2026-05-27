# フロントエンド単体テスト結果

実行日時: 2026-05-27  
テストフレームワーク: Jest 30 + React Testing Library 16  
実行コマンド: `npm test -- --coverage`

---

## テスト実行結果（全文）

```
> frontend@0.1.0 test
> jest --coverage --coverage

PASS src/__tests__/OrderSummary.test.tsx (11.456 s)
PASS src/__tests__/CartContext.test.tsx (15.046 s)
PASS src/__tests__/BookCard.test.tsx (17.523 s)
PASS src/__tests__/CartItemRow.test.tsx (20.683 s)
PASS src/__tests__/checkout.test.tsx (26.031 s)
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    82.9 |    76.08 |   88.88 |   82.85 |                   
 app/checkout      |   79.36 |    76.31 |   91.66 |   80.35 |                   
  page.tsx         |   79.36 |    76.31 |   91.66 |   80.35 | 40,47,80-99       
 components        |   81.81 |      100 |   71.42 |   81.81 |                   
  BookCard.tsx     |     100 |      100 |     100 |     100 |                   
  CartItemRow.tsx  |   66.66 |      100 |      50 |   66.66 | 44-57             
  OrderSummary.tsx |     100 |      100 |     100 |     100 |                   
 contexts          |   88.37 |       75 |   94.11 |   86.84 |                   
  CartContext.tsx  |   88.37 |       75 |   94.11 |   86.84 | 21-24,62-63       
-------------------|---------|----------|---------|---------|-------------------
Test Suites: 5 passed, 5 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        43.057 s
Ran all test suites.
```

---

## テストスイート・テストケース一覧

| ファイル | テストスイート | テストケース | 結果 |
|---|---|---|---|
| `CartContext.test.tsx` | CartContext | 商品追加でカートに追加されること | ✅ PASS |
| `CartContext.test.tsx` | CartContext | 同一商品を追加すると数量がインクリメントされること | ✅ PASS |
| `CartContext.test.tsx` | CartContext | 数量変更が正しく反映されること | ✅ PASS |
| `CartContext.test.tsx` | CartContext | 商品削除でカートから除かれること | ✅ PASS |
| `CartContext.test.tsx` | CartContext | 合計金額（小計の総和）が正しく計算されること | ✅ PASS |
| `BookCard.test.tsx` | BookCard | タイトル・著者・価格が表示されること | ✅ PASS |
| `CartItemRow.test.tsx` | CartItemRow（CartItem） | 書名・数量・小計が表示されること | ✅ PASS |
| `CartItemRow.test.tsx` | CartItemRow（CartItem） | 削除ボタンのクリックで onRemove が呼ばれること | ✅ PASS |
| `OrderSummary.test.tsx` | OrderSummary | 注文商品リストと合計金額が表示されること | ✅ PASS |
| `checkout.test.tsx` | 注文フォームバリデーション（checkout/page） | 全項目空欄で送信するとエラーメッセージが表示されること | ✅ PASS |
| `checkout.test.tsx` | 注文フォームバリデーション（checkout/page） | メールアドレス形式不正でエラーメッセージが表示されること | ✅ PASS |
| `checkout.test.tsx` | 注文フォームバリデーション（checkout/page） | 全項目入力済みでエラーが表示されないこと | ✅ PASS |

**合計: 12 / 12 PASS（失敗 0）**

---

## カバレッジサマリー

| ファイル | Statements | Branches | Functions | Lines | 未カバー行 |
|---|---|---|---|---|---|
| **全ファイル合計** | **82.9%** | **76.08%** | **88.88%** | **82.85%** | — |
| `app/checkout/page.tsx` | 79.36% | 76.31% | 91.66% | 80.35% | 40, 47, 80–99 |
| `components/BookCard.tsx` | 100% | 100% | 100% | 100% | — |
| `components/CartItemRow.tsx` | 66.66% | 100% | 50% | 66.66% | 44–57 |
| `components/OrderSummary.tsx` | 100% | 100% | 100% | 100% | — |
| `contexts/CartContext.tsx` | 88.37% | 75% | 94.11% | 86.84% | 21–24, 62–63 |

### 未カバー箇所の説明

| ファイル | 未カバー行 | 内容 |
|---|---|---|
| `app/checkout/page.tsx` | 40, 47 | カート空時のリダイレクト処理・フォーム変更時のエラークリア処理 |
| `app/checkout/page.tsx` | 80–99 | API エラー時のハンドリング（400/404/500/通信エラー） |
| `components/CartItemRow.tsx` | 44–57 | 数量増減ボタン（＋/−）クリック処理 |
| `contexts/CartContext.tsx` | 21–24 | localStorage からの初期ロード（JSON.parse エラー時の catch 処理） |
| `contexts/CartContext.tsx` | 62–63 | `clear()` 関数 |

---

## テスト環境

- **Node.js**: 20 (Alpine Linux via Docker)
- **Jest**: ^30.4.2
- **jest-environment-jsdom**: ^30.4.1
- **@testing-library/react**: ^16.3.2
- **@testing-library/jest-dom**: ^6.9.1
- **@testing-library/user-event**: ^14.6.1
- **実行環境**: Docker (`node:20-alpine`)
- **設定ファイル**: `frontend/jest.config.js`（`next/jest` + `jest-environment-jsdom`）

---

## 作成したテストファイル

| ファイル | 対象 |
|---|---|
| [`src/__tests__/CartContext.test.tsx`](../frontend/src/__tests__/CartContext.test.tsx) | `contexts/CartContext.tsx` |
| [`src/__tests__/BookCard.test.tsx`](../frontend/src/__tests__/BookCard.test.tsx) | `components/BookCard.tsx` |
| [`src/__tests__/CartItemRow.test.tsx`](../frontend/src/__tests__/CartItemRow.test.tsx) | `components/CartItemRow.tsx` |
| [`src/__tests__/OrderSummary.test.tsx`](../frontend/src/__tests__/OrderSummary.test.tsx) | `components/OrderSummary.tsx` |
| [`src/__tests__/checkout.test.tsx`](../frontend/src/__tests__/checkout.test.tsx) | `app/checkout/page.tsx` |
