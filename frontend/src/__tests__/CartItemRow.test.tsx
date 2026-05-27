import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartItemRow from '@/components/CartItemRow';
import type { CartItem } from '@/types';

jest.mock('@/components/BookCoverImage', () => {
  const MockImage = ({ alt }: { alt: string }) => <img alt={alt} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const item: CartItem = {
  bookId: 'book1',
  quantity: 2,
  snapshot: {
    title: 'テスト書籍',
    author: 'テスト著者',
    price: 1500,
    coverImageUrl: '/cover.jpg',
  },
};

describe('CartItemRow（CartItem）', () => {
  test('書名・数量・小計が表示されること', () => {
    render(
      <CartItemRow
        item={item}
        onUpdateQuantity={jest.fn()}
        onRemove={jest.fn()}
      />,
    );
    expect(screen.getByText('テスト書籍')).toBeInTheDocument();
    // 数量
    expect(screen.getByText('2')).toBeInTheDocument();
    // 小計: 1500 x 2 = 3000
    expect(screen.getByText('¥3,000')).toBeInTheDocument();
  });

  test('削除ボタンのクリックで onRemove が呼ばれること', async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    render(
      <CartItemRow
        item={item}
        onUpdateQuantity={jest.fn()}
        onRemove={onRemove}
      />,
    );
    await user.click(screen.getByText('削除'));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith('book1');
  });
});
