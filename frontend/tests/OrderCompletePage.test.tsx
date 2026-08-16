import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderCompletePage from "../src/app/order/complete/page";

const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: mockGet }),
}));

describe("OrderCompletePage", () => {
  it("orderNumberがある場合、完了メッセージと注文番号を表示する (FR-007, FR-008)", () => {
    mockGet.mockImplementation((key: string) => (key === "orderNumber" ? "ORD-000001" : null));

    render(<OrderCompletePage />);

    expect(screen.getByText("ご注文ありがとうございました")).toBeInTheDocument();
    expect(screen.getByText(/注文番号: ORD-000001/)).toBeInTheDocument();
  });

  it("「商品一覧へ戻る」リンクは商品一覧画面(/)を指す (FR-009)", () => {
    mockGet.mockReturnValue(null);

    render(<OrderCompletePage />);

    expect(screen.getByRole("link", { name: "商品一覧へ戻る" })).toHaveAttribute("href", "/");
  });

  it("orderNumberが無い場合は注文番号欄を表示しない", () => {
    mockGet.mockReturnValue(null);

    render(<OrderCompletePage />);

    expect(screen.queryByText(/注文番号:/)).not.toBeInTheDocument();
  });
});
