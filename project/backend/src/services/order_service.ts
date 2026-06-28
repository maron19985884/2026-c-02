import { OrderItem, createOrder as createOrderInDB } from '../models/order';

interface OrderInput {
  customer_name: string;
  customer_address: string;
  customer_email: string;
  items: OrderItem[];
}

interface ValidationErrors {
  [field: string]: string;
}

function validateOrderInput(input: OrderInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.customer_name || input.customer_name.trim() === '') {
    errors.customer_name = '氏名は必須です';
  }
  if (!input.customer_address || input.customer_address.trim() === '') {
    errors.customer_address = '住所は必須です';
  }
  if (!input.customer_email || input.customer_email.trim() === '') {
    errors.customer_email = 'メールアドレスは必須です';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customer_email)) {
    errors.customer_email = 'メールアドレスの形式が正しくありません';
  }

  return errors;
}

export async function createOrder(input: OrderInput): Promise<{ orderNumber: string }> {
  const errors = validateOrderInput(input);
  if (Object.keys(errors).length > 0) {
    throw { statusCode: 400, errors };
  }

  if (!input.items || input.items.length === 0) {
    throw { statusCode: 422, error: '注文アイテムが1件以上必要です' };
  }

  const orderNumber = await createOrderInDB(
    input.customer_name,
    input.customer_address,
    input.customer_email,
    input.items
  );

  return { orderNumber };
}
