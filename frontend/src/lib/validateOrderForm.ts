/**
 * 注文フォームの入力検証。
 *
 * 詳細設計書 DETAIL-004 §2.9 / contracts/orders-api.md 末尾に対応。
 *
 * バックエンドの `validateOrderRequest.ts` と同一の規則を実装する。
 * 両者の判定がずれると、フロントを通過したのにサーバで弾かれる状態が起きるため、
 * それぞれ単体テストを持つ（SC-004 / SC-008）。
 */

export type FieldErrorCode = "REQUIRED" | "TOO_LONG" | "INVALID_FORMAT";

export interface OrderFormInput {
  name: string;
  address: string;
  email: string;
}

export type OrderFormErrors = Partial<Record<keyof OrderFormInput, string>>;

export const MAX_NAME_LENGTH = 100;
export const MAX_ADDRESS_LENGTH = 255;
export const MAX_EMAIL_LENGTH = 255;

/** 利用者に提示するメッセージ。項目名を含めてどこが問題か分かるようにする（FR-018） */
const MESSAGES: Record<keyof OrderFormInput, Record<FieldErrorCode, string>> = {
  name: {
    REQUIRED: "氏名を入力してください",
    TOO_LONG: `氏名は${MAX_NAME_LENGTH}文字以内で入力してください`,
    INVALID_FORMAT: "氏名の形式が正しくありません",
  },
  address: {
    REQUIRED: "住所を入力してください",
    TOO_LONG: `住所は${MAX_ADDRESS_LENGTH}文字以内で入力してください`,
    INVALID_FORMAT: "住所の形式が正しくありません",
  },
  email: {
    REQUIRED: "メールアドレスを入力してください",
    TOO_LONG: `メールアドレスは${MAX_EMAIL_LENGTH}文字以内で入力してください`,
    INVALID_FORMAT: "メールアドレスの形式が正しくありません",
  },
};

/** バックエンドの isValidEmail と同一の判定 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

function checkText(value: string, maxLength: number): FieldErrorCode | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "REQUIRED";
  if (trimmed.length > maxLength) return "TOO_LONG";
  return undefined;
}

export function validateOrderForm(input: OrderFormInput): OrderFormErrors {
  const errors: OrderFormErrors = {};

  const nameError = checkText(input.name, MAX_NAME_LENGTH);
  if (nameError) errors.name = MESSAGES.name[nameError];

  const addressError = checkText(input.address, MAX_ADDRESS_LENGTH);
  if (addressError) errors.address = MESSAGES.address[addressError];

  const emailError = checkText(input.email, MAX_EMAIL_LENGTH);
  if (emailError) {
    errors.email = MESSAGES.email[emailError];
  } else if (!isValidEmail(input.email.trim())) {
    errors.email = MESSAGES.email.INVALID_FORMAT;
  }

  return errors;
}

/**
 * サーバが返した `details.fields`（項目名 → エラー種別）を
 * 画面表示用のメッセージへ変換する（FR-018 / FR-019）。
 */
export function toFormErrors(fields: Record<string, unknown>): OrderFormErrors {
  const errors: OrderFormErrors = {};
  for (const key of ["name", "address", "email"] as const) {
    const code = fields[key];
    if (typeof code === "string" && code in MESSAGES[key]) {
      errors[key] = MESSAGES[key][code as FieldErrorCode];
    }
  }
  return errors;
}
