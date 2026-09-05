"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ApiError, api } from "@/lib/api";
import { clear as clearCart } from "@/lib/cart";
import type { OrderFieldErrors } from "@/lib/types";
import { hasErrors, validateOrderForm } from "@/lib/validation";
import type { CartLine } from "@/lib/useCartLines";
import ErrorNotice from "./ErrorNotice";
import OrderSummary from "./OrderSummary";
import styles from "./CheckoutForm.module.css";

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  multiline?: boolean;
  type?: string;
}

function Field({ id, label, value, onChange, error, multiline = false, type = "text" }: FieldProps) {
  const describedBy = error ? `${id}-error` : undefined;
  const className = `${multiline ? styles.textarea : styles.input} ${error ? styles.inputError : ""}`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        <span className={styles.required} aria-hidden="true">
          必須
        </span>
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={className}
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={className}
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      )}
      {error && (
        <p className={styles.errorText} id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutForm({ lines, total }: { lines: CartLine[]; total: number }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<OrderFieldErrors>({});
  const [generalError, setGeneralError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const availableItems = lines
    .filter((l) => !l.unavailable)
    .map((l) => ({ bookId: l.bookId, quantity: l.quantity }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(false);

    const clientErrors = validateOrderForm({ name, address, email });
    if (availableItems.length === 0) {
      clientErrors.items = "カートが空です";
    }
    setFieldErrors(clientErrors);
    if (hasErrors(clientErrors)) return;

    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customer: { name: name.trim(), address: address.trim(), email: email.trim() },
        items: availableItems,
      });
      clearCart(); // FR-020a / CL-004
      router.push(`/order-complete?number=${encodeURIComponent(order.orderNumber)}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_ERROR") {
        setFieldErrors(err.fields ?? {});
      } else {
        setGeneralError(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field id="name" label="氏名" value={name} onChange={setName} error={fieldErrors.name} />
      <Field
        id="address"
        label="住所"
        value={address}
        onChange={setAddress}
        error={fieldErrors.address}
        multiline
      />
      <Field
        id="email"
        label="メールアドレス"
        type="email"
        value={email}
        onChange={setEmail}
        error={fieldErrors.email}
      />

      {fieldErrors.items && (
        <p className={styles.errorText} id="items-error" role="alert">
          {fieldErrors.items}
        </p>
      )}

      <div>
        <h2>注文内容</h2>
        <OrderSummary lines={lines} total={total} />
      </div>

      {generalError && <ErrorNotice />}

      <button type="submit" className={`btn ${styles.submit}`} disabled={submitting}>
        {submitting ? "送信中…" : "注文する"}
      </button>
    </form>
  );
}
