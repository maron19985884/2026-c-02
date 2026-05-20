# ブランチ別テスト調査レポート

> 調査日: 2026-05-20  
> 対象: リモートリポジトリの全ブランチ（feature/kazukisugawara を除く）

---

## テストファイルなし（3ブランチ）

| ブランチ | 状況 |
|---|---|
| `main` | テストファイルなし |
| `feature/AkaneOno` | テストファイルなし |
| `feature/h1nakamu` | テストファイルなし |

---

## テストあり（3ブランチ）の詳細

---

### feature/keitaKobayashi — 統合テスト（実DB接続）

ファイル: `backend/src/__tests__/`（3ファイル）

| テスト対象 | テストケース |
|---|---|
| `GET /health` | DB接続状態の確認（status:ok, db:connected） |
| `GET /api/books` | 200で一覧返す、必須フィールド確認 |
| `GET /api/books/:id` | 正常取得、404（存在しない）、400（無効ID） |
| `POST /api/orders` | 正常作成(201)、複数商品の合計金額、氏名空→400、住所空→400、不正メール→400、itemsが空→400 |
| `GET /api/orders/:id` | 正常取得（items含む）、404（存在しない） |

**特徴:** 実DBに接続する統合テストのみ。`pool.end()` で後処理あり。

---

### feature/satoyuya — ユニットテスト＋結合テスト（テストID付き）

ファイル: `テスト/ユニットテスト/` と `テスト/結合テスト/`（6ファイル）

#### Backend ユニットテスト（`generateOrderNumber.test.ts` / `validation.test.ts`）

| テストID | テスト内容 |
|---|---|
| UT-BE-01〜04 | 注文番号生成: フォーマット、ランダム範囲(1000-9999)、日付有効性、一意性 |
| UT-BE-05〜09 | 氏名バリデーション: 空/スペース/undefined→エラー、日本語・英語→OK |
| UT-BE-10〜16 | メールバリデーション: 空/@なし/ローカル部なし/ドメイン部なし→エラー、サブドメイン→OK |
| UT-BE-17〜19 | 住所バリデーション: 空/undefined→エラー、有効値→OK |
| UT-BE-20〜24 | 商品バリデーション: 空配列/undefined/null/非配列→エラー、有効配列→OK |

#### Frontend ユニットテスト（`cartReducer.test.ts` / `checkoutValidation.test.ts`）

| テストID | テスト内容 |
|---|---|
| UT-FE-01〜04 | カートReducer ADD: 追加、数量増加、別エントリ作成、イミュータブル確認 |
| UT-FE-05〜08 | カートReducer UPDATE: 数量更新、0で削除、負で削除、他アイテム不変 |
| UT-FE-09〜11 | カートReducer REMOVE: 単一削除、複数から1件削除、存在しないID |
| UT-FE-12〜13 | カートReducer CLEAR: 全削除、空カートでも正常 |
| UT-FE-14〜15 | カートReducer HYDRATE: state初期化、既存を置き換え |
| UT-FE-16〜17 | 合計金額・合計数量の計算 |
| UT-FE-18〜27 | チェックアウトバリデーション: 氏名/メール/住所の各パターン、全項目複合テスト |

#### API 結合テスト（`books.test.ts` / `orders.test.ts`、axios使用、Docker前提）

| テストID | テスト内容 |
|---|---|
| IT-BK-01〜02 | GET /api/books: 200/必須フィールド確認 |
| IT-BK-03〜05 | GET /api/books/:id: 正常/404/400 |
| IT-ORD-01〜06 | POST /api/orders: 正常(201)/各バリデーション400/存在しない書籍ID→500 |
| IT-ORD-07〜11 | GET /api/orders/:id: 取得/items確認/合計金額のDB価格一致確認/404/400 |

**特徴:** テストIDが体系的（UT-BE/UT-FE/IT-BK/IT-ORD）。テストファイルがプロジェクトルートの `テスト/` ディレクトリに分離。

---

### feature/kazukisugawara2 — ユニットテスト（DBモック、最も網羅的）

ファイル: `backend/src/__tests__/` と `frontend/src/__tests__/`（8ファイル）  
カスタムAIエージェント定義あり（`coverage-test-writer` / `unit-test-runner`）

#### Backend ユニットテスト（DBモック済み）

| ファイル | テストケース |
|---|---|
| `index.test.ts` | CORS設定、router登録、GET /health (200 + {status:'ok'}) |
| `productsController.test.ts` | GET /api/products: 正常/空配列/DB失敗(500)<br>GET /api/products/:id: 正常/404/400(文字列・0・負・float)/500 |
| `productsQuery.test.ts` | getAllProducts: 正常/空配列/DBエラー/ORDER BY確認<br>getProductById: 正常/undefined/DBエラー/パラメータ確認<br>getProductsByIds: 空配列(DBコールなし)/複数ID/単一ID/DBエラー |
| `ordersController.test.ts` | POST /api/orders: 正常201/DB価格で合計計算/複数商品集計/各バリデーション/存在しない商品/DBエラー<br>GET /api/orders/:id: 正常/items付き/404/DBエラー |
| `ordersQuery.test.ts` | createOrderWithItems: トランザクション制御(begin/commit/rollback/release)、INSERT確認、ORDER BY確認<br>getOrderById: 正常/not found/DBエラー<br>getOrderItemsByOrderId: あり/なし/DBエラー |
| `pool.test.ts` | デフォルト接続値(host/port/db/user/password)、環境変数上書き、プール設定(connectionLimit等)、exportが正しいpool |

#### Frontend ユニットテスト

| ファイル | テストケース |
|---|---|
| `api.test.ts` | fetchProducts/fetchProduct/createOrder の正常・エラー・ネットワーク失敗・URL構築・cache:no-store確認 |
| `useCart.test.ts` | 初期化/localStorage読み書き/addItem/updateQuantity(境界値含む)/removeItem/clearCart/totalAmount/totalCount/戻り値の形 |

**特徴:** DBはすべてjestモック。カスタムAIエージェント（`coverage-test-writer`・`unit-test-runner`）が定義されており、テスト自動生成・実行の仕組みも含む。最も多くのエッジケースをカバー。

---

## ブランチ間の差分まとめ

| 観点 | keitaKobayashi | satoyuya | kazukisugawara2 |
|---|---|---|---|
| テスト種別 | 統合テストのみ | ユニット＋結合 | ユニットのみ |
| DB接続 | **実DB** | 結合テストは実DB | **すべてモック** |
| フロントエンドテスト | なし | あり（cartReducer, checkoutValidation） | あり（api, useCart） |
| テストID体系 | なし | あり（UT-BE/FE, IT-BK/ORD） | なし |
| テストファイル数 | 3 | 6 | 8 |
| カバーするエンドポイント | books, health, orders | books, orders | products, orders, health |
| `getProductsByIds` テスト | なし | なし | **あり**（kazukisugawara2のみ） |
| `pool.ts` 設定テスト | なし | なし | **あり**（kazukisugawara2のみ） |
| 注文番号生成テスト | なし | **あり**（satoyuyaのみ） | なし |
| フォームバリデーション（FE） | なし | **あり**（checkoutValidation） | なし |
| カートhook（useCart） | なし | なし | **あり** |
| 合計金額のDB価格一致確認 | あり | あり（IT-ORD-09） | あり（コントローラーレベル） |
