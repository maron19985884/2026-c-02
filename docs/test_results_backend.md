# バックエンド 単体テスト結果

## 実行コマンド

```
npm test -- --coverage
```

## 実行環境

- 実行方式: Docker コンテナ（`node:20-alpine`）
- 実行日: 2026-05-27
- テストフレームワーク: Jest + ts-jest + supertest

---

## テスト結果（全文）

```
> backend@0.1.0 test
> jest --coverage

PASS src/__tests__/utils/dataStore.test.ts (36.568 s)
PASS src/__tests__/api/books.test.ts (42.583 s)
PASS src/__tests__/api/orders.test.ts (43.985 s)
----------------------|---------|----------|---------|---------|---------------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------|---------|----------|---------|---------|---------------------------
All files             |   89.47 |       80 |     100 |   88.76 |
 src                  |     100 |      100 |     100 |     100 |
  app.ts              |     100 |      100 |     100 |     100 |
 src/controllers      |   84.37 |    66.66 |     100 |   82.75 |
  booksController.ts  |   88.88 |      100 |     100 |   86.66 | 10,24
  ordersController.ts |    82.6 |       50 |     100 |   81.39 | 68-69,76-77,94-95,115-116
 src/routes           |     100 |      100 |     100 |     100 |
  books.ts            |     100 |      100 |     100 |     100 |
  orders.ts           |     100 |      100 |     100 |     100 |
 src/utils            |     100 |      100 |     100 |     100 |
  fileStore.ts        |     100 |      100 |     100 |     100 |
----------------------|---------|----------|---------|---------|---------------------------
Test Suites: 3 passed, 3 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        88.126 s
Ran all test suites.
```

---

## サマリー

| 項目 | 結果 |
|------|------|
| テストスイート | **3 passed**, 3 total |
| テスト数 | **20 passed**, 20 total |
| 失敗 | **0** |
| ステートメントカバレッジ | 89.47% |
| ブランチカバレッジ | 80.00% |
| 関数カバレッジ | **100%** |
| 行カバレッジ | 88.76% |

---

## テストファイル一覧

### `src/__tests__/api/books.test.ts` — PASS

| # | テスト名 | 結果 |
|---|---------|------|
| 1 | GET /api/books › 書籍配列が返ること | ✅ PASS |
| 2 | GET /api/books/:id › 存在するIDで書籍オブジェクトが返ること | ✅ PASS |
| 3 | GET /api/books/:id › 存在しないIDで404が返ること | ✅ PASS |

### `src/__tests__/api/orders.test.ts` — PASS

| # | テスト名 | 結果 |
|---|---------|------|
| 4 | POST /api/orders › 正常系 › 正常データで201と注文オブジェクト（orderId含む）が返ること | ✅ PASS |
| 5 | POST /api/orders › 正常系 › 注文番号採番: 既存0件 → 末尾が000001 | ✅ PASS |
| 6 | POST /api/orders › 正常系 › 注文番号採番: 既存2件 → 末尾が000003 | ✅ PASS |
| 7 | POST /api/orders › バリデーションエラー（400）› customerName欠損で400が返ること | ✅ PASS |
| 8 | POST /api/orders › バリデーションエラー（400）› address欠損で400が返ること | ✅ PASS |
| 9 | POST /api/orders › バリデーションエラー（400）› email欠損で400が返ること | ✅ PASS |
| 10 | POST /api/orders › バリデーションエラー（400）› email形式不正で400が返ること | ✅ PASS |
| 11 | POST /api/orders › バリデーションエラー（400）› items空配列で400が返ること | ✅ PASS |
| 12 | POST /api/orders › バリデーションエラー（400）› items欠損で400が返ること | ✅ PASS |

### `src/__tests__/utils/dataStore.test.ts` — PASS

| # | テスト名 | 結果 |
|---|---------|------|
| 13 | readJson - 書籍データ読み込み › 書籍一覧をJSONとして正しく読み込めること | ✅ PASS |
| 14 | readJson - 書籍データ読み込み › IDによる書籍取得（存在）: 対象書籍が見つかること | ✅ PASS |
| 15 | readJson - 書籍データ読み込み › IDによる書籍取得（不存在）: undefinedが返ること | ✅ PASS |
| 16 | writeJson - 注文保存 › 注文データをJSONファイルに書き込めること | ✅ PASS |
| 17 | 注文番号採番ロジック › 初回注文（既存0件）は連番000001になること | ✅ PASS |
| 18 | 注文番号採番ロジック › 既存1件の場合は連番000002になること | ✅ PASS |
| 19 | 注文番号採番ロジック › 既存5件の場合は連番000006になること | ✅ PASS |
| 20 | 注文番号採番ロジック › orderId形式が ORD-YYYYMMDD-NNNNNN であること | ✅ PASS |

---

## カバレッジ詳細

| ファイル | Stmts | Branch | Funcs | Lines | 未カバー行 |
|---------|-------|--------|-------|-------|----------|
| `src/app.ts` | 100% | 100% | 100% | 100% | — |
| `src/routes/books.ts` | 100% | 100% | 100% | 100% | — |
| `src/routes/orders.ts` | 100% | 100% | 100% | 100% | — |
| `src/utils/fileStore.ts` | 100% | 100% | 100% | 100% | — |
| `src/controllers/booksController.ts` | 88.88% | 100% | 100% | 86.66% | 10, 24 |
| `src/controllers/ordersController.ts` | 82.6% | 50% | 100% | 81.39% | 68–69, 76–77, 94–95, 115–116 |

**未カバー行の補足:**
- `booksController.ts:10,24` — `catch` ブロック（`fs.readFile` が失敗した場合の 500 エラー返却）
- `ordersController.ts:68-69,76-77,94-95,115-116` — `readJson`/`writeJson` が例外を投げた場合の 500 エラー返却パス

いずれもファイルI/Oの障害時エラーハンドリングであり、モック差し替えによる追加テストで網羅可能。
