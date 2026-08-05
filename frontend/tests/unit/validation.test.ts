import { validateOrderForm, hasFormErrors } from '@/lib/validation';

describe('validateOrderForm', () => {
  it('requires customerName, address and email (FR-012, FR-013)', () => {
    const errors = validateOrderForm({ customerName: '', address: '', email: '' });
    expect(errors.customerName).toBeDefined();
    expect(errors.address).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(hasFormErrors(errors)).toBe(true);
  });

  it('flags an invalid email format (FR-013)', () => {
    const errors = validateOrderForm({ customerName: '山田太郎', address: '東京都', email: 'not-an-email' });
    expect(errors.email).toBeDefined();
  });

  it('passes with valid input', () => {
    const errors = validateOrderForm({ customerName: '山田太郎', address: '東京都', email: 'taro@example.com' });
    expect(hasFormErrors(errors)).toBe(false);
  });
});
