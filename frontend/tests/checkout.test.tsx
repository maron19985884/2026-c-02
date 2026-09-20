/**
 * 注文フォーム画面の単体テスト（T061）。
 *
 * 検証対象:
 * - 入力欄と注文内容が同一画面にあること（FR-021）
 * - バリデーションエラー時に遷移せず入力を保持（FR-018〜FR-020 / SC-004）
 * - 成功時にカートが空になること（FR-022a / SC-012）
 * - 失敗時にカートを空にしないこと（FR-022b）
 * - カート0件でフォームが表示されないこと（FR-014）
 * - 二重送信の防止（FR-025）
 * - 注文番号が URL に出ないこと（FR-029b / SC-013）
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CheckoutPage from "@/app/checkout/page";
import { CART_STORAGE_KEY, CartProvider } from "@/lib/cartContext";
import { LAST_ORDER_STORAGE_KEY } from "@/lib/lastOrder";
import { ApiClientError, createOrder, fetchBooks } from "@/lib/apiClient";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/lib/apiClient", () => {
  const actual = jest.requireActual("@/lib/apiClient");
  return { ...actual, fetchBooks: jest.fn(), createOrder: jest.fn() };
});

const mockFetchBooks = fetchBooks as jest.MockedFunction<typeof fetchBooks>;
const mockCreateOrder = createOrder as jest.MockedFunction<typeof createOrder>;

const BOOKS = [
  { id: 1, title: "吾輩は猫である", author: "夏目漱石", price: 880, coverImageUrl: null },
];

const ORDER = {
  orderNumber: "01K59Z4M8QX3V7TPB2NHRG6WDC",
  totalAmount: 1760,
  items: [
    { title: "吾輩は猫である", unitPrice: 880, quantity: 2, subtotal: 1760 },
  ],
};

function seedCart() {
  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify([{ bookId: 1, quantity: 2 }]),
  );
}

function renderCheckout() {
  return render(
    <CartProvider>
      <CheckoutPage />
    </CartProvider>,
  );
}

function fillForm(overrides: Partial<Record<string, string>> = {}) {
  fireEvent.change(screen.getByLabelText(/氏名/), {
    target: { value: overrides.name ?? "小林 景大" },
  });
  fireEvent.change(screen.getByLabelText(/住所/), {
    target: { value: overrides.address ?? "東京都千代田区丸の内1-1-1" },
  });
  fireEvent.change(screen.getByLabelText(/メールアドレス/), {
    target: { value: overrides.email ?? "kobayashi@example.com" },
  });
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  mockPush.mockReset();
  mockFetchBooks.mockReset().mockResolvedValue(BOOKS);
  mockCreateOrder.mockReset().mockResolvedValue(ORDER);
});

describe("表示", () => {
  it("入力欄と注文内容・合計が同一画面に表示される", async () => {
    seedCart();
    renderCheckout();

    await screen.findByLabelText(/氏名/);
    expect(screen.getByLabelText(/住所/)).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
    // 同じ画面に注文内容と合計がある
    expect(screen.getByText("吾輩は猫である")).toBeInTheDocument();
    expect(screen.getByTestId("cart-total")).toHaveTextContent("1,760 円");
  });

  it("カートが0件ならフォームを表示せず注文させない", async () => {
    renderCheckout();

    expect(
      await screen.findByText("カートに商品がありません"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/氏名/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "注文する" }),
    ).not.toBeInTheDocument();
  });
});

describe("バリデーション", () => {
  it("未入力のまま送信するとエラーが出て遷移しない", async () => {
    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    expect(await screen.findByText("氏名を入力してください")).toBeInTheDocument();
    expect(screen.getByText("住所を入力してください")).toBeInTheDocument();
    expect(
      screen.getByText("メールアドレスを入力してください"),
    ).toBeInTheDocument();
    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("メール形式不正では送信されない", async () => {
    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm({ email: "not-an-email" });
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    expect(
      await screen.findByText("メールアドレスの形式が正しくありません"),
    ).toBeInTheDocument();
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it("エラー時も入力内容を保持する", async () => {
    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm({ email: "bad" });
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    await screen.findByText("メールアドレスの形式が正しくありません");
    expect(screen.getByLabelText(/氏名/)).toHaveValue("小林 景大");
    expect(screen.getByLabelText(/メールアドレス/)).toHaveValue("bad");
  });

  it("カートは空にならない", async () => {
    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    await screen.findByText("氏名を入力してください");
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).not.toBeNull();
  });
});

describe("注文確定", () => {
  it("成功すると注文完了画面へ遷移する", async () => {
    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/order-complete"));
  });

  it("遷移先の URL に注文番号を含めない", async () => {
    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalled());
    expect(mockPush.mock.calls[0][0]).toBe("/order-complete");
    expect(mockPush.mock.calls[0][0]).not.toContain(ORDER.orderNumber);
  });

  it("成功時にカートが空になる（localStorage からも消える）", async () => {
    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    await waitFor(() =>
      expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBeNull(),
    );
  });

  it("注文結果を sessionStorage へ保存する", async () => {
    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    await waitFor(() =>
      expect(window.sessionStorage.getItem(LAST_ORDER_STORAGE_KEY)).toContain(
        ORDER.orderNumber,
      ),
    );
  });

  it("金額を送信しない（サーバ側で算出させる）", async () => {
    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    await waitFor(() => expect(mockCreateOrder).toHaveBeenCalled());
    const [, items] = mockCreateOrder.mock.calls[0];
    expect(items).toEqual([{ bookId: 1, quantity: 2 }]);
  });

  it("送信中はボタンを無効化して二重送信を防ぐ", async () => {
    let resolve: ((v: typeof ORDER) => void) | undefined;
    mockCreateOrder.mockReturnValueOnce(
      new Promise((r) => {
        resolve = r;
      }),
    );

    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    const button = await screen.findByRole("button", {
      name: "注文を確定しています…",
    });
    expect(button).toBeDisabled();

    resolve?.(ORDER);
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
  });
});

describe("注文確定の失敗", () => {
  it("500 のときは遷移せずエラーを表示しカートを保持する", async () => {
    mockCreateOrder.mockRejectedValueOnce(
      new ApiClientError(500, "INTERNAL_ERROR", "注文を確定できませんでした"),
    );

    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    expect(
      await screen.findByText("注文を確定できませんでした"),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).not.toBeNull();
  });

  it("409 のときは該当書籍を提示し遷移しない", async () => {
    mockCreateOrder.mockRejectedValueOnce(
      new ApiClientError(
        409,
        "BOOKS_UNAVAILABLE",
        "ご注文いただけない書籍が含まれています",
        { unavailableBookIds: [1] },
      ),
    );

    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    expect(await screen.findByText(/書籍ID 1/)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("400 のときはサーバの項目別エラーを表示する", async () => {
    mockCreateOrder.mockRejectedValueOnce(
      new ApiClientError(400, "VALIDATION_ERROR", "入力内容に誤りがあります", {
        fields: { email: "INVALID_FORMAT" },
      }),
    );

    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    expect(
      await screen.findByText("メールアドレスの形式が正しくありません"),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("失敗後は再度送信できる（ボタンが有効に戻る）", async () => {
    mockCreateOrder.mockRejectedValueOnce(
      new ApiClientError(500, "INTERNAL_ERROR", "注文を確定できませんでした"),
    );

    seedCart();
    renderCheckout();
    await screen.findByLabelText(/氏名/);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    await screen.findByText("注文を確定できませんでした");
    expect(screen.getByRole("button", { name: "注文する" })).toBeEnabled();
  });
});
