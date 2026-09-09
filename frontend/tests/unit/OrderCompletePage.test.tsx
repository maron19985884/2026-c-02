import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import OrderCompletePage from "@/app/order/complete/[orderNumber]/page";
import { fetchOrderByNumber } from "@/lib/api/orders";

jest.mock("@/lib/api/orders", () => ({
  fetchOrderByNumber: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

const mockedFetchOrderByNumber = fetchOrderByNumber as jest.Mock;
const mockedRedirect = redirect as jest.Mock;

describe("OrderCompletePage", () => {
  afterEach(() => {
    mockedFetchOrderByNumber.mockReset();
    mockedRedirect.mockClear();
  });

  it("shows the completion message when the order is found", async () => {
    mockedFetchOrderByNumber.mockResolvedValueOnce({ orderNumber: "01J8Z3K9N4Q7R2XABCD5EFGHJK" });

    const jsx = await OrderCompletePage({ params: { orderNumber: "01J8Z3K9N4Q7R2XABCD5EFGHJK" } });
    render(jsx);

    expect(screen.getByText(/注文が受け付けられました/)).toBeInTheDocument();
    expect(screen.getByText("01J8Z3K9N4Q7R2XABCD5EFGHJK")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "商品一覧へ戻る" })).toHaveAttribute("href", "/");
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("redirects to the book list when the order cannot be fetched", async () => {
    mockedFetchOrderByNumber.mockRejectedValueOnce(new Error("Failed to fetch order: 404"));

    await expect(
      OrderCompletePage({ params: { orderNumber: "00000000000000000000000000" } })
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockedRedirect).toHaveBeenCalledWith("/");
  });
});
