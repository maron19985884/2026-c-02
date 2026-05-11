# 内部設計書 - 注文フォーム機能

- **機能ID**: F-04
- **対応外部設計書**: `docs/external-design/F-04-order-form.md`
- **作成日**: 2026-05-10
- **バージョン**: 1.0

---

## 1. 概要

### 対象機能・変更範囲の要約

注文フォーム画面（`/order`）で配送先情報（氏名・住所・メールアドレス）を入力し、`POST /orders` でバックエンドに送信する機能。2カラムレイアウト（フォーム + 注文サマリー）を提供する。送信成功後は `clearCart()` でカートをクリアし、注文完了画面（`/order/complete`）にリダイレクトする。カートが空の場合は早期リターンで空状態UIを表示する。

### 外部設計書との対応関係

| 外部設計項目 | 実装ファイル |
|---|---|
| 注文フォーム画面 (`/order`) | `frontend/src/app/order/page.tsx` |
| `POST /orders` エンドポイント | `backend/src/index.ts` |
| `orders`, `order_items` テーブル | `mysql/init/01_init.sql` |
| `CartContext.items, total, clearCart` | `frontend/src/contexts/CartContext.tsx` |
| `CartItem` 型 | `frontend/src/types/index.ts` |

---

## 2. アーキテクチャ設計

### コンポーネント構成図

```
OrderPage (frontend/src/app/order/page.tsx)
├── 空カート時の早期リターン UI
│   └── 「カートが空です」 + リンク
└── 通常レンダリング（items.length > 0）
    ├── <header>      ← チェックアウト専用シンプルヘッダー
    ├── プログレスバー ← 「1 お届け先情報」がアクティブ
    └── <main> 2カラムグリッド
        ├── 左カラム: 配送先フォームカード
        │   ├── 氏名 <input> + エラー表示
        │   ├── 住所 <textarea> + エラー表示
        │   ├── メールアドレス <input type="email"> + エラー表示
        │   └── 「注文を確定する」<button type="submit">
        └── 右カラム: 注文サマリーカード（sticky）
            ├── 「注文を確定する」<button>（サマリー側）
            ├── アイテム一覧（title × quantity / 小計）
            ├── 商品小計
            ├── 配送料（無料）
            └── 注文合計
```

### サービス間データフロー

```
[/order 画面]
    │ CartContext.items + フォーム入力値
    │
    ├─ items.length === 0 → 空状態UI表示（リダイレクトではなく同一画面）
    │
    └─ 「注文を確定する」クリック
           │ validate() → エラーあり: setErrors() して停止
           │ エラーなし: setSubmitting(true)
           ▼
   fetch POST http://localhost:4000/orders
   {
     name, address, email,
     items: items.map(i => ({
       book_id: i.id, title: i.title, price: i.price, quantity: i.quantity
     }))
   }
           ▼
   Express.js (backend/src/index.ts)
     │ バリデーション
     │ トランザクション開始
     │ INSERT INTO orders
     │ INSERT INTO order_items × N
     │ COMMIT
     ▼
   { order_number: "ORD-xxxxx" }
           ▼
   clearCart() → localStorage クリア
   router.push('/order/complete?orderNumber=' + order_number)
```

### 新規追加・変更するファイル一覧

本機能は既存実装済み。変更なし。

| ファイル | ステータス | 備考 |
|---|---|---|
| `frontend/src/app/order/page.tsx` | 実装済み | `OrderPage` コンポーネント |
| `backend/src/index.ts` | 実装済み | `POST /orders` ルート |
| `mysql/init/01_init.sql` | 実装済み | `orders`, `order_items` テーブル |

---

## 3. フロントエンド設計

### 3.1 ページ・コンポーネント設計

#### `OrderPage` (`frontend/src/app/order/page.tsx`)

**責務**: 配送先情報の入力・バリデーション・POST送信。注文サマリーの表示。

**ディレクティブ**: `"use client"` （`useState`, `useRouter`, `useCart` を使用するため必須）

**内部状態**

| state 変数 | 型 | 初期値 | 説明 |
|---|---|---|---|
| `name` | `string` | `""` | 氏名フィールドの入力値 |
| `address` | `string` | `""` | 住所フィールドの入力値 |
| `email` | `string` | `""` | メールアドレスフィールドの入力値 |
| `errors` | `FormErrors` | `{}` | バリデーションエラーメッセージ |
| `submitting` | `boolean` | `false` | 送信中フラグ（二重送信防止） |

**型定義**（ファイル内ローカル定義）:

```typescript
type FormErrors = {
  name?: string;
  address?: string;
  email?: string;
};
```

**コンテキスト利用**:

```typescript
const { items, total, clearCart } = useCart();
```

**ルーター利用**:

```typescript
const router = useRouter();
// 送信成功時:
router.push(`/order/complete?orderNumber=${data.order_number}`);
```

**空カート時の処理**:

外部設計書では `/cart` または `/` へのリダイレクトを指定しているが、実装では画面内に「カートが空です」メッセージを表示する方式（リダイレクトなし）:

```typescript
if (items.length === 0) {
  return (
    <div style={{ ... }}>
      <p>カートが空です</p>
      <Link href="/">書籍一覧へ</Link>
    </div>
  );
}
```

**バリデーション関数**:

```typescript
const validate = (): FormErrors => {
  const errs: FormErrors = {};
  // 氏名バリデーション
  if (!name.trim()) errs.name = "氏名を入力してください";
  // 住所バリデーション
  if (!address.trim()) errs.address = "住所を入力してください";
  // メールバリデーション
  if (!email.trim()) errs.email = "メールアドレスを入力してください";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errs.email = "メールアドレスの形式が正しくありません";
  return errs;
};
```

- `name.trim()` で空白のみの入力を弾く
- `address.trim()` で空白のみの入力を弾く
- メール: 未入力チェック → 形式チェックの順（先に未入力エラーを表示）
- メール正規表現: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`（簡易実装）
- 100文字超チェック（`name` の上限）は現在未実装（外部設計書に記載あり）

**送信ハンドラ**:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errs = validate();
  if (Object.keys(errs).length > 0) { setErrors(errs); return; }
  setSubmitting(true);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, address, email,
        items: items.map((i) => ({
          book_id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity
        })),
      }),
    });
    const data = await res.json();
    clearCart();
    router.push(`/order/complete?orderNumber=${data.order_number}`);
  } catch {
    setSubmitting(false);
    // エラー表示なし（現在未実装）
  }
};
```

**注意**: エラーハンドリングは `catch` ブロックで `setSubmitting(false)` のみ。エラーメッセージ表示は未実装（改善余地あり）。

**送信ボタンの状態**:

```typescript
<button type="submit" disabled={submitting}>
  {submitting ? "処理中…" : "注文を確定する"}
</button>
```

- `disabled={submitting}` で二重送信防止
- `submitting` 中は背景色が `#F5C518`（暗めの黄色）に変化

**入力フィールドの共通スタイル**:

```typescript
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: `1px solid ${AMZ.border}`,
  borderRadius: 4,
  fontSize: 14,
  color: AMZ.text,
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
  background: "white",
};
// エラー時の枠線変更:
style={{ ...inputStyle, borderColor: errors.name ? AMZ.red : AMZ.border }}
```

**エラーメッセージ表示**:

```typescript
{errors.name && (
  <p style={{ color: AMZ.red, fontSize: 12, margin: "4px 0 0" }}>
    {errors.name}
  </p>
)}
```

- `AMZ.red = "#CC0000"` を使用（外部設計書の `#ef4444` とは異なる）

**スタイル定数**:

```typescript
const AMZ = {
  navy: "#131921",
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
  red: "#CC0000",
};
```

**2カラムグリッドレイアウト**:

```typescript
style={{
  maxWidth: 1000,
  margin: "0 auto",
  padding: 16,
  display: "grid",
  gridTemplateColumns: "1fr 280px",
  gap: 16,
  alignItems: "start"
}}
```

右カラム（注文サマリー）は `position: "sticky", top: 16` でスクロール追従。

### 3.2 API呼び出し設計

**fetch先エンドポイント**: `POST ${process.env.NEXT_PUBLIC_API_URL}/orders`

**リクエストヘッダー**: `Content-Type: application/json`

**リクエストボディ型**:

```typescript
type OrderRequest = {
  name: string;
  address: string;
  email: string;
  items: Array<{
    book_id: number;   // CartItem.id
    title: string;
    price: number;
    quantity: number;
  }>;
};
```

**レスポンス型** (200 OK):

```typescript
type OrderResponse = {
  order_number: string;  // 例: "ORD-1714900000000"
};
```

**エラーレスポンス**:

| ステータス | ボディ | 条件 |
|---|---|---|
| 400 | `{ "error": "Bad Request" }` | 必須項目欠落、items が空配列 |
| 500 | `{ "error": "Internal Server Error" }` | DB接続エラー、トランザクション失敗 |

**現在の実装上の問題点**:
- レスポンスのステータスコード（`res.ok`）を確認していない
- 400/500 エラー時でも `res.json()` が成功すれば `clearCart()` と `router.push()` が実行される可能性がある
- 改善: `if (!res.ok) throw new Error(await res.text())` でエラーを throw する

### 3.3 状態管理設計

**CartContext の変更点**: なし。`items`, `total`, `clearCart` を利用するのみ。

**送信後のカートクリア**:

```typescript
// POST成功後
clearCart();
// → CartContext 内: setItems([]) → localStorage.setItem("cart", "[]")
```

---

## 4. バックエンド設計

### 4.1 APIエンドポイント設計

| 項目 | 内容 |
|---|---|
| メソッド | POST |
| パス | `/orders` |
| 認証 | 不要 |
| Content-Type | `application/json` |

**リクエストボディ型**:

```typescript
type OrderRequest = {
  name: string;
  address: string;
  email: string;
  items: Array<{
    book_id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
};
```

**成功レスポンス** (200 OK):

```typescript
type OrderResponse = {
  order_number: string;  // 形式: "ORD-" + Date.now()（13桁ミリ秒タイムスタンプ）
};
```

**エラーレスポンス**:

| ステータス | ボディ | 条件 |
|---|---|---|
| 400 | `{ "error": "Bad Request" }` | `!name \|\| !address \|\| !email \|\| !Array.isArray(items) \|\| items.length === 0` |
| 500 | `{ "error": "Internal Server Error" }` | DB接続エラー、INSERT失敗、コミット失敗 |

**バリデーションルール（バックエンド）**:

```typescript
if (!name || !address || !email || !Array.isArray(items) || items.length === 0) {
  res.status(400).json({ error: "Bad Request" });
  return;
}
```

- 各フィールドの falsy 値チェックのみ（`""`, `null`, `undefined` で 400）
- メール形式チェックはバックエンドでは未実装（フロントエンドのみ）
- `items` の各要素の型バリデーションは未実装

### 4.2 ビジネスロジック設計

**処理フロー（擬似コード）**:

```
1. リクエストボディを分解: { name, address, email, items }
2. バリデーション: いずれかが falsy または items が空 → 400 返却
3. pool.getConnection() でコネクション取得
4. conn.beginTransaction() でトランザクション開始
5. totalAmount を計算:
     items.reduce((sum, item) => sum + item.price * item.quantity, 0)
6. orderNumber を生成: `ORD-${Date.now()}`
7. INSERT INTO orders:
     conn.query(
       "INSERT INTO orders (order_number, name, address, email, total_amount) VALUES (?, ?, ?, ?, ?)",
       [orderNumber, name, address, email, totalAmount]
     )
     → orderId = result.insertId
8. for each item in items:
     conn.query(
       "INSERT INTO order_items (order_id, book_id, title, price, quantity) VALUES (?, ?, ?, ?, ?)",
       [orderId, item.book_id, item.title, item.price, item.quantity]
     )
9. conn.commit()
10. res.json({ order_number: orderNumber })
[エラー時]
11. conn.rollback()
    console.error(err)
    res.status(500).json({ error: "Internal Server Error" })
[finally]
12. conn.release()
```

**トランザクション境界**:

- `beginTransaction` ～ `commit`（または `rollback`）が 1 つのトランザクション
- `orders` の INSERT 後に `orderId` を取得し、各 `order_items` を INSERT
- いずれか 1 つの INSERT が失敗した場合、`rollback` により全体がロールバックされる
- `conn.release()` は `finally` ブロックで必ず実行（接続リーク防止）

**`total_amount` の計算**:

- クライアントから送られた `items[].price` を使用してサーバー側で計算（`Σ price × quantity`）
- クライアント側の `total` は参照せず、サーバーで独立して計算する
- **注意**: `items[].price` 自体はクライアントから受け取っており、価格の真正性はDBと照合していない（スコープ外）

**`order_number` の一意性**:

- `ORD-${Date.now()}` はミリ秒精度のタイムスタンプを使用
- 同一ミリ秒に複数リクエストが来た場合、重複が発生する可能性がある
- `order_number` カラムは `UNIQUE` 制約があり、重複時は INSERT エラー（500 として返却）
- 対策: 再試行ロジックは未実装（要件として許容）

### 4.3 データアクセス設計

**`orders` への INSERT**:

```sql
INSERT INTO orders (order_number, name, address, email, total_amount)
VALUES (?, ?, ?, ?, ?);
-- バインドパラメータ: [orderNumber, name, address, email, totalAmount]
-- 返却: ResultSetHeader.insertId → orderId
```

**`order_items` への INSERT**（ループ内）:

```sql
INSERT INTO order_items (order_id, book_id, title, price, quantity)
VALUES (?, ?, ?, ?, ?);
-- バインドパラメータ: [orderId, item.book_id, item.title, item.price, item.quantity]
```

**コネクションプール使用方針**:
- `pool.getConnection()` でコネクションを取得してトランザクション管理
- `finally` ブロックで `conn.release()` を確実に実行
- 複数のクエリを同一トランザクション内で実行するため `getConnection()` が必要（`pool.query()` は別コネクションを使用する可能性があるため不可）

---

## 5. データベース設計

### 5.1 テーブル設計

本機能では既存の `orders` テーブルおよび `order_items` テーブルを使用する。変更なし。

**orders テーブル（既存）**:

```sql
CREATE TABLE IF NOT EXISTS orders (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30)  NOT NULL UNIQUE,
  name         VARCHAR(100) NOT NULL,
  address      TEXT         NOT NULL,
  email        VARCHAR(255) NOT NULL,
  total_amount INT          NOT NULL,     -- 円単位の整数、サーバー側で計算
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**order_items テーブル（既存）**:

```sql
CREATE TABLE IF NOT EXISTS order_items (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT          NOT NULL,
  book_id  INT          NOT NULL,
  title    VARCHAR(200) NOT NULL,
  price    INT          NOT NULL,         -- 注文時点の価格（スナップショット）
  quantity INT          NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**インデックス**:
- `orders.id`: PRIMARY KEY（自動）
- `orders.order_number`: UNIQUE 制約により自動でインデックス生成
- `order_items.id`: PRIMARY KEY（自動）
- `order_items.order_id`: 外部キー制約により自動でインデックス生成
- `order_items.book_id`: インデックスなし（現状は参照用途のみ）

**注意**: `order_items.book_id` は `books.id` への外部キー制約が設定されていない（`orders` テーブルへの参照のみ）。書籍が削除されても `order_items` は影響を受けない（スコープ内の要件）。

### 5.2 データ移行・初期データ

初期データなし（注文データは実際の注文で生成される）。

---

## 6. 型定義設計

追加型定義なし。ローカル型 `FormErrors` はページコンポーネント内で定義済み。

```typescript
// order/page.tsx 内でローカル定義（変更なし）
type FormErrors = {
  name?: string;
  address?: string;
  email?: string;
};
```

`CartItem` 型（`frontend/src/types/index.ts`）を使用してリクエストボディを組み立てる:

```typescript
items: items.map((i: CartItem) => ({
  book_id: i.id,
  title: i.title,
  price: i.price,
  quantity: i.quantity
}))
```

---

## 7. エラーハンドリング設計

### フロントエンドのエラー表示方針

| エラー条件 | 現在の実装 | 推奨改善 |
|---|---|---|
| 氏名未入力 | フィールド下に「氏名を入力してください」 | 対応済み |
| 住所未入力 | フィールド下に「住所を入力してください」 | 対応済み |
| メール未入力 | フィールド下に「メールアドレスを入力してください」 | 対応済み |
| メール形式不正 | フィールド下に「メールアドレスの形式が正しくありません」 | 対応済み |
| API通信失敗 | `setSubmitting(false)` のみ（エラー表示なし） | エラーstate追加し「注文の送信に失敗しました」を表示 |
| サーバー400エラー | `clearCart()` と遷移が実行される可能性あり | `res.ok` チェックを追加 |
| サーバー500エラー | 同上 | 同上 |
| 二重送信 | `disabled={submitting}` で防止 | 対応済み |
| カートが空 | インライン空状態UI表示（リダイレクトなし） | 外部設計書では `/cart` へのリダイレクトを指定 |

### バックエンドのHTTPステータスコード方針

| 条件 | ステータス |
|---|---|
| 正常注文作成 | 200 OK |
| 必須項目欠落・items空 | 400 Bad Request |
| DB接続エラー・トランザクション失敗 | 500 Internal Server Error |

### ネットワークエラー・タイムアウト対応

- `fetch` のタイムアウト設定なし
- ネットワークエラーは `catch` で補足し `setSubmitting(false)` に戻る（エラー表示なし）

---

## 8. セキュリティ考慮事項

| 項目 | 対応状況 |
|---|---|
| SQLインジェクション対策 | パラメータバインディング（`?` プレースホルダー）で全クエリ対応済み |
| XSS対策 | React の JSX 自動エスケープにより対応済み。フォーム入力値は `dangerouslySetInnerHTML` を使用していない |
| CSRF対策 | 同一オリジン前提。本番では適切な対策が必要（スコープ外） |
| 個人情報（名前・住所・メール）の送信 | 本番では HTTPS 必須 |
| 価格の改ざん | `items[].price` はクライアントから受け取るため、フロントエンドで価格を改ざん可能。本番ではサーバー側でDB照合が推奨（スコープ外） |
| メール形式バリデーション | フロントエンドのみ。バックエンドでは未実装 |

---

## 9. テスト観点

| テストケース | 分類 | 確認内容 |
|---|---|---|
| 正常な入力で注文確定 | 正常系 | `/order/complete?orderNumber=ORD-xxxx` に遷移すること |
| 注文確定後カートがクリア | 正常系 | `clearCart()` が呼ばれ localStorage が空になること |
| 氏名未入力で送信 | 異常系 | 「氏名を入力してください」エラーが表示されること |
| 住所未入力で送信 | 異常系 | 「住所を入力してください」エラーが表示されること |
| メール未入力で送信 | 異常系 | 「メールアドレスを入力してください」エラーが表示されること |
| メール形式不正で送信 | 異常系 | 「メールアドレスの形式が正しくありません」エラーが表示されること |
| 全フィールドが空白のみで送信 | 境界値 | バリデーションエラーが表示されること（trim チェック） |
| 送信中のボタン状態 | 正常系 | ボタンが `disabled` になり「処理中…」と表示されること |
| 空カートで `/order` アクセス | 異常系 | 「カートが空です」UI が表示されること |
| バックエンドが停止している場合 | 異常系 | ボタンが再度有効化されること（エラーメッセージ表示は現状なし） |
| 注文サマリーの合計金額 | 正常系 | `total`（CartContext）が正しく表示されること |

---

## 10. 実装上の注意事項・制約

1. **レスポンスのステータスコード未確認**: 現在の実装では `res.ok` を確認せずに `res.json()` を呼んでいる。400/500 エラー時もレスポンスボディが返るため JSON パースは成功するが、その後の `clearCart()` と `router.push()` が不適切に実行される可能性がある。

2. **`name` の 100文字チェック未実装**: 外部設計書では 100 文字超のバリデーションを指定しているが、現在の `validate()` 関数では未実装。追加が必要な場合:
   ```typescript
   if (name.trim().length > 100) errs.name = "氏名は100文字以内で入力してください";
   ```

3. **空カート時の動作**: 外部設計書では `/cart` へのリダイレクトを指定しているが、実装では同一画面での空状態UI表示となっている（`useRouter` によるリダイレクトではない）。

4. **サマリー側の「注文を確定する」ボタン**: 右カラム（注文サマリーカード）にも「注文を確定する」ボタンが存在し、`handleSubmit` を `onClick` で呼び出している（型キャストあり）。`React.FormEvent` を期待する関数を `MouseEventHandler` として使用するため、型キャストによる回避が行われている。

5. **`"use client"` ディレクティブ**: `useState`, `useRouter`, `useCart` を使用するため必須。

6. **スタイル規約**: 全インラインスタイル必須。`inputStyle` 定数を定義してフィールド間でスタイルを共通化している。

7. **エラー色の差異**: 外部設計書では `#ef4444` を指定しているが、実装では `AMZ.red = "#CC0000"` を使用している。
