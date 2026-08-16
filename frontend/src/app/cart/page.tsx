"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listBooks } from "../lib/booksApi";
import { getItems, updateQuantity, removeItem } from "../lib/cartStore";
import CartItemRow from "../components/CartItemRow";

export type CartDisplayItem = {
  bookId: number;
  quantity: number;
  title: string;
  price: number;
  coverImageUrl: string | null;
  isAvailable: boolean;
};

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; items: CartDisplayItem[] };

export default function CartPage() {
  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    listBooks()
      .then((books) => {
        if (cancelled) return;

        const items: CartDisplayItem[] = getItems().map((cartItem) => {
          const book = books.find((b) => b.id === cartItem.bookId);
          if (book) {
            return {
              bookId: cartItem.bookId,
              quantity: cartItem.quantity,
              title: book.title,
              price: book.price,
              coverImageUrl: book.coverImageUrl,
              isAvailable: true,
            };
          }
          return {
            bookId: cartItem.bookId,
            quantity: cartItem.quantity,
            title: "この書籍",
            price: 0,
            coverImageUrl: null,
            isAvailable: false,
          };
        });

        setState({ status: "success", items });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleQuantityChange = (bookId: number, quantity: number) => {
    if (state.status !== "success") return;
    const ok = updateQuantity(bookId, quantity);
    if (!ok) return;

    setState({
      status: "success",
      items: state.items.map((item) =>
        item.bookId === bookId ? { ...item, quantity } : item
      ),
    });
  };

  const handleRemove = (bookId: number) => {
    if (state.status !== "success") return;
    const ok = removeItem(bookId);
    if (!ok) return;

    setState({
      status: "success",
      items: state.items.filter((item) => item.bookId !== bookId),
    });
  };

  return (
    <main className="page">
      <h1 className="page__title">カート</h1>

      {state.status === "loading" && <p className="state-message">読み込み中...</p>}

      {state.status === "error" && (
        <p className="state-message state-message--error" role="alert">
          カート情報の取得中に問題が発生しました。時間をおいて再度お試しください。
        </p>
      )}

      {state.status === "success" && state.items.length === 0 && (
        <p className="state-message">カートに書籍がありません</p>
      )}

      {state.status === "success" && state.items.length > 0 && (
        <div className="cart-list">
          {state.items.map((item) => (
            <CartItemRow
              key={item.bookId}
              bookId={item.bookId}
              title={item.title}
              price={item.price}
              quantity={item.quantity}
              coverImageUrl={item.coverImageUrl}
              isAvailable={item.isAvailable}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
            />
          ))}

          <p className="cart-total">
            合計: ¥
            {state.items
              .filter((item) => item.isAvailable)
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toLocaleString("ja-JP")}
          </p>

          {(() => {
            const purchasableCount = state.items.filter((item) => item.isAvailable).length;
            if (purchasableCount === 0) {
              return (
                <button type="button" className="button button--primary" disabled>
                  注文手続きへ
                </button>
              );
            }
            return (
              <Link href="/order" className="button button--primary">
                注文手続きへ
              </Link>
            );
          })()}
        </div>
      )}
    </main>
  );
}
