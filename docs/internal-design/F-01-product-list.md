# 内部設計書 - 商品一覧表示機能

- **機能ID**: F-01
- **対応外部設計書**: `docs/external-design/F-01-product-list.md`
- **作成日**: 2026-05-10
- **バージョン**: 1.0

---

## 1. 概要

### 対象機能・変更範囲の要約

トップページ（`/`）に全書籍をグリッド形式で表示する機能。マウント時に `GET /products` を呼び出して書籍一覧を取得し、Amazonスタイルの商品カードグリッドとして描画する。カードから商品詳細ページへの遷移、ヘッダーからカートページへの遷移を提供する。

### 外部設計書との対応関係

| 外部設計項目 | 実装ファイル |
|---|---|
| 商品一覧画面 (`/`) | `frontend/src/app/page.tsx` |
| `GET /products` エンドポイント | `backend/src/index.ts` |
| `books` テーブル | `mysql/init/01_init.sql` |
| `Book` 型 | `frontend/src/types/index.ts` |

---

## 2. アーキテクチャ設計

### コンポーネント構成図

```
ProductListPage (frontend/src/app/page.tsx)
├── <header>          ← Amazonスタイルヘッダー（ロゴ・検索・カートリンク）
│   └── cartCount     ← useCart().items から計算
├── <main>
│   ├── <h2>          ← 「技術書一覧」
│   ├── Loading state ← loading === true 時
│   └── Book Grid
│       └── BookCard × N
│           ├── <Link href={/products/[id]}>
│           │   ├── <img src={image_url} />
│           │   ├── title (AMZ.link カラー)
│           │   ├── author (AMZ.textSub カラー)
│           │   ├── <Stars rating={stars} /> (ダミーレーティング)
│           │   └── price (AMZ.price カラー)
│           └── カートに追加 <button> ← addItem() 呼び出し
└── <Stars />         ← ローカルヘルパーコンポーネント
```

### サービス間データフロー

```
ブラウザ (localhost:3000)
    │ useEffect マウント時
    │ GET http://localhost:4000/products
    ▼
Express.js (backend/src/index.ts)
    │ pool.query("SELECT * FROM books ORDER BY id")
    ▼
MySQL (books テーブル)
    │ RowDataPacket[]
    ▼
Express.js → JSON レスポンス Book[]
    ▼
Next.js page.tsx
    │ setBooks(data)
    ▼
グリッドレンダリング
```

### 新規追加・変更するファイル一覧

本機能は既存実装済み。変更なし。

| ファイル | ステータス | 備考 |
|---|---|---|
| `frontend/src/app/page.tsx` | 実装済み | `ProductListPage` コンポーネント |
| `backend/src/index.ts` | 実装済み | `GET /products` ルート |
| `mysql/init/01_init.sql` | 実装済み | `books` テーブル・初期データ |
| `frontend/src/types/index.ts` | 実装済み | `Book` 型 |

---

## 3. フロントエンド設計

### 3.1 ページ・コンポーネント設計

#### `ProductListPage` (`frontend/src/app/page.tsx`)

**責務**: 書籍一覧の取得・表示。カートへの即時追加ボタンを提供する。

**ディレクティブ**: `"use client"` （`useEffect`, `useState`, `useCart` を使用するため必須）

**内部状態**

| state 変数 | 型 | 初期値 | 説明 |
|---|---|---|---|
| `books` | `Book[]` | `[]` | APIから取得した書籍一覧 |
| `loading` | `boolean` | `true` | ローディング中フラグ |

**コンテキスト利用**

```typescript
const { items, addItem } = useCart();
const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
```

**レンダリングロジック**

```
loading === true  → <p>読み込み中…</p>
loading === false → グリッドレンダリング
  books.length === 0 → 空メッセージ（現在未実装。実装時は「販売中の書籍はありません」を表示）
  books.length > 0   → BookCard × N
```

**ローカルヘルパー**

```typescript
// ダミーレーティング生成（DBに評価データなし）
const DUMMY_RATINGS: Record<number, { stars: number; count: number }> = {};
function getRating(id: number): { stars: number; count: number }

// 星アイコン表示コンポーネント
function Stars({ rating }: { rating: number }): JSX.Element
```

**カートに追加ボタンのハンドラ**

```typescript
onClick={() => addItem({
  id: book.id,
  title: book.title,
  author: book.author,
  price: book.price
})}
```

`addItem` の引数型は `Omit<CartItem, "quantity">` であることに注意（`quantity` は CartContext 内で `1` として設定）。

**スタイル仕様**

実装では Amazonスタイルを採用しており、外部設計書のカラーパレットとは異なる色定数 `AMZ` を使用している。

```typescript
const AMZ = {
  navy: "#131921",      // ヘッダー背景
  header: "#232F3E",    // ナビバー背景
  orange: "#FF9900",    // カートボタン・星・バッジ
  price: "#B12704",     // 価格テキスト
  link: "#007185",      // タイトルリンク・著者リンク
  text: "#0F1111",      // 本文テキスト
  textSub: "#565959",   // サブテキスト（著者名・レビュー数）
  green: "#007600",     // Prime表示
  prime: "#00A8E1",     // Prime対応テキスト
  border: "#D5D9D9",    // ボーダー
  borderLight: "#E7E7E7", // 薄いボーダー
  bg: "#EAEDED",        // ページ背景
  card: "#FFFFFF",      // カード背景
};
```

グリッドレイアウト:

```typescript
style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: 16
}}
```

カードホバーエフェクト（インラインイベントハンドラで制御）:

```typescript
onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.2)")}
onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
```

### 3.2 API呼び出し設計

**fetch先エンドポイント**: `GET ${process.env.NEXT_PUBLIC_API_URL}/products`

**リクエスト型**: なし（クエリパラメータなし）

**レスポンス型**:

```typescript
type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  image_url: string;
  // created_at は API から返されるが型定義には含めていない
};
// → Book[] として受け取る
```

**実装コード**:

```typescript
useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
    .then((r) => r.json())
    .then((data) => { setBooks(data); setLoading(false); })
    .catch(() => setLoading(false));
}, []);
```

**エラーハンドリング方針**:
- `.catch()` で `loading` を `false` にセットするのみ（エラー状態の `state` が未実装）
- 改善余地: `error` state を追加し、ユーザーへのエラーメッセージ表示を行うことが推奨される
- 画像読み込みエラーは `<img onError>` で代替画像を表示することが推奨されるが、現在未実装

### 3.3 状態管理設計

**CartContext の変更点**: なし（`addItem` を利用するのみ）

**localStorage 永続化データ構造**:

```typescript
// キー: "cart"
// 値: JSON.stringify(CartItem[])
// CartItem の image_url は含まれない（CartItem 型定義に image_url なし）
type CartItem = {
  id: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
};
```

---

## 4. バックエンド設計

### 4.1 APIエンドポイント設計

| 項目 | 内容 |
|---|---|
| メソッド | GET |
| パス | `/products` |
| 認証 | 不要 |
| リクエストボディ | なし |

**レスポンス型** (200 OK):

```typescript
type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  image_url: string;
  created_at: string; // ISO 8601 形式
};
// → Book[] として返却
```

**エラーレスポンス**:

| ステータス | ボディ | 条件 |
|---|---|---|
| 500 | `{ "error": "Internal Server Error" }` | DB接続エラー・クエリ失敗 |

**バリデーションルール**: なし（全件取得のため入力値なし）

### 4.2 ビジネスロジック設計

**処理フロー**:

```
1. pool.query() で SELECT * FROM books ORDER BY id を実行
2. RowDataPacket[] をそのまま JSON レスポンスとして返却
3. エラー発生時は console.error() でログ出力し 500 を返却
```

**トランザクション境界**: 読み取り専用のため不要

**外部依存**: MySQL コネクションプール（`pool`）

### 4.3 データアクセス設計

**SQLクエリ**:

```sql
SELECT * FROM books ORDER BY id;
```

`ORDER BY id` により登録順（ID昇順）で返却される。

**コネクションプール使用方針**:
- `pool.query()` を直接使用（単発クエリのため `getConnection()` 不要）
- プール設定: `connectionLimit: 10`、`waitForConnections: true`

---

## 5. データベース設計

### 5.1 テーブル設計

本機能では既存の `books` テーブルを読み取り専用で使用する。変更なし。

**books テーブル（既存）**:

```sql
CREATE TABLE IF NOT EXISTS books (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200)  NOT NULL,
  author      VARCHAR(100)  NOT NULL,
  price       INT           NOT NULL,        -- 円単位の整数
  description TEXT,
  image_url   VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**インデックス**: PRIMARY KEY (id) のみ。全件取得のため追加インデックス不要。

### 5.2 データ移行・初期データ

初期データは `mysql/init/01_init.sql` に定義済み（技術書6冊）。再実行する場合は `docker compose down -v` でボリュームを削除してから `docker compose up` を実行する。

---

## 6. 型定義設計

追加型定義なし。既存の `Book` 型（`frontend/src/types/index.ts`）を使用する。

```typescript
// 既存（変更なし）
export type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  image_url: string;
};
```

**注意**: バックエンドレスポンスには `created_at` フィールドが含まれるが、フロントエンドの `Book` 型には定義されていない。一覧表示では未使用のため問題ないが、型の厳密性を求める場合は `created_at?: string` を追加することを検討する。

---

## 7. エラーハンドリング設計

### フロントエンドのエラー表示方針

| エラー条件 | 現在の実装 | 推奨改善 |
|---|---|---|
| API通信失敗 | `loading: false` になり何も表示されない | `error` state を追加し「書籍一覧の取得に失敗しました」を表示 |
| データ0件 | 空グリッドが表示される | `books.length === 0` 時に「販売中の書籍はありません」を表示 |
| 画像読み込み失敗 | 壊れた画像アイコンが表示される | `<img onError>` でプレースホルダーに切り替え |

### バックエンドのHTTPステータスコード方針

| 条件 | ステータス |
|---|---|
| 正常取得 | 200 OK |
| DBエラー | 500 Internal Server Error |

### ネットワークエラー・タイムアウト対応

現状: `fetch` のタイムアウト設定なし。`catch` で `loading: false` にセットするのみ。
推奨: `AbortController` を使用したタイムアウト（例: 10秒）を設定する。

---

## 8. セキュリティ考慮事項

| 項目 | 対応状況 |
|---|---|
| 入力バリデーション | 入力なし（閲覧専用ページ）。該当なし |
| SQLインジェクション対策 | パラメータなし（全件 SELECT）。該当なし |
| XSS対策 | React の JSX 自動エスケープにより対応済み。`book.title` 等は安全にレンダリングされる |
| 画像URLの信頼性 | DB登録時に管理者が設定する想定。エンドユーザーによる任意設定不可 |

---

## 9. テスト観点

| テストケース | 分類 | 確認内容 |
|---|---|---|
| 書籍一覧が正常表示される | 正常系 | 6冊のカードがグリッドに表示されること |
| ローディング中の表示 | 正常系 | API応答前に「読み込み中…」が表示されること |
| 「カートに追加」ボタン押下 | 正常系 | カートアイコンのバッジ数が増加すること |
| カードクリックで詳細遷移 | 正常系 | `/products/[id]` に遷移すること |
| カートアイコンクリックで遷移 | 正常系 | `/cart` に遷移すること |
| APIエラー時の表示 | 異常系 | （改善余地）エラーメッセージが表示されること |
| バックエンドが停止している場合 | 異常系 | ローディング後に適切なフォールバックが表示されること |

---

## 10. 実装上の注意事項・制約

1. **Amazonスタイルカラーパレット**: 外部設計書はネイビー系（`#1e3a8a`）を指定しているが、実装では `AMZ` 定数（`#131921` 等）を使用している。両者は別物であり、実装は既存の `AMZ` パレットに準拠すること。

2. **`"use client"` ディレクティブ**: `useEffect`、`useState`、`useCart`（Context）を使用するため必須。Server Component にはできない。

3. **ダミーレーティング**: `DUMMY_RATINGS` はモジュールスコープの変数として定義されており、ページリロード間では値がリセットされるが、同一レンダリングセッション内では固定される。書籍IDに対して決定論的な計算式で生成されるため、同一IDは常に同一の評価を返す。

4. **`image_url` の `alt` 属性**: `alt={book.title}` を設定済み。アクセシビリティ要件を満たしている。

5. **CSS モジュール・Tailwind 禁止**: すべてインラインスタイル（`style={{...}}`）を使用すること。

6. **Next.js `<img>` タグ**: `@next/next/no-img-element` ESLintルールの警告があるが、`<Image>` コンポーネントへの移行は外部 URL 設定が必要なため、現状は `eslint-disable` コメントで抑制している。
