import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CheckoutPage from "@/app/checkout/page";
import { addItem, readCart } from "@/lib/cart";
import { api } from "@/lib/api";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/lib/api", () => ({
  api: {
    getBook: jest.fn(),
    createOrder: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    code: string;
    fields?: Record<string, string>;
    constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
      super(message);
      this.status = status;
      this.code = code;
      this.fields = fields;
    }
  },
}));

const mockedApi = api as unknown as {
  getBook: jest.Mock;
  createOrder: jest.Mock;
};

describe("CheckoutPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("カートが空なら注文フォームを表示せず案内を出す（確定できない）", async () => {
    render(<CheckoutPage />);

    expect(
      await screen.findByText("カートが空のため注文手続きに進めません。"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "注文する" })).not.toBeInTheDocument();
  });

  it("注文成功（201）後にカートが空になり、注文完了画面へ遷移する", async () => {
    addItem(1);
    mockedApi.getBook.mockResolvedValue({
      id: 1,
      title: "テスト書籍",
      author: "テスト著者",
      price: 500,
      coverImageUrl: "/images/books/placeholder.svg",
      description: "",
    });
    mockedApi.createOrder.mockResolvedValue({
      orderNumber: "ORD-TEST0000000000000000000001",
      orderedAt: new Date().toISOString(),
      customer: { name: "山田 太郎", address: "東京都", email: "taro@example.com" },
      items: [{ bookId: 1, title: "テスト書籍", unitPrice: 500, quantity: 1, subtotal: 500 }],
      totalAmount: 500,
    });

    const user = userEvent.setup();
    render(<CheckoutPage />);

    await user.type(await screen.findByLabelText(/氏名/), "山田 太郎");
    await user.type(screen.getByLabelText(/住所/), "東京都千代田区1-1-1");
    await user.type(screen.getByLabelText(/メールアドレス/), "taro@example.com");
    await user.click(screen.getByRole("button", { name: "注文する" }));

    await waitFor(() => expect(mockedApi.createOrder).toHaveBeenCalledTimes(1));
    expect(readCart()).toEqual([]); // FR-020a / CL-004
    expect(push).toHaveBeenCalledWith(
      expect.stringContaining("/order-complete?number=ORD-TEST0000000000000000000001"),
    );
  });
});
