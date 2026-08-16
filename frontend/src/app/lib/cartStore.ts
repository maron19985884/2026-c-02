const STORAGE_KEY = "cart";

export type CartItem = {
  bookId: number;
  quantity: number;
};

export function getItems(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export function addItem(bookId: number): boolean {
  const items = getItems();
  const existing = items.find((item) => item.bookId === bookId);

  const updated = existing
    ? items.map((item) =>
        item.bookId === bookId ? { ...item, quantity: item.quantity + 1 } : item
      )
    : [...items, { bookId, quantity: 1 }];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    // localStorageへの書き込みに失敗しても画面をクラッシュさせない（容量超過・ストレージ無効化等）
    return false;
  }
}
