import { generateOrderNumber } from '../../src/services/orderNumber';

describe('generateOrderNumber', () => {
  it('formats as ORD-YYYYMMDD-NNNN (research.md 6)', () => {
    const date = new Date(2026, 7, 5); // 2026-08-05 (月は0始まり)
    expect(generateOrderNumber(date, 1)).toBe('ORD-20260805-0001');
  });

  it('zero-pads the daily sequence to 4 digits', () => {
    const date = new Date(2026, 0, 1);
    expect(generateOrderNumber(date, 23)).toBe('ORD-20260101-0023');
  });
});
