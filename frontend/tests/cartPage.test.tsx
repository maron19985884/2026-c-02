/**
 * カート画面の単体テスト（T039）。
 *
 * 検証対象:
 * - 書名・単価・数量・小計・合計の表示（FR-007 / FR-010 / FR-013）
 * - 数量増減で合計が即時更新されること（FR-008 / FR-011）
 * - 数量0で行が消えること（FR-011a）
 * - 削除で合計が即時更新されること（FR-009 / FR-012）
 * - 0件時の空状態と進行不可（FR-014）
 * - 販売停止書籍の提示（FR-016b）
 * - 取得失敗時にカートを失わせないこと（FR-030）
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CartPage from "@/app/cart/page";
import { CART_STORAGE_KEY, CartProvider } from "@/lib/cartContext";
import { ApiClientError, fetchBooks } from "@/lib/apiClient";

jest.mock("@/lib/apiClient", () => {
  const actual = jest.requireActual("@/lib/apiClient");
  return { ...actual, fetchBooks: jest.fn() };
});

const mockFetchBooks = fetchBooks as jest.MockedFunction<typeof fetchBooks>;

const BOOKS = [
  { id: 1, title: "吾輩は猫である", author: "夏目漱石", price: 880, coverImageUrl: null },
  { id: 2, title: "銀河鉄道の夜", author: "宮沢賢治", price: 660, coverImageUrl: null },
];

function seedCart(items: { bookId: number; quantity: number }[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function renderCart() {
  return render(
    <CartProvider>
      <CartPage />
    </CartProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  mockFetchBooks.mockReset();
  mockFetchBooks.mockResolvedValue(BOOKS);
});

describe("カート画面", () => {
  it("書名・単価・数量・小計・合計を表示する", async () => {
    seedCart([{ bookId: 1, quantity: 2 }]);
    renderCart();

    expect(await screen.findByText("吾輩は猫である")).toBeInTheDocument();
    expect(screen.getByText("880 円")).toBeInTheDocument();
    // 小計と合計の2箇所に同じ金額が出る（明細1件のため）
    expect(screen.getAllByText("1,760 円")).toHaveLength(2);
    expect(screen.getByTestId("cart-total")).toHaveTextContent("1,760 円");
  });

  it("複数明細の合計は小計の総和になる", async () => {
    seedCart([
      { bookId: 1, quantity: 2 }, // 1760
      { bookId: 2, quantity: 1 }, //  660
    ]);
    renderCart();

    await screen.findByText("吾輩は猫である");
    expect(screen.getByTestId("cart-total")).toHaveTextContent("2,420 円");
  });

  it("数量を増やすと小計と合計が即時更新される", async () => {
    seedCart([{ bookId: 1, quantity: 1 }]);
    renderCart();

    await screen.findByText("吾輩は猫である");
    expect(screen.getByTestId("cart-total")).toHaveTextContent("880 円");

    fireEvent.click(
      screen.getByRole("button", { name: "吾輩は猫である の数量を1増やす" }),
    );

    expect(screen.getByTestId("cart-total")).toHaveTextContent("1,760 円");
  });

  it("数量を0まで減らすとカートから消える", async () => {
    seedCart([
      { bookId: 1, quantity: 1 },
      { bookId: 2, quantity: 1 },
    ]);
    renderCart();

    await screen.findByText("吾輩は猫である");

    fireEvent.click(
      screen.getByRole("button", { name: "吾輩は猫である の数量を1減らす" }),
    );

    expect(screen.queryByText("吾輩は猫である")).not.toBeInTheDocument();
    expect(screen.getByTestId("cart-total")).toHaveTextContent("660 円");
  });

  it("削除すると行が消え合計が即時更新される", async () => {
    seedCart([
      { bookId: 1, quantity: 1 },
      { bookId: 2, quantity: 1 },
    ]);
    renderCart();

    await screen.findByText("吾輩は猫である");

    fireEvent.click(
      screen.getByRole("button", { name: "吾輩は猫である をカートから削除する" }),
    );

    expect(screen.queryByText("吾輩は猫である")).not.toBeInTheDocument();
    expect(screen.getByTestId("cart-total")).toHaveTextContent("660 円");
  });

  it("最後の1件を0にすると空状態になり注文手続きへ進めない", async () => {
    seedCart([{ bookId: 1, quantity: 1 }]);
    renderCart();

    await screen.findByText("吾輩は猫である");

    fireEvent.click(
      screen.getByRole("button", { name: "吾輩は猫である の数量を1減らす" }),
    );

    expect(screen.getByText("カートに商品がありません")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "注文手続きへ" }),
    ).not.toBeInTheDocument();
  });

  it("カートが0件なら空状態と一覧への導線を表示する", async () => {
    renderCart();

    expect(
      await screen.findByText("カートに商品がありません"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "商品一覧へ戻る" }),
    ).toBeInTheDocument();
  });

  it("1冊以上あれば注文手続きへのリンクを表示する", async () => {
    seedCart([{ bookId: 1, quantity: 1 }]);
    renderCart();

    const link = await screen.findByRole("link", { name: "注文手続きへ" });
    expect(link).toHaveAttribute("href", "/checkout");
  });

  it("販売停止の書籍を特定できる形で提示し、進行を止める", async () => {
    // 書籍99 は fetchBooks の結果に含まれない = 販売停止または削除
    seedCart([
      { bookId: 1, quantity: 1 },
      { bookId: 99, quantity: 1 },
    ]);
    renderCart();

    expect(
      await screen.findByText(
        "ご注文いただけない書籍がカートに含まれています",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/書籍ID 99/)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "注文手続きへ" }),
    ).not.toBeInTheDocument();
  });

  it("販売停止の書籍を削除すると注文手続きへ進めるようになる", async () => {
    seedCart([
      { bookId: 1, quantity: 1 },
      { bookId: 99, quantity: 1 },
    ]);
    renderCart();

    await screen.findByText(/書籍ID 99/);
    fireEvent.click(screen.getByRole("button", { name: "カートから削除" }));

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "注文手続きへ" }),
      ).toBeInTheDocument(),
    );
  });

  it("書籍情報の取得に失敗してもカートを失わせない", async () => {
    mockFetchBooks.mockRejectedValueOnce(
      new ApiClientError(0, "INTERNAL_ERROR", "サーバに接続できませんでした"),
    );
    seedCart([{ bookId: 1, quantity: 2 }]);
    renderCart();

    expect(
      await screen.findByText("サーバに接続できませんでした"),
    ).toBeInTheDocument();
    // カートの保存内容は残っている
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toContain("\"bookId\":1");
  });
});
