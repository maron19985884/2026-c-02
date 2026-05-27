# 詳細設計書：ページ仕様（ルーティング・データ取得・状態管理）

**対象ディレクトリ:** `frontend/src/app/`

---

## 共通設定：layout.tsx

**ファイル:** `frontend/src/app/layout.tsx`
**種別:** サーバーコンポーネント（外側）+ クライアントコンポーネント（CartProvider）

### 役割

- `<html>` / `<body>` の共通構造を定義
- `CartProvider` でアプリ全体をラップしカート状態を全ページで共有
- `Header` を全ページに表示

### 実装コード骨格

```typescript
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
```

---

## 1. 商品一覧画面（page.tsx）

**ファイル:** `frontend/src/app/page.tsx`
**種別:** サーバーコンポーネント

### ルーティング

| 項目 | 内容 |
|---|---|
| URL パス | `/` |
| 動的セグメント | なし |

### データ取得

| 項目 | 内容 |
|---|---|
| 取得方式 | Next.js `fetch` を使った SSR（サーバーサイドレンダリング） |
| API | `GET ${process.env.BACKEND_URL}/api/books` |
| キャッシュ | `cache: 'no-store'`（常に最新データを取得） |
| エラーハンドリング | `try/catch` で API エラーを捕捉し `books = []` にフォールバック。エラーメッセージを state に保持して表示 |

### State

なし（サーバーコンポーネントのため `useState` は使用しない）

### 実装コード骨格

```typescript
import BookCard from '@/components/BookCard';
import { fetchBooks } from '@/lib/api';

export default async function HomePage() {
  let books = [];
  let errorMessage: string | null = null;

  try {
    books = await fetchBooks();
  } catch {
    errorMessage = '書籍情報の取得に失敗しました。しばらくしてから再度お試しください。';
  }

  if (errorMessage) return <p>{errorMessage}</p>;

  if (books.length === 0) return <p>現在販売中の書籍はありません</p>;

  return (
    <div className="grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
```

---

## 2. 商品詳細画面（books/[id]/page.tsx）

**ファイル:** `frontend/src/app/books/[id]/page.tsx`
**種別:** サーバーコンポーネント（書籍データ取得部分）＋クライアントコンポーネント（カート追加ボタン部分）

### ルーティング

| 項目 | 内容 |
|---|---|
| URL パス | `/books/[id]` |
| 動的セグメント | `id`（`Book.id`） |
| params 型 | `{ params: { id: string } }` |

### データ取得

| 項目 | 内容 |
|---|---|
| 取得方式 | `fetchBook(id)` を使った SSR |
| API | `GET ${BACKEND_URL}/api/books/:id` |
| キャッシュ | `cache: 'no-store'` |
| 404 処理 | API が 404 を返した場合 `notFound()` を呼び出し、`not-found.tsx` を表示 |
| エラー処理 | API が 500 等を返した場合エラーメッセージを表示 |

### State（AddToCartButton クライアントコンポーネント内）

```typescript
const [added, setAdded] = useState(false);
// カート追加後2秒間 true、その後 false に戻す
```

### カート追加ロジック（クライアント側）

```typescript
const { add } = useCart();

const handleAddToCart = () => {
  add(book.id, {
    title: book.title,
    author: book.author,
    price: book.price,
    coverImageUrl: book.coverImageUrl,
  });
  setAdded(true);
  setTimeout(() => setAdded(false), 2000);
};
```

### コンポーネント分割

| コンポーネント | 種別 | 責務 |
|---|---|---|
| `books/[id]/page.tsx` | サーバー | 書籍データ取得・詳細レイアウト表示 |
| `AddToCartButton`（同ファイル内またはインライン） | クライアント | カート追加ボタンの状態管理・操作 |

### 実装コード骨格

```typescript
// page.tsx（サーバーコンポーネント）
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchBook } from '@/lib/api';
import AddToCartButton from './AddToCartButton';

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  let book;
  try {
    book = await fetchBook(params.id);
  } catch (e: any) {
    if (e.status === 404) notFound();
    return <p>書籍情報の取得に失敗しました。しばらくしてから再度お試しください。</p>;
  }

  return (
    <div>
      <Link href="/">← 商品一覧へ戻る</Link>
      <Image src={book.coverImageUrl} alt={book.title} width={320} height={448} />
      <h1>{book.title}</h1>
      <p>著者：{book.author}</p>
      <p>¥{book.price.toLocaleString('ja-JP')}（税込）</p>
      <p>{book.description}</p>
      <AddToCartButton book={book} />
    </div>
  );
}
```

```typescript
// AddToCartButton.tsx（クライアントコンポーネント）
'use client';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import type { Book } from '@/types';

export default function AddToCartButton({ book }: { book: Book }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    add(book.id, {
      title: book.title,
      author: book.author,
      price: book.price,
      coverImageUrl: book.coverImageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button onClick={handleClick} disabled={added}>
      {added ? '追加しました ✓' : 'カートに追加'}
    </button>
  );
}
```

---

## 3. カート画面（cart/page.tsx）

**ファイル:** `frontend/src/app/cart/page.tsx`
**種別:** クライアントコンポーネント（`'use client'`）

### ルーティング

| 項目 | 内容 |
|---|---|
| URL パス | `/cart` |
| 動的セグメント | なし |

### データ取得

なし（`CartContext` から `items` を取得。APIコールなし）

### State

`CartContext` の `items`, `totalAmount`, `updateQuantity`, `remove` を `useCart()` で取得。
ページローカルの `useState` は不要。

### 派生値（useMemo）

```typescript
const summaryItems = useMemo(
  () => items.map((i) => ({
    title: i.snapshot.title,
    quantity: i.quantity,
    subtotal: i.snapshot.price * i.quantity,
  })),
  [items]
);
```

### 実装コード骨格

```typescript
'use client';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import CartItemRow from '@/components/CartItemRow';

export default function CartPage() {
  const { items, totalAmount, updateQuantity, remove } = useCart();

  if (items.length === 0) {
    return (
      <div>
        <h1>カート</h1>
        <p>カートに商品が入っていません。</p>
        <Link href="/">商品一覧へ戻る</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>カート</h1>
      <ul>
        {items.map((item) => (
          <CartItemRow
            key={item.bookId}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={remove}
          />
        ))}
      </ul>
      <p>合計：¥{totalAmount.toLocaleString('ja-JP')}</p>
      <Link href="/checkout">注文手続きへ進む</Link>
    </div>
  );
}
```

---

## 4. 注文フォーム画面（checkout/page.tsx）

**ファイル:** `frontend/src/app/checkout/page.tsx`
**種別:** クライアントコンポーネント（`'use client'`）

### ルーティング

| 項目 | 内容 |
|---|---|
| URL パス | `/checkout` |
| 動的セグメント | なし |

### データ取得

なし（`CartContext` からカート情報を取得）

### State

```typescript
const [form, setForm] = useState<OrderFormValues>({
  customerName: '',
  address: '',
  email: '',
});
const [errors, setErrors] = useState<OrderFormErrors>({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [apiError, setApiError] = useState<string | null>(null);
```

### カートが空の場合のリダイレクト

```typescript
const router = useRouter();
const { items, totalAmount, clear } = useCart();

useEffect(() => {
  if (items.length === 0) {
    router.replace('/cart');
  }
}, [items, router]);
```

### バリデーション関数

```typescript
function validate(form: OrderFormValues): OrderFormErrors {
  const errs: OrderFormErrors = {};
  if (!form.customerName.trim()) errs.customerName = '氏名を入力してください';
  if (!form.address.trim()) errs.address = '住所を入力してください';
  if (!form.email.trim()) {
    errs.email = 'メールアドレスを入力してください';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errs.email = '有効なメールアドレスを入力してください';
  }
  return errs;
}
```

### 送信処理フロー

```typescript
const handleSubmit = async () => {
  const errs = validate(form);
  if (Object.keys(errs).length > 0) {
    setErrors(errs);
    return;
  }

  setIsSubmitting(true);
  setApiError(null);

  try {
    const order = await createOrder({
      customerName: form.customerName.trim(),
      address: form.address.trim(),
      email: form.email.trim(),
      items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
    });
    clear();
    sessionStorage.setItem('lastOrder', JSON.stringify({
      orderId: order.orderId,
      items: order.items,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    }));
    router.push('/order-complete');
  } catch (e: any) {
    setApiError(e.message ?? 'サーバーエラーが発生しました。しばらくしてから再度お試しください。');
    setIsSubmitting(false);
  }
};
```

---

## 5. 注文完了画面（order-complete/page.tsx）

**ファイル:** `frontend/src/app/order-complete/page.tsx`
**種別:** クライアントコンポーネント（`'use client'`）

### ルーティング

| 項目 | 内容 |
|---|---|
| URL パス | `/order-complete` |
| 動的セグメント | なし |

### データ取得

なし（`sessionStorage` からデータを読み取る）

### State

```typescript
const [order, setOrder] = useState<LastOrderData | null>(null);
```

### 初期化フロー（`useEffect`）

```typescript
const router = useRouter();

useEffect(() => {
  const stored = sessionStorage.getItem('lastOrder');
  if (!stored) {
    router.replace('/');
    return;
  }
  try {
    setOrder(JSON.parse(stored));
  } catch {
    router.replace('/');
  }
}, [router]);
```

### 実装コード骨格

```typescript
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderSummary from '@/components/OrderSummary';
import type { LastOrderData } from '@/types';

export default function OrderCompletePage() {
  const [order, setOrder] = useState<LastOrderData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('lastOrder');
    if (!stored) { router.replace('/'); return; }
    try { setOrder(JSON.parse(stored)); }
    catch { router.replace('/'); }
  }, [router]);

  if (!order) return null; // リダイレクト待ち

  return (
    <div>
      <h1>ご注文ありがとうございます！</h1>
      <p>注文番号：{order.orderId}</p>
      <OrderSummary items={order.items} totalAmount={order.totalAmount} />
      <Link href="/">商品一覧へ戻る</Link>
    </div>
  );
}
```

---

## 6. 環境変数

| 変数名 | 使用ファイル | 説明 |
|---|---|---|
| `BACKEND_URL` | `frontend/src/lib/api.ts` | バックエンドの baseURL（例: `http://backend:3001`） |

**next.config.ts での設定例:**

```typescript
const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL ?? 'http://localhost:3001',
  },
};

export default nextConfig;
```
