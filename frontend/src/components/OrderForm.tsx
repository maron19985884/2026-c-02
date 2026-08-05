import { FormEvent, useState } from 'react';
import { OrderFormValues, OrderFormErrors, validateOrderForm, hasFormErrors } from '@/lib/validation';

interface OrderFormProps {
  onSubmit: (values: OrderFormValues) => void;
  submitError?: string | null;
}

export function OrderForm({ onSubmit, submitError }: OrderFormProps) {
  const [values, setValues] = useState<OrderFormValues>({ customerName: '', address: '', email: '' });
  const [errors, setErrors] = useState<OrderFormErrors>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateOrderForm(values);
    setErrors(validationErrors);
    if (!hasFormErrors(validationErrors)) {
      onSubmit(values);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="customerName">氏名</label>
        <input
          id="customerName"
          value={values.customerName}
          onChange={(e) => setValues((prev) => ({ ...prev, customerName: e.target.value }))}
        />
        {errors.customerName && <p role="alert">{errors.customerName}</p>}
      </div>
      <div>
        <label htmlFor="address">住所</label>
        <input
          id="address"
          value={values.address}
          onChange={(e) => setValues((prev) => ({ ...prev, address: e.target.value }))}
        />
        {errors.address && <p role="alert">{errors.address}</p>}
      </div>
      <div>
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          value={values.email}
          onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
        />
        {errors.email && <p role="alert">{errors.email}</p>}
      </div>
      {submitError && <p role="alert">{submitError}</p>}
      <button type="submit">注文する</button>
    </form>
  );
}
