import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartProvider } from "@/context/CartContext";
import OrderPage from "@/app/order/page";
import { createOrder } from "@/lib/api/orders";

jest.mock("@/lib/api/orders", () => ({
  createOrder: jest.fn(),
}));

const mockedReplace = jest.fn();
const mockedPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockedReplace, push: mockedPush }),
}));

const mockedCreateOrder = createOrder as jest.Mock;

const CART_STORAGE_KEY = "bookstore.cart";

describe("OrderPage + CartContext（実際のカート状態でのクリア）", () => {
  afterEach(() => {
    window.localStorage.clear();
    mockedCreateOrder.mockReset();
    mockedReplace.mockReset();
    mockedPush.mockReset();
  });

  it("注文確定後にclearCart()でカートが空になっても、完了画面への遷移が/cartへの差し戻しに上書きされない", async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ bookId: 1, title: "Book A", price: 1000, imageUrl: null, quantity: 1 }])
    );
    mockedCreateOrder.mockResolvedValueOnce({
      orderNumber: "01J8Z3K9N4Q7R2XABCD5EFGHJK",
      totalAmount: 1000,
    });

    render(
      <CartProvider>
        <OrderPage />
      </CartProvider>
    );

    fireEvent.change(await screen.findByLabelText("氏名"), { target: { value: "山田花子" } });
    fireEvent.change(screen.getByLabelText("住所"), { target: { value: "東京都千代田区1-1-1" } });
    fireEvent.change(screen.getByLabelText("メールアドレス"), { target: { value: "hanako@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    await waitFor(() =>
      expect(mockedPush).toHaveBeenCalledWith("/order/complete/01J8Z3K9N4Q7R2XABCD5EFGHJK")
    );
    expect(mockedReplace).not.toHaveBeenCalledWith("/cart");
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]")).toEqual([]);
  });
});
