"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listBooks } from "../lib/booksApi";
import { getItems, clear as clearCart } from "../lib/cartStore";
import { createOrder, ValidationError, UnavailableItemsError } from "../lib/ordersApi";
import { validate, type FormFields, type FormErrors } from "../lib/orderValidation";
import OrderSummary, { type OrderSummaryItem } from "../components/OrderSummary";

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; items: OrderSummaryItem[] };

export default function OrderPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [fields, setFields] = useState<FormFields>({
    customerName: "",
    customerAddress: "",
    customerEmail: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listBooks()
      .then((books) => {
        if (cancelled) return;

        const items: OrderSummaryItem[] = getItems()
          .map((cartItem) => {
            const book = books.find((b) => b.id === cartItem.bookId);
            if (!book) return null;
            return {
              bookId: cartItem.bookId,
              title: book.title,
              price: book.price,
              quantity: cartItem.quantity,
            };
          })
          .filter((item): item is OrderSummaryItem => item !== null);

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

  const totalAmount =
    state.status === "success"
      ? state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      : 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.status !== "success") return;

    const { isValid, errors: validationErrors } = validate(fields);
    setErrors(validationErrors);
    setSubmitError(null);
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const result = await createOrder({
        customerName: fields.customerName,
        customerAddress: fields.customerAddress,
        customerEmail: fields.customerEmail,
        items: state.items.map((item) => ({ bookId: item.bookId, quantity: item.quantity })),
      });

      clearCart();
      router.push(`/order/complete?orderNumber=${result.orderNumber}`);
    } catch (error) {
      if (error instanceof ValidationError) {
        const fieldErrors: FormErrors = {};
        for (const detail of error.details) {
          if (detail.startsWith("customerName")) fieldErrors.customerName = detail;
          else if (detail.startsWith("customerAddress")) fieldErrors.customerAddress = detail;
          else if (detail.startsWith("customerEmail")) fieldErrors.customerEmail = detail;
        }
        setErrors(fieldErrors);
      } else if (error instanceof UnavailableItemsError) {
        setSubmitError(
          "カート内の一部の書籍が注文できなくなっています。カートを確認してください。"
        );
      } else {
        setSubmitError("注文の確定中に問題が発生しました。時間をおいて再度お試しください。");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <h1 className="page__title">注文フォーム</h1>

      {state.status === "loading" && <p className="state-message">読み込み中...</p>}

      {state.status === "error" && (
        <p className="state-message state-message--error" role="alert">
          注文内容の取得中に問題が発生しました。時間をおいて再度お試しください。
        </p>
      )}

      {state.status === "success" && (
        <>
          <OrderSummary items={state.items} totalAmount={totalAmount} />

          <form className="order-form" onSubmit={handleSubmit} noValidate>
            <div className="order-form__field">
              <label htmlFor="customerName">氏名</label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                value={fields.customerName}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, customerName: e.target.value }))
                }
              />
              {errors.customerName && (
                <p className="order-form__error" role="alert">
                  {errors.customerName}
                </p>
              )}
            </div>

            <div className="order-form__field">
              <label htmlFor="customerAddress">住所</label>
              <input
                id="customerAddress"
                name="customerAddress"
                type="text"
                value={fields.customerAddress}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, customerAddress: e.target.value }))
                }
              />
              {errors.customerAddress && (
                <p className="order-form__error" role="alert">
                  {errors.customerAddress}
                </p>
              )}
            </div>

            <div className="order-form__field">
              <label htmlFor="customerEmail">メールアドレス</label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="text"
                value={fields.customerEmail}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, customerEmail: e.target.value }))
                }
              />
              {errors.customerEmail && (
                <p className="order-form__error" role="alert">
                  {errors.customerEmail}
                </p>
              )}
            </div>

            {submitError && (
              <p className="state-message state-message--error" role="alert">
                {submitError}
              </p>
            )}

            <button type="submit" className="button button--primary" disabled={isSubmitting}>
              注文する
            </button>
          </form>
        </>
      )}
    </main>
  );
}
