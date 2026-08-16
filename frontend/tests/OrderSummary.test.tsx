import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import OrderSummary from "../src/app/components/OrderSummary";

describe("OrderSummary", () => {
  it("書名・単価・数量・小計と合計金額を表示する", () => {
    render(
      <OrderSummary
        items={[
          { bookId: 1, title: "Book A", price: 1000, quantity: 2 },
          { bookId: 2, title: "Book B", price: 1500, quantity: 1 },
        ]}
        totalAmount={3500}
      />
    );

    const rowA = screen.getByText("Book A").closest(".order-summary__item") as HTMLElement;
    expect(within(rowA).getByText("¥1,000")).toBeInTheDocument();
    expect(within(rowA).getByText(/数量: 2/)).toBeInTheDocument();
    expect(within(rowA).getByText("¥2,000")).toBeInTheDocument();

    const rowB = screen.getByText("Book B").closest(".order-summary__item") as HTMLElement;
    expect(within(rowB).getAllByText("¥1,500")).toHaveLength(2);

    expect(screen.getByText(/^合計:/)).toHaveTextContent("合計: ¥3,500");
  });
});
