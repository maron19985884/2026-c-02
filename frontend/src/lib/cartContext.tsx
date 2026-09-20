/**
 * カート状態と localStorage 永続化。
 *
 * 詳細設計書 DETAIL-004 §2.8 / research.md D-01 に対応。
 *
 * - 同一ブラウザで永続保持し、再訪時に復元する（FR-016）
 * - 端末・ブラウザを跨いで引き継がない（FR-016a。localStorage の性質で満たされる）
 * - 保持するのは { bookId, quantity } のみ。書名・価格は保存しない
 *   （表示のたびに API の最新値を使うため）
 * - localStorage が使えない環境ではメモリ上のカートとして動作を継続する（憲法§3）
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const CART_STORAGE_KEY = "cart";

export interface CartItem {
  bookId: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  /** 数量の合計。ヘッダーの件数に使う（FR-033） */
  totalQuantity: number;
  /** localStorage からの復元が終わったか（初回描画のちらつき対策） */
  isRestored: boolean;
  /** 書籍を追加する。既存行があれば数量を1加算する（FR-009） */
  addItem: (bookId: number) => void;
  /** 数量を設定する。0以下になった行は自動削除する（FR-011a） */
  setQuantity: (bookId: number, quantity: number) => void;
  /** 行を明示的に削除する（FR-012） */
  removeItem: (bookId: number) => void;
  /** カートを空にし、localStorage からも削除する（FR-022a） */
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** 保存値を読み出す。壊れている・読めない場合は空のカートとして扱う */
function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((entry): entry is CartItem => {
      if (typeof entry !== "object" || entry === null) return false;
      const { bookId, quantity } = entry as Partial<CartItem>;
      return (
        Number.isInteger(bookId) &&
        (bookId as number) > 0 &&
        Number.isInteger(quantity) &&
        (quantity as number) >= 1
      );
    });
  } catch {
    // プライベートウィンドウ等で localStorage が例外を投げる場合がある。
    // 画面を壊さず、メモリ上のカートとして継続する。
    return [];
  }
}

/**
 * 保存する。失敗しても画面を壊さない。
 *
 * 空のカートはキー自体を削除する。FR-022a が注文確定時に
 * 「復元対象のデータも破棄する」ことを求めており、空配列を書き残すと
 * 破棄したことにならないため。
 */
function writeStorage(items: CartItem[]): void {
  try {
    if (items.length === 0) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 書き込めない場合はメモリ上のカートとして継続する
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isRestored, setIsRestored] = useState(false);

  // 初回マウント時に復元する（FR-016）
  useEffect(() => {
    setItems(readStorage());
    setIsRestored(true);
  }, []);

  // 変更のたびに同期する。復元前に書き込むと空で上書きしてしまうため待つ
  useEffect(() => {
    if (!isRestored) return;
    writeStorage(items);
  }, [items, isRestored]);

  const addItem = useCallback((bookId: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.bookId === bookId);
      if (existing) {
        // 行を増やさず数量を1加算する（FR-009）
        return prev.map((item) =>
          item.bookId === bookId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { bookId, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((bookId: number, quantity: number) => {
    setItems((prev) => {
      // 0以下は削除として扱う（FR-011a）。上限は設けない（FR-011b）
      if (quantity <= 0) {
        return prev.filter((item) => item.bookId !== bookId);
      }
      return prev.map((item) =>
        item.bookId === bookId ? { ...item, quantity } : item,
      );
    });
  }, []);

  const removeItem = useCallback((bookId: number) => {
    setItems((prev) => prev.filter((item) => item.bookId !== bookId));
  }, []);

  // 空にすると同期用の useEffect が localStorage のキーごと削除する（FR-022a）
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalQuantity,
      isRestored,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [items, totalQuantity, isRestored, addItem, setQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart は CartProvider の内側で使用してください");
  }
  return context;
}
