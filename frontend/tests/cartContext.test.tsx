/**
 * cartContext の単体テスト（T028）。
 *
 * 検証対象:
 * - 同一書籍の再追加で行を増やさず数量を加算する（FR-009 / SC-011）
 * - 数量0で自動削除する（FR-011a）
 * - 数量に上限を設けない（FR-011b）
 * - localStorage から復元する（FR-016 / SC-010）
 * - localStorage が使えなくても動作を継続する（憲法§3）
 * - 注文確定時のクリアで localStorage からも消える（FR-022a）
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { CART_STORAGE_KEY, CartProvider, useCart } from "@/lib/cartContext";

function setup() {
  return renderHook(() => useCart(), { wrapper: CartProvider });
}

beforeEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe("addItem", () => {
  it("新規の書籍は数量1で追加される", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    act(() => result.current.addItem(1));

    expect(result.current.items).toEqual([{ bookId: 1, quantity: 1 }]);
    expect(result.current.totalQuantity).toBe(1);
  });

  it("同一書籍を再度追加すると行は増えず数量が1加算される", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    act(() => result.current.addItem(1));
    act(() => result.current.addItem(1));
    act(() => result.current.addItem(1));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({ bookId: 1, quantity: 3 });
    expect(result.current.totalQuantity).toBe(3);
  });

  it("異なる書籍はそれぞれ別の行になる", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    act(() => result.current.addItem(1));
    act(() => result.current.addItem(2));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalQuantity).toBe(2);
  });
});

describe("setQuantity", () => {
  it("数量を変更できる", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    act(() => result.current.addItem(1));
    act(() => result.current.setQuantity(1, 5));

    expect(result.current.items[0].quantity).toBe(5);
  });

  it("数量0でカートから自動削除される", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    act(() => result.current.addItem(1));
    act(() => result.current.addItem(2));
    act(() => result.current.setQuantity(1, 0));

    expect(result.current.items).toEqual([{ bookId: 2, quantity: 1 }]);
  });

  it("負の数量でも削除として扱う", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    act(() => result.current.addItem(1));
    act(() => result.current.setQuantity(1, -3));

    expect(result.current.items).toEqual([]);
  });

  it("数量に上限を設けない", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    act(() => result.current.addItem(1));
    act(() => result.current.setQuantity(1, 100000));

    expect(result.current.items[0].quantity).toBe(100000);
    expect(result.current.totalQuantity).toBe(100000);
  });
});

describe("removeItem / clearCart", () => {
  it("明示的な削除で行が消える", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    act(() => result.current.addItem(1));
    act(() => result.current.setQuantity(1, 3));
    act(() => result.current.removeItem(1));

    expect(result.current.items).toEqual([]);
  });

  it("clearCart で localStorage からも削除される", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    act(() => result.current.addItem(1));
    await waitFor(() =>
      expect(window.localStorage.getItem(CART_STORAGE_KEY)).not.toBeNull(),
    );

    act(() => result.current.clearCart());

    expect(result.current.items).toEqual([]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });
});

describe("永続化と復元", () => {
  it("保存済みのカートを復元する", async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { bookId: 1, quantity: 2 },
        { bookId: 5, quantity: 3 },
      ]),
    );

    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalQuantity).toBe(5);
  });

  it("壊れた保存値は空のカートとして扱う", async () => {
    window.localStorage.setItem(CART_STORAGE_KEY, "{ではないJSON");

    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    expect(result.current.items).toEqual([]);
  });

  it("不正な要素を含む保存値はその要素だけ捨てる", async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { bookId: 1, quantity: 2 },
        { bookId: "x", quantity: 1 },
        { bookId: 3, quantity: 0 },
      ]),
    );

    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    expect(result.current.items).toEqual([{ bookId: 1, quantity: 2 }]);
  });

  it("localStorage が読めなくても動作を継続する", async () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("localStorage は利用できません");
    });

    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    expect(result.current.items).toEqual([]);
  });

  it("localStorage に書けなくてもメモリ上のカートとして継続する", async () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const { result } = setup();
    await waitFor(() => expect(result.current.isRestored).toBe(true));

    act(() => result.current.addItem(1));

    expect(result.current.items).toEqual([{ bookId: 1, quantity: 1 }]);
    expect(result.current.totalQuantity).toBe(1);
  });
});
