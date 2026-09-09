import { render, screen } from "@testing-library/react";
import CartPage from "@/app/cart/page";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/types/cart";

jest.mock("@/context/CartContext", () => ({
  useCart: jest.fn(),
}));

const mockedUseCart = useCart as jest.Mock;

const items: CartItem[] = [
  { bookId: 1, title: "Book A", price: 1000, imageUrl: null, quantity: 2 },
  { bookId: 2, title: "Book B", price: 1500, imageUrl: null, quantity: 1 },
];

function mockCart(cartItems: CartItem[]) {
  mockedUseCart.mockReturnValue({
    items: cartItems,
    increaseQuantity: jest.fn(),
    decreaseQuantity: jest.fn(),
    removeItem: jest.fn(),
  });
}

describe("CartPage", () => {
  afterEach(() => {
    mockedUseCart.mockReset();
  });

  it("shows an empty state and no checkout link when the cart is empty", () => {
    mockCart([]);

    render(<CartPage />);

    expect(screen.getByText("カートに書籍がありません。")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "注文手続きへ" })).not.toBeInTheDocument();
  });

  it("renders one row per cart item", () => {
    mockCart(items);

    render(<CartPage />);

    expect(screen.getByText("Book A")).toBeInTheDocument();
    expect(screen.getByText("Book B")).toBeInTheDocument();
  });

  it("displays the total as the sum of all line subtotals", () => {
    mockCart(items);

    render(<CartPage />);

    expect(screen.getByText("合計: ¥3,500")).toBeInTheDocument();
  });

  it("shows the checkout link to /order when the cart has items", () => {
    mockCart(items);

    render(<CartPage />);

    expect(screen.getByRole("link", { name: "注文手続きへ" })).toHaveAttribute("href", "/order");
  });
});
