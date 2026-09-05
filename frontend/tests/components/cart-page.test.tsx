import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CartPage from "@/app/cart/page";
import { addItem } from "@/lib/cart";
import { api } from "@/lib/api";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/cart",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/lib/api", () => ({
  api: { getBook: jest.fn() },
  ApiError: class ApiError extends Error {
    code: string;
    constructor(status: number, code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));

const mockedGetBook = api.getBook as jest.Mock;

function book(id: number, price: number) {
  return {
    id,
    title: `書籍${id}`,
    author: "著者",
    price,
    coverImageUrl: "/images/books/placeholder.svg",
    description: "",
  };
}

describe("CartPage（US2: 数量変更・削除で合計が更新される）", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
    mockedGetBook.mockImplementation((id: number) =>
      Promise.resolve(id === 1 ? book(1, 500) : book(2, 300)),
    );
  });

  it("数量を+1すると合計が単価分だけ増える", async () => {
    addItem(1); // 500
    addItem(2); // 300 → 合計 800
    const user = userEvent.setup();
    render(<CartPage />);

    expect(await screen.findByText("¥800")).toBeInTheDocument();

    const row1 = screen.getByText("書籍1").closest("tr") as HTMLElement;
    await user.click(within(row1).getByRole("button", { name: "数量を1増やす" }));

    await waitFor(() => expect(screen.getByText("¥1,300")).toBeInTheDocument());
  });

  it("行を削除すると合計から外れ、最後の1件削除で空状態になる", async () => {
    addItem(1); // 500
    addItem(2); // 300 → 合計 800
    const user = userEvent.setup();
    render(<CartPage />);

    expect(await screen.findByText("¥800")).toBeInTheDocument();

    const row2 = screen.getByText("書籍2").closest("tr") as HTMLElement;
    await user.click(within(row2).getByRole("button", { name: /「書籍2」をカートから削除/ }));
    await waitFor(() => expect(screen.getByText("¥500")).toBeInTheDocument());

    const row1 = screen.getByText("書籍1").closest("tr") as HTMLElement;
    await user.click(within(row1).getByRole("button", { name: /「書籍1」をカートから削除/ }));
    await waitFor(() =>
      expect(screen.getByText("カートに商品がありません。")).toBeInTheDocument(),
    );
  });
});
