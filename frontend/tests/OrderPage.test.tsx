import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import OrderPage from "../src/app/order/page";
import { validate } from "../src/app/lib/orderValidation";
import * as booksApi from "../src/app/lib/booksApi";
import * as cartStore from "../src/app/lib/cartStore";
import * as ordersApi from "../src/app/lib/ordersApi";
import { ValidationError, UnavailableItemsError } from "../src/app/lib/ordersApi";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("OrderPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("カート内の注文商品・合計金額と、氏名・住所・メールアドレスの入力欄を表示する", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([
      { bookId: 1, quantity: 2 },
      { bookId: 2, quantity: 1 },
    ]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([
      { id: 1, title: "Book A", author: "Author A", price: 1000, coverImageUrl: null },
      { id: 2, title: "Book B", author: "Author B", price: 1500, coverImageUrl: null },
    ]);

    render(<OrderPage />);

    await waitFor(() => {
      expect(screen.getByText("Book A")).toBeInTheDocument();
    });
    expect(screen.getByText("Book B")).toBeInTheDocument();
    expect(screen.getByText(/^合計:/)).toHaveTextContent("合計: ¥3,500");

    expect(screen.getByLabelText("氏名")).toBeInTheDocument();
    expect(screen.getByLabelText("住所")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "注文する" })).toBeInTheDocument();
  });

  it("販売対象外の項目はカート合成時に除外される", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([
      { bookId: 1, quantity: 1 },
      { bookId: 999, quantity: 3 },
    ]);
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([
      { id: 1, title: "Book A", author: "Author A", price: 1000, coverImageUrl: null },
    ]);

    render(<OrderPage />);

    await waitFor(() => {
      expect(screen.getByText("Book A")).toBeInTheDocument();
    });
    expect(screen.getByText(/^合計:/)).toHaveTextContent("合計: ¥1,000");
  });

  it("書籍情報の取得に失敗した場合は汎用エラー表示になる", async () => {
    vi.spyOn(cartStore, "getItems").mockReturnValue([{ bookId: 1, quantity: 1 }]);
    vi.spyOn(booksApi, "listBooks").mockRejectedValue(new Error("network down"));

    render(<OrderPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("validate(fields)", () => {
    it("氏名・住所・メールアドレスがすべて有効な場合はisValid: trueを返す (FR-003, FR-004)", () => {
      const result = validate({
        customerName: "山田太郎",
        customerAddress: "東京都千代田区1-1-1",
        customerEmail: "taro@example.com",
      });

      expect(result).toEqual({ isValid: true, errors: {} });
    });

    it("未入力の項目それぞれにエラーを設定する (FR-003)", () => {
      const result = validate({ customerName: "", customerAddress: "", customerEmail: "" });

      expect(result.isValid).toBe(false);
      expect(result.errors.customerName).toBeTruthy();
      expect(result.errors.customerAddress).toBeTruthy();
      expect(result.errors.customerEmail).toBeTruthy();
    });

    it("メールアドレスの形式が不正な場合にエラーを設定する (FR-004)", () => {
      const result = validate({
        customerName: "山田太郎",
        customerAddress: "東京都千代田区1-1-1",
        customerEmail: "invalid",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.customerEmail).toBeTruthy();
    });
  });

  describe("「注文する」押下時の送信フロー", () => {
    const fillAndSubmit = async () => {
      fireEvent.change(screen.getByLabelText("氏名"), { target: { value: "山田太郎" } });
      fireEvent.change(screen.getByLabelText("住所"), {
        target: { value: "東京都千代田区1-1-1" },
      });
      fireEvent.change(screen.getByLabelText("メールアドレス"), {
        target: { value: "taro@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: "注文する" }));
    };

    beforeEach(() => {
      mockPush.mockReset();
      vi.spyOn(cartStore, "getItems").mockReturnValue([{ bookId: 1, quantity: 2 }]);
      vi.spyOn(booksApi, "listBooks").mockResolvedValue([
        { id: 1, title: "Book A", author: "Author A", price: 1000, coverImageUrl: null },
      ]);
    });

    it("未入力のまま押すと該当項目にエラーが表示され、createOrderは呼ばれない (FR-003)", async () => {
      const createOrderSpy = vi.spyOn(ordersApi, "createOrder");

      render(<OrderPage />);
      await waitFor(() => expect(screen.getByText("Book A")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: "注文する" }));

      expect(await screen.findByText("氏名を入力してください")).toBeInTheDocument();
      expect(createOrderSpy).not.toHaveBeenCalled();
    });

    it("メールアドレスの形式が不正だとエラーが表示され、createOrderは呼ばれない (FR-004)", async () => {
      const createOrderSpy = vi.spyOn(ordersApi, "createOrder");

      render(<OrderPage />);
      await waitFor(() => expect(screen.getByText("Book A")).toBeInTheDocument());

      fireEvent.change(screen.getByLabelText("氏名"), { target: { value: "山田太郎" } });
      fireEvent.change(screen.getByLabelText("住所"), {
        target: { value: "東京都千代田区1-1-1" },
      });
      fireEvent.change(screen.getByLabelText("メールアドレス"), {
        target: { value: "invalid" },
      });
      fireEvent.click(screen.getByRole("button", { name: "注文する" }));

      expect(await screen.findByText("メールアドレスの形式が正しくありません")).toBeInTheDocument();
      expect(createOrderSpy).not.toHaveBeenCalled();
    });

    it("createOrderがValidationErrorをthrowした場合、該当項目にエラーを反映する", async () => {
      vi.spyOn(ordersApi, "createOrder").mockRejectedValue(
        new ValidationError(["customerEmail format is invalid"])
      );

      render(<OrderPage />);
      await waitFor(() => expect(screen.getByText("Book A")).toBeInTheDocument());

      await fillAndSubmit();

      expect(
        await screen.findByText("customerEmail format is invalid")
      ).toBeInTheDocument();
    });

    it("createOrderがUnavailableItemsErrorをthrowした場合、汎用エラーメッセージを表示する", async () => {
      vi.spyOn(ordersApi, "createOrder").mockRejectedValue(new UnavailableItemsError([1]));

      render(<OrderPage />);
      await waitFor(() => expect(screen.getByText("Book A")).toBeInTheDocument());

      await fillAndSubmit();

      expect(
        await screen.findByText(/カート内の一部の書籍が注文できなくなっています/)
      ).toBeInTheDocument();
    });

    it("createOrderが予期しないエラーをthrowした場合、汎用エラーメッセージを表示する", async () => {
      vi.spyOn(ordersApi, "createOrder").mockRejectedValue(new Error("network down"));

      render(<OrderPage />);
      await waitFor(() => expect(screen.getByText("Book A")).toBeInTheDocument());

      await fillAndSubmit();

      expect(
        await screen.findByText(/注文の確定中に問題が発生しました/)
      ).toBeInTheDocument();
    });

    it("成功時はcartStore.clear()を呼び、注文完了画面へ遷移する (FR-005, FR-006)", async () => {
      vi.spyOn(ordersApi, "createOrder").mockResolvedValue({
        orderNumber: "ORD-000001",
        totalAmount: 2000,
        items: [{ bookId: 1, title: "Book A", price: 1000, quantity: 2, subtotal: 2000 }],
      });
      const clearSpy = vi.spyOn(cartStore, "clear").mockReturnValue(true);

      render(<OrderPage />);
      await waitFor(() => expect(screen.getByText("Book A")).toBeInTheDocument());

      await fillAndSubmit();

      await waitFor(() => {
        expect(clearSpy).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/order/complete?orderNumber=ORD-000001");
      });
    });
  });
});
