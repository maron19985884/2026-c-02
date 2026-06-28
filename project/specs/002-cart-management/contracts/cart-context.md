# UI Contract: CartContext

**Feature**: 002-cart-management
**Date**: 2026-06-28

## 概要

カート機能はバックエンドAPIを持たない。代わりに、フロントエンド全体で
共有される `CartContext` が外部インターフェースとなる。

## CartContext インターフェース

```typescript
interface CartContextValue {
  // 状態
  items: CartItem[];
  totalAmount: number;    // items から毎回算出

  // 操作
  addToCart: (book: Book, quantity?: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  removeFromCart: (bookId: number) => void;
  clearCart: () => void;
}
```

## 利用コンポーネントとの契約

### 書籍詳細画面（カート追加）

```
BookDetailPage
  → addToCart(book)
  → 追加後、router.push('/') で商品一覧へ遷移
```

### カート画面

```
CartPage
  → items: CartItem[]        // 一覧表示
  → totalAmount: number      // 合計金額表示
  → updateQuantity(bookId, newQty)  // 数量変更
  → removeFromCart(bookId)           // 削除
```

### 注文フォーム画面

```
OrderPage
  → items: CartItem[]        // 注文内容確認表示
  → totalAmount: number      // 合計金額表示
  → clearCart()              // 注文確定後にカートをクリア
  → items.length === 0 のとき /cart へリダイレクト
```

## 状態変化の規則

| 操作 | 前提条件 | 後状態 |
|---|---|---|
| `addToCart(book)` | 同一 bookId が存在しない | items に新エントリが追加される |
| `addToCart(book)` | 同一 bookId が存在する | 既存エントリの quantity が +1 される |
| `updateQuantity(id, q)` | q >= 1 | 対象エントリの quantity が q になる |
| `updateQuantity(id, q)` | q < 1 | 状態変化なし（無視） |
| `removeFromCart(id)` | 常に | 対象 bookId のエントリが除去される |
| `clearCart()` | 常に | items が空配列になる |
