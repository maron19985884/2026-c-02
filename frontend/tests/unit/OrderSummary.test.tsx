import { render, screen } from "@testing-library/react";
import OrderSummary from "@/components/OrderSummary";
import type { CartItem } from "@/types/cart";

const items: CartItem[] = [
  { bookId: 1, title: "Book A", price: 1000, imageUrl: null, quantity: 2 },
  { bookId: 2, title: "Book B", price: 1500, imageUrl: null, quantity: 1 },
];

describe("OrderSummary", () => {
  it("renders each book's title, quantity, and subtotal", () => {
    render(<OrderSummary items={items} />);

    expect(screen.getByText("Book A")).toBeInTheDocument();
    expect(screen.getByText("数量: 2")).toBeInTheDocument();
    expect(screen.getByText("¥2,000")).toBeInTheDocument();

    expect(screen.getByText("Book B")).toBeInTheDocument();
    expect(screen.getByText("数量: 1")).toBeInTheDocument();
    expect(screen.getByText("¥1,500")).toBeInTheDocument();
  });

  it("displays the total as the sum of all line subtotals", () => {
    render(<OrderSummary items={items} />);

    expect(screen.getByText("合計: ¥3,500")).toBeInTheDocument();
  });
});
