# 内部設計書 - 商品詳細表示・カート追加機能

- **機能ID**: F-02
- **対応外部設計書**: `docs/external-design/F-02-product-detail.md`
- **作成日**: 2026-05-10
- **バージョン**: 1.0

---

## 1. 概要

### 対象機能・変更範囲の要約

書籍詳細ページ（`/products/[id]`）に個別書籍の全情報（書影・タイトル・著者・価格・説明文）を表示し、「カートに追加」ボタンで `CartContext.addItem()` を呼び出す機能。URLパラメータ `id` から書籍を特定し、`GET /products/:id` でデータを取得する。

### 外部設計書との対応関係

| 外部設計項目 | 実装ファイル |
|---|---|
| 商品詳細画面 (`/products/[id]`) | `frontend/src/app/products/[id]/page.tsx` |
| `GET /products/:id` エンドポイント | `backend/src/index.ts` |
| `CartContext.addItem()` | `frontend/src/contexts/CartContext.tsx` |
| `Book` / `CartItem` 型 | `frontend/src/types/index.ts` |

---

## 2. アーキテクチャ設計

### コンポーネント構成図

```
ProductDetailPage (frontend/src/app/products/[id]/page.tsx)
├── <header>              ← Amazonスタイルヘッダー（ロゴ・検索・カートリンク）
│   └── サブバー          ← 「← 書籍一覧に戻る」リンク
├── <main>
│   ├── <nav> Breadcrumb  ← 本 › コンピュータ・テクノロジー › {book.title}
│   ├── Loading state     ← loading === true 時
│   ├── Error state       ← book === null 時
│   └── 商品詳細カード
│       ├── 左カラム: <img src={image_url} />
│       ├── 中央カラム: タイトル・著者・星評価・価格・説明文
│       ├── 右カラム（Buy Box）
│       │   ├── 価格
│       │   ├── Prime表示
│       │   ├── 在庫あり
│       │   ├── 「カートに追加」<button> ← handleAddToCart()
│       │   └── 「カートを見る」<Link href="/cart">
│       └── レビューセクション（ダミー固定データ）
```

### サービス間データフロー

```
ブラウザ (/products/[id])
    │ useParams() で id 取得
    │ useEffect マウント時
    │ GET http://localhost:4000/products/{id}
    ▼
Express.js (backend/src/index.ts)
    │ pool.query("SELECT * FROM books WHERE id = ?", [id])
    ▼
MySQL (books テーブル)
    ▼
Express.js → JSON レスポンス Book | 404
    ▼
Next.js page.tsx
    │ setBook(data) / エラー処理
    ▼
詳細カードレンダリング

[ユーザー「カートに追加」クリック]
    ↓
handleAddToCart()
    ↓
addItem({ id, title, author, price })
    ↓
CartContext 内 setItems() → localStorage 永続化
    ↓
added: true → 2500ms 後 false（ボタンラベル一時変更）
```

### 新規追加・変更するファイル一覧

本機能は既存実装済み。変更なし。

| ファイル | ステータス | 備考 |
|---|---|---|
| `frontend/src/app/products/[id]/page.tsx` | 実装済み | `ProductDetailPage` コンポーネント |
| `backend/src/index.ts` | 実装済み | `GET /products/:id` ルート |
| `frontend/src/contexts/CartContext.tsx` | 実装済み | `addItem` メソッド |

---

## 3. フロントエンド設計

### 3.1 ページ・コンポーネント設計

#### `ProductDetailPage` (`frontend/src/app/products/[id]/page.tsx`)

**責務**: URLパラメータから書籍IDを取得してAPIで詳細を取得・表示する。カート追加フィードバック（ボタンラベル一時変更）を提供する。

**ディレクティブ**: `"use client"` （`useParams`, `useEffect`, `useState`, `useCart` を使用するため必須）

**内部状態**

| state 変数 | 型 | 初期値 | 説明 |
|---|---|---|---|
| `book` | `Book \| null` | `null` | 取得した書籍データ |
| `loading` | `boolean` | `true` | ローディング中フラグ |
| `added` | `boolean` | `false` | カート追加フィードバック表示フラグ |

**URLパラメータ取得**:

```typescript
const { id } = useParams();
// id は string | string[] 型。useEffect の依存配列に含める
```

**カートアイテム数計算**:

```typescript
const { addItem, items } = useCart();
const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
```

**カート追加ハンドラ**:

```typescript
const handleAddToCart = () => {
  if (!book) return;
  addItem({ id: book.id, title: book.title, author: book.author, price: book.price });
  setAdded(true);
  setTimeout(() => setAdded(false), 2500);
};
```

- `addItem` の引数型: `Omit<CartItem, "quantity">` = `{ id: number; title: string; author: string; price: number }`
- 追加後 2500ms でボタンラベルを元に戻す（`setTimeout` 利用）

**レンダリング条件分岐**:

```
loading === true  → <p>読み込み中…</p>
loading === false, book === null → <p>書籍が見つかりません</p>
loading === false, book !== null → 商品詳細カード（3カラム構成）
```

**Buy Box のボタン状態**:

```typescript
// カートに追加ボタン
background: added ? "#C3E6CB" : AMZ.orange
border: `1px solid ${added ? "#28A745" : "#C59000"}`
color: added ? "#155724" : AMZ.text
// ラベル
{added ? "✓ カートに追加しました" : "カートに追加"}
```

**スタイル仕様**

```typescript
const AMZ = {
  navy: "#131921",
  header: "#232F3E",
  orange: "#FF9900",
  yellow: "#FFD814",
  price: "#B12704",
  link: "#007185",
  text: "#0F1111",
  textSub: "#565959",
  green: "#007600",
  prime: "#00A8E1",
  border: "#D5D9D9",
  borderLight: "#E7E7E7",
  bg: "#EAEDED",
  card: "#FFFFFF",
};
```

**3カラムレイアウト**:

```typescript
// 外側コンテナ
style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}

// 左カラム（書影）
style={{ flexShrink: 0, width: 240 }}

// 中央カラム（書籍情報）
style={{ flex: 1, minWidth: 280 }}

// 右カラム（Buy Box）
style={{ width: 240, flexShrink: 0, border: "1px solid #D5D9D9", borderRadius: 8, padding: 16 }}
```

**レビューセクション**: ダミーデータ（静的配列）を使用。DBに評価データはない。

### 3.2 API呼び出し設計

**fetch先エンドポイント**: `GET ${process.env.NEXT_PUBLIC_API_URL}/products/${id}`

**リクエスト型**: URLパス変数 `id`（string型、数値文字列）

**レスポンス型** (200 OK):

```typescript
type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  image_url: string;
};
```

**レスポンス型** (404 Not Found):

```typescript
{ error: "Not Found" }
```

**実装コード**:

```typescript
useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
    .then((r) => r.json())
    .then((data) => { setBook(data); setLoading(false); })
    .catch(() => setLoading(false));
}, [id]);
```

**エラーハンドリング方針**:
- 404 の場合: `r.json()` は `{ error: "Not Found" }` を返すが、現在の実装では `setBook({ error: "Not Found" })` として `book` にセットされてしまう可能性がある（レスポンスのステータスコードチェックが未実装）
- 改善: `if (!r.ok) throw new Error(...)` でステータスコードを確認し、404 と 500 を区別したエラーハンドリングを実装することが推奨される

### 3.3 状態管理設計

**CartContext の変更点**: なし（`addItem` を利用するのみ）

**`addItem` の動作詳細** (CartContext.tsx より):

```typescript
const addItem = (book: Omit<CartItem, "quantity">) => {
  setItems((prev) => {
    const existing = prev.find((i) => i.id === book.id);
    if (existing) {
      // 既存アイテム: quantity + 1
      return prev.map((i) =>
        i.id === book.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    }
    // 新規アイテム: quantity = 1 で追加
    return [...prev, { ...book, quantity: 1 }];
  });
};
```

---

## 4. バックエンド設計

### 4.1 APIエンドポイント設計

| 項目 | 内容 |
|---|---|
| メソッド | GET |
| パス | `/products/:id` |
| 認証 | 不要 |
| リクエストボディ | なし |
| URLパラメータ | `id`: 書籍ID（数値文字列） |

**成功レスポンス** (200 OK):

```typescript
type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  image_url: string;
  created_at: string;
};
```

**エラーレスポンス**:

| ステータス | ボディ | 条件 |
|---|---|---|
| 404 | `{ "error": "Not Found" }` | `books` テーブルに該当IDの行が存在しない |
| 500 | `{ "error": "Internal Server Error" }` | DB接続エラー・クエリ失敗 |

**バリデーションルール**: バックエンドでのパラメータバリデーションは未実装。`id` が数値以外の文字列の場合、MySQL の WHERE 句でキャスト変換が行われ、0件となって 404 が返却される。

### 4.2 ビジネスロジック設計

**処理フロー**:

```
1. req.params.id を取得
2. pool.query("SELECT * FROM books WHERE id = ?", [req.params.id]) を実行
   ※ パラメータバインディングにより SQLインジェクション対策済み
3. rows.length === 0 → 404 返却
4. rows.length > 0 → rows[0] を JSON レスポンスとして返却
5. エラー発生時 → console.error() でログ出力し 500 返却
```

**トランザクション境界**: 読み取り専用のため不要

### 4.3 データアクセス設計

**SQLクエリ**:

```sql
SELECT * FROM books WHERE id = ?;
-- バインドパラメータ: [req.params.id]
```

**コネクションプール使用方針**:
- `pool.query()` を直接使用（単発クエリのため `getConnection()` 不要）

---

## 5. データベース設計

本機能では既存の `books` テーブルを読み取り専用で使用する。変更なし。

テーブル定義は F-01 内部設計書の「5.1 テーブル設計」を参照。

---

## 6. 型定義設計

追加型定義なし。既存の `Book` 型と `CartItem` 型（`frontend/src/types/index.ts`）を使用する。

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

export type CartItem = {
  id: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
};
```

**注意**: `addItem` の引数型は `Omit<CartItem, "quantity">` であり、`CartContext.tsx` の型定義と `types/index.ts` の `CartItem` 型の両方に依存している。`CartItem` の構造を変更する場合は必ず `CartContext.tsx` の `addItem` シグネチャも確認すること。

---

## 7. エラーハンドリング設計

### フロントエンドのエラー表示方針

| エラー条件 | 現在の実装 | 推奨改善 |
|---|---|---|
| 書籍が見つからない（404） | `book === null` → 「書籍が見つかりません」表示 | HTTP ステータスコードを確認してから分岐する |
| API通信失敗 | `loading: false`, `book: null` → 「書籍が見つかりません」と同じ表示になる | 通信エラーと404を区別した別メッセージを表示する |
| `id` が数値でない | バックエンドで 404 として処理されるため、フロント側での明示的なエラーはない | `isNaN(Number(id))` チェックを追加してフロントで早期エラー表示 |
| カート追加失敗（localStorage超過） | エラー表示なし（CartContext 内の catch が空） | エラー通知の追加を検討 |

### バックエンドのHTTPステータスコード方針

| 条件 | ステータス |
|---|---|
| 正常取得 | 200 OK |
| IDに対応する書籍なし | 404 Not Found |
| DBエラー | 500 Internal Server Error |

---

## 8. セキュリティ考慮事項

| 項目 | 対応状況 |
|---|---|
| SQLインジェクション対策 | `pool.query("SELECT * FROM books WHERE id = ?", [req.params.id])` のパラメータバインディングで対応済み |
| XSS対策 | React の JSX 自動エスケープにより対応済み。`book.description` も安全にレンダリングされる |
| localStorage セキュリティ | カートデータは非機密情報（書籍ID・タイトル・価格）のみ。個人情報は含まれない |

---

## 9. テスト観点

| テストケース | 分類 | 確認内容 |
|---|---|---|
| 正常な書籍IDでアクセス | 正常系 | 書籍詳細が表示されること |
| 「カートに追加」ボタン押下 | 正常系 | ボタンラベルが「✓ カートに追加しました」に変わること |
| 2500ms後にボタンが元に戻る | 正常系 | ラベルが「カートに追加」に戻ること |
| 同じ書籍を複数回追加 | 正常系 | CartContext の quantity が加算されること |
| 存在しない書籍ID | 異常系 | 「書籍が見つかりません」が表示されること |
| 数値でないIDでアクセス | 異常系 | 404応答からフォールバック表示されること |
| 「← 書籍一覧に戻る」クリック | 正常系 | `/` に遷移すること |
| 「カートを見る」クリック | 正常系 | `/cart` に遷移すること |
| ローディング中の表示 | 正常系 | 「読み込み中…」が表示されること |

---

## 10. 実装上の注意事項・制約

1. **`useParams()` の戻り値型**: `id` は `string | string[] | undefined` 型。テンプレートリテラル内での使用（`` `/products/${id}` ``）では文字列結合が行われる。型安全にするには `Array.isArray(id) ? id[0] : id` のように処理することが推奨される。

2. **`added` state のクリーンアップ**: `setTimeout` がコンポーネントのアンマウント後に実行される場合、「Can't perform a React state update on an unmounted component」警告が発生する可能性がある。`useEffect` の cleanup 関数で `clearTimeout` することが推奨される（現在未実装）。

3. **`image_url` の `alt` 属性**: `alt={book.title}` を設定済み。

4. **ダミーレビューデータ**: レビュー情報は静的配列でハードコードされており、書籍IDによらず同じ内容が表示される。本番では DB 管理が必要。

5. **スタイル規約**: 全インラインスタイル必須。CSS モジュール・Tailwind 禁止。
