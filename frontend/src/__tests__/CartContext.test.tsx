import '@testing-library/jest-dom';
import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, CartContext } from '@/contexts/CartContext';
import type { BookSnapshot } from '@/types';

const snapshot: BookSnapshot = {
  title: 'テスト書籍',
  author: 'テスト著者',
  price: 1000,
  coverImageUrl: '/test.jpg',
};

const snapshot2: BookSnapshot = {
  title: 'テスト書籍2',
  author: 'テスト著者2',
  price: 2000,
  coverImageUrl: '/test2.jpg',
};

function TestCart() {
  const cart = useContext(CartContext)!;
  return (
    <div>
      <div data-testid="items">{JSON.stringify(cart.items)}</div>
      <div data-testid="total">{cart.totalAmount}</div>
      <button onClick={() => cart.add('book1', snapshot)}>Add book1</button>
      <button onClick={() => cart.add('book2', snapshot2)}>Add book2</button>
      <button onClick={() => cart.updateQuantity('book1', 5)}>Update book1 qty</button>
      <button onClick={() => cart.remove('book1')}>Remove book1</button>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('商品追加でカートに追加されること', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );
    await user.click(screen.getByText('Add book1'));
    const items = JSON.parse(screen.getByTestId('items').textContent!);
    expect(items).toHaveLength(1);
    expect(items[0].bookId).toBe('book1');
    expect(items[0].quantity).toBe(1);
  });

  test('同一商品を追加すると数量がインクリメントされること', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );
    await user.click(screen.getByText('Add book1'));
    await user.click(screen.getByText('Add book1'));
    const items = JSON.parse(screen.getByTestId('items').textContent!);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  test('数量変更が正しく反映されること', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );
    await user.click(screen.getByText('Add book1'));
    await user.click(screen.getByText('Update book1 qty'));
    const items = JSON.parse(screen.getByTestId('items').textContent!);
    expect(items[0].quantity).toBe(5);
  });

  test('商品削除でカートから除かれること', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );
    await user.click(screen.getByText('Add book1'));
    await user.click(screen.getByText('Remove book1'));
    const items = JSON.parse(screen.getByTestId('items').textContent!);
    expect(items).toHaveLength(0);
  });

  test('合計金額（小計の総和）が正しく計算されること', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );
    await user.click(screen.getByText('Add book1')); // 1000
    await user.click(screen.getByText('Add book2')); // 2000
    await user.click(screen.getByText('Add book1')); // book1 x2 = 2000
    // book1: 2 x 1000 = 2000, book2: 1 x 2000 = 2000, total = 4000
    expect(screen.getByTestId('total').textContent).toBe('4000');
  });
});
