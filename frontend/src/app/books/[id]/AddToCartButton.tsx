'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import type { Book } from '@/types';

export default function AddToCartButton({ book }: { book: Book }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    add(book.id, {
      title: book.title,
      author: book.author,
      price: book.price,
      coverImageUrl: book.coverImageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={added}
      className={`w-full sm:w-auto py-3 px-8 rounded-xl font-semibold text-base transition-all duration-200 ${
        added
          ? 'bg-green-500 text-white cursor-default'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
      }`}
    >
      {added ? '追加しました ✓' : 'カートに追加'}
    </button>
  );
}
