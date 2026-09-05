import {
  addItem,
  clear,
  readCart,
  removeItem,
  setQuantity,
  CART_STORAGE_KEY,
  MAX_QUANTITY,
} from "@/lib/cart";

describe("cart.addItem", () => {
  beforeEach(() => window.localStorage.clear());

  it("初回追加は数量1の新規明細になる", () => {
    addItem(1);
    expect(readCart()).toEqual([{ bookId: 1, quantity: 1 }]);
  });

  it("既存の書籍を追加すると数量が+1される（明細は増えない／CL-002）", () => {
    addItem(1);
    addItem(1);
    expect(readCart()).toEqual([{ bookId: 1, quantity: 2 }]);
  });

  it("異なる書籍は別明細になる", () => {
    addItem(1);
    addItem(2);
    expect(readCart()).toHaveLength(2);
  });
});

describe("cart.clear", () => {
  beforeEach(() => window.localStorage.clear());

  it("カートを空にする（注文確定後 / CL-004）", () => {
    addItem(1);
    clear();
    expect(readCart()).toEqual([]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });
});

describe("cart.setQuantity（US2）", () => {
  beforeEach(() => window.localStorage.clear());

  it("指定した数量に更新する", () => {
    addItem(1);
    setQuantity(1, 5);
    expect(readCart()).toEqual([{ bookId: 1, quantity: 5 }]);
  });

  it("下限1にクランプする（0以下を指定しても1になる）", () => {
    addItem(1);
    setQuantity(1, 0);
    expect(readCart()).toEqual([{ bookId: 1, quantity: 1 }]);
  });

  it(`上限${MAX_QUANTITY}にクランプする`, () => {
    addItem(1);
    setQuantity(1, MAX_QUANTITY + 50);
    expect(readCart()).toEqual([{ bookId: 1, quantity: MAX_QUANTITY }]);
  });
});

describe("cart.removeItem（US2）", () => {
  beforeEach(() => window.localStorage.clear());

  it("指定した書籍だけ取り除く", () => {
    addItem(1);
    addItem(2);
    removeItem(1);
    expect(readCart()).toEqual([{ bookId: 2, quantity: 1 }]);
  });

  it("最後の1件を削除するとカートが空になる", () => {
    addItem(1);
    removeItem(1);
    expect(readCart()).toEqual([]);
  });
});

describe("cart.readCart（破損データからの復旧）", () => {
  beforeEach(() => window.localStorage.clear());

  it("壊れたJSONは空カートにフォールバックする", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, "{not json");
    expect(readCart()).toEqual([]);
  });

  it("配列でないデータは空カートにフォールバックする", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ foo: "bar" }));
    expect(readCart()).toEqual([]);
  });

  it("不正な要素（bookId が文字列等）は除外される", () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ bookId: "1", quantity: 2 }, { bookId: 3, quantity: 1 }]),
    );
    expect(readCart()).toEqual([{ bookId: 3, quantity: 1 }]);
  });
});
