export interface OrderFormValues {
  customerName: string;
  address: string;
  email: string;
}

export interface OrderFormErrors {
  customerName?: string;
  address?: string;
  email?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 必須チェックとメール形式チェック（FR-013） */
export function validateOrderForm(values: OrderFormValues): OrderFormErrors {
  const errors: OrderFormErrors = {};

  if (!values.customerName.trim()) {
    errors.customerName = '氏名を入力してください';
  }
  if (!values.address.trim()) {
    errors.address = '住所を入力してください';
  }
  if (!values.email.trim()) {
    errors.email = 'メールアドレスを入力してください';
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'メールアドレスの形式が正しくありません';
  }

  return errors;
}

export function hasFormErrors(errors: OrderFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
