import { addItem, increaseQuantity, decreaseQuantity, removeItem, cartTotal, CartItem } from '@/lib/cart';

const bookA = { id: 1, title: 'Book A', price: 1000 };
const bookB = { id: 2, title: 'Book B', price: 500 };

describe('cart logic', () => {
  it('adds a new book with quantity 1', () => {
    const items = addItem([], bookA);
    expect(items).toEqual([{ bookId: 1, title: 'Book A', price: 1000, quantity: 1 }]);
  });

  it('increments quantity when the same book is added again instead of creating a new row (FR-021)', () => {
    const items = addItem(addItem([], bookA), bookA);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('does not go below quantity 1 when decreasing (FR-022)', () => {
    const items: CartItem[] = [{ bookId: 1, title: 'Book A', price: 1000, quantity: 1 }];
    expect(decreaseQuantity(items, 1)[0].quantity).toBe(1);
  });

  it('increases and decreases quantity within bounds', () => {
    let items: CartItem[] = [{ bookId: 1, title: 'Book A', price: 1000, quantity: 1 }];
    items = increaseQuantity(items, 1);
    expect(items[0].quantity).toBe(2);
    items = decreaseQuantity(items, 1);
    expect(items[0].quantity).toBe(1);
  });

  it('removes an item from the cart', () => {
    const items: CartItem[] = [{ bookId: 1, title: 'Book A', price: 1000, quantity: 1 }];
    expect(removeItem(items, 1)).toEqual([]);
  });

  it('computes the total across multiple items', () => {
    const items = addItem(addItem([], bookA), bookB);
    expect(cartTotal(items)).toBe(1500);
  });
});
