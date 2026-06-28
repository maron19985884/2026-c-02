import { useState, FormEvent } from 'react';

interface FormValues {
  customerName: string;
  customerAddress: string;
  customerEmail: string;
}

interface FormErrors {
  customerName?: string;
  customerAddress?: string;
  customerEmail?: string;
}

interface Props {
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
}

export default function OrderForm({ onSubmit, isSubmitting }: Props) {
  const [values, setValues] = useState<FormValues>({
    customerName: '',
    customerAddress: '',
    customerEmail: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!values.customerName.trim()) errs.customerName = '氏名は必須です';
    if (!values.customerAddress.trim()) errs.customerAddress = '住所は必須です';
    if (!values.customerEmail.trim()) {
      errs.customerEmail = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.customerEmail)) {
      errs.customerEmail = 'メールアドレスの形式が正しくありません';
    }
    return errs;
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSubmit(values);
  }

  function handleChange(field: keyof FormValues, value: string): void {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  const fieldStyle: React.CSSProperties = { display: 'block', width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' };
  const errorStyle: React.CSSProperties = { color: 'red', fontSize: '0.875em', marginTop: '2px' };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="customerName">氏名 <span style={{ color: 'red' }}>*</span></label>
        <input
          id="customerName"
          type="text"
          value={values.customerName}
          onChange={(e) => handleChange('customerName', e.target.value)}
          style={fieldStyle}
        />
        {errors.customerName && <p style={errorStyle}>{errors.customerName}</p>}
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="customerAddress">住所 <span style={{ color: 'red' }}>*</span></label>
        <input
          id="customerAddress"
          type="text"
          value={values.customerAddress}
          onChange={(e) => handleChange('customerAddress', e.target.value)}
          style={fieldStyle}
        />
        {errors.customerAddress && <p style={errorStyle}>{errors.customerAddress}</p>}
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="customerEmail">メールアドレス <span style={{ color: 'red' }}>*</span></label>
        <input
          id="customerEmail"
          type="email"
          value={values.customerEmail}
          onChange={(e) => handleChange('customerEmail', e.target.value)}
          style={fieldStyle}
        />
        {errors.customerEmail && <p style={errorStyle}>{errors.customerEmail}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        style={{ padding: '10px 32px', fontSize: '1em', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
      >
        {isSubmitting ? '処理中...' : '注文する'}
      </button>
    </form>
  );
}
