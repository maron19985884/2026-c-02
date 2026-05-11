import React from "react";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../CartContext";

// localStorage モック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _getStore: () => store,
    _setStore: (s: Record<string, string>) => {
      store = s;
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// ---- useCart: CartProvider 外で呼んだ場合のエラー ----
describe("useCart: CartProvider の外で使用した場合", () => {
  it("CartProvider の外で useCart を呼ぶと Error を投げる", () => {
    // console.error を黙らせる
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart must be used within CartProvider"
    );
    consoleSpy.mockRestore();
  });
});

// ---- 初期状態 ----
describe("CartProvider: 初期状態", () => {
  it("items が空配列で、total が 0 であること", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });
});

// ---- localStorage からの初期読み込み ----
describe("CartProvider: localStorage からの初期読み込み", () => {
  it("localStorage に保存済みカートがある場合、マウント時に復元する", async () => {
    const saved = [
      { id: 1, title: "TypeScript 入門", author: "著者A", price: 2800, quantity: 2 },
    ];
    localStorageMock._setStore({ cart: JSON.stringify(saved) });
    localStorageMock.getItem.mockImplementation(
      (key: string) => localStorageMock._getStore()[key] ?? null
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    // useEffect は非同期なので act で完了を待つ
    await act(async () => {});

    expect(result.current.items).toEqual(saved);
  });

  it("localStorage の値が不正な JSON の場合、items は空配列のまま", async () => {
    localStorageMock.getItem.mockImplementation(() => "invalid-json{{{");

    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {});

    expect(result.current.items).toEqual([]);
  });

  it("localStorage に値がない場合、items は空配列のまま", async () => {
    localStorageMock.getItem.mockImplementation(() => null);

    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {});

    expect(result.current.items).toEqual([]);
  });
});

// ---- addItem ----
describe("addItem", () => {
  it("新しいアイテムを追加すると quantity が 1 になること", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      result.current.addItem({
        id: 1,
        title: "TypeScript 入門",
        author: "著者A",
        price: 2800,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({
      id: 1,
      title: "TypeScript 入門",
      author: "著者A",
      price: 2800,
      quantity: 1,
    });
  });

  it("既存のアイテムを addItem すると quantity が +1 され、他のアイテムは変わらないこと", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // 先に 2 つ追加しておく
    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
      result.current.addItem({ id: 2, title: "React 実践", author: "著者B", price: 3200 });
    });
    // id:1 を再度追加（id:2 は変わらないブランチもカバー）
    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.find((i) => i.id === 1)?.quantity).toBe(2);
    expect(result.current.items.find((i) => i.id === 2)?.quantity).toBe(1);
  });

  it("異なる id のアイテムは別々に追加されること", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
      result.current.addItem({ id: 2, title: "React 実践", author: "著者B", price: 3200 });
    });

    expect(result.current.items).toHaveLength(2);
  });
});

// ---- updateQuantity ----
describe("updateQuantity", () => {
  it("quantity を更新できること（複数アイテム中の対象アイテムだけ変わること）", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // 2 つ追加して id:1 だけ更新（id:2 は変わらないブランチもカバー）
    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
      result.current.addItem({ id: 2, title: "React 実践", author: "著者B", price: 3200 });
    });
    await act(async () => {
      result.current.updateQuantity(1, 5);
    });

    expect(result.current.items.find((i) => i.id === 1)?.quantity).toBe(5);
    expect(result.current.items.find((i) => i.id === 2)?.quantity).toBe(1);
  });

  it("quantity < 1 の場合は早期リターンし、quantity が変わらないこと", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
    });
    await act(async () => {
      result.current.updateQuantity(1, 0);
    });

    expect(result.current.items[0].quantity).toBe(1);
  });

  it("quantity = 1 は有効で更新されること", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
    });
    await act(async () => {
      result.current.updateQuantity(1, 1);
    });

    expect(result.current.items[0].quantity).toBe(1);
  });
});

// ---- removeItem ----
describe("removeItem", () => {
  it("指定した id のアイテムを削除できること", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
      result.current.addItem({ id: 2, title: "React 実践", author: "著者B", price: 3200 });
    });
    await act(async () => {
      result.current.removeItem(1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe(2);
  });

  it("存在しない id を removeItem しても items は変わらないこと", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
    });
    await act(async () => {
      result.current.removeItem(9999);
    });

    expect(result.current.items).toHaveLength(1);
  });
});

// ---- clearCart ----
describe("clearCart", () => {
  it("カートをすべてクリアすること", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
      result.current.addItem({ id: 2, title: "React 実践", author: "著者B", price: 3200 });
    });
    await act(async () => {
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });
});

// ---- total ----
describe("total", () => {
  it("price × quantity の合計を正しく計算すること", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
      result.current.addItem({ id: 2, title: "React 実践", author: "著者B", price: 3200 });
    });

    // id:1 quantity=2, id:2 quantity=1
    // total = 2800×2 + 3200×1 = 8800
    expect(result.current.total).toBe(8800);
  });
});

// ---- localStorage への書き込み ----
describe("localStorage への書き込み", () => {
  it("items が変化すると localStorage.setItem が呼ばれること", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "cart",
      expect.any(String)
    );
  });

  it("localStorage.setItem がエラーを投げても items は正常に更新されること", async () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("localStorage quota exceeded");
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      result.current.addItem({ id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 });
    });

    // エラーが catch されるので items は正常に更新される
    expect(result.current.items).toHaveLength(1);
  });
});
