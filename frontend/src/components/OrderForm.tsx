"use client";

import { useState, type FormEvent } from "react";
import { validateOrderForm } from "@/lib/validateOrderForm";
import type { CustomerInfo, OrderFormErrors } from "@/types/order";
import styles from "./OrderForm.module.css";

interface OrderFormProps {
  onValidSubmit: (customerInfo: CustomerInfo) => void;
}

const INITIAL_CUSTOMER_INFO: CustomerInfo = { name: "", address: "", email: "" };

export default function OrderForm({ onValidSubmit }: OrderFormProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(INITIAL_CUSTOMER_INFO);
  const [errors, setErrors] = useState<OrderFormErrors>({});

  function handleChange(field: keyof CustomerInfo, value: string) {
    setCustomerInfo((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateOrderForm(customerInfo);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onValidSubmit(customerInfo);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="customerName">氏名</label>
        <input
          id="customerName"
          type="text"
          value={customerInfo.name}
          onChange={(event) => handleChange("name", event.target.value)}
          aria-invalid={errors.name !== undefined}
        />
        {errors.name && (
          <p className={styles.errorText} role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="customerAddress">住所</label>
        <input
          id="customerAddress"
          type="text"
          value={customerInfo.address}
          onChange={(event) => handleChange("address", event.target.value)}
          aria-invalid={errors.address !== undefined}
        />
        {errors.address && (
          <p className={styles.errorText} role="alert">
            {errors.address}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="customerEmail">メールアドレス</label>
        <input
          id="customerEmail"
          type="text"
          value={customerInfo.email}
          onChange={(event) => handleChange("email", event.target.value)}
          aria-invalid={errors.email !== undefined}
        />
        {errors.email && (
          <p className={styles.errorText} role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <button type="submit" className={styles.submitButton}>
        注文する
      </button>
    </form>
  );
}
