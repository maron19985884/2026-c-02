# 内部設計書 - カート管理機能

- **機能ID**: F-03
- **対応外部設計書**: `docs/external-design/F-03-cart.md`
- **作成日**: 2026-05-10
- **バージョン**: 1.0

---

## 1. 概要

### 対象機能・変更範囲の要約

カート画面（`/cart`）に `CartContext` が保持する全アイテムを表示し、数量変更・削除・合計金額の確認ができる機能。API呼び出しは行わず、クライアントサイドの `CartContext` と `localStorage` のみで完結する。注文手続きへの遷移導線（`/order`）を提供する。

### 外部設計書との対応関係

| 外部設計項目 | 実装ファイル |
|---|---|
| カート画面 (`/cart`) | `frontend/src/app/cart/page.tsx` |
| `CartContext` | `frontend/src/contexts/CartContext.tsx` |
| `CartItem` 型 | `frontend/src/types/index.ts` |

---

## 2. アーキテクチャ設計

### コンポーネント構成図

```
CartPage (frontend/src/app/cart/page.tsx)
├── <header>              ← Amazonスタイルヘッダー（ロゴ・検索・カートアイコン）
├── <main>
│   ├── <h1>「ショッピングカート」
│   ├── 空カート表示（items.length === 0）
│   │   ├── 「カートに商品がありません」
│   │   └── <Link href="/">書籍一覧へ戻る</Link>
│   └── カートアイテム表示（items.length > 0）
│       ├── 左カラム: アイテム一覧カード
│       │   ├── ヘッダー行（「価格」）
│       │   ├── CartItem × N
│       │   │   ├── 書影プレースホルダー（📚絵文字）
│       │   │   ├── <Link href="/products/[id]">{title}</Link>
│       │   │   ├── 著者名・在庫あり・Prime対応
│       │   │   ├── <select> 数量（1〜10）← updateQuantity()
│       │   │   ├── 削除ボタン ← removeItem()
│       │   │   ├── 「後で購入する」（未実装）
│       │   │   └── 小計（price × quantity）
│       │   └── 小計合計行
│       └── 右カラム: 注文サマリーカード
│           ├── Prime無料配送バナー
│           ├── 小計と合計金額
│           └── <Link href="/order">レジに進む</Link>
```

### サービス間データフロー

```
localStorage (キー: "cart")
    │ 初回マウント時 JSON.parse()
    ▼
CartContext (items: CartItem[])
    │
    ├─ 画面レンダリング（items から表示）
    │
    ├─ 数量変更: updateQuantity(id, qty)
    │   → setItems() → useEffect → localStorage 再保存
    │
    ├─ 削除: removeItem(id)
    │   → setItems() → useEffect → localStorage 再保存
    │
    └─ total: items.reduce((sum, i) => sum + i.price * i.quantity, 0)
```

**APIへの通信なし。完全クライアントサイド処理。**

### 新規追加・変更するファイル一覧

本機能は既存実装済み。変更なし。

| ファイル | ステータス | 備考 |
|---|---|---|
| `frontend/src/app/cart/page.tsx` | 実装済み | `CartPage` コンポーネント |
| `frontend/src/contexts/CartContext.tsx` | 実装済み | `updateQuantity`, `removeItem`, `total` |

---

## 3. フロントエンド設計

### 3.1 ページ・コンポーネント設計

#### `CartPage` (`frontend/src/app/cart/page.tsx`)

**責務**: `CartContext` から読み込んだアイテムを表示し、数量変更・削除操作を提供する。APIへの通信は行わない。

**ディレクティブ**: `"use client"` （`useCart`（Context）を使用するため必須）

**内部状態**: なし（`CartContext` のみ使用）

**コンテキスト利用**:

```typescript
const { items, updateQuantity, removeItem, total } = useCart();
const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
```

**レンダリング条件分岐**:

```
items.length === 0 → 空カート表示（注文ボタン非表示）
items.length > 0  → 2カラムレイアウト（アイテム一覧 + 注文サマリー）
```

**数量変更の実装** (`<select>` ドロップダウン方式):

```typescript
<select
  value={item.quantity}
  onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
>
  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
    <option key={n} value={n}>{n}</option>
  ))}
</select>
```

- 選択可能範囲: 1〜10（外部設計書の「任意の正の整数を許容」とは異なり上限10で実装済み）
- `updateQuantity(id, quantity)` は `quantity < 1` の場合早期リターンする（CartContext側で実装済み）

**削除ボタンの実装**:

```typescript
<button onClick={() => removeItem(item.id)}>
  削除
</button>
```

**スタイル仕様**:

```typescript
const AMZ = {
  navy: "#131921",
  header: "#232F3E",
  orange: "#FF9900",
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
  yellow: "#FFD814",
};
```

**2カラムレイアウト**:

```typescript
// 外側コンテナ
style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}

// 左カラム（アイテム一覧）
style={{ flex: 1, minWidth: 320, background: AMZ.card, ... }}

// 右カラム（注文サマリー）
style={{ width: 280, flexShrink: 0, background: AMZ.card, ... }}
```

**注意**: 外部設計書では削除ボタンに `#ef4444` を指定しているが、実装では `color: AMZ.link`（`#007185`）を使用している（Amazonスタイルに合わせた変更）。

**書影の表示**: 実装では `<img>` タグの代わりに絵文字（📚）をプレースホルダーとして使用している。

### 3.2 API呼び出し設計

**API呼び出しなし**。本画面はクライアントサイドのみで完結する。

### 3.3 状態管理設計

**CartContext の変更点**: なし。既存の `updateQuantity`, `removeItem`, `total` を使用する。

**`updateQuantity` の動作詳細** (CartContext.tsx より):

```typescript
const updateQuantity = (id: number, quantity: number) => {
  if (quantity < 1) return;  // 1未満は無視（0にはならない）
  setItems((prev) =>
    prev.map((i) => (i.id === id ? { ...i, quantity } : i))
  );
  // setItems 後、useEffect で localStorage に自動再保存
};
```

**`removeItem` の動作詳細**:

```typescript
const removeItem = (id: number) => {
  setItems((prev) => prev.filter((i) => i.id !== id));
  // setItems 後、useEffect で localStorage に自動再保存
};
```

**`total` の計算**:

```typescript
// CartContext.tsx 内でリアルタイム計算（useMemo 未使用、直接計算）
const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
```

**localStorage 永続化の仕組み**:

```typescript
// CartContext.tsx 内
useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(items));
}, [items]);
// items が変化するたびに localStorage を更新（同期的）
```

**localStorage データ構造**:

```typescript
// キー: "cart"
// 値: JSON.stringify の出力（CartItem[] の JSON 文字列）
// 例:
[
  { "id": 1, "title": "プログラミング入門", "author": "山田 太郎", "price": 2800, "quantity": 2 },
  { "id": 3, "title": "データサイエンス実践", "author": "田中 一郎", "price": 3800, "quantity": 1 }
]
```

---

## 4. バックエンド設計

**API呼び出しなし。バックエンド設計は本機能に不要。**

---

## 5. データベース設計

**DBアクセスなし。本機能に不要。**

---

## 6. 型定義設計

追加型定義なし。既存の `CartItem` 型（`frontend/src/types/index.ts`）を使用する。

```typescript
// 既存（変更なし）
export type CartItem = {
  id: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
};
```

**注意**: `CartItem` には `image_url` が含まれていない。カート画面で書影を表示する場合は `image_url` を `CartItem` に追加し、F-02の `addItem` 呼び出し時に `image_url` を渡す必要がある。現在は絵文字プレースホルダーで代替している。

---

## 7. エラーハンドリング設計

### フロントエンドのエラー表示方針

| エラー条件 | 現在の実装 | 推奨改善 |
|---|---|---|
| カートが空 | 「カートに商品がありません」メッセージ表示、注文ボタン非表示 | 対応済み |
| `updateQuantity` で 0 以下 | CartContext で `quantity < 1` の場合早期リターン（削除にはならない） | 外部設計書では「自動削除または最小値1で固定」とあるが実装は最小値1固定 |
| localStorage 読み込み失敗 | CartContext の `useEffect` 内で `try-catch` により空配列でフォールバック | 対応済み（ただし警告表示なし） |
| localStorage 書き込み失敗 | `useEffect` 内の `localStorage.setItem` で例外が発生しても catch されない | `try-catch` 追加を推奨 |

### ネットワークエラー・タイムアウト対応

API呼び出しなし。該当なし。

---

## 8. セキュリティ考慮事項

| 項目 | 対応状況 |
|---|---|
| 入力バリデーション | 数量は `<select>` で1〜10から選択するため、自由入力なし |
| XSS対策 | React の JSX 自動エスケープにより対応済み。`item.title` 等は安全 |
| localStorage の内容改ざん | クライアント側で任意に書き換え可能。ただし注文確定時（F-04）にサーバーでも `total_amount` を再計算するため、価格改ざんの影響は限定的（価格は `items[].price` をクライアントから受け取る点に注意） |

---

## 9. テスト観点

| テストケース | 分類 | 確認内容 |
|---|---|---|
| カートにアイテムがある場合の表示 | 正常系 | アイテムタイトル・単価・数量・小計が正しく表示されること |
| 合計金額の計算 | 正常系 | `Σ(price × quantity)` が正しく計算・表示されること |
| 数量変更（増加） | 正常系 | `<select>` で数量を変更すると小計・合計がリアルタイム更新されること |
| アイテム削除 | 正常系 | 削除ボタン押下でアイテムがリストから消えること |
| 全アイテム削除後 | 正常系 | 空カート表示（「カートに商品がありません」）に切り替わること |
| 「レジに進む」クリック | 正常系 | `/order` に遷移すること |
| 「書籍一覧へ戻る」クリック | 正常系 | `/` に遷移すること |
| ページリロード後のカート永続化 | 正常系 | localStorage からカートが復元されること |
| 空カートで `/cart` を直接開く | 異常系 | 空カート表示が正しく表示されること（注文ボタンなし） |
| 数量を1未満に変更しようとする | 境界値 | 数量が1のまま変化しないこと（`<select>` の選択肢に0以下がないため操作不可） |

---

## 10. 実装上の注意事項・制約

1. **数量上限 10**: `<select>` の選択肢は `[1,2,...,10]` に固定されている。外部設計書は「任意の正の整数を許容」とあるが、現実装は上限10。大量購入が必要な場合は直接入力フィールドへの変更が必要。

2. **書影未表示**: `CartItem` 型に `image_url` がないため、書影を表示できない。絵文字（📚）で代替している。`image_url` が必要な場合は `CartItem` 型への追加と `addItem` の引数変更が必要。

3. **「後で購入する」ボタン**: UIに表示されているが、クリックハンドラが未実装（機能なし）。

4. **削除色の差異**: 外部設計書では `#ef4444`（赤色）を指定しているが、実装では `AMZ.link`（`#007185`、青色）を使用している。Amazonスタイルに合わせた実装上の判断。

5. **`"use client"` ディレクティブ**: `useCart`（Context）を使用するため必須。

6. **スタイル規約**: 全インラインスタイル必須。CSS モジュール・Tailwind 禁止。
