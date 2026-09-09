import type { CustomerInfo, OrderFormErrors } from "@/types/order";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

export function validateOrderForm(customerInfo: CustomerInfo): OrderFormErrors {
  const errors: OrderFormErrors = {};

  if (customerInfo.name.trim() === "") {
    errors.name = "氏名を入力してください。";
  }

  if (customerInfo.address.trim() === "") {
    errors.address = "住所を入力してください。";
  }

  if (customerInfo.email.trim() === "") {
    errors.email = "メールアドレスを入力してください。";
  } else if (!EMAIL_PATTERN.test(customerInfo.email.trim())) {
    errors.email = "メールアドレスの形式が正しくありません。";
  }

  return errors;
}
