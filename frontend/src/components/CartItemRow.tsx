'use client';

import BookCoverImage from '@/components/BookCoverImage';
import type { CartItem } from '@/types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemove: (bookId: string) => void;
}

export default function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const subtotal = item.snapshot.price * item.quantity;

  return (
    <li className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 w-16 h-[90px] relative rounded overflow-hidden bg-gray-50">
        <BookCoverImage
          src={item.snapshot.coverImageUrl}
          alt={item.snapshot.title}
          width={64}
          height={90}
          fill
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-snug mb-0.5 line-clamp-2">
          {item.snapshot.title}
        </p>
        <p className="text-gray-500 text-xs mb-2">{item.snapshot.author}</p>
        <p className="text-gray-600 text-sm mb-3">
          ¥{item.snapshot.price.toLocaleString('ja-JP')}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onUpdateQuantity(item.bookId, item.quantity - 1)
              }
              disabled={item.quantity === 1}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="数量を減らす"
            >
              −
            </button>
            <span className="w-6 text-center font-semibold text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                onUpdateQuantity(item.bookId, item.quantity + 1)
              }
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="数量を増やす"
            >
              +
            </button>
            <span className="ml-2 text-sm font-semibold text-gray-900">
              ¥{subtotal.toLocaleString('ja-JP')}
            </span>
          </div>

          <button
            onClick={() => onRemove(item.bookId)}
            className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </li>
  );
}
