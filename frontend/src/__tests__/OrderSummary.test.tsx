import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import OrderSummary from '@/components/OrderSummary';

describe('OrderSummary', () => {
  const items = [
    { title: '書籍A', quantity: 1, subtotal: 1000 },
    { title: '書籍B', quantity: 2, subtotal: 3000 },
  ];
  const totalAmount = 4000;

  test('注文商品リストと合計金額が表示されること', () => {
    render(<OrderSummary items={items} totalAmount={totalAmount} />);
    expect(screen.getByText('書籍A')).toBeInTheDocument();
    expect(screen.getByText('書籍B')).toBeInTheDocument();
    expect(screen.getByText('¥4,000')).toBeInTheDocument();
  });
});
