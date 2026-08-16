const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FormFields = {
  customerName: string;
  customerAddress: string;
  customerEmail: string;
};

export type FormErrors = Partial<Record<keyof FormFields, string>>;

export function validate(fields: FormFields): { isValid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};

  if (fields.customerName.trim() === "") {
    errors.customerName = "氏名を入力してください";
  }
  if (fields.customerAddress.trim() === "") {
    errors.customerAddress = "住所を入力してください";
  }
  if (fields.customerEmail.trim() === "") {
    errors.customerEmail = "メールアドレスを入力してください";
  } else if (!EMAIL_PATTERN.test(fields.customerEmail)) {
    errors.customerEmail = "メールアドレスの形式が正しくありません";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
