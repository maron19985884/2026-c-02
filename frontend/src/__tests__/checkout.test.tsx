import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from '@/app/checkout/page';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    items: [
      {
        bookId: 'book1',
        quantity: 1,
        snapshot: {
          title: 'テスト書籍',
          author: 'テスト著者',
          price: 1000,
          coverImageUrl: '',
        },
      },
    ],
    totalAmount: 1000,
    clear: jest.fn(),
    isLoaded: true,
  }),
}));

jest.mock('@/components/OrderSummary', () => {
  const MockOrderSummary = () => <div data-testid="order-summary" />;
  MockOrderSummary.displayName = 'MockOrderSummary';
  return MockOrderSummary;
});

jest.mock('@/lib/api', () => ({
  createOrder: jest.fn().mockResolvedValue({
    orderId: 'order-123',
    customerName: '山田太郎',
    address: '東京都渋谷区',
    email: 'test@example.com',
    items: [],
    totalAmount: 1000,
    createdAt: '2024-01-01T00:00:00Z',
  }),
  ApiError: class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

describe('注文フォームバリデーション（checkout/page）', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('全項目空欄で送信するとエラーメッセージが表示されること', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage />);
    await user.click(screen.getByText('注文する'));
    expect(screen.getByText('氏名を入力してください')).toBeInTheDocument();
    expect(screen.getByText('住所を入力してください')).toBeInTheDocument();
    expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
  });

  test('メールアドレス形式不正でエラーメッセージが表示されること', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage />);
    await user.type(screen.getByPlaceholderText('山田 太郎'), '山田太郎');
    await user.type(screen.getByPlaceholderText('東京都渋谷区道玄坂1-2-3'), '東京都渋谷区');
    await user.type(screen.getByPlaceholderText('example@email.com'), 'invalid-email');
    await user.click(screen.getByText('注文する'));
    expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
  });

  test('全項目入力済みでエラーが表示されないこと', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage />);
    await user.type(screen.getByPlaceholderText('山田 太郎'), '山田太郎');
    await user.type(screen.getByPlaceholderText('東京都渋谷区道玄坂1-2-3'), '東京都渋谷区');
    await user.type(screen.getByPlaceholderText('example@email.com'), 'test@example.com');
    await user.click(screen.getByText('注文する'));
    expect(screen.queryByText('氏名を入力してください')).not.toBeInTheDocument();
    expect(screen.queryByText('住所を入力してください')).not.toBeInTheDocument();
    expect(screen.queryByText('メールアドレスを入力してください')).not.toBeInTheDocument();
    expect(screen.queryByText('有効なメールアドレスを入力してください')).not.toBeInTheDocument();
  });
});
