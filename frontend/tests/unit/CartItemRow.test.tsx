import { fireEvent, render, screen } from "@testing-library/react";
import CartItemRow from "@/components/CartItemRow";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/types/cart";

jest.mock("@/context/CartContext", () => ({
  useCart: jest.fn(),
}));

const mockedUseCart = useCart as jest.Mock;

const item: CartItem = { bookId: 1, title: "Book A", price: 1000, imageUrl: null, quantity: 2 };

function mockCartActions() {
  const actions = { increaseQuantity: jest.fn(), decreaseQuantity: jest.fn(), removeItem: jest.fn() };
  mockedUseCart.mockReturnValue(actions);
  return actions;
}

describe("CartItemRow", () => {
  afterEach(() => {
    mockedUseCart.mockReset();
  });

  it("displays title, price, quantity, and subtotal", () => {
    mockCartActions();

    render(<CartItemRow item={item} />);

    expect(screen.getByText("Book A")).toBeInTheDocument();
    expect(screen.getByText("¥1,000")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("¥2,000")).toBeInTheDocument();
  });

  it("calls increaseQuantity with the book id when the + button is clicked", () => {
    const { increaseQuantity } = mockCartActions();

    render(<CartItemRow item={item} />);
    fireEvent.click(screen.getByRole("button", { name: "数量を増やす" }));

    expect(increaseQuantity).toHaveBeenCalledWith(1);
  });

  it("calls decreaseQuantity with the book id when the - button is clicked", () => {
    const { decreaseQuantity } = mockCartActions();

    render(<CartItemRow item={item} />);
    fireEvent.click(screen.getByRole("button", { name: "数量を減らす" }));

    expect(decreaseQuantity).toHaveBeenCalledWith(1);
  });

  it("disables the decrease button when quantity is 1", () => {
    mockCartActions();

    render(<CartItemRow item={{ ...item, quantity: 1 }} />);

    expect(screen.getByRole("button", { name: "数量を減らす" })).toBeDisabled();
  });

  it("calls removeItem with the book id when the delete button is clicked", () => {
    const { removeItem } = mockCartActions();

    render(<CartItemRow item={item} />);
    fireEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(removeItem).toHaveBeenCalledWith(1);
  });
});
