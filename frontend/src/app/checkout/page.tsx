/**
 * SCR-004 注文フォーム。
 *
 * 詳細設計書 DETAIL-004 §2.10 に対応。
 * - 入力欄と注文内容・合計を同一画面に置く（別の確認画面を挟まない・FR-021）
 * - 送信時に検証し、エラー時は遷移させず入力内容を保持（FR-018〜FR-020）
 * - 送信中はボタンを disabled にして二重送信を防ぐ（FR-025）
 * - 成功時のみカートを空にする（FR-022a / FR-022b）
 * - 注文番号を URL に含めず sessionStorage で受け渡す（FR-029b）
 * - カート0件ならフォームを表示しない（FR-014）
 */
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CartSummary from "@/components/CartSummary";
import EmptyState from "@/components/EmptyState";
import ErrorNotice from "@/components/ErrorNotice";
import {
  ApiClientError,
  createOrder,
  fetchBooks,
  type BookSummary,
} from "@/lib/apiClient";
import { calcCartTotal } from "@/lib/calcCartTotal";
import { useCart } from "@/lib/cartContext";
import { saveLastOrder } from "@/lib/lastOrder";
import {
  toFormErrors,
  validateOrderForm,
  type OrderFormErrors,
} from "@/lib/validateOrderForm";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isRestored, clearCart, removeItem } = useCart();

  const [books, setBooks] = useState<BookSummary[] | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [unavailableIds, setUnavailableIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setBooks(await fetchBooks());
    } catch (err) {
      setLoadError(err);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateOrderForm({ name, address, email });
    setErrors(validationErrors);
    setSubmitError(null);
    setUnavailableIds([]);

    // 入力が不正な間は送信しない。入力内容は保持したまま（FR-020）
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const order = await createOrder(
        { name: name.trim(), address: address.trim(), email: email.trim() },
        items.map((item) => ({ bookId: item.bookId, quantity: item.quantity })),
      );

      // 成功したときだけカートを空にする（FR-022a）
      saveLastOrder(order);
      clearCart();
      router.push("/order-complete");
    } catch (err) {
      // 失敗時はカートも入力内容も保持する（FR-022b / FR-026）
      if (err instanceof ApiClientError) {
        if (err.code === "VALIDATION_ERROR" && err.details?.fields) {
          setErrors(
            toFormErrors(err.details.fields as Record<string, unknown>),
          );
        } else if (err.code === "BOOKS_UNAVAILABLE") {
          const ids = err.details?.unavailableBookIds;
          setUnavailableIds(Array.isArray(ids) ? (ids as number[]) : []);
        }
      }
      setSubmitError(err);
      setIsSubmitting(false);
    }
  };

  if (!isRestored || (books === null && loadError === null)) {
    return (
      <main className="container">
        <h1 className={styles.heading}>注文手続き</h1>
        <p className={styles.loading}>読み込み中です…</p>
      </main>
    );
  }

  // カート0件ではフォームを表示せず注文を確定させない。
  // URL 直接アクセスや、注文確定後の「戻る」操作でもここに到達する（FR-014）
  if (items.length === 0) {
    return (
      <main className="container">
        <h1 className={styles.heading}>注文手続き</h1>
        <EmptyState
          message="カートに商品がありません"
          description="商品一覧から書籍を追加してから、注文手続きへお進みください。"
          actionHref="/"
          actionLabel="商品一覧へ戻る"
        />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="container">
        <h1 className={styles.heading}>注文手続き</h1>
        <ErrorNotice error={loadError} onRetry={() => void load()} showBackToList />
      </main>
    );
  }

  const { lines, total } = calcCartTotal(items, books ?? []);

  return (
    <main className="container">
      <h1 className={styles.heading}>注文手続き</h1>

      {unavailableIds.length > 0 && (
        <div className={styles.unavailable} role="alert">
          <p>ご注文いただけない書籍が含まれています。</p>
          <ul>
            {unavailableIds.map((bookId) => (
              <li key={bookId}>
                書籍ID {bookId}{" "}
                <button type="button" onClick={() => removeItem(bookId)}>
                  カートから削除
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {submitError !== null && unavailableIds.length === 0 && (
        <div className={styles.errorArea}>
          <ErrorNotice error={submitError} />
        </div>
      )}

      <div className={styles.layout}>
        <form onSubmit={handleSubmit} noValidate>
          <h2 className={styles.sectionTitle}>お届け先</h2>

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              氏名
              <span className={styles.required}>必須</span>
            </label>
            <input
              id="name"
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className={styles.fieldError} role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="address" className={styles.label}>
              住所
              <span className={styles.required}>必須</span>
            </label>
            <textarea
              id="address"
              className={`${styles.textarea} ${errors.address ? styles.inputError : ""}`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              aria-invalid={errors.address ? true : undefined}
              aria-describedby={errors.address ? "address-error" : undefined}
            />
            {errors.address && (
              <p id="address-error" className={styles.fieldError} role="alert">
                {errors.address}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              メールアドレス
              <span className={styles.required}>必須</span>
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className={styles.fieldError} role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? "注文を確定しています…" : "注文する"}
          </button>
        </form>

        {/* 注文内容を入力欄と同一画面で確認できる（FR-021） */}
        <section>
          <h2 className={styles.sectionTitle}>ご注文内容</h2>
          <CartSummary lines={lines} total={total} />
        </section>
      </div>
    </main>
  );
}
