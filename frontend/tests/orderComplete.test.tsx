/**
 * 注文完了画面の単体テスト（T061）。
 *
 * 検証対象:
 * - 完了メッセージ・注文番号・一覧へ戻るリンク（FR-027 / FR-028 / FR-029）
 * - 再読込相当で注文情報が表示されないこと（FR-029a / SC-013）
 * - 注文番号が再表示できない旨の案内（FR-029c）
 */
import { render, screen } from "@testing-library/react";
import OrderCompletePage from "@/app/order-complete/page";
import { LAST_ORDER_STORAGE_KEY } from "@/lib/lastOrder";

const ORDER = {
  orderNumber: "01K59Z4M8QX3V7TPB2NHRG6WDC",
  totalAmount: 2420,
  items: [
    { title: "吾輩は猫である", unitPrice: 880, quantity: 2, subtotal: 1760 },
    { title: "銀河鉄道の夜", unitPrice: 660, quantity: 1, subtotal: 660 },
  ],
};

function seedLastOrder() {
  window.sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(ORDER));
}

beforeEach(() => {
  window.sessionStorage.clear();
});

describe("注文直後", () => {
  it("完了メッセージを表示する", async () => {
    seedLastOrder();
    render(<OrderCompletePage />);

    expect(
      await screen.findByText("ご注文ありがとうございました"),
    ).toBeInTheDocument();
  });

  it("注文番号を表示する", async () => {
    seedLastOrder();
    render(<OrderCompletePage />);

    expect(await screen.findByTestId("order-number")).toHaveTextContent(
      ORDER.orderNumber,
    );
  });

  it("注文内容と合計を表示する", async () => {
    seedLastOrder();
    render(<OrderCompletePage />);

    expect(await screen.findByText("吾輩は猫である")).toBeInTheDocument();
    expect(screen.getByTestId("cart-total")).toHaveTextContent("2,420 円");
  });

  it("商品一覧へ戻るリンクを表示する", async () => {
    seedLastOrder();
    render(<OrderCompletePage />);

    const link = await screen.findByRole("link", { name: "商品一覧へ戻る" });
    expect(link).toHaveAttribute("href", "/");
  });

  it("注文番号が再表示できない旨を伝える", async () => {
    seedLastOrder();
    render(<OrderCompletePage />);

    expect(await screen.findByText(/再表示できません/)).toBeInTheDocument();
  });

  it("表示後に sessionStorage から削除する（一度きりの読み出し）", async () => {
    seedLastOrder();
    render(<OrderCompletePage />);

    await screen.findByTestId("order-number");
    expect(window.sessionStorage.getItem(LAST_ORDER_STORAGE_KEY)).toBeNull();
  });
});

describe("再読込・直接アクセス", () => {
  it("保存された注文がなければ注文情報を表示しない", async () => {
    render(<OrderCompletePage />);

    expect(
      await screen.findByText("表示できる注文情報がありません"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("order-number")).not.toBeInTheDocument();
  });

  it("商品一覧への導線のみを示す", async () => {
    render(<OrderCompletePage />);

    const link = await screen.findByRole("link", { name: "商品一覧へ戻る" });
    expect(link).toHaveAttribute("href", "/");
  });

  it("再読込相当（2回目の描画）では注文情報が表示されない", async () => {
    seedLastOrder();

    const first = render(<OrderCompletePage />);
    expect(await screen.findByTestId("order-number")).toBeInTheDocument();
    first.unmount();

    render(<OrderCompletePage />);
    expect(
      await screen.findByText("表示できる注文情報がありません"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("order-number")).not.toBeInTheDocument();
  });

  it("保存値が壊れている場合も注文情報を表示しない", async () => {
    window.sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, "{壊れたJSON");

    render(<OrderCompletePage />);

    expect(
      await screen.findByText("表示できる注文情報がありません"),
    ).toBeInTheDocument();
  });

  it("注文番号を欠く保存値は無効として扱う", async () => {
    window.sessionStorage.setItem(
      LAST_ORDER_STORAGE_KEY,
      JSON.stringify({ totalAmount: 100, items: [] }),
    );

    render(<OrderCompletePage />);

    expect(
      await screen.findByText("表示できる注文情報がありません"),
    ).toBeInTheDocument();
  });
});
