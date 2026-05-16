# サブエージェント依頼プロンプト一覧（feature/KazukiSugawara2）

抽出件数: 7 件

---

## [1] 外部設計書の作成

- **日時**: 2026-05-11 22:57:59
- **ブランチ**: `feature/kazukisugawara2`
- **エージェント型**: `external-design-writer`

### プロンプト

```
以下の要件定義書（user_requirements.md）を元に外部設計書を作成してください。

プロジェクトのワーキングディレクトリは `/home/suga/workspace/docker/2026-c-02` です。

## プロジェクト概要（CLAUDE.md より）

個人運営オンライン書店の購買フロー（商品一覧 → 商品詳細 → カート → 注文フォーム → 注文完了）を実装するWebアプリケーション。ログイン・決済・在庫管理はスコープ外。

### アーキテクチャ
- **Frontend**: Next.js 14 + TypeScript, App Router使用。`src/app/` 配下にページを追加する。
- **Backend**: Express + TypeScript。`backend/src/index.ts` がエントリポイント。REST APIを提供する。
- **MySQL 8**: 初期化SQLは `mysql/init/` に置くと起動時に自動実行される。

フロントエンドからバックエンドへの通信は環境変数 `NEXT_PUBLIC_API_URL`（デフォルト: `http://localhost:4000`）経由。

---

## 要件定義書（user_requirements.md の全文）

# ユーザー要件定義書
## 個人運営オンライン書店（購買フロー特化版）

## 1. 対象ユーザーと目的

**ユーザー：** 書店サイトを訪れた購入希望者

**目的：** 欲しい本を見つけ、必要事項を入力して注文を完了する

## 2. ユーザー要件一覧

### 画面1｜商品一覧

| # | ユーザーがしたいこと | 補足条件 |
|---|---|---|
| U-01 | 販売中の書籍をまとめて見たい | グリッド形式で複数冊を一覧できること |
| U-02 | 各書籍の基本情報を一覧上で把握したい | 書影・タイトル・著者・価格が見えること |
| U-03 | 気になる本をクリックして詳細を見たい | 商品詳細画面へ遷移できること |

### 画面2｜商品詳細

| # | ユーザーがしたいこと | 補足条件 |
|---|---|---|
| U-04 | 書籍の詳しい情報を確認したい | 書影・タイトル・著者・価格・説明文が見えること |
| U-05 | 購入意思が固まったらカートに追加したい | 「カートに追加」ボタンを押すだけで追加できること |
| U-06 | 追加後もそのまま他の本を見続けたい | カートに追加しても一覧に戻れること |

### 画面3｜カート

| # | ユーザーがしたいこと | 補足条件 |
|---|---|---|
| U-07 | カートに入れた本の一覧を確認したい | 書名・単価・数量・小計が見えること |
| U-08 | 冊数を変更したい | 数量を増減でき、小計と合計がリアルタイムに変わること |
| U-09 | 不要な本をカートから削除したい | 削除後、合計金額も即時更新されること |
| U-10 | 全商品の合計金額を確認したい | 送料などの表示ルールはスコープ外 |
| U-11 | 注文手続きに進みたい | 注文フォーム画面へ遷移できること |

### 画面4｜注文フォーム

| # | ユーザーがしたいこと | 補足条件 |
|---|---|---|
| U-12 | 氏名・住所・メールアドレスを入力したい | 3項目すべてが必須入力であること |
| U-13 | 入力ミスがあれば気づきたい | 未入力や形式不正の場合はエラーメッセージを表示すること |
| U-14 | 注文内容（カート）を確認しながら入力したい | 注文商品と合計金額が同画面で見えること |
| U-15 | 入力完了後に注文を確定したい | 「注文する」ボタン1つで完了画面に進めること |

### 画面5｜注文完了

| # | ユーザーがしたいこと | 補足条件 |
|---|---|---|
| U-16 | 注文が受け付けられたことを確認したい | 注文完了メッセージが表示されること |
| U-17 | 自分の注文を特定できる番号を受け取りたい | 注文番号が画面上に表示されること |
| U-18 | 注文後にトップへ戻れるようにしたい | 商品一覧へ戻るリンクがあること |

## 3. スコープ外（明示的に含めない機能）

| 機能 | 除外理由 |
|---|---|
| ログイン・会員管理 | 本フローに不要 |
| 決済処理 | スコープ外 |
| 在庫管理 | スコープ外 |
| 管理画面 | スコープ外 |
| レビュー・評価 | スコープ外 |
| 検索・フィルター | スコープ外 |

## 4. 画面遷移サマリー

```
商品一覧 → 商品詳細 → （カートに追加）
                              ↓
                           カート → 注文フォーム → 注文完了
                              ↑
                         （一覧から直接も可）
```

---

外部設計書は `/home/suga/workspace/docker/2026-c-02/external_design.md` として保存してください。
```

---

## [2] 内部設計書の作成

- **日時**: 2026-05-12 12:42:51
- **ブランチ**: `feature/kazukisugawara2`
- **エージェント型**: `internal-design-writer`

### プロンプト

```
以下の外部設計書（external_design.md）を元に内部設計書を作成してください。

プロジェクトのワーキングディレクトリは `/home/suga/workspace/docker/2026-c-02` です。
内部設計書は `/home/suga/workspace/docker/2026-c-02/internal_design.md` として保存してください。

## プロジェクト概要（CLAUDE.md より）

個人運営オンライン書店の購買フロー（商品一覧 → 商品詳細 → カート → 注文フォーム → 注文完了）を実装するWebアプリケーション。

### アーキテクチャ
- **Frontend**: Next.js 14 + TypeScript, App Router使用。`src/app/` 配下にページを追加する。
- **Backend**: Express + TypeScript。`backend/src/index.ts` がエントリポイント。REST APIを提供する。
- **MySQL 8**: 初期化SQLは `mysql/init/` に置くと起動時に自動実行される。

フロントエンドからバックエンドへの通信は環境変数 `NEXT_PUBLIC_API_URL`（デフォルト: `http://localhost:4000`）経由。

---

## 外部設計書の主要内容サマリー

### 画面一覧（5画面）

| 画面ID | 画面名 | URL | App Routerパス |
|---|---|---|---|
| SCR-01 | 商品一覧画面 | `/` | `src/app/page.tsx` |
| SCR-02 | 商品詳細画面 | `/products/[id]` | `src/app/products/[id]/page.tsx` |
| SCR-03 | カート画面 | `/cart` | `src/app/cart/page.tsx` |
| SCR-04 | 注文フォーム画面 | `/order` | `src/app/order/page.tsx` |
| SCR-05 | 注文完了画面 | `/order/complete` | `src/app/order/complete/page.tsx` |

### APIエンドポイント（4本）

| # | メソッド | パス | 概要 |
|---|---|---|---|
| API-01 | GET | `/api/products` | 商品一覧取得 |
| API-02 | GET | `/api/products/:id` | 商品詳細取得 |
| API-03 | POST | `/api/orders` | 注文作成 |
| API-04 | GET | `/api/orders/:id` | 注文詳細取得（任意実装） |

### DBテーブル（3テーブル）

- `products`（書籍マスタ）: id, title, author, price, image_url, description, created_at, updated_at
- `orders`（注文ヘッダ）: id, order_number(ORD-XXXXXXXXXX形式, UNIQUE), customer_name, customer_address, customer_email, total_amount, created_at, updated_at
- `order_items`（注文明細）: id, order_id(FK), product_id(FK), title(スナップショット), price(スナップショット), quantity, subtotal, created_at

### 主要な設計上の前提

- **[前提A]** カートはlocalStorageで管理（カート専用APIなし）
- **[前提B]** 数量「−」は数量1のとき非活性
- **[前提C]** メール送信はスコープ外
- **[前提D]** 注文番号はURLクエリパラメータで受け渡し（例: `/order/complete?order_number=ORD-0000000042`）
- **[前提G]** 注文番号フォーマット: `ORD-` + 10桁ゼロ埋めID

### セキュリティ要件
- パラメータ化クエリ（SQLインジェクション対策）
- CORS設定（localhost:3000のみ許可）
- dangerouslySetInnerHTML使用禁止
- 入力値バリデーション（API側）

### バリデーション仕様（注文フォーム）

| フィールド | ルール | エラーメッセージ |
|---|---|---|
| 氏名 | 必須・最大100文字 | 「氏名を入力してください」「氏名は100文字以内で入力してください」 |
| 住所 | 必須・最大255文字 | 「住所を入力してください」「住所は255文字以内で入力してください」 |
| メールアドレス | 必須・RFC5322形式・最大255文字 | 「メールアドレスを入力してください」「有効なメールアドレスを入力してください」 |

### POSTリクエスト仕様（API-03）

```json
{
  "customer_name": "山田 太郎",
  "customer_address": "東京都渋谷区渋谷1-1-1",
  "customer_email": "taro.yamada@example.com",
  "items": [
    { "product_id": 1, "quantity": 2 }
  ]
}
```

レスポンス（201 Created）:
```json
{
  "order": {
    "id": 42,
    "order_number": "ORD-0000000042",
    "customer_name": "山田 太郎",
    "customer_email": "taro.yamada@example.com",
    "total_amount": 8360,
    "created_at": "2026-05-12T10:30:00Z"
  }
}
```

---

内部設計書には以下の内容を含めてください：

1. **ディレクトリ構成**（フロントエンド・バックエンドのファイル構造）
2. **コンポーネント設計**（フロントエンド各画面のコンポーネント分割、Props定義）
3. **状態管理設計**（カートのlocalStorage管理ロジック、カスタムフックなど）
4. **バックエンド実装設計**（ルーター・コントローラー・DBアクセスの分離方針、各APIの処理フロー）
5. **DBアクセス設計**（SQLクエリ、パラメータ化クエリの実装方針）
6. **エラーハンドリング実装方針**（フロントエンド・バックエンド）
7. **型定義**（TypeScriptの主要な型/インターフェース定義）
8. **初期化SQL**（`mysql/init/01_init.sql`の内容）
9. **環境変数・設定ファイル**の実装詳細
```

---

## [3] 内部設計書の作成

- **日時**: 2026-05-12 12:46:56
- **ブランチ**: `feature/kazukisugawara2`
- **エージェント型**: `internal-design-writer`

### プロンプト

```
以下の外部設計書（external_design.md）を元に内部設計書を作成してください。

プロジェクトのワーキングディレクトリは `/home/suga/workspace/docker/2026-c-02` です。
内部設計書は `/home/suga/workspace/docker/2026-c-02/internal_design.md` として保存してください。

外部設計書の全文は以下です：

---

# 外部設計書

## 1. ドキュメント情報

| 項目 | 内容 |
|---|---|
| ドキュメント名 | 外部設計書（個人運営オンライン書店 購買フロー） |
| 作成日 | 2026-05-12 |
| バージョン | 1.0.0 |
| 対象システム名 | 個人運営オンライン書店 購買フローWebアプリケーション |
| 参照要件定義書 | user_requirements.md |

## 2. システム概要

### 2.1 システムの目的と背景

本システムは、個人が運営するオンライン書店における購買フローを実現するWebアプリケーションである。ユーザーが書籍を探し、カートに追加し、配送情報を入力して注文を完了するまでの一連の操作をブラウザ上で完結できる。

認証・決済・在庫管理は本システムのスコープ外とし、購買体験のコアフローに特化した実装とする。

### 2.2 システム全体像

```
ユーザーブラウザ (http://localhost:3000)
        ↓ HTTP/REST (JSON)  NEXT_PUBLIC_API_URL (http://localhost:4000)
Frontendサービス: Next.js 14 + TypeScript, App Router (src/app/)
        ↓ fetch
Backendサービス: Express + TypeScript (backend/src/index.ts, port 4000)
        ↓ mysql2
データベースサービス: MySQL 8 (初期化SQL: mysql/init/01_init.sql)
Docker Compose で3サービスを統合管理
```

### 2.3 スコープ

対象範囲: 商品一覧表示、商品詳細表示、カート管理、注文フォーム、注文完了
対象外: ログイン・会員管理、決済処理、在庫管理、管理画面、レビュー・評価、検索・フィルター、送料計算

## 3. 画面設計

### 3.1 画面一覧

| 画面ID | 画面名 | URL | App Routerパス |
|---|---|---|---|
| SCR-01 | 商品一覧画面 | `/` | `src/app/page.tsx` |
| SCR-02 | 商品詳細画面 | `/products/[id]` | `src/app/products/[id]/page.tsx` |
| SCR-03 | カート画面 | `/cart` | `src/app/cart/page.tsx` |
| SCR-04 | 注文フォーム画面 | `/order` | `src/app/order/page.tsx` |
| SCR-05 | 注文完了画面 | `/order/complete` | `src/app/order/complete/page.tsx` |

### 3.2 SCR-01 商品一覧画面（対応要件: U-01, U-02, U-03）

表示項目: 書影（任意）、タイトル、著者名、価格（¥X,XXX形式）
操作: 書籍カードクリック→SCR-02へ遷移、カートアイコンクリック→SCR-03へ遷移
ページ初期表示: GET /api/products を呼び出し書籍一覧を取得

### 3.3 SCR-02 商品詳細画面（対応要件: U-04, U-05, U-06）

表示項目: 書影（任意）、タイトル、著者名、価格、説明文（任意）
操作: ページ初期表示でGET /api/products/:id 呼び出し、「カートに追加」ボタン→localStorageに追加・同画面維持、「商品一覧に戻る」→SCR-01

### 3.4 SCR-03 カート画面（対応要件: U-07, U-08, U-09, U-10, U-11）

表示項目: 書名・単価・数量・小計・合計金額
操作: 数量±ボタン（−は数量1のとき非活性）、削除ボタン、「注文手続きへ進む」（カート空のとき非活性）、「商品一覧に戻る」
リアルタイム更新: localStorageから読み込み、小計・合計を即時再計算

### 3.5 SCR-04 注文フォーム画面（対応要件: U-12, U-13, U-14, U-15）

表示項目: 注文内容確認エリア（書名・数量・小計・合計）、お届け先入力エリア（氏名・住所・メールアドレス）
バリデーション:
- 氏名: 必須・最大100文字
- 住所: 必須・最大255文字
- メールアドレス: 必須・RFC5322形式・最大255文字
操作: blurでバリデーション、「注文する」→POST /api/orders→成功時localStorageクリア→SCR-05へ遷移

### 3.6 SCR-05 注文完了画面（対応要件: U-16, U-17, U-18）

表示項目: 注文完了メッセージ、注文番号（URLクエリパラメータ order_number から取得）
操作: 「商品一覧へ戻る」→SCR-01

## 4. 画面遷移

SCR-01→SCR-02（書籍カードクリック）
SCR-01→SCR-03（カートアイコンクリック）
SCR-02→SCR-01（「商品一覧に戻る」）
SCR-02→SCR-03（カートアイコンクリック）
SCR-03→SCR-04（「注文手続きへ進む」、カートが空でない場合）
SCR-03→SCR-01（「商品一覧に戻る」）
SCR-04→SCR-05（「注文する」クリック後、POST /api/orders が201を返した場合）
SCR-05→SCR-01（「商品一覧へ戻る」）

## 5. API設計

### API-01 GET /api/products
商品一覧取得。レスポンス200: { "products": [{ id, title, author, price, image_url, description }] }
エラー: 500

### API-02 GET /api/products/:id
商品詳細取得。レスポンス200: { "product": { id, title, author, price, image_url, description } }
エラー: 400(idが整数でない)、404(商品不存在)、500

### API-03 POST /api/orders
注文作成。リクエスト: { customer_name, customer_address, customer_email, items: [{product_id, quantity}] }
レスポンス201: { "order": { id, order_number, customer_name, customer_email, total_amount, created_at } }
エラー: 400(バリデーション失敗)、404(存在しないproduct_id)、500

### API-04 GET /api/orders/:id（任意実装）
注文詳細取得。レスポンス200: { "order": { id, order_number, customer_name, customer_address, customer_email, total_amount, created_at, items: [{product_id, title, price, quantity, subtotal}] } }
エラー: 404、500

## 6. データモデル設計

### productsテーブル
id INT PK AUTO_INCREMENT, title VARCHAR(255) NOT NULL, author VARCHAR(255) NOT NULL, price INT NOT NULL CHECK(>=0), image_url TEXT NULL, description TEXT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### ordersテーブル
id INT PK AUTO_INCREMENT, order_number VARCHAR(20) NOT NULL UNIQUE, customer_name VARCHAR(100) NOT NULL, customer_address TEXT NOT NULL, customer_email VARCHAR(255) NOT NULL, total_amount INT NOT NULL CHECK(>=0), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### order_itemsテーブル
id INT PK AUTO_INCREMENT, order_id INT NOT NULL FK(orders.id), product_id INT NOT NULL FK(products.id), title VARCHAR(255) NOT NULL（スナップショット）, price INT NOT NULL（スナップショット）, quantity INT NOT NULL CHECK(>=1), subtotal INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
インデックス: idx_order_items_order_id, idx_order_items_product_id

## 7. 非機能要件

- パフォーマンス: TTI 3秒以内、API応答1秒以内、カート操作100ms以内
- セキュリティ: CORS(localhost:3000のみ), パラメータ化クエリ, XSS対策(dangerouslySetInnerHTML禁止), .envによる秘密情報管理
- エラーハンドリング: フロント→try-catch+ユーザーメッセージ表示、バックエンド→400/500レスポンス、スタックトレースはログのみ

## 8. 外部インターフェース

- NEXT_PUBLIC_API_URL: http://localhost:4000
- PORT: 4000, DB_HOST: mysql, DB_PORT: 3306, DB_USER: appuser, DB_PASSWORD: password, DB_NAME: appdb

## 9. 制約・前提条件

- [前提A] カートはlocalStorage管理
- [前提B] 数量「−」は1のとき非活性
- [前提C] メール送信はスコープ外
- [前提D] 注文番号はURLクエリパラメータで受け渡し（/order/complete?order_number=ORD-0000000042）
- [前提E] スマホ対応はMVP必須外
- [前提F] 価格は税込み表示、税計算なし
- [前提G] 注文番号フォーマット: ORD- + 10桁ゼロ埋めID（例: ORD-0000000001）

---

内部設計書には以下の内容を含めてください：

1. **ディレクトリ構成**（フロントエンド・バックエンドのファイル構造）
2. **コンポーネント設計**（各画面のコンポーネント分割、Props定義）
3. **状態管理設計**（カートのlocalStorage管理ロジック、カスタムフック）
4. **バックエンド実装設計**（ルーター・コントローラー・DBアクセスの分離方針、各APIの処理フロー）
5. **DBアクセス設計**（パラメータ化クエリの実装方針）
6. **型定義**（TypeScriptの主要な型/インターフェース）
7. **初期化SQL**（mysql/init/01_init.sql の内容）
8. **環境変数・設定ファイル**の実装詳細
```

---

## [4] 内部設計書に基づくコーディング実施

- **日時**: 2026-05-12 13:03:19
- **ブランチ**: `feature/kazukisugawara2`
- **エージェント型**: `design-to-code`

### プロンプト

```
内部設計書（`/home/suga/workspace/docker/2026-c-02/internal_design.md`）に従って、個人運営オンライン書店の購買フローを実装してください。

プロジェクトのワーキングディレクトリは `/home/suga/workspace/docker/2026-c-02` です。

内部設計書をまず読み込み、そこに記載されている内容に従って全ての実装を行ってください。

実装対象の概要：
- フロントエンド（Next.js 14 + TypeScript）: 5画面（商品一覧・商品詳細・カート・注文フォーム・注文完了）
- バックエンド（Express + TypeScript）: 4本のREST API
- MySQL初期化SQL: テーブル定義とサンプルデータ

内部設計書のパス: `/home/suga/workspace/docker/2026-c-02/internal_design.md`
外部設計書のパス: `/home/suga/workspace/docker/2026-c-02/external_design.md`（補足参照用）

まず既存のファイル構造を確認してから実装を進めてください。
```

---

## [5] テストコードの実装（100%カバレッジ）

- **日時**: 2026-05-12 13:19:28
- **ブランチ**: `feature/kazukisugawara2`
- **エージェント型**: `coverage-test-writer`

### プロンプト

```
個人運営オンライン書店プロジェクトのテストコードを実装してください。

プロジェクトのワーキングディレクトリは `/home/suga/workspace/docker/2026-c-02` です。

## 対象ファイル（バックエンド）

以下のすべてのバックエンドソースファイルに対してテストを書いてください：

- `backend/src/index.ts` — Expressアプリ（CORSミドルウェア、ルーター登録、healthエンドポイント）
- `backend/src/db/pool.ts` — mysql2接続プール
- `backend/src/db/productsQuery.ts` — getAllProducts, getProductById, getProductsByIds
- `backend/src/db/ordersQuery.ts` — createOrderWithItems（トランザクション）, getOrderById, getOrderItemsByOrderId
- `backend/src/controllers/productsController.ts` — GET /api/products, GET /api/products/:id ハンドラー
- `backend/src/controllers/ordersController.ts` — POST /api/orders, GET /api/orders/:id ハンドラー
- `backend/src/routes/products.ts` — 商品ルーター
- `backend/src/routes/orders.ts` — 注文ルーター

## 対象ファイル（フロントエンド）

- `frontend/src/lib/api.ts` — fetchProducts, fetchProduct, createOrder
- `frontend/src/hooks/useCart.ts` — useCartカスタムフック

## 実装の指針

1. まず各ソースファイルを読み込んで内容を把握する
2. `backend/package.json` と `frontend/package.json` を確認してテストライブラリを把握する
3. バックエンドは Jest + Supertest でテスト。mysql2はjest.mock()でモック
4. フロントエンドは Jest + React Testing Library でテスト。fetchはjest.mock()でモック
5. 全分岐（success/error/edge cases）をカバーする
6. テストファイルは以下の場所に配置：
   - バックエンド: `backend/src/__tests__/` 配下
   - フロントエンド: `frontend/src/__tests__/` 配下

テストの実行に必要なJest設定ファイル（jest.config.js/ts）も必要に応じて作成・更新してください。
```

---

## [6] 商品一覧の読み込みエラー修正

- **日時**: 2026-05-12 21:11:37
- **ブランチ**: `feature/kazukisugawara2`
- **エージェント型**: `design-to-code`

### プロンプト

```
## バグ修正依頼

プロジェクトのワーキングディレクトリは `/home/suga/workspace/docker/2026-c-02` です。

## 問題

商品一覧画面（SCR-01）で「商品の読み込みに失敗しました。」と表示され、商品が一覧表示されない。

## 原因（調査済み）

`frontend/src/lib/api.ts` の `fetchProducts()` は Next.js の **Server Component** から呼ばれる。Server Component はブラウザではなく **Docker コンテナ内のNext.jsサーバー**から実行される。

現在の設定：
```
NEXT_PUBLIC_API_URL=http://localhost:4000  （docker-compose.yml の environment）
```

Server Component が `http://localhost:4000/api/products` を fetch しようとすると、コンテナ内では `localhost` = frontend コンテナ自身を指すため、バックエンドに到達できない。

Docker ネットワーク内でバックエンドを呼ぶには `http://backend:4000`（Docker Compose サービス名）を使う必要がある。

一方、ブラウザ（Client Component）から呼ぶ場合は `http://localhost:4000` が正しい（ホストOSから見たポートマッピング）。

## 修正方針

### 方針：サーバー用とクライアント用でベースURLを分ける

1. **`docker-compose.yml`** に `INTERNAL_API_URL=http://backend:4000` を追加する（`NEXT_PUBLIC_` プレフィックスなし = サーバーサイドのみ有効）

2. **`frontend/src/lib/api.ts`** でサーバー用URLとクライアント用URLを切り替える：
   - Server Component（サーバー側実行）: `process.env.INTERNAL_API_URL || 'http://backend:4000'`
   - Client Component（ブラウザ実行）: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'`
   - `typeof window === 'undefined'` でサーバー/クライアントを判定するか、関数を分ける

3. **`.env.example`** にも `INTERNAL_API_URL=http://backend:4000` を追加する

## 修正対象ファイル

- `/home/suga/workspace/docker/2026-c-02/docker-compose.yml`
- `/home/suga/workspace/docker/2026-c-02/frontend/src/lib/api.ts`
- `/home/suga/workspace/docker/2026-c-02/.env.example`

## 参考：現在の `api.ts` の内容

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/api/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  const data = await res.json();
  return data.products as Product[];
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, { cache: 'no-store' });
  if (res.status === 404) throw new Error('Product not found');
  if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
  const data = await res.json();
  return data.product as Product;
}

export async function createOrder(body: CreateOrderRequest): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw err;
  }
  const data = await res.json();
  return data.order as Order;
}
```

## 制約

- `fetchProducts()` と `fetchProduct()` は Server Component から呼ばれる（サーバー側実行）
- `createOrder()` は Client Component の注文フォームから呼ばれる（ブラウザ実行）
- 既存の関数シグネチャ（引数・戻り値の型）は変えないこと
- `typeof window === 'undefined'` でサーバー/クライアントを判定するシンプルな実装でよい
```

---

## [7] 単体テスト実行

- **日時**: 2026-05-16 11:07:57
- **ブランチ**: `feature/kazukisugawara2`
- **エージェント型**: `unit-test-runner`

### プロンプト

```
このプロジェクトの単体テストをすべて実行してください。

## プロジェクト概要
個人運営オンライン書店の購買フロー（商品一覧 → 商品詳細 → カート → 注文フォーム → 注文完了）を実装するWebアプリケーション。

## 構成
- **Frontend** (`frontend/`): Next.js 14 + TypeScript, App Router
- **Backend** (`backend/`): Express + TypeScript。`backend/src/index.ts` がエントリポイント
- **MySQL 8** (`mysql/`)

## 作業内容
1. `frontend/` と `backend/` の両方でテストコマンドを確認する（package.json の scripts を確認）
2. テストが存在する場合はそれを実行する（Dockerコンテナ内ではなく、ローカルで `npm test` などを実行）
3. テスト結果（パス/失敗/スキップ数）とエラー内容を報告する
4. テストが存在しない場合はその旨を報告する

作業ディレクトリ: /home/suga/workspace/docker/2026-c-02
```

---

