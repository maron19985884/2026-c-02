import { act, fireEvent, render, screen } from "@testing-library/react";
import AddToCartButton from "@/components/AddToCartButton";
import { useCart } from "@/context/CartContext";

jest.mock("@/context/CartContext", () => ({
  useCart: jest.fn(),
}));

const mockedUseCart = useCart as jest.Mock;

describe("AddToCartButton", () => {
  const book = { id: 1, title: "Book A", price: 1000, imageUrl: null };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    mockedUseCart.mockReset();
  });

  it("calls addItem and shows a temporary success label when clicked", () => {
    const addItem = jest.fn();
    mockedUseCart.mockReturnValue({ items: [], addItem });

    render(<AddToCartButton book={book} />);
    fireEvent.click(screen.getByRole("button", { name: "カートに追加" }));

    expect(addItem).toHaveBeenCalledTimes(1);
    expect(addItem).toHaveBeenCalledWith(book);
    expect(screen.getByRole("button", { name: "追加しました" })).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(screen.getByRole("button", { name: "カートに追加" })).toBeInTheDocument();
  });

  it("calls addItem on every click without debouncing rapid clicks", () => {
    const addItem = jest.fn();
    mockedUseCart.mockReturnValue({ items: [], addItem });

    render(<AddToCartButton book={book} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(addItem).toHaveBeenCalledTimes(3);
  });
});
