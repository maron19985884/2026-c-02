import { test, expect, Page } from '@playwright/test';

const API = 'http://localhost:4000';

const mockBook1 = {
  id: 1,
  title: 'Clean Code',
  author: 'Robert C. Martin',
  price: 3200,
  description: 'クリーンなコードを書くための実践的な指南書です。',
  image_url: 'https://placehold.co/240x320/2563eb/white?text=Clean+Code',
};

const mockBook2 = {
  id: 2,
  title: 'リーダブルコード',
  author: 'Dustin Boswell',
  price: 2640,
  description: '読みやすいコードを書くためのベストプラクティスを紹介します。',
  image_url: 'https://placehold.co/240x320/16a34a/white?text=Readable+Code',
};

/**
 * 書籍詳細ページでカートに追加し、ヘッダーのカートリンクを
 * クリックして /cart へ SPA 遷移するヘルパー。
 *
 * ポイント：page.goto('/cart') はフルリロードで CartProvider が
 * 再マウントされるため、useEffect([items]) が items=[] で
 * localStorage を上書きしてしまう。
 * SPA ナビゲーション（Next.js Link）は layout を保持するため
 * CartProvider の state がそのまま引き継がれる。
 */
async function addToCartAndGo(page: Page, bookId: number, mockBook: typeof mockBook1) {
  await page.route(`${API}/books/${bookId}`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockBook),
    }),
  );
  await page.goto(`/books/${bookId}`);
  await page.getByRole('button', { name: 'カートに追加' }).click();
  await expect(page.getByRole('button', { name: '追加しました!' })).toBeVisible();
  // ヘッダーの「カート」をクリック → SPA 遷移（CartProvider 再マウントなし）
  await page.locator('header').getByRole('link', { name: /カート/ }).click();
  await expect(page).toHaveURL('/cart');
}

// ─── カートページ ─────────────────────────────────────────────────────────────

test.describe('カートページ', () => {
  test('カートが空の場合「カートは空です」と表示される', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText('カートは空です')).toBeVisible();
  });

  test('カートが空のとき「書籍一覧へ」リンクが表示される', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByRole('button', { name: '書籍一覧へ' })).toBeVisible();
  });

  test('カートに追加した商品が表示される', async ({ page }) => {
    await addToCartAndGo(page, 1, mockBook1);
    await expect(page.getByText('Clean Code')).toBeVisible();
    await expect(page.getByText('Robert C. Martin')).toBeVisible();
  });

  test('カートの合計金額が正しく表示される', async ({ page }) => {
    await addToCartAndGo(page, 1, mockBook1);
    // ¥3,200 が合計として表示される
    await expect(page.getByText('¥3,200').first()).toBeVisible();
  });

  test('「＋」ボタンで数量を増やせる', async ({ page }) => {
    await addToCartAndGo(page, 1, mockBook1);
    await page.getByRole('button', { name: '＋' }).click();
    // 合計が ¥6,400 になる（数量2 × ¥3,200）
    await expect(page.getByText('¥6,400').first()).toBeVisible();
  });

  test('「−」ボタンで数量を減らせる（1→0で削除される）', async ({ page }) => {
    await addToCartAndGo(page, 1, mockBook1);
    await page.getByRole('button', { name: '−' }).click();
    await expect(page.getByText('カートは空です')).toBeVisible();
  });

  test('「削除」ボタンでカートから削除できる', async ({ page }) => {
    await addToCartAndGo(page, 1, mockBook1);
    await page.getByRole('button', { name: '削除' }).click();
    await expect(page.getByText('カートは空です')).toBeVisible();
  });

  test('「注文へ進む」ボタンで注文ページに遷移できる', async ({ page }) => {
    await addToCartAndGo(page, 1, mockBook1);
    await page.getByRole('button', { name: '注文へ進む' }).click();
    await expect(page).toHaveURL('/order');
  });
});

// ─── ヘッダーのカートバッジ ───────────────────────────────────────────────────

test.describe('ヘッダーのカートバッジ', () => {
  test('商品を追加するとヘッダーのバッジが更新される', async ({ page }) => {
    await page.route(`${API}/books/1`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBook1),
      }),
    );
    await page.goto('/books/1');
    await page.getByRole('button', { name: 'カートに追加' }).click();
    await expect(page.getByRole('button', { name: '追加しました!' })).toBeVisible();
    await expect(page.locator('header').getByText('1')).toBeVisible();
  });

  test('2種類の商品を追加するとバッジが2になる', async ({ page }) => {
    // 1冊目を追加
    await page.route(`${API}/books/1`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBook1),
      }),
    );
    await page.goto('/books/1');
    await page.getByRole('button', { name: 'カートに追加' }).click();
    await expect(page.locator('header').getByText('1')).toBeVisible();

    // 2冊目を追加（SPA 遷移で CartProvider を再マウントしない）
    await page.route(`${API}/books/2`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBook2),
      }),
    );
    await page.route(`${API}/books`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockBook1, mockBook2]),
      }),
    );
    // 一覧へ戻って2冊目の詳細へ SPA 遷移
    await page.locator('header').getByRole('link', { name: 'BookStore' }).click();
    await expect(page).toHaveURL('/');
    await page.getByText('リーダブルコード').click();
    await expect(page).toHaveURL('/books/2');
    await page.getByRole('button', { name: 'カートに追加' }).click();
    await expect(page.locator('header').getByText('2')).toBeVisible();
  });
});
