'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types';

type Props = {
  product: Product;
};

// カートに追加ボタンコンポーネント
// Client Component: useCart フックを使用するため
export default function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  // 追加完了フィードバック表示用のフラグ
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem({
      id:    product.id,
      title: product.title,
      price: product.price,
    });

    // ボタンラベルを一時的に「追加しました」に変更してフィードバックを提供する
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={added}
      style={{
        backgroundColor: added ? '#38a169' : '#2b6cb0',
        color:           'white',
        border:          'none',
        borderRadius:    '0.375rem',
        padding:         '0.75rem 1.5rem',
        fontSize:        '1rem',
        cursor:          added ? 'default' : 'pointer',
        transition:      'background-color 0.2s',
        width:           '100%',
        maxWidth:        '300px',
      }}
    >
      {added ? '追加しました' : 'カートに追加'}
    </button>
  );
}
