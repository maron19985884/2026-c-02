import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import CartPage from "../src/app/cart/page";
import * as booksApi from "../src/app/lib/booksApi";
import * as cartStore from "../src/app/lib/cartStore";

describe("CartPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("表示中の書籍について書名・単価・数量・小計と合計を表示する", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([
      { bookId: 1, quantity: 2 },
      { bookId: 2, quantity: 1 },
    ]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([
      { id: 1, title: "Book A", author: "Author A", price: 1000, coverImageUrl: null },
      { id: 2, title: "Book B", author: "Author B", price: 1500, coverImageUrl: null },
    ]);

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Book A")).toBeInTheDocument();
    });
    const rowA = screen.getByText("Book A").closest(".cart-item") as HTMLElement;
    const rowB = screen.getByText("Book B").closest(".cart-item") as HTMLElement;

    // Book A: 単価1000 * 数量2 = 小計2000
    expect(within(rowA).getByText("¥1,000")).toBeInTheDocument();
    expect(within(rowA).getByText("¥2,000")).toBeInTheDocument();
    // Book B: 単価1500 * 数量1 = 小計1500
    expect(within(rowB).getAllByText("¥1,500")).toHaveLength(2);

    // 合計: 2000 + 1500 = 3500
    expect(screen.getByText(/^合計:/)).toHaveTextContent("合計: ¥3,500");
  });

  it("カートが空の場合は空状態を表示する", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([]);

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("カートに書籍がありません")).toBeInTheDocument();
    });
  });

  it("販売対象外になった書籍はその旨を表示し、合計に含めない", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([
      { bookId: 1, quantity: 1 },
      { bookId: 999, quantity: 3 }, // listBooksの結果に存在しない = 販売対象外
    ]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([
      { id: 1, title: "Book A", author: "Author A", price: 1000, coverImageUrl: null },
    ]);

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Book A")).toBeInTheDocument();
    });
    expect(screen.getByText(/販売を終了しました/)).toBeInTheDocument();

    // 販売終了分(999)は合計に含めないため、合計欄は1000のみ
    expect(screen.getByText(/^合計:/)).toHaveTextContent("合計: ¥1,000");
  });

  it("「＋」を押すと数量・小計・合計がその場で更新される (FR-004)", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([{ bookId: 1, quantity: 1 }]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([
      { id: 1, title: "Book A", author: "Author A", price: 1000, coverImageUrl: null },
    ]);
    const updateSpy = vi.spyOn(cartStore, "updateQuantity").mockReturnValue(true);

    render(<CartPage />);
    await waitFor(() => expect(screen.getByText("Book A")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "数量を増やす" }));

    expect(updateSpy).toHaveBeenCalledWith(1, 2);
    const row = screen.getByText("Book A").closest(".cart-item") as HTMLElement;
    expect(within(row).getByText("2")).toBeInTheDocument();
    expect(within(row).getByText("¥2,000")).toBeInTheDocument();
    expect(screen.getByText(/^合計:/)).toHaveTextContent("合計: ¥2,000");
  });

  it("数量が1のとき「−」ボタンは無効化されている (FR-009)", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([{ bookId: 1, quantity: 1 }]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([
      { id: 1, title: "Book A", author: "Author A", price: 1000, coverImageUrl: null },
    ]);

    render(<CartPage />);
    await waitFor(() => expect(screen.getByText("Book A")).toBeInTheDocument());

    expect(screen.getByRole("button", { name: "数量を減らす" })).toBeDisabled();
  });

  it("「削除」を押すとその行が消え、合計が更新される (FR-006)", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([
      { bookId: 1, quantity: 1 },
      { bookId: 2, quantity: 1 },
    ]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([
      { id: 1, title: "Book A", author: "Author A", price: 1000, coverImageUrl: null },
      { id: 2, title: "Book B", author: "Author B", price: 500, coverImageUrl: null },
    ]);
    const removeSpy = vi.spyOn(cartStore, "removeItem").mockReturnValue(true);

    render(<CartPage />);
    await waitFor(() => expect(screen.getByText("Book A")).toBeInTheDocument());

    const rowA = screen.getByText("Book A").closest(".cart-item") as HTMLElement;
    fireEvent.click(within(rowA).getByRole("button", { name: "削除" }));

    expect(removeSpy).toHaveBeenCalledWith(1);
    expect(screen.queryByText("Book A")).not.toBeInTheDocument();
    expect(screen.getByText("Book B")).toBeInTheDocument();
    expect(screen.getByText(/^合計:/)).toHaveTextContent("合計: ¥500");
  });

  it("購入可能な書籍がある場合、注文手続きへのリンクが有効になる", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([{ bookId: 1, quantity: 1 }]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([
      { id: 1, title: "Book A", author: "Author A", price: 1000, coverImageUrl: null },
    ]);

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "注文手続きへ" })).toHaveAttribute(
        "href",
        "/order"
      );
    });
  });

  it("カートが空の場合、注文手続きへボタンは無効化される", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([]);

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("カートに書籍がありません")).toBeInTheDocument();
    });
    expect(screen.queryByRole("link", { name: "注文手続きへ" })).not.toBeInTheDocument();
  });

  it("カート内が全て販売対象外の場合、注文手続きへボタンは無効化される", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([{ bookId: 999, quantity: 1 }]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([]);

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText(/販売を終了しました/)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "注文手続きへ" })).toBeDisabled();
  });

  it("書籍情報の取得に失敗した場合は汎用エラー表示になる", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([{ bookId: 1, quantity: 1 }]);
    vi.spyOn(booksApi, "listBooks").mockRejectedValue(new Error("network down"));

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
