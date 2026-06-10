import { test, expect, Page } from '@playwright/test';

const API = 'http://localhost:4000';

const mockBook = {
  id: 1,
  title: 'Clean Code',
  author: 'Robert C. Martin',
  price: 3200,
  description: 'クリーンなコードを書くための実践的な指南書です。',
  image_url: 'https://placehold.co/240x320/2563eb/white?text=Clean+Code',
};

/**
 * 書籍をカートに追加して注文フォームページへ遷移するヘルパー。
 * SPA ナビゲーション（Link クリック）で CartProvider を再マウントせず
 * React state をそのまま引き継ぐ。
 */
async function setupOrderPage(page: Page) {
  await page.route(`${API}/books/1`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockBook),
    }),
  );
  // 書籍詳細ページでカートに追加
  await page.goto('/books/1');
  await page.getByRole('button', { name: 'カートに追加' }).click();
  await expect(page.getByRole('button', { name: '追加しました!' })).toBeVisible();
  // ヘッダー → カートへ SPA 遷移
  await page.locator('header').getByRole('link', { name: /カート/ }).click();
  await expect(page).toHaveURL('/cart');
  // カートページ → 注文フォームへ SPA 遷移
  await page.getByRole('button', { name: '注文へ進む' }).click();
  await expect(page).toHaveURL('/order');
}

// ─── 注文フォームページ ───────────────────────────────────────────────────────

test.describe('注文フォームページ', () => {
  test('カートが空のとき「カートに商品がありません」と表示される', async ({ page }) => {
    await page.goto('/order');
    await expect(page.getByText('カートに商品がありません')).toBeVisible();
  });

  test('注文ページに注文内容が表示される', async ({ page }) => {
    await setupOrderPage(page);
    await expect(page.getByText('Clean Code × 1')).toBeVisible();
    await expect(page.getByText('¥3,200').first()).toBeVisible();
  });

  test('注文フォームの入力欄が表示される', async ({ page }) => {
    await setupOrderPage(page);
    await expect(page.getByPlaceholder('山田 太郎')).toBeVisible();
    await expect(page.getByPlaceholder('東京都千代田区...')).toBeVisible();
    await expect(page.getByPlaceholder('example@mail.com')).toBeVisible();
  });

  test('未入力で送信するとエラーメッセージが表示される', async ({ page }) => {
    await setupOrderPage(page);
    await page.getByRole('button', { name: '注文を確定する' }).click();
    await expect(page.getByText('すべての項目を入力してください')).toBeVisible();
  });

  test('氏名だけ入力して送信してもエラーになる', async ({ page }) => {
    await setupOrderPage(page);
    await page.getByPlaceholder('山田 太郎').fill('山田 太郎');
    await page.getByRole('button', { name: '注文を確定する' }).click();
    await expect(page.getByText('すべての項目を入力してください')).toBeVisible();
  });
});

// ─── 注文完了フロー ───────────────────────────────────────────────────────────

test.describe('注文完了フロー', () => {
  test('フォームに入力して送信すると注文完了ページに遷移する', async ({ page }) => {
    await page.route(`${API}/orders`, route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          order_number: 'ORD-20260527-ABC123',
          total_amount: 3200,
        }),
      }),
    );

    await setupOrderPage(page);
    await page.getByPlaceholder('山田 太郎').fill('山田 太郎');
    await page.getByPlaceholder('東京都千代田区...').fill('東京都千代田区1-1-1');
    await page.getByPlaceholder('example@mail.com').fill('yamada@example.com');
    await page.getByRole('button', { name: '注文を確定する' }).click();

    await expect(page).toHaveURL(/\/order\/complete/);
  });

  test('注文完了ページに注文番号が表示される', async ({ page }) => {
    await page.route(`${API}/orders`, route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          order_number: 'ORD-20260527-ABC123',
          total_amount: 3200,
        }),
      }),
    );

    await setupOrderPage(page);
    await page.getByPlaceholder('山田 太郎').fill('山田 太郎');
    await page.getByPlaceholder('東京都千代田区...').fill('東京都千代田区1-1-1');
    await page.getByPlaceholder('example@mail.com').fill('yamada@example.com');
    await page.getByRole('button', { name: '注文を確定する' }).click();

    await expect(page.getByText('ORD-20260527-ABC123')).toBeVisible();
    await expect(page.getByText('¥3,200')).toBeVisible();
    await expect(page.getByText('ご注文ありがとうございます')).toBeVisible();
  });

  test('注文完了後、カートが空になる', async ({ page }) => {
    await page.route(`${API}/orders`, route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          order_number: 'ORD-20260527-ABC123',
          total_amount: 3200,
        }),
      }),
    );

    await setupOrderPage(page);
    await page.getByPlaceholder('山田 太郎').fill('山田 太郎');
    await page.getByPlaceholder('東京都千代田区...').fill('東京都千代田区1-1-1');
    await page.getByPlaceholder('example@mail.com').fill('yamada@example.com');
    await page.getByRole('button', { name: '注文を確定する' }).click();
    await expect(page).toHaveURL(/\/order\/complete/);

    // 注文完了後、ヘッダーのカートバッジが消える（SPA 状態確認）
    await expect(page.locator('header span')).not.toBeVisible();
  });

  test('注文完了ページから書籍一覧へ戻れる', async ({ page }) => {
    await page.goto('/order/complete?order_number=ORD-20260527-ABC123&total=3200');
    await page.getByRole('button', { name: '書籍一覧へ戻る' }).click();
    await expect(page).toHaveURL('/');
  });

  test('APIエラー時にエラーメッセージが表示される', async ({ page }) => {
    await page.route(`${API}/orders`, route =>
      route.fulfill({ status: 500, body: 'Internal Server Error' }),
    );

    await setupOrderPage(page);
    await page.getByPlaceholder('山田 太郎').fill('山田 太郎');
    await page.getByPlaceholder('東京都千代田区...').fill('東京都千代田区1-1-1');
    await page.getByPlaceholder('example@mail.com').fill('yamada@example.com');
    await page.getByRole('button', { name: '注文を確定する' }).click();

    await expect(page.getByText('注文に失敗しました。もう一度お試しください。')).toBeVisible();
  });
});

// ─── 注文完了ページ（直接アクセス）────────────────────────────────────────────

test.describe('注文完了ページ', () => {
  test('URLパラメータから注文番号と合計金額が表示される', async ({ page }) => {
    await page.goto('/order/complete?order_number=ORD-20260527-XYZ999&total=6400');
    await expect(page.getByText('ORD-20260527-XYZ999')).toBeVisible();
    await expect(page.getByText('¥6,400')).toBeVisible();
  });

  test('✅アイコンとタイトルが表示される', async ({ page }) => {
    await page.goto('/order/complete?order_number=ORD-TEST-001&total=1000');
    await expect(page.getByText('✅')).toBeVisible();
    await expect(page.getByText('ご注文ありがとうございます')).toBeVisible();
  });
});
