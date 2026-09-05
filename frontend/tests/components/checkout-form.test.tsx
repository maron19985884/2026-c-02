import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CheckoutForm from "@/components/CheckoutForm";
import { api, ApiError } from "@/lib/api";
import type { CartLine } from "@/lib/useCartLines";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
}));

jest.mock("@/lib/api", () => {
  class ApiError extends Error {
    status: number;
    code: string;
    fields?: Record<string, string>;
    constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
      super(message);
      this.status = status;
      this.code = code;
      this.fields = fields;
    }
  }
  return { api: { createOrder: jest.fn() }, ApiError };
});

const mockedCreateOrder = api.createOrder as jest.Mock;

const lines: CartLine[] = [
  { bookId: 1, title: "テスト書籍", unitPrice: 500, quantity: 2, subtotal: 1000, unavailable: false },
];

describe("CheckoutForm（US3: 項目別エラー表示・サーバ fields マッピング）", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("未入力のまま送信するとクライアント側で項目別エラーを表示し、API を呼ばない", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm lines={lines} total={1000} />);

    await user.click(screen.getByRole("button", { name: "注文する" }));

    expect(await screen.findByText("氏名を入力してください")).toBeInTheDocument();
    expect(screen.getByText("住所を入力してください")).toBeInTheDocument();
    expect(screen.getByText("メールアドレスを入力してください")).toBeInTheDocument();
    expect(mockedCreateOrder).not.toHaveBeenCalled();

    // aria-invalid が立っている
    expect(screen.getByLabelText(/氏名/)).toHaveAttribute("aria-invalid", "true");
  });

  it("メール形式が不正なら email 欄にエラーを出す", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm lines={lines} total={1000} />);

    await user.type(screen.getByLabelText(/氏名/), "山田 太郎");
    await user.type(screen.getByLabelText(/住所/), "東京都");
    await user.type(screen.getByLabelText(/メールアドレス/), "not-an-email");
    await user.click(screen.getByRole("button", { name: "注文する" }));

    expect(await screen.findByText("メールアドレスの形式が正しくありません")).toBeInTheDocument();
    expect(mockedCreateOrder).not.toHaveBeenCalled();
  });

  it("サーバの 400 fields を各入力欄のエラーへマッピングする", async () => {
    mockedCreateOrder.mockRejectedValue(
      new ApiError(400, "VALIDATION_ERROR", "validation failed", {
        email: "メールアドレスの形式が正しくありません",
        items: "カートが空です",
      }),
    );

    const user = userEvent.setup();
    render(<CheckoutForm lines={lines} total={1000} />);

    await user.type(screen.getByLabelText(/氏名/), "山田 太郎");
    await user.type(screen.getByLabelText(/住所/), "東京都千代田区1-1-1");
    await user.type(screen.getByLabelText(/メールアドレス/), "taro@example.com");
    await user.click(screen.getByRole("button", { name: "注文する" }));

    await waitFor(() => expect(mockedCreateOrder).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("メールアドレスの形式が正しくありません")).toBeInTheDocument();
    expect(screen.getByText("カートが空です")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("通信エラー（VALIDATION_ERROR 以外）は汎用エラー表示になる", async () => {
    mockedCreateOrder.mockRejectedValue(new ApiError(0, "NETWORK", "network error"));

    const user = userEvent.setup();
    render(<CheckoutForm lines={lines} total={1000} />);

    await user.type(screen.getByLabelText(/氏名/), "山田 太郎");
    await user.type(screen.getByLabelText(/住所/), "東京都千代田区1-1-1");
    await user.type(screen.getByLabelText(/メールアドレス/), "taro@example.com");
    await user.click(screen.getByRole("button", { name: "注文する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("通信に失敗しました");
  });
});
