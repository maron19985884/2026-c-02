/**
 * Header の単体テスト（T032）。
 *
 * 検証対象:
 * - 件数が「数量の合計」であり行数ではないこと（FR-033 / SC-014）
 * - カート変更で件数が更新されること（FR-034）
 * - カート画面への導線があること（FR-035）
 */
import { act, render, screen } from "@testing-library/react";
import Header from "@/components/Header";
import { CART_STORAGE_KEY, CartProvider, useCart } from "@/lib/cartContext";

/** テストからカート操作を行うための補助コンポーネント */
function CartActions() {
  const { addItem, setQuantity, clearCart } = useCart();
  return (
    <div>
      <button type="button" onClick={() => addItem(1)}>
        add-1
      </button>
      <button type="button" onClick={() => addItem(2)}>
        add-2
      </button>
      <button type="button" onClick={() => setQuantity(2, 3)}>
        set-2-to-3
      </button>
      <button type="button" onClick={() => clearCart()}>
        clear
      </button>
    </div>
  );
}

function setup() {
  return render(
    <CartProvider>
      <Header />
      <CartActions />
    </CartProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Header", () => {
  it("カート画面への導線を表示する", () => {
    setup();

    const link = screen.getByRole("link", { name: /カート/ });
    expect(link).toHaveAttribute("href", "/cart");
  });

  it("カートが0件のときも件数として 0 を表示する", () => {
    setup();

    expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
  });

  it("カートに追加すると件数が増える", () => {
    setup();

    act(() => {
      screen.getByText("add-1").click();
    });

    expect(screen.getByTestId("cart-count")).toHaveTextContent("1");
  });

  it("件数は行数ではなく数量の合計である", () => {
    setup();

    // 書籍1 を数量1、書籍2 を数量3 ＝ 2行だが合計4点
    act(() => {
      screen.getByText("add-1").click();
    });
    act(() => {
      screen.getByText("add-2").click();
    });
    act(() => {
      screen.getByText("set-2-to-3").click();
    });

    expect(screen.getByTestId("cart-count")).toHaveTextContent("4");
  });

  it("同一書籍を複数回追加した件数は追加回数と一致する", () => {
    setup();

    act(() => {
      screen.getByText("add-1").click();
    });
    act(() => {
      screen.getByText("add-1").click();
    });

    expect(screen.getByTestId("cart-count")).toHaveTextContent("2");
  });

  it("カートをクリアすると件数が 0 に戻る", () => {
    setup();

    act(() => {
      screen.getByText("add-1").click();
    });
    act(() => {
      screen.getByText("clear").click();
    });

    expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
  });

  it("保存済みカートがある場合は復元後の件数を表示する", async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ bookId: 1, quantity: 2 }]),
    );

    setup();

    expect(await screen.findByText("2")).toBeInTheDocument();
  });
});
