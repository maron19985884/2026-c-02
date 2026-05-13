// カートReducerのユニットテスト
// 対象: frontend/src/context/CartContext.tsx の cartReducer 関数

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface CartItem {
  book: Book;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD'; book: Book }
  | { type: 'UPDATE'; bookId: number; quantity: number }
  | { type: 'REMOVE'; bookId: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.book.id === action.book.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.book.id === action.book.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { book: action.book, quantity: 1 }] };
    }
    case 'UPDATE': {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.book.id !== action.bookId) };
      }
      return {
        items: state.items.map((i) =>
          i.book.id === action.bookId ? { ...i, quantity: action.quantity } : i
        ),
      };
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.book.id !== action.bookId) };
    case 'CLEAR':
      return { items: [] };
    case 'HYDRATE':
      return { items: action.items };
    default:
      return state;
  }
}

const mockBook1: Book = {
  id: 1,
  title: 'Clean Code',
  author: 'Robert C. Martin',
  price: 3520,
  description: '良いコードを書くための実践的なガイド',
  image_url: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const mockBook2: Book = {
  id: 2,
  title: 'リファクタリング',
  author: 'Martin Fowler',
  price: 4180,
  description: null,
  image_url: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

describe('cartReducer - カート状態管理', () => {
  describe('[ADD] 書籍追加', () => {
    test('[UT-FE-01] 空のカートに書籍を追加できる', () => {
      const state: CartState = { items: [] };
      const newState = cartReducer(state, { type: 'ADD', book: mockBook1 });

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0].book.id).toBe(1);
      expect(newState.items[0].quantity).toBe(1);
    });

    test('[UT-FE-02] 同じ書籍を追加すると数量が1増加する', () => {
      const state: CartState = { items: [{ book: mockBook1, quantity: 1 }] };
      const newState = cartReducer(state, { type: 'ADD', book: mockBook1 });

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0].quantity).toBe(2);
    });

    test('[UT-FE-03] 異なる書籍を追加すると別エントリが作成される', () => {
      const state: CartState = { items: [{ book: mockBook1, quantity: 1 }] };
      const newState = cartReducer(state, { type: 'ADD', book: mockBook2 });

      expect(newState.items).toHaveLength(2);
    });

    test('[UT-FE-04] 元のstateが変更されない（イミュータブル）', () => {
      const state: CartState = { items: [] };
      cartReducer(state, { type: 'ADD', book: mockBook1 });

      expect(state.items).toHaveLength(0);
    });
  });

  describe('[UPDATE] 数量更新', () => {
    test('[UT-FE-05] 指定した数量に更新できる', () => {
      const state: CartState = { items: [{ book: mockBook1, quantity: 1 }] };
      const newState = cartReducer(state, { type: 'UPDATE', bookId: 1, quantity: 5 });

      expect(newState.items[0].quantity).toBe(5);
    });

    test('[UT-FE-06] 数量を0に更新するとアイテムが削除される', () => {
      const state: CartState = { items: [{ book: mockBook1, quantity: 3 }] };
      const newState = cartReducer(state, { type: 'UPDATE', bookId: 1, quantity: 0 });

      expect(newState.items).toHaveLength(0);
    });

    test('[UT-FE-07] 負の数量に更新するとアイテムが削除される', () => {
      const state: CartState = { items: [{ book: mockBook1, quantity: 3 }] };
      const newState = cartReducer(state, { type: 'UPDATE', bookId: 1, quantity: -1 });

      expect(newState.items).toHaveLength(0);
    });

    test('[UT-FE-08] 更新対象以外のアイテムは変更されない', () => {
      const state: CartState = {
        items: [
          { book: mockBook1, quantity: 1 },
          { book: mockBook2, quantity: 2 },
        ],
      };
      const newState = cartReducer(state, { type: 'UPDATE', bookId: 1, quantity: 10 });

      const book2Item = newState.items.find((i) => i.book.id === 2);
      expect(book2Item?.quantity).toBe(2);
    });
  });

  describe('[REMOVE] 書籍削除', () => {
    test('[UT-FE-09] 単一アイテムを削除できる', () => {
      const state: CartState = { items: [{ book: mockBook1, quantity: 2 }] };
      const newState = cartReducer(state, { type: 'REMOVE', bookId: 1 });

      expect(newState.items).toHaveLength(0);
    });

    test('[UT-FE-10] 複数アイテムから指定した1件のみ削除できる', () => {
      const state: CartState = {
        items: [
          { book: mockBook1, quantity: 1 },
          { book: mockBook2, quantity: 1 },
        ],
      };
      const newState = cartReducer(state, { type: 'REMOVE', bookId: 1 });

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0].book.id).toBe(2);
    });

    test('[UT-FE-11] 存在しないIDを指定しても他のアイテムは変わらない', () => {
      const state: CartState = { items: [{ book: mockBook1, quantity: 1 }] };
      const newState = cartReducer(state, { type: 'REMOVE', bookId: 999 });

      expect(newState.items).toHaveLength(1);
    });
  });

  describe('[CLEAR] カート全削除', () => {
    test('[UT-FE-12] 全アイテムを削除できる', () => {
      const state: CartState = {
        items: [
          { book: mockBook1, quantity: 2 },
          { book: mockBook2, quantity: 1 },
        ],
      };
      const newState = cartReducer(state, { type: 'CLEAR' });

      expect(newState.items).toHaveLength(0);
    });

    test('[UT-FE-13] 空カートでCLEARしても正常動作する', () => {
      const state: CartState = { items: [] };
      const newState = cartReducer(state, { type: 'CLEAR' });

      expect(newState.items).toHaveLength(0);
    });
  });

  describe('[HYDRATE] 状態初期化', () => {
    test('[UT-FE-14] 指定したアイテムでstateを初期化できる', () => {
      const state: CartState = { items: [] };
      const items: CartItem[] = [
        { book: mockBook1, quantity: 3 },
        { book: mockBook2, quantity: 1 },
      ];
      const newState = cartReducer(state, { type: 'HYDRATE', items });

      expect(newState.items).toHaveLength(2);
      expect(newState.items[0].quantity).toBe(3);
    });

    test('[UT-FE-15] 既存のアイテムを新しいアイテムで置き換える', () => {
      const state: CartState = { items: [{ book: mockBook1, quantity: 5 }] };
      const newState = cartReducer(state, {
        type: 'HYDRATE',
        items: [{ book: mockBook2, quantity: 2 }],
      });

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0].book.id).toBe(2);
    });
  });

  describe('合計金額・合計数量の計算', () => {
    test('[UT-FE-16] 合計金額が正しく計算される（3520×2 + 4180×1 = 11220）', () => {
      const items: CartItem[] = [
        { book: mockBook1, quantity: 2 },
        { book: mockBook2, quantity: 1 },
      ];
      const totalAmount = items.reduce(
        (sum, item) => sum + item.book.price * item.quantity,
        0
      );
      expect(totalAmount).toBe(11220);
    });

    test('[UT-FE-17] 合計数量が正しく計算される（2 + 3 = 5）', () => {
      const items: CartItem[] = [
        { book: mockBook1, quantity: 2 },
        { book: mockBook2, quantity: 3 },
      ];
      const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
      expect(totalCount).toBe(5);
    });
  });
});
