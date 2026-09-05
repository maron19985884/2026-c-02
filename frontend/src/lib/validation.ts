// 注文フォームの送信時バリデーション（純関数・テスト対象）。
// バックエンド backend/src/domain/orderValidation.ts と同一仕様にすること（EMAIL_PATTERN / 文字数上限）。

import type { OrderFieldErrors } from "./types";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const FIELD_LIMITS = {
  name: 255,
  address: 1000,
  email: 255,
} as const;

export interface OrderFormValues {
  name: string;
  address: string;
  email: string;
}

/**
 * 3項目を検証し、問題があるフィールドのみメッセージを返す。
 * 返り値が空オブジェクトなら妥当。
 */
export function validateOrderForm(values: OrderFormValues): OrderFieldErrors {
  const errors: OrderFieldErrors = {};
  const name = values.name.trim();
  const address = values.address.trim();
  const email = values.email.trim();

  if (name.length === 0) {
    errors.name = "氏名を入力してください";
  } else if (name.length > FIELD_LIMITS.name) {
    errors.name = `氏名は${FIELD_LIMITS.name}文字以内で入力してください`;
  }

  if (address.length === 0) {
    errors.address = "住所を入力してください";
  } else if (address.length > FIELD_LIMITS.address) {
    errors.address = `住所は${FIELD_LIMITS.address}文字以内で入力してください`;
  }

  if (email.length === 0) {
    errors.email = "メールアドレスを入力してください";
  } else if (email.length > FIELD_LIMITS.email) {
    errors.email = `メールアドレスは${FIELD_LIMITS.email}文字以内で入力してください`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "メールアドレスの形式が正しくありません";
  }

  return errors;
}

export function hasErrors(errors: OrderFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
