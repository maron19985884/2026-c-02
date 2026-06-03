# ブランチ別テスト調査レポート

> 調査日: 2026-06-03  
> 対象: リモートリポジトリの全ブランチ（feature/kazukisugawara を除く）

---

## テストファイルなし（1ブランチ）

| ブランチ | 状況 |
|---|---|
| `main` | テストファイルなし |

---

## テストあり（5ブランチ）の詳細

---

### feature/AkaneOno — ユニットテスト（fileStoreモック）＋フロントエンドコンポーネントテスト

ファイル構成:
- `backend/src/__tests__/api/` — 2ファイル
- `backend/src/__tests__/utils/` — 1ファイル
- `frontend/src/__tests__/` — 5ファイル
- `docs/test_results_backend.md` / `docs/test_results_frontend.md` — テスト結果ドキュメント

#### Backend ユニットテスト（fileStoreモック）

| ファイル | テストケース |
|---|---|
| `api/books.test.ts` | GET /api/books: 書籍配列が返ること |
| | GET /api/books/:id: 存在するUUID IDで書籍オブジェクトが返ること |
| | GET /api/books/:id: 存在しないIDで404が返ること |
| `api/orders.test.ts` | POST /api/orders 正常系: 201+注文オブジェクト(orderId含む)が返ること |
| | POST /api/orders 正常系: 注文番号採番 既存0件→末尾000001 |
| | POST /api/orders 正常系: 注文番号採番 既存2件→末尾000003 |
| | POST /api/orders バリデーション: customerName欠損→400 |
| | POST /api/orders バリデーション: address欠損→400 |
| | POST /api/orders バリデーション: email欠損→400 |
| | POST /api/orders バリデーション: email形式不正→400 |
| | POST /api/orders バリデーション: items空配列→400 |
| | POST /api/orders バリデーション: items欠損→400 |
| `utils/dataStore.test.ts` | readJson: 書籍一覧をJSONとして正しく読み込めること |
| | readJson: IDによる書籍取得（存在）— 対象書籍が見つかること |
| | readJson: IDによる書籍取得（不存在）— undefinedが返ること |
| | writeJson: 注文データをJSONファイルに書き込めること |
| | 注文番号採番: 初回(既存0件)→000001 |
| | 注文番号採番: 既存1件→000002 |
| | 注文番号採番: 既存5件→000006 |
| | 注文番号採番: orderId形式が `ORD-YYYYMMDD-NNNNNN` であること |

#### Frontend コンポーネントテスト（React Testing Library）

| ファイル | テストケース |
|---|---|
| `BookCard.test.tsx` | タイトル・著者・価格が表示されること |
| `CartContext.test.tsx` | 商品追加でカートに追加されること |
| | 同一商品を追加すると数量がインクリメントされること |
| | 数量変更が正しく反映されること |
| | 商品削除でカートから除かれること |
| | 合計金額（小計の総和）が正しく計算されること |
| `CartItemRow.test.tsx` | 書名・数量・小計が表示されること |
| | 削除ボタンのクリックで onRemove が呼ばれること |
| `OrderSummary.test.tsx` | 注文商品リストと合計金額が表示されること |
| `checkout.test.tsx` | 全項目空欄で送信するとエラーメッセージが表示されること |
| | メールアドレス形式不正でエラーメッセージが表示されること |
| | 全項目入力済みでエラーが表示されないこと |

#### テスト実行結果（docs/test_results_*.md より）

| 対象 | 結果 | テスト数 | Stmt | Branch | Funcs | Lines |
|---|---|---|---|---|---|---|
| Backend | ✅ 全Pass | 20 passed / 20 | 89.47% | 80.00% | 100% | 88.76% |
| Frontend | ✅ 全Pass | 12 passed / 12 | 82.9% | 76.08% | 88.88% | 82.85% |

**特徴:**
- DBの代わりに **JSONファイルストア（fs.promises）** を使用するアーキテクチャ
- 書籍IDが **UUID形式**（他ブランチは整数）
- 注文番号フォーマット: `ORD-YYYYMMDD-NNNNNN`（既存件数+1のシーケンシャル6桁）
- フロントエンドのコンポーネント単位テスト（BookCard, CartItemRow, OrderSummary）が充実
- テスト結果ドキュメントをdocsに格納

---

### feature/h1nakamu — ユニットテスト（DBモック、最小構成）

ファイル構成:
- `backend/src/routes/books.test.ts`
- `backend/src/routes/orders.test.ts`
- `backend/test-results/result_20260526_142251.txt` — テスト実行結果ファイル

#### Backend ユニットテスト（DBモック）

| ファイル | テストケース |
|---|---|
| `routes/books.test.ts` | GET /books: 書籍一覧を返す |
| | GET /books/:id: 指定したIDの書籍を返す |
| | GET /books/:id: 存在しないIDの場合は404を返す（エラーメッセージ「書籍が見つかりません」） |
| `routes/orders.test.ts` | POST /orders: 注文を作成して注文番号を返す（合計金額: 3200×2=6400） |
| | POST /orders: 必須項目が不足している場合は400を返す（エラーメッセージ「必須項目が不足しています」） |
| | POST /orders: itemsが空の場合は400を返す |

#### テスト実行結果（test-results/result_20260526_142251.txt より）

| 結果 | テスト数 | 実行時間 |
|---|---|---|
| ✅ 全Pass | 6 passed / 6 | 0.743s |

**特徴:**
- 最もシンプルな構成（6テストのみ）
- トランザクション制御（beginTransaction/commit/rollback/release）のモックあり
- 注文番号フォーマット: `ORD-YYYYMMDD-XXXXXX`（英数字6文字）
- テストファイルがroutes直下に配置（他ブランチは `__tests__/`）
- フロントエンドテストなし
- GET /books/:id の400（無効ID）テストなし
- 注文取得（GET /api/orders/:id）テストなし

---

### feature/keitaKobayashi — 統合テスト（実DB接続）

ファイル: `backend/src/__tests__/`（3ファイル）

| ファイル | テストケース |
|---|---|
| `health.test.ts` | GET /health: DB接続状態の確認（status:ok, db:connected） |
| `books.test.ts` | GET /api/books: 200で一覧返す |
| | GET /api/books: 各書籍に必須フィールドが含まれる |
| | GET /api/books/:id: 存在する書籍を返す |
| | GET /api/books/:id: 存在しない書籍は404 |
| | GET /api/books/:id: 無効なidは400 |
| `orders.test.ts` | POST /api/orders: 正常な注文を作成できる（201） |
| | POST /api/orders: 複数商品の合計金額が正しい |
| | POST /api/orders: 氏名が空の場合は400 |
| | POST /api/orders: 住所が空の場合は400 |
| | POST /api/orders: メール形式が不正の場合は400 |
| | POST /api/orders: 商品リストが空の場合は400 |
| | GET /api/orders/:id: 作成した注文を取得できる（items付き） |
| | GET /api/orders/:id: 存在しない注文は404 |

**特徴:** 実DBに接続する統合テストのみ。`pool.end()` で後処理あり。フロントエンドテストなし。

---

### feature/satoyuya — ユニットテスト＋結合テスト（テストID付き）

ファイル: `テスト/ユニットテスト/`（4ファイル）、`テスト/結合テスト/`（2ファイル）

#### Backend ユニットテスト（`generateOrderNumber.test.ts` / `validation.test.ts`）

| テストID | テスト内容 |
|---|---|
| UT-BE-01〜04 | 注文番号生成: フォーマット確認、ランダム範囲(1000-9999)、日付有効性、一意性（10回中5回以上ユニーク） |
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

#### API 結合テスト（axios使用、Docker Compose前提）

| テストID | テスト内容 |
|---|---|
| IT-BK-01〜02 | GET /api/books: 200/必須フィールド確認 |
| IT-BK-03〜05 | GET /api/books/:id: 正常/404/400 |
| IT-ORD-01〜06 | POST /api/orders: 正常(201)/各バリデーション400/存在しない書籍ID→500 |
| IT-ORD-07〜11 | GET /api/orders/:id: 取得/items確認/合計金額のDB価格一致確認/404/400 |

**特徴:** テストIDが体系的（UT-BE/UT-FE/IT-BK/IT-ORD）。注文番号フォーマット: `ORD-YYYYMMDDHHmmss-XXXX`（日時+4桁乱数）。テストファイルがプロジェクトルートの `テスト/` ディレクトリに分離。

---

### feature/kazukisugawara2 — ユニットテスト（DBモック、最も網羅的）

ファイル: `backend/src/__tests__/`（6ファイル）、`frontend/src/__tests__/`（2ファイル）  
カスタムAIエージェント定義あり（`coverage-test-writer` / `unit-test-runner`）

#### Backend ユニットテスト（DBモック）

| ファイル | テストケース |
|---|---|
| `index.test.ts` | CORS設定、router登録、GET /health (200 + {status:'ok'}) |
| `productsController.test.ts` | GET /api/products: 正常/空配列/DB失敗(500) |
| | GET /api/products/:id: 正常/404/400(文字列・0・負・float)/500 |
| `productsQuery.test.ts` | getAllProducts: 正常/空配列/DBエラー/ORDER BY確認 |
| | getProductById: 正常/undefined/DBエラー/パラメータ確認 |
| | getProductsByIds: 空配列(DBコールなし)/複数ID/単一ID/DBエラー |
| `ordersController.test.ts` | POST /api/orders: 正常201/DB価格で合計計算/複数商品集計/各バリデーション/存在しない商品/DBエラー |
| | GET /api/orders/:id: 正常/items付き/404/DBエラー |
| `ordersQuery.test.ts` | createOrderWithItems: トランザクション制御(begin/commit/rollback/release) |
| | INSERT内容確認/注文番号のゼロパディング確認 |
| | getOrderById: 正常/not found/DBエラー |
| | getOrderItemsByOrderId: あり/なし/DBエラー |
| `pool.test.ts` | デフォルト接続値(host/port/db/user/password) |
| | 環境変数上書き(DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD) |
| | プール設定(waitForConnections/connectionLimit/queueLimit) |
| | exportが正しいpool/createPoolが1回だけ呼ばれること |

#### Frontend ユニットテスト

| ファイル | テストケース |
|---|---|
| `api.test.ts` | fetchProducts: 正常/空配列/500エラー/503エラー/networkエラー/cache:no-store確認 |
| | fetchProduct: 正常/404/500/400/URL構築/networkエラー |
| | createOrder: 正常/POSTメソッド確認/400・404・500 ApiError/networkエラー |
| `useCart.test.ts` | 初期化: 空カート/initialized=true/localStorage読み込み/null/invalid JSON |
| | saveCart: localStorage書き込み/空カートでも書き込み |
| | addItem: 新規追加/数量増加/他アイテム不変/複数追加 |
| | updateQuantity: 数量更新/0(no-op)/負(no-op)/他アイテム不変/境界値=1 |
| | removeItem: 削除/存在しないID/最後のアイテム |
| | clearCart: 全削除/空カートでno-op |
| | totalAmount/totalCount: 空/単一/複数 |
| | 戻り値の形: 必要なフィールドの確認 |

**特徴:** DBはすべてjestモック。注文番号フォーマット: `ORD-0000000001`（10桁ゼロパディング）。カスタムAIエージェントによるテスト自動生成・実行の仕組みも含む。

---

## ブランチ間の差分まとめ

### テスト概要比較

| 観点 | AkaneOno | h1nakamu | keitaKobayashi | satoyuya | kazukisugawara2 |
|---|---|---|---|---|---|
| テスト種別 | ユニット＋FEコンポーネント | ユニットのみ | 統合テストのみ | ユニット＋結合 | ユニットのみ |
| DB接続 | **なし（JSONファイル）** | モック | **実DB** | 結合テストは実DB | **すべてモック** |
| フロントエンドテスト | **あり（5ファイル）** | なし | なし | あり（2ファイル） | あり（2ファイル） |
| テストID体系 | なし | なし | なし | **あり（UT/IT系統）** | なし |
| テストファイル数 | **8** | 2 | 3 | 6 | 8 |
| テスト総数 | **32**（BE:20, FE:12） | 6 | 14 | 27 | 約50+ |
| テスト結果ファイル | **あり（docs/）** | あり（test-results/） | なし | なし | なし |

### エンドポイント別カバレッジ比較

| テスト対象 | AkaneOno | h1nakamu | keitaKobayashi | satoyuya | kazukisugawara2 |
|---|---|---|---|---|---|
| GET /api/books（一覧） | ✅ | ✅ | ✅ | ✅ | ✅（products） |
| GET /api/books/:id 正常 | ✅ | ✅ | ✅ | ✅ | ✅（products） |
| GET /api/books/:id 404 | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /api/books/:id 400 | — | — | ✅ | ✅ | ✅ |
| GET /health | — | — | ✅ | — | ✅ |
| POST /api/orders 正常 | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /api/orders 氏名空→400 | ✅ | 一括400のみ | ✅ | ✅ | ✅ |
| POST /api/orders 住所空→400 | ✅ | 一括400のみ | ✅ | ✅ | ✅ |
| POST /api/orders メール不正→400 | ✅ | — | ✅ | ✅ | ✅ |
| POST /api/orders items空→400 | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /api/orders items欠損→400 | ✅ | — | — | — | — |
| GET /api/orders/:id 正常 | — | — | ✅ | ✅ | ✅ |
| GET /api/orders/:id 404 | — | — | ✅ | ✅ | ✅ |

### 注文番号フォーマット比較

| ブランチ | フォーマット | 採番方式 |
|---|---|---|
| AkaneOno | `ORD-YYYYMMDD-NNNNNN` | 既存件数+1のシーケンシャル6桁 |
| h1nakamu | `ORD-YYYYMMDD-XXXXXX` | 英数字6文字（ランダム系） |
| satoyuya | `ORD-YYYYMMDDHHmmss-XXXX` | 日時14桁+乱数4桁(1000-9999) |
| kazukisugawara2 | `ORD-0000000001` | insertIdのゼロパディング10桁 |
| keitaKobayashi | 不明 | — |

### ブランチ固有テストの特徴

| ブランチ | 固有の特徴 |
|---|---|
| **AkaneOno** | フロントエンドコンポーネント（BookCard/CartItemRow/OrderSummary）の表示テスト。注文番号採番の連番ロジックを単体検証。テスト実行結果ドキュメント（カバレッジ付き）が整備されている。 |
| **h1nakamu** | テストファイルがroutes直下に配置（他ブランチは`__tests__/`）。テスト結果ファイルが`test-results/`に保存されている。最小限の実装だが実行済みであることが確認可能。 |
| **keitaKobayashi** | 唯一の実DB統合テスト。GET /health でDB接続確認。複数商品の合計金額テストあり。 |
| **satoyuya** | テストIDによる体系的な管理（UT-BE/UT-FE/IT-BK/IT-ORD）。Docker Compose前提の結合テスト。合計金額のDB価格一致確認（IT-ORD-09）。 |
| **kazukisugawara2** | `pool.ts`設定テスト・`getProductsByIds`テストが唯一存在。トランザクション制御の詳細検証。AIエージェントによるテスト自動化の仕組みを構築。 |
