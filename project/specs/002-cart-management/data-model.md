# Data Model: カート機能（追加・変更・削除）

**Feature**: 002-cart-management
**Date**: 2026-06-28

## 概要

カートはフロントエンドのメモリ内状態（React Context）で管理する。
DBへの永続化は行わない（セッション単位・ブラウザを閉じると消去）。

## フロントエンドエンティティ（TypeScript型定義）

### CartItem（カートアイテム）

カートに追加された書籍1件分のエントリ。

```typescript
interface CartItem {
  bookId: number;       // 書籍ID（一意識別子）
  title: string;        // 書籍タイトル（表示用）
  author: string;       // 著者名（表示用）
  unitPrice: number;    // 税込単価（円）
  quantity: number;     // 数量（1以上の整数）
}
```

**派生値（算出プロパティ）**:
- `subtotal = unitPrice × quantity`（小計）

### CartState（カートの状態）

CartContext が保持する状態全体。

```typescript
interface CartState {
  items: CartItem[];     // カートアイテムのリスト
  totalAmount: number;   // 合計金額（全アイテムの小計合算、送料除く）
}
```

`totalAmount` は `items` の変化から毎回再計算する（永続化しない）。

## CartContextが提供する操作

| 操作 | 関数シグネチャ | 仕様参照 |
|---|---|---|
| カートに追加 | `addToCart(book: Book, quantity?: number): void` | FR-001, FR-002 |
| 数量変更 | `updateQuantity(bookId: number, quantity: number): void` | FR-005, FR-006, FR-010 |
| 書籍削除 | `removeFromCart(bookId: number): void` | FR-007, FR-008 |
| カートクリア | `clearCart(): void` | 注文確定後に使用（001-purchase-flow より） |

## バリデーションルール

| 操作 | ルール |
|---|---|
| addToCart | 同一 `bookId` が存在する場合は新エントリを作らず quantity を加算する |
| updateQuantity | `quantity` は1以上の整数。1未満への変更は無視する（FR-010） |
| removeFromCart | 対象 `bookId` が存在しない場合は何もしない |

## 参照エンティティ（読み取り専用）

カート追加操作では書籍情報が必要。書籍データは `GET /api/books/:id` から取得する。

```typescript
interface Book {
  id: number;
  title: string;
  author: string;
  price: number;       // 税込価格（円）
  description: string | null;
  image_url: string | null;
}
```

詳細は [001-purchase-flow の contracts/books-api.md](../001-purchase-flow/contracts/books-api.md) を参照。

## DBエンティティ

カート機能ではDBテーブルを新規作成しない（フロントエンド完結のため）。
