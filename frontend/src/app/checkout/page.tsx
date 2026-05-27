'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import OrderSummary from '@/components/OrderSummary';
import { createOrder, ApiError } from '@/lib/api';
import type { OrderFormValues, OrderFormErrors } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: OrderFormValues): OrderFormErrors {
  const errs: OrderFormErrors = {};
  if (!form.customerName.trim()) errs.customerName = '氏名を入力してください';
  if (!form.address.trim()) errs.address = '住所を入力してください';
  if (!form.email.trim()) {
    errs.email = 'メールアドレスを入力してください';
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errs.email = '有効なメールアドレスを入力してください';
  }
  return errs;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clear, isLoaded } = useCart();

  const [form, setForm] = useState<OrderFormValues>({
    customerName: '',
    address: '',
    email: '',
  });
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || isSubmitting) return;
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items, router, isLoaded, isSubmitting]);

  const handleChange = (field: keyof OrderFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const order = await createOrder({
        customerName: form.customerName.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
        items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
      });
      clear();
      sessionStorage.setItem(
        'lastOrder',
        JSON.stringify({
          orderId: order.orderId,
          items: order.items,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
        }),
      );
      router.push('/order-complete');
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        switch (e.status) {
          case 400:
          case 404:
            setApiError(e.message);
            break;
          case 500:
            setApiError(
              'サーバーエラーが発生しました。しばらくしてから再度お試しください。',
            );
            break;
          default:
            setApiError('予期しないエラーが発生しました。');
        }
      } else {
        setApiError(
          '通信エラーが発生しました。接続を確認してください。',
        );
      }
      setIsSubmitting(false);
    }
  };

  const summaryItems = items.map((i) => ({
    title: i.snapshot.title,
    quantity: i.quantity,
    subtotal: i.snapshot.price * i.quantity,
  }));

  if (!isLoaded) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">注文フォーム</h1>

      <div className="flex flex-col-reverse md:flex-row md:gap-8 lg:gap-12">
        {/* フォーム */}
        <div className="w-full md:flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5">お届け先情報</h2>

            <div className="space-y-5">
              {/* 氏名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  氏名{' '}
                  <span className="text-red-500" aria-hidden>
                    *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) =>
                    handleChange('customerName', e.target.value)
                  }
                  placeholder="山田 太郎"
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.customerName
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-blue-400'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-red-600 text-xs mt-1.5">
                    {errors.customerName}
                  </p>
                )}
              </div>

              {/* 住所 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  住所{' '}
                  <span className="text-red-500" aria-hidden>
                    *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="東京都渋谷区道玄坂1-2-3"
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.address
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-blue-400'
                  }`}
                />
                {errors.address && (
                  <p className="text-red-600 text-xs mt-1.5">
                    {errors.address}
                  </p>
                )}
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  メールアドレス{' '}
                  <span className="text-red-500" aria-hidden>
                    *
                  </span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="example@email.com"
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-blue-400'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1.5">{errors.email}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-7 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
            >
              {isSubmitting ? '送信中...' : '注文する'}
            </button>

            {apiError && (
              <p className="mt-3 text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                {apiError}
              </p>
            )}
          </div>
        </div>

        {/* 注文内容 */}
        <div className="w-full md:w-72 lg:w-80 mb-6 md:mb-0">
          <OrderSummary items={summaryItems} totalAmount={totalAmount} />
        </div>
      </div>
    </div>
  );
}
