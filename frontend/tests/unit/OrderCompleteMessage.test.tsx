import { render, screen } from '@testing-library/react';
import { OrderCompleteMessage } from '@/components/OrderCompleteMessage';

describe('OrderCompleteMessage', () => {
  it('shows a not-found message when there is no order', () => {
    render(<OrderCompleteMessage order={null} />);
    expect(screen.getByText('注文情報が見つかりませんでした。')).toBeTruthy();
  });

  it('shows the completion message and order number when an order is present (FR-016, FR-017)', () => {
    render(
      <OrderCompleteMessage
        order={{
          orderNumber: 'ORD-20260805-0001',
          createdAt: '2026-08-05T00:00:00.000Z',
          customerName: '山田太郎',
          items: [],
          totalAmount: 0,
        }}
      />
    );
    expect(screen.getByText(/受け付けました/)).toBeTruthy();
    expect(screen.getByText('ORD-20260805-0001')).toBeTruthy();
  });
});
