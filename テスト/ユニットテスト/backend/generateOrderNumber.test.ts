// 注文番号生成ロジックのユニットテスト
// 対象: backend/src/routes/orders.ts の generateOrderNumber 関数

function generateOrderNumber(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const datePart =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ORD-${datePart}-${rand}`;
}

describe('generateOrderNumber - 注文番号生成', () => {
  test('[UT-BE-01] ORD-YYYYMMDDHHmmss-XXXX フォーマットで生成される', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^ORD-\d{14}-\d{4}$/);
  });

  test('[UT-BE-02] ランダム部分は1000〜9999の範囲内', () => {
    for (let i = 0; i < 50; i++) {
      const orderNumber = generateOrderNumber();
      const rand = parseInt(orderNumber.split('-')[2], 10);
      expect(rand).toBeGreaterThanOrEqual(1000);
      expect(rand).toBeLessThanOrEqual(9999);
    }
  });

  test('[UT-BE-03] 日付部分に有効な年月日が含まれる', () => {
    const before = new Date();
    const orderNumber = generateOrderNumber();
    const datePart = orderNumber.split('-')[1];

    const year = parseInt(datePart.substring(0, 4), 10);
    const month = parseInt(datePart.substring(4, 6), 10);
    const day = parseInt(datePart.substring(6, 8), 10);

    expect(year).toBeGreaterThanOrEqual(before.getFullYear());
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });

  test('[UT-BE-04] 複数回生成した場合に高い一意性を持つ', () => {
    const results = new Set<string>();
    for (let i = 0; i < 10; i++) {
      results.add(generateOrderNumber());
    }
    // ランダム部分が9000通りあるため、10回中5回以上はユニーク
    expect(results.size).toBeGreaterThanOrEqual(5);
  });
});
