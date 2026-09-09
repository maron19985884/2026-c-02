import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import OrderPage from "@/app/order/page";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/api/orders";
import type { CartItem } from "@/types/cart";

jest.mock("@/context/CartContext", () => ({
  useCart: jest.fn(),
}));

jest.mock("@/lib/api/orders", () => ({
  createOrder: jest.fn(),
}));

const mockedReplace = jest.fn();
const mockedPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockedReplace, push: mockedPush }),
}));

const mockedUseCart = useCart as jest.Mock;
const mockedCreateOrder = createOrder as jest.Mock;

const items: CartItem[] = [{ bookId: 1, title: "Book A", price: 1000, imageUrl: null, quantity: 1 }];

function mockCart(cartItems: CartItem[], isLoaded: boolean) {
  const clearCart = jest.fn();
  mockedUseCart.mockReturnValue({
    items: cartItems,
    isLoaded,
    addItem: jest.fn(),
    increaseQuantity: jest.fn(),
    decreaseQuantity: jest.fn(),
    removeItem: jest.fn(),
    clearCart,
  });
  return { clearCart };
}

function fillAndSubmitForm() {
  fireEvent.change(screen.getByLabelText("氏名"), { target: { value: "山田花子" } });
  fireEvent.change(screen.getByLabelText("住所"), { target: { value: "東京都千代田区1-1-1" } });
  fireEvent.change(screen.getByLabelText("メールアドレス"), { target: { value: "hanako@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "注文する" }));
}

describe("OrderPage", () => {
  afterEach(() => {
    mockedUseCart.mockReset();
    mockedCreateOrder.mockReset();
    mockedReplace.mockReset();
    mockedPush.mockReset();
  });

  it("does not redirect while the cart has not finished loading", () => {
    mockCart([], false);

    render(<OrderPage />);

    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("redirects to /cart once loaded with an empty cart", () => {
    mockCart([], true);

    render(<OrderPage />);

    expect(mockedReplace).toHaveBeenCalledWith("/cart");
  });

  it("renders the order form without redirecting when the cart has items", () => {
    mockCart(items, true);

    const { container } = render(<OrderPage />);

    expect(mockedReplace).not.toHaveBeenCalled();
    expect(container.querySelector("form")).not.toBeNull();
  });

  it("clears the cart and navigates to the completion page on successful submission", async () => {
    const { clearCart } = mockCart(items, true);
    mockedCreateOrder.mockResolvedValueOnce({ orderNumber: "01J8Z3K9N4Q7R2XABCD5EFGHJK", totalAmount: 1000 });

    render(<OrderPage />);
    fillAndSubmitForm();

    await waitFor(() => expect(mockedPush).toHaveBeenCalledWith("/order/complete/01J8Z3K9N4Q7R2XABCD5EFGHJK"));
    expect(clearCart).toHaveBeenCalled();
  });

  it("shows an error and keeps the entered values when submission fails", async () => {
    mockCart(items, true);
    mockedCreateOrder.mockRejectedValueOnce(new Error("Failed to create order: 500"));

    render(<OrderPage />);
    fillAndSubmitForm();

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(mockedPush).not.toHaveBeenCalled();
    expect(screen.getByLabelText("氏名")).toHaveValue("山田花子");
  });
});
