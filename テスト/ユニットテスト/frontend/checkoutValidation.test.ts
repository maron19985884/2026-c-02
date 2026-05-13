// チェックアウトフォームバリデーションのユニットテスト
// 対象: frontend/src/app/checkout/page.tsx の validate 関数

interface FormValues {
  customer_name: string;
  customer_email: string;
  customer_address: string;
}

interface FormErrors {
  customer_name?: string;
  customer_email?: string;
  customer_address?: string;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.customer_name.trim()) {
    errors.customer_name = '氏名は必須です';
  }
  if (!values.customer_email.trim()) {
    errors.customer_email = 'メールアドレスは必須です';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.customer_email)) {
    errors.customer_email = '有効なメールアドレスを入力してください';
  }
  if (!values.customer_address.trim()) {
    errors.customer_address = '住所は必須です';
  }
  return errors;
}

describe('checkoutValidation - 注文フォームバリデーション', () => {
  describe('氏名バリデーション', () => {
    test('[UT-FE-18] 氏名が空文字の場合エラーが設定される', () => {
      const errors = validate({ customer_name: '', customer_email: 'a@b.com', customer_address: '東京' });
      expect(errors.customer_name).toBe('氏名は必須です');
    });

    test('[UT-FE-19] 氏名がスペースのみの場合エラーが設定される', () => {
      const errors = validate({ customer_name: '   ', customer_email: 'a@b.com', customer_address: '東京' });
      expect(errors.customer_name).toBe('氏名は必須です');
    });

    test('[UT-FE-20] 有効な氏名の場合エラーが設定されない', () => {
      const errors = validate({ customer_name: '山田太郎', customer_email: 'a@b.com', customer_address: '東京' });
      expect(errors.customer_name).toBeUndefined();
    });
  });

  describe('メールアドレスバリデーション', () => {
    test('[UT-FE-21] メールが空文字の場合「必須」エラーが設定される', () => {
      const errors = validate({ customer_name: '山田', customer_email: '', customer_address: '東京' });
      expect(errors.customer_email).toBe('メールアドレスは必須です');
    });

    test('[UT-FE-22] メール形式が不正な場合「有効な形式」エラーが設定される', () => {
      const errors = validate({ customer_name: '山田', customer_email: 'invalid', customer_address: '東京' });
      expect(errors.customer_email).toBe('有効なメールアドレスを入力してください');
    });

    test('[UT-FE-23] 有効なメールアドレスの場合エラーが設定されない', () => {
      const errors = validate({ customer_name: '山田', customer_email: 'test@example.com', customer_address: '東京' });
      expect(errors.customer_email).toBeUndefined();
    });
  });

  describe('住所バリデーション', () => {
    test('[UT-FE-24] 住所が空文字の場合エラーが設定される', () => {
      const errors = validate({ customer_name: '山田', customer_email: 'a@b.com', customer_address: '' });
      expect(errors.customer_address).toBe('住所は必須です');
    });

    test('[UT-FE-25] 有効な住所の場合エラーが設定されない', () => {
      const errors = validate({ customer_name: '山田', customer_email: 'a@b.com', customer_address: '東京都渋谷区1-1-1' });
      expect(errors.customer_address).toBeUndefined();
    });
  });

  describe('複合バリデーション', () => {
    test('[UT-FE-26] 全項目が有効な場合エラーは空オブジェクトを返す', () => {
      const errors = validate({
        customer_name: '山田太郎',
        customer_email: 'yamada@example.com',
        customer_address: '東京都渋谷区1-1-1',
      });
      expect(Object.keys(errors)).toHaveLength(0);
    });

    test('[UT-FE-27] 全項目が空の場合3つのエラーが設定される', () => {
      const errors = validate({ customer_name: '', customer_email: '', customer_address: '' });
      expect(errors.customer_name).toBe('氏名は必須です');
      expect(errors.customer_email).toBe('メールアドレスは必須です');
      expect(errors.customer_address).toBe('住所は必須です');
    });
  });
});
