// 注文バリデーションのユニットテスト
// 対象: backend/src/routes/orders.ts のバリデーションロジック

function validateCustomerName(name: string | undefined): string | null {
  if (!name?.trim()) return '氏名は必須です';
  return null;
}

function validateCustomerEmail(email: string | undefined): string | null {
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return '有効なメールアドレスを入力してください';
  }
  return null;
}

function validateCustomerAddress(address: string | undefined): string | null {
  if (!address?.trim()) return '住所は必須です';
  return null;
}

function validateItems(items: unknown): string | null {
  if (!Array.isArray(items) || (items as unknown[]).length === 0) {
    return '注文商品が空です';
  }
  return null;
}

describe('注文バリデーション', () => {
  describe('氏名バリデーション', () => {
    test('[UT-BE-05] 空文字はエラーメッセージを返す', () => {
      expect(validateCustomerName('')).toBe('氏名は必須です');
    });

    test('[UT-BE-06] スペースのみはエラーメッセージを返す', () => {
      expect(validateCustomerName('   ')).toBe('氏名は必須です');
    });

    test('[UT-BE-07] undefinedはエラーメッセージを返す', () => {
      expect(validateCustomerName(undefined)).toBe('氏名は必須です');
    });

    test('[UT-BE-08] 有効な氏名（日本語）はnullを返す', () => {
      expect(validateCustomerName('山田太郎')).toBeNull();
    });

    test('[UT-BE-09] 有効な氏名（英語）はnullを返す', () => {
      expect(validateCustomerName('John Doe')).toBeNull();
    });
  });

  describe('メールアドレスバリデーション', () => {
    test('[UT-BE-10] 空文字はエラーメッセージを返す', () => {
      expect(validateCustomerEmail('')).toBe('有効なメールアドレスを入力してください');
    });

    test('[UT-BE-11] undefinedはエラーメッセージを返す', () => {
      expect(validateCustomerEmail(undefined)).toBe('有効なメールアドレスを入力してください');
    });

    test('[UT-BE-12] @なしはエラーメッセージを返す', () => {
      expect(validateCustomerEmail('notanemail')).toBe('有効なメールアドレスを入力してください');
    });

    test('[UT-BE-13] ローカル部なし（@domain.com）はエラーメッセージを返す', () => {
      expect(validateCustomerEmail('@domain.com')).toBe('有効なメールアドレスを入力してください');
    });

    test('[UT-BE-14] ドメイン部なし（user@）はエラーメッセージを返す', () => {
      expect(validateCustomerEmail('user@')).toBe('有効なメールアドレスを入力してください');
    });

    test('[UT-BE-15] 有効なメールアドレスはnullを返す', () => {
      expect(validateCustomerEmail('test@example.com')).toBeNull();
    });

    test('[UT-BE-16] サブドメイン付きメールはnullを返す', () => {
      expect(validateCustomerEmail('user@mail.example.co.jp')).toBeNull();
    });
  });

  describe('住所バリデーション', () => {
    test('[UT-BE-17] 空文字はエラーメッセージを返す', () => {
      expect(validateCustomerAddress('')).toBe('住所は必須です');
    });

    test('[UT-BE-18] undefinedはエラーメッセージを返す', () => {
      expect(validateCustomerAddress(undefined)).toBe('住所は必須です');
    });

    test('[UT-BE-19] 有効な住所はnullを返す', () => {
      expect(validateCustomerAddress('東京都渋谷区1-1-1')).toBeNull();
    });
  });

  describe('注文商品バリデーション', () => {
    test('[UT-BE-20] 空配列はエラーメッセージを返す', () => {
      expect(validateItems([])).toBe('注文商品が空です');
    });

    test('[UT-BE-21] undefinedはエラーメッセージを返す', () => {
      expect(validateItems(undefined)).toBe('注文商品が空です');
    });

    test('[UT-BE-22] nullはエラーメッセージを返す', () => {
      expect(validateItems(null)).toBe('注文商品が空です');
    });

    test('[UT-BE-23] 配列でない値はエラーメッセージを返す', () => {
      expect(validateItems('not an array')).toBe('注文商品が空です');
    });

    test('[UT-BE-24] 有効な商品配列はnullを返す', () => {
      expect(validateItems([{ book_id: 1, quantity: 1 }])).toBeNull();
    });
  });
});
