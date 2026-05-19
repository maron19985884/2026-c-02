# ブランチ間ソースコード比較レポート

比較対象: `origin/feature/AkaneOno` / `origin/feature/h1nakamu` / `origin/feature/kazukisugawara2` / `origin/feature/keitaKobayashi` / `origin/feature/satoyuya`

---

## 1. 実装状況サマリー

| 機能 | AkaneOno | h1nakamu | kazukisugawara2 | keitaKobayashi | satoyuya |
|------|----------|----------|-----------------|----------------|----------|
| 商品一覧（U-01〜U-03） | × | × | ○ | ○ | ○ |
| 商品詳細（U-04〜U-06） | × | × | ○ | ○ | ○ |
| カート（U-07〜U-11） | × | × | ○ | ○ | ○ |
| 注文フォーム（U-12〜U-15） | × | × | ○ | ○ | ○ |
| 注文完了（U-16〜U-18） | × | × | ○ | ○ | ○ |
| バックエンド実装 | × | △（ヘルスのみ） | ○ | ○ | ○ |
| DBスキーマ定義 | × | △（usersテーブルのみ） | ○ | ○ | ○ |
| テスト | × | × | ○ | ○ | ○ |

凡例: ○=実装済み / △=一部実装 / ×=未実装

---

## 2. 機能別比較

### 2-1. 商品一覧（U-01〜U-03）

#### 共通点
- 全3ブランチ（kazukisugawara2・keitaKobayashi・satoyuya）でグリッド表示（`gridTemplateColumns: repeat(auto-fill, minmax(...))`）を使用
- タイトル・著者・価格を表示
- バックエンドAPIからデータを取得して一覧表示

#### ブランチ別の差分

**AkaneOno**
- フロントエンドにページファイルは存在するが、商品一覧機能は未実装（README.mdとuser_requirements.mdのみコミット）
- ソースコード自体がリポジトリに存在しない

**h1nakamu**
- フロントエンドの `page.tsx` が存在するが「🚀 Frontend 起動確認」のスタブのみで、商品一覧機能は未実装

**kazukisugawara2**
- `Server Component`（`async function`）でサーバーサイドにてデータ取得
- バックエンドの `/api/products` エンドポイントを `fetch()` で呼び出す
- `BookCard` コンポーネントに分離。書影（`image_url`）・タイトル・著者・価格を表示
- エラー時は `ErrorMessage` コンポーネントを表示、商品ゼロ件も考慮

**keitaKobayashi**
- `'use client'` の Client Component。`useEffect` + `useState` で非同期にデータ取得
- `BookCard` コンポーネントに分離。`img` タグで書影（`image_url`）を表示、フォールバックに placehold.co を使用
- ローディング中・エラー時のステータス表示あり

**satoyuya**
- `'use client'` の Client Component。`useEffect` + `useState` で非同期にデータ取得
- `BookCard` コンポーネントは使用せず、`page.tsx` にインライン実装
- 書影の代わりにタイトル文字から色を生成する `BookCover` コンポーネント（擬似書影）を独自実装

---

### 2-2. 商品詳細（U-04〜U-06）

#### 共通点
- 全3ブランチ（kazukisugawara2・keitaKobayashi・satoyuya）で動的ルーティング `[id]` を使用
- タイトル・著者・価格・説明文を表示
- カートに追加ボタンを実装
- 一覧に戻るリンク/ボタンを実装

#### ブランチ別の差分

**kazukisugawara2**
- `Server Component`。ページ自体はサーバーサイドでデータ取得
- カートに追加ボタン部分のみを `AddToCartButton` として `'use client'` の Client Component に分離（Server/Clientの適切な境界設計）
- `next/image` の `Image` コンポーネントで書影を表示（最適化対応）
- パンくずリスト（書籍一覧 > 書名）を実装
- ID が不正な場合は `notFound()` を呼び出す

**keitaKobayashi**
- `'use client'` の Client Component。`useEffect` でクライアントサイドにデータ取得
- カートに追加後は「✓ カートに追加しました」に2秒間ボタンテキストが変化するフィードバックあり
- `img` タグで書影表示（プレースホルダー付き）

**satoyuya**
- `'use client'` の Client Component。`useEffect` でクライアントサイドにデータ取得
- 書影の代わりに `BookCover` コンポーネント（グラデーション擬似書影）
- カートに追加後の視覚フィードバックあり
- 一覧に戻るボタンは `router.back()` を使用（ブラウザ履歴で戻る）

---

### 2-3. カート（U-07〜U-11）

#### 共通点
- 全3ブランチで localStorage を用いたカート管理を実装
- 商品一覧の確認・数量増減（＋/−ボタン）・削除・合計金額表示・注文手続きへ遷移ボタンを実装
- カートが空の場合は空カート表示と一覧への戻るリンクを表示

#### ブランチ別の差分

**kazukisugawara2**
- `CartItemRow` コンポーネントに分離してカート行を表示
- 合計金額表示に「税込み」表記あり
- `/order` へ遷移

**keitaKobayashi**
- `CartProvider`（Context + `useState` + `useEffect` で状態管理）を採用。`useCart` は Context 経由
- カートアイテムは `{ book: Book, quantity: number }` 型で Book オブジェクト全体を保持
- 書影のサムネイル画像をカート内で表示
- `/checkout` へ遷移

**satoyuya**
- `CartProvider`（Context + `useReducer`）を採用。`cartReducer` 関数で状態更新
- カートアイテムは `{ book: Book, quantity: number }` 型
- 2カラムレイアウト（商品一覧 + 注文サマリーサイドパネル）
- `MiniCover` コンポーネントで擬似書影をカート内でも表示
- `/checkout` へ遷移

---

### 2-4. 注文フォーム（U-12〜U-15）

#### 共通点
- 全3ブランチで氏名・住所・メールアドレスの入力フォームを実装
- 必須チェックとメール形式バリデーションを実装
- 注文内容確認（商品名・数量・合計）を表示
- バックエンドAPIへ POST して注文を作成

#### ブランチ別の差分

**kazukisugawara2**
- フォーム単体で `validateField()` 関数によりフィールドごとのバリデーション
- `onBlur`（フォーカスが外れたとき）でもリアルタイムバリデーション実行
- 文字数上限チェックあり（氏名100文字、住所255文字、メール255文字）
- `OrderSummary` コンポーネントに注文内容を分離
- カートが空の場合はカート画面へ `router.replace()` でリダイレクト
- 注文完了後は `/order/complete?order_number=XXX` へ遷移（URLクエリパラメータで注文番号を渡す）

**keitaKobayashi**
- 送信時に一括バリデーション（`validate()` 関数）
- `onBlur` バリデーションなし、文字数チェックなし
- フォーム（左）と注文内容（右）を2カラムグリッドで表示
- 注文APIのリクエストに `unit_price` を含める（`items: [{ book_id, quantity, unit_price }]`）
- 注文完了後は `/orders/:id` へ遷移（注文IDで注文詳細を取得）

**satoyuya**
- 送信時に一括バリデーション（`validate()` 関数）
- `onBlur` バリデーションなし、文字数チェックなし
- 住所入力欄は `textarea`（複数行）を使用
- フォーム（左）と注文内容（右）を2カラムグリッドで表示
- 注文完了後は `/complete/:id` へ遷移

---

### 2-5. 注文完了（U-16〜U-18）

#### 共通点
- 全3ブランチで注文完了メッセージを表示
- 注文番号（または注文IDに相当する識別子）を表示
- 書籍一覧へ戻るリンクを実装

#### ブランチ別の差分

**kazukisugawara2**
- URLクエリパラメータ（`?order_number=XXX`）から注文番号を取得して表示
- `useSearchParams()` を `Suspense` でラップ（Next.js 14 のビルド警告対策）
- APIへの再取得なし（注文番号のみURLに含める）
- チェックマーク（&#10003;）アイコンを丸い背景で表示

**keitaKobayashi**
- URLパスパラメータ（`/orders/:id`）から注文IDを取得し、`GET /api/orders/:id` で注文詳細を再取得
- `Server Component`（`async function`）で注文詳細を表示
- 氏名・メール・住所・注文内容（明細）をすべて表示する詳細な完了画面
- `✅` アイコンを使用

**satoyuya**
- URLパスパラメータ（`/complete/:orderId`）から注文IDを取得し、`GET /api/orders/:id` で注文詳細を再取得
- `'use client'` の Client Component（`useEffect` で取得）
- 注文番号・お届け先情報（氏名・メール・住所）・注文明細・合計を一覧表示
- 注文日時も表示（`toLocaleString("ja-JP")`）

---

## 3. 横断的な技術比較

### 3-1. フレームワーク・技術スタック

| 項目 | AkaneOno | h1nakamu | kazukisugawara2 | keitaKobayashi | satoyuya |
|------|----------|----------|-----------------|----------------|----------|
| フロントエンド | Next.js 14 | Next.js 14 | Next.js 14 | Next.js 14 | Next.js 14 |
| バックエンド | — | Express + TS | Express + TS | Express + TS | Express + TS |
| 追加ライブラリ（フロント） | — | — | — | — | — |
| 追加ライブラリ（バック） | — | cors, mysql2 | cors, mysql2 | cors, mysql2, dotenv | cors, mysql2 |
| テストフレームワーク | — | — | Jest（外部設定） | Jest + ts-jest + supertest | Jest（外部設定） |

- 全ブランチとも Next.js 14 + TypeScript + Express + TypeScript + MySQL 8 の構成
- keitaKobayashi のみ `dotenv` を依存関係に含む
- keitaKobayashi のみ `supertest` を含む（結合テスト用）
- kazukisugawara2・satoyuya はテスト用 node_modules をコンテナ外部（`/tmp`）にインストールする構成

### 3-2. カート管理方法

| ブランチ | カート管理方式 | カートアイテムのデータ構造 |
|----------|----------------|--------------------------|
| kazukisugawara2 | `useCart` カスタムフック（useState + useEffect） | `{ product_id, title, price, quantity }` |
| keitaKobayashi | Context API（CartContext + useState + useEffect） | `{ book: Book, quantity }` |
| satoyuya | Context API + useReducer（CartContext + cartReducer） | `{ book: Book, quantity }` |

**kazukisugawara2** は軽量なカスタムフック方式でシンプル。カートアイテムは商品IDと表示に必要な最小限の情報のみを保持。

**keitaKobayashi** は Context + useState 方式。Book オブジェクト全体をカートアイテムに含める。Provider は `createElement` を使って `CartContext.Provider` を返す（JSX 不使用）。

**satoyuya** は Context + useReducer 方式で最も設計が整理されている。`cartReducer` 関数で状態遷移を一元管理。`HYDRATE` アクションによる localStorage からの復元も Reducer 内で処理。

いずれも永続化は `localStorage` を利用しており、SSR/CSR 不一致対策として `useEffect` 内でのみ読み書きしている。

### 3-3. バックエンド構造・APIエンドポイント

| 項目 | h1nakamu | kazukisugawara2 | keitaKobayashi | satoyuya |
|------|----------|-----------------|----------------|----------|
| 構造 | フラット（スタブのみ） | 3層分離（Router / Controller / DB層） | 3層分離（Router / Controller / Model） | 2層（Router + 直接DBクエリ） |
| 書籍エンドポイント | — | `/api/products` | `/api/books` | `/api/books` |
| 注文エンドポイント | — | `/api/orders` | `/api/orders` | `/api/orders` |
| ヘルスチェック | `/health` | `/health` | `/health`（DB接続確認付き） | `/health` |
| エントリポイント分離 | 単一ファイル | index.ts のみ | index.ts + app.ts | index.ts のみ |
| レスポンス形式 | — | `{ products: [...] }` / `{ product: {...} }` | `{ data: T, error: string\|null, message: string }` | 直接配列/オブジェクト |

**kazukisugawara2** は Router → Controller → DB層（Query関数）の3層分離が最も徹底されている。DB層に `productsQuery.ts`・`ordersQuery.ts`・`pool.ts` が分離されており、テスタビリティが高い。

**keitaKobayashi** も3層分離（Router / Controller / Model）。レスポンスに `ApiResponse<T>` 型を統一使用し、`{ data, error, message }` 形式で返すことでフロントエンドでのエラーハンドリングを統一している。`app.ts` と `index.ts` を分離しており、supertest での結合テストが容易。

**satoyuya** は Router 内に直接DBクエリを記述するフラット構造。ルーターとロジックが混在しているが、コード量は少なくシンプル。

### 3-4. DBスキーマ比較

| 項目 | h1nakamu | kazukisugawara2 | keitaKobayashi | satoyuya |
|------|----------|-----------------|----------------|----------|
| 書籍テーブル名 | users（スタブ）| `products` | `books` | `books` |
| 注文テーブル | なし | `orders` + `order_items` | `orders` + `order_items` | `orders` + `order_items` |
| 注文番号カラム | — | `order_number`（UNIQUE）あり | なし（注文IDを使用） | `order_number`（UNIQUE）あり |
| order_items の外部キー | — | `product_id` | `book_id` | `book_id` |
| order_items の subtotal カラム | — | あり | なし | なし |
| orders の updated_at | — | あり | なし | なし |
| サンプルデータ | なし | あり（5件）| あり（8件）| あり（8件）|

**kazukisugawara2** のみテーブル名が `products`（他は `books`）。`order_items` の外部キーも `product_id`（他は `book_id`）と異なる。また `order_items` に `subtotal` カラムを持ち、注文時の小計をスナップショットとして保存する設計。

**kazukisugawara2** と **satoyuya** は `orders` テーブルに `order_number` カラム（注文番号）を持つ。**keitaKobayashi** は注文番号なしで注文IDをそのまま完了画面で使用。

### 3-5. バリデーション実装

| ブランチ | フロントサイド | バックエンドサイド | フロントのタイミング |
|----------|--------------|-------------------|-------------------|
| kazukisugawara2 | ○（詳細） | ○（詳細） | 送信時 + onBlur |
| keitaKobayashi | ○ | ○ | 送信時のみ |
| satoyuya | ○ | ○ | 送信時のみ |

**kazukisugawara2** がフロント・バックエンド両方で最も厳密なバリデーションを実装。
- フロント：`validateField()` 関数でフィールド単位の検証、`onBlur` でリアルタイムエラー表示、文字数上限チェックも実装
- バックエンド：必須チェック・文字数チェック・メール形式・items 配列の中身（型・範囲チェック）まで実施。バリデーション失敗時は `details` 配列で複数エラーを一括返却

**keitaKobayashi** のバックエンドは必須チェックとメール形式チェックのみ。エラーメッセージは日本語。

**satoyuya** のバックエンドは必須チェックとメール形式チェックのみ。フォームの住所欄は `textarea`（複数行入力）で使い勝手に配慮。

### 3-6. テストの有無

| ブランチ | フロントテスト | バックエンドテスト | テスト種別 |
|----------|--------------|-----------------|-----------|
| AkaneOno | なし | なし | — |
| h1nakamu | なし | なし | — |
| kazukisugawara2 | ○（2ファイル） | ○（5ファイル） | ユニット（モック使用）+ カバレッジレポート |
| keitaKobayashi | なし | ○（3ファイル） | 結合（実DB接続） |
| satoyuya | ○（2ファイル） | ○（2ファイル）+ 結合（2ファイル） | ユニット（ロジック抽出）+ 結合 |

**kazukisugawara2**
- バックエンド：`productsController.test.ts`・`ordersController.test.ts`・`productsQuery.test.ts`・`ordersQuery.test.ts`・`pool.test.ts`
- DB層を `jest.mock()` でモックして完全なユニットテスト。supertest でHTTPパイプライン含めて検証
- フロントエンド：`useCart.test.ts`（カスタムフックの全操作を網羅）・`api.test.ts`
- カバレッジレポート（`coverage/lcov-report`）もコミット済み

**keitaKobayashi**
- バックエンドのみ、実DBに接続する結合テスト（`books.test.ts`・`orders.test.ts`・`health.test.ts`）
- DBが起動している前提で動作確認するスタイル
- フロントエンドテストなし

**satoyuya**
- バックエンドユニット：`generateOrderNumber.test.ts`（注文番号生成ロジック）・`validation.test.ts`（バリデーション関数）
- フロントエンドユニット：`cartReducer.test.ts`（Reducerの状態遷移）・`checkoutValidation.test.ts`（バリデーション関数）
- 実装コードからロジックを再定義したユニットテスト（実装ファイルをインポートせず独立）
- `テスト/結合テスト/` フォルダに `books.test.ts`・`orders.test.ts` の結合テストもあり

---

## 4. 総評

### AkaneOno
ソースコードの実装が存在しない。`README.md` と `user_requirements.md` のみがコミットされており、開発着手前の状態。

### h1nakamu
Docker 環境・バックエンドの起動確認・フロントエンドの起動確認のみが実装されており、要件定義の5機能はすべて未実装。データベーススキーマも `users` テーブルのみのスタブ。スターターキットの段階から進んでいない。

### kazukisugawara2
5機能すべてを完全実装。設計面でも最も洗練されており、以下の点が際立つ。
- フロントエンドを Server Component / Client Component で適切に分離（SEO・初期表示速度を考慮）
- バックエンドを Router / Controller / DB層の3層に完全分離し、テスタビリティを確保
- フロント・バックエンド双方で詳細なバリデーション（文字数チェック・`onBlur` でのリアルタイム表示）
- ユニットテストを充実させ、カバレッジレポートもコミット済み
- 注文番号の生成とスナップショット保存（`order_items` に `title`, `price`, `subtotal` を保存）も実装

### keitaKobayashi
5機能すべてを実装。独自の工夫として `ApiResponse<T>` 型によるレスポンス形式の統一がある。注文完了画面が最も情報量が多く（注文者情報・明細含む）、完了後に実DBから注文情報を再取得して表示する設計。テストは実DBを使った結合テストのみで、モックを使ったユニットテストはない。フロントエンドのテストが存在しない点と、商品一覧・詳細がクライアントサイドレンダリングのみである点は課題。

### satoyuya
5機能すべてを実装。カート管理に `useReducer` を採用しており、状態遷移の管理が明確で保守性が高い。UIデザインが他ブランチと差別化されており（擬似書影、2カラムレイアウト）、ユーザー体験に配慮した実装。バックエンドはルーターにDB処理を直書きする構造で保守性はやや低い。住所入力に `textarea` を使うなど細かい配慮もある。テストはロジック関数を抽出して再定義するアプローチで独立性が高く、ユニット・結合の両方が存在する。

### ブランチ横断での共通課題と推奨事項
- **テーブル名の統一**: `products`（kazukisugawara2）vs `books`（keitaKobayashi・satoyuya）が混在しており、統一が必要
- **Server Component の活用**: keitaKobayashi・satoyuya の商品一覧/詳細は Client Component のみで実装しており、SEOと初期表示速度の観点で kazukisugawara2 のアプローチを参考にできる
- **バリデーションの充実**: keitaKobayashi・satoyuya のバリデーションは文字数チェックがなく、kazukisugawara2 の実装を参考に強化が望ましい
- **バックエンドの層分離**: satoyuya のルーターへの直接DB処理記述は、kazukisugawara2 や keitaKobayashi の3層分離構造に改善が望ましい
