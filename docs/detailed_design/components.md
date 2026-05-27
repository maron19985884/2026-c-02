# 詳細設計書：React コンポーネント仕様

**対象ディレクトリ:** `frontend/src/components/`, `frontend/src/context/`, `frontend/src/hooks/`

---

## 1. Header

**ファイル:** `frontend/src/components/Header.tsx`
**種別:** クライアントコンポーネント（`'use client'`）
**責務:** 全ページ共通のナビゲーションバー。サイト名リンクとカートアイコン（総冊数バッジ）を表示する。

### Props

なし（`CartContext` から直接 `totalCount` を取得する）

### State

なし（`useCart()` フックから読み取るのみ）

### 内部ロジック

```typescript
const { totalCount } = useCart();
```

### 表示仕様

| 要素 | 表示内容 | 備考 |
|---|---|---|
| サイト名リンク | `<Link href="/">` でテキスト表示 | クリックで `/` へ遷移 |
| カートアイコン | カートマーク + `totalCount` の数字バッジ | `<Link href="/cart">` でラップ |

### 使用箇所

`frontend/src/app/layout.tsx` の `<body>` 直下に1回だけ配置。全ページに表示される。

### 実装コード骨格

```typescript
'use client';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function Header() {
  const { totalCount } = useCart();

  return (
    <header>
      <Link href="/">書店サイト名</Link>
      <Link href="/cart" aria-label={`カート（${totalCount}冊）`}>
        <span>カート</span>
        <span>{totalCount}</span>
      </Link>
    </header>
  );
}
```

---

## 2. BookCard

**ファイル:** `frontend/src/components/BookCard.tsx`
**種別:** サーバーコンポーネント（props のみ。`'use client'` 不要）
**責務:** 商品一覧画面の書籍カード1枚を表示する。全体がリンクになっており、クリックで商品詳細へ遷移する。

### Props

```typescript
interface BookCardProps {
  book: Book;
}
```

| prop名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `book` | `Book` | ○ | 表示する書籍情報 |

### State

なし

### 表示仕様

| 要素 | 表示内容 | 備考 |
|---|---|---|
| カード全体 | `<Link href={/books/${book.id}}>` でラップ | クリックで詳細画面へ遷移 |
| 書影 | `<Image src={book.coverImageUrl} alt={book.title} />` | 画像ロード失敗時はプレースホルダー（`onError` ハンドラで代替画像 `/images/no-image.png` へ差し替え） |
| タイトル | `book.title` | 長い場合は2行で切り捨て（CSS `line-clamp: 2`） |
| 著者名 | `book.author` | 1行で切り捨て |
| 価格 | `¥${book.price.toLocaleString('ja-JP')}` | カンマ区切り |

### 使用箇所

`frontend/src/app/page.tsx`（商品一覧）でマップして列挙する。

### 実装コード骨格

```typescript
import Link from 'next/link';
import Image from 'next/image';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`}>
      <article>
        <Image
          src={book.coverImageUrl}
          alt={book.title}
          width={200}
          height={280}
        />
        <h2>{book.title}</h2>
        <p>{book.author}</p>
        <p>¥{book.price.toLocaleString('ja-JP')}</p>
      </article>
    </Link>
  );
}
```

---

## 3. CartItemRow

**ファイル:** `frontend/src/components/CartItemRow.tsx`
**種別:** クライアントコンポーネント（`'use client'`）
**責務:** カート画面の1アイテム行を表示する。数量増減・削除ボタンのイベントを親（カートページ）経由で `CartContext` に委譲する。

### Props

```typescript
interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemove: (bookId: string) => void;
}
```

| prop名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `item` | `CartItem` | ○ | カートアイテム（`bookId`, `quantity`, `snapshot` を含む） |
| `onUpdateQuantity` | `(bookId: string, quantity: number) => void` | ○ | 数量変更コールバック |
| `onRemove` | `(bookId: string) => void` | ○ | 削除コールバック |

### 派生値（内部計算）

```typescript
const subtotal = item.snapshot.price * item.quantity;
```

### 表示仕様

| 要素 | 表示内容 | 備考 |
|---|---|---|
| 書影（サムネイル） | `item.snapshot.coverImageUrl` | 幅64px程度のサムネイル |
| タイトル | `item.snapshot.title` | |
| 著者名 | `item.snapshot.author` | |
| 単価 | `¥${item.snapshot.price.toLocaleString('ja-JP')}` | |
| 「−」ボタン | `onClick={() => onUpdateQuantity(item.bookId, item.quantity - 1)}` | `item.quantity === 1` のとき `disabled` |
| 数量表示 | `item.quantity` | |
| 「+」ボタン | `onClick={() => onUpdateQuantity(item.bookId, item.quantity + 1)}` | 常時活性 |
| 小計 | `¥${subtotal.toLocaleString('ja-JP')}` | `quantity` 変更時に自動再計算 |
| 「削除」ボタン | `onClick={() => onRemove(item.bookId)}` | 常時表示 |

### 使用箇所

`frontend/src/app/cart/page.tsx` でカートアイテムリストをマップして使用。

### 実装コード骨格

```typescript
'use client';
import Image from 'next/image';
import type { CartItem } from '@/types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemove: (bookId: string) => void;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const subtotal = item.snapshot.price * item.quantity;

  return (
    <div>
      <Image src={item.snapshot.coverImageUrl} alt={item.snapshot.title} width={64} height={90} />
      <div>
        <p>{item.snapshot.title}</p>
        <p>{item.snapshot.author}</p>
        <p>¥{item.snapshot.price.toLocaleString('ja-JP')}</p>
      </div>
      <div>
        <button
          onClick={() => onUpdateQuantity(item.bookId, item.quantity - 1)}
          disabled={item.quantity === 1}
        >
          −
        </button>
        <span>{item.quantity}</span>
        <button onClick={() => onUpdateQuantity(item.bookId, item.quantity + 1)}>+</button>
      </div>
      <p>¥{subtotal.toLocaleString('ja-JP')}</p>
      <button onClick={() => onRemove(item.bookId)}>削除</button>
    </div>
  );
}
```

---

## 4. OrderSummary

**ファイル:** `frontend/src/components/OrderSummary.tsx`
**種別:** サーバーコンポーネント（props のみ）
**責務:** 注文フォーム画面・注文完了画面で注文内容（商品リストと合計金額）を表示する。データは props で受け取るため、使用コンテキストに依存しない汎用コンポーネント。

### Props

```typescript
interface OrderSummaryItem {
  title: string;
  quantity: number;
  subtotal: number;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  totalAmount: number;
}
```

| prop名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `items` | `OrderSummaryItem[]` | ○ | 表示する商品明細リスト |
| `totalAmount` | `number` | ○ | 合計金額（円） |

### 表示仕様

| 要素 | 表示内容 | 備考 |
|---|---|---|
| 各商品行 | `{item.title}  ×{item.quantity}冊  ¥${item.subtotal.toLocaleString('ja-JP')}` | items をマップして表示 |
| 区切り線 | `<hr />` | 商品行と合計の間 |
| 合計金額 | `合計：¥${totalAmount.toLocaleString('ja-JP')}` | |

### 使用箇所

- `frontend/src/app/checkout/page.tsx`（注文フォーム）: `CartItem[]` から変換して渡す
- `frontend/src/app/order-complete/page.tsx`（注文完了）: `LastOrderData.items` から変換して渡す

### 実装コード骨格

```typescript
interface OrderSummaryItem {
  title: string;
  quantity: number;
  subtotal: number;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  totalAmount: number;
}

export default function OrderSummary({ items, totalAmount }: OrderSummaryProps) {
  return (
    <section>
      <h2>注文内容</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <span>{item.title}</span>
            <span>×{item.quantity}冊</span>
            <span>¥{item.subtotal.toLocaleString('ja-JP')}</span>
          </li>
        ))}
      </ul>
      <hr />
      <p>合計：¥{totalAmount.toLocaleString('ja-JP')}</p>
    </section>
  );
}
```

---

## 5. CartContext

**ファイル:** `frontend/src/context/CartContext.tsx`
**種別:** クライアントコンポーネント（`'use client'`）
**責務:** カート状態をアプリ全体で共有する React Context。`localStorage` への永続化も担う。

### Context 型

```typescript
CartContextValue
// → data_models.md「2-6. CartContextValue」参照
```

### State

```typescript
const [items, setItems] = useState<CartItem[]>([]);
```

### localStorage 仕様

| キー | 型 | 説明 |
|---|---|---|
| `'cart'` | `CartItem[]` （JSON文字列） | カートアイテム一覧 |

### 初期化フロー（`useEffect`）

```typescript
useEffect(() => {
  const stored = localStorage.getItem('cart');
  if (stored) {
    try {
      setItems(JSON.parse(stored));
    } catch {
      localStorage.removeItem('cart'); // 破損データは削除
    }
  }
}, []);
```

### 各アクション実装仕様

#### `add(bookId, snapshot)`

```typescript
setItems((prev) => {
  const existing = prev.find((i) => i.bookId === bookId);
  const next = existing
    ? prev.map((i) => i.bookId === bookId ? { ...i, quantity: i.quantity + 1 } : i)
    : [...prev, { bookId, quantity: 1, snapshot }];
  localStorage.setItem('cart', JSON.stringify(next));
  return next;
});
```

#### `updateQuantity(bookId, quantity)`

```typescript
setItems((prev) => {
  const next = prev.map((i) => i.bookId === bookId ? { ...i, quantity } : i);
  localStorage.setItem('cart', JSON.stringify(next));
  return next;
});
```

#### `remove(bookId)`

```typescript
setItems((prev) => {
  const next = prev.filter((i) => i.bookId !== bookId);
  localStorage.setItem('cart', JSON.stringify(next));
  return next;
});
```

#### `clear()`

```typescript
setItems([]);
localStorage.removeItem('cart');
```

### 派生値（`useMemo`）

```typescript
const totalCount = useMemo(
  () => items.reduce((sum, i) => sum + i.quantity, 0),
  [items]
);

const totalAmount = useMemo(
  () => items.reduce((sum, i) => sum + i.snapshot.price * i.quantity, 0),
  [items]
);
```

### 使用箇所

`frontend/src/app/layout.tsx` で `<CartProvider>` としてアプリ全体をラップする。

---

## 6. useCart（カスタムフック）

**ファイル:** `frontend/src/hooks/useCart.ts`
**責務:** `CartContext` の値を取得するカスタムフック。Context が未設定の場合にエラーを明示する。

### 実装コード

```typescript
import { useContext } from 'react';
import { CartContext } from '@/context/CartContext';

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
```

### 使用箇所

- `Header.tsx`（totalCount の取得）
- `frontend/src/app/books/[id]/page.tsx`（add の呼び出し）
- `frontend/src/app/cart/page.tsx`（items, totalAmount, updateQuantity, remove の取得）
- `frontend/src/app/checkout/page.tsx`（items, totalAmount, clear の取得）
