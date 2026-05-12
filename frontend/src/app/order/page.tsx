'use client';

// SCR-04: 注文フォーム画面
// Client Component: フォーム操作・バリデーション・API通信が必要なため

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { createOrder } from '@/lib/api';
import OrderSummary from '@/components/OrderSummary';
import type { OrderFormValues, FormErrors } from '@/types';

// フィールド単位のバリデーション関数
function validateField(name: keyof OrderFormValues, value: string): string | undefined {
  switch (name) {
    case 'customer_name':
      if (!value.trim()) return '氏名は必須です';
      if (value.length > 100) return '氏名は100文字以内で入力してください';
      break;
    case 'customer_address':
      if (!value.trim()) return '住所は必須です';
      if (value.length > 255) return '住所は255文字以内で入力してください';
      break;
    case 'customer_email': {
      if (!value.trim()) return 'メールアドレスは必須です';
      if (value.length > 255) return 'メールアドレスは255文字以内で入力してください';
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!EMAIL_REGEX.test(value)) return 'メールアドレスの形式が正しくありません';
      break;
    }
  }
  return undefined;
}

export default function OrderPage() {
  const router = useRouter();
  const { items, initialized, totalAmount, clearCart } = useCart();

  const [form, setForm] = useState<OrderFormValues>({
    customer_name:    '',
    customer_address: '',
    customer_email:   '',
  });
  const [errors, setErrors]       = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]   = useState<string | null>(null);

  // カートが空の場合はカート画面へリダイレクトする（前提: 7.2より）
  useEffect(() => {
    if (initialized && items.length === 0) {
      router.replace('/cart');
    }
  }, [initialized, items.length, router]);

  // フォームの入力変更ハンドラー
  const handleChange = (name: keyof OrderFormValues, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    // 入力中はエラーをクリアする
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // フォームフォーカスが外れたときのバリデーション（onBlur）
  const handleBlur = (name: keyof OrderFormValues) => {
    const error = validateField(name, form[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // 送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 全フィールドを再バリデーションする
    const newErrors: FormErrors = {};
    (Object.keys(form) as (keyof OrderFormValues)[]).forEach(name => {
      const err = validateField(name, form[name]);
      if (err) newErrors[name] = err;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      const order = await createOrder({
        ...form,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      });

      // 注文完了後にカートを空にして完了画面へ遷移する
      clearCart();
      router.push(`/order/complete?order_number=${order.order_number}`);
    } catch (err: unknown) {
      console.error('createOrder failed:', err);
      setApiError('注文の送信に失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  // ハイドレーション完了前はローディング表示
  if (!initialized) {
    return <p style={{ color: '#718096' }}>読み込み中...</p>;
  }

  // カートが空の場合はリダイレクト処理中なので何も表示しない
  if (items.length === 0) {
    return null;
  }

  // 入力フィールドの共通スタイル
  const inputStyle: React.CSSProperties = {
    width:        '100%',
    padding:      '0.5rem 0.75rem',
    border:       '1px solid #cbd5e0',
    borderRadius: '0.375rem',
    fontSize:     '1rem',
    boxSizing:    'border-box',
  };

  const errorStyle: React.CSSProperties = {
    color:     '#e53e3e',
    fontSize:  '0.875rem',
    marginTop: '0.25rem',
  };

  return (
    <main>
      <h1
        style={{
          fontSize:     '1.75rem',
          fontWeight:   'bold',
          marginBottom: '1.5rem',
          color:        '#2d3748',
        }}
      >
        注文フォーム
      </h1>

      {/* 注文内容確認エリア */}
      <OrderSummary items={items} totalAmount={totalAmount} />

      {/* 注文フォーム */}
      <div
        style={{
          backgroundColor: 'white',
          border:          '1px solid #e2e8f0',
          borderRadius:    '0.5rem',
          padding:         '1.5rem',
        }}
      >
        <h2
          style={{
            fontSize:     '1.125rem',
            fontWeight:   'bold',
            marginBottom: '1.25rem',
            color:        '#2d3748',
          }}
        >
          お届け先情報
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* 氏名 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="customer_name"
              style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              氏名 <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              id="customer_name"
              type="text"
              value={form.customer_name}
              onChange={e => handleChange('customer_name', e.target.value)}
              onBlur={() => handleBlur('customer_name')}
              placeholder="山田 太郎"
              style={{
                ...inputStyle,
                borderColor: errors.customer_name ? '#e53e3e' : '#cbd5e0',
              }}
            />
            {errors.customer_name && (
              <p style={errorStyle} role="alert">{errors.customer_name}</p>
            )}
          </div>

          {/* 住所 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="customer_address"
              style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              住所 <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              id="customer_address"
              type="text"
              value={form.customer_address}
              onChange={e => handleChange('customer_address', e.target.value)}
              onBlur={() => handleBlur('customer_address')}
              placeholder="東京都千代田区千代田1-1"
              style={{
                ...inputStyle,
                borderColor: errors.customer_address ? '#e53e3e' : '#cbd5e0',
              }}
            />
            {errors.customer_address && (
              <p style={errorStyle} role="alert">{errors.customer_address}</p>
            )}
          </div>

          {/* メールアドレス */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="customer_email"
              style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              メールアドレス <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              id="customer_email"
              type="email"
              value={form.customer_email}
              onChange={e => handleChange('customer_email', e.target.value)}
              onBlur={() => handleBlur('customer_email')}
              placeholder="taro@example.com"
              style={{
                ...inputStyle,
                borderColor: errors.customer_email ? '#e53e3e' : '#cbd5e0',
              }}
            />
            {errors.customer_email && (
              <p style={errorStyle} role="alert">{errors.customer_email}</p>
            )}
          </div>

          {/* APIエラーメッセージ */}
          {apiError && (
            <div
              role="alert"
              style={{
                padding:         '0.75rem 1rem',
                marginBottom:    '1rem',
                backgroundColor: '#fff5f5',
                border:          '1px solid #feb2b2',
                borderRadius:    '0.375rem',
                color:           '#c53030',
                fontSize:        '0.875rem',
              }}
            >
              {apiError}
            </div>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width:           '100%',
              padding:         '0.875rem',
              backgroundColor: submitting ? '#a0aec0' : '#2b6cb0',
              color:           'white',
              border:          'none',
              borderRadius:    '0.375rem',
              fontSize:        '1rem',
              fontWeight:      'bold',
              cursor:          submitting ? 'not-allowed' : 'pointer',
              transition:      'background-color 0.2s',
            }}
          >
            {submitting ? '送信中...' : '注文する'}
          </button>
        </form>
      </div>
    </main>
  );
}
