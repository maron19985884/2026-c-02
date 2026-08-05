import { validateOrderInput, hasValidationErrors } from '../../src/services/orderValidation';

describe('validateOrderInput', () => {
  it('requires customerName, address, email and a non-empty items array (FR-012, FR-020)', () => {
    const errors = validateOrderInput({ customerName: '', address: '', email: '', items: [] });
    expect(errors).toEqual({
      customerName: 'REQUIRED',
      address: 'REQUIRED',
      email: 'REQUIRED',
      items: 'EMPTY',
    });
    expect(hasValidationErrors(errors)).toBe(true);
  });

  it('flags an invalid email format (FR-013)', () => {
    const errors = validateOrderInput({
      customerName: '山田太郎',
      address: '東京都',
      email: 'not-an-email',
      items: [{ bookId: 1, quantity: 1 }],
    });
    expect(errors).toEqual({ email: 'INVALID_FORMAT' });
  });

  it('passes with valid input', () => {
    const errors = validateOrderInput({
      customerName: '山田太郎',
      address: '東京都',
      email: 'taro@example.com',
      items: [{ bookId: 1, quantity: 1 }],
    });
    expect(hasValidationErrors(errors)).toBe(false);
  });
});
