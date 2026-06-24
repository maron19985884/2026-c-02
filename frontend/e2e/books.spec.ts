import { test, expect } from '@playwright/test';

const API = 'http://localhost:4000';

const mockBooks = [
  {
    id: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    price: 3200,
    description: 'クリーンなコードを書くための実践的な指南書です。',
    image_url: 'https://placehold.co/240x320/2563eb/white?text=Clean+Code',
  },
  {
    id: 2,
    title: 'リーダブルコード',
    author: 'Dustin Boswell',
    price: 2640,
    description: '読みやすいコードを書くためのベストプラクティスを紹介します。',
    image_url: 'https://placehold.co/240x320/16a34a/white?text=Readable+Code',
  },
];

// ─── 書籍一覧ページ ───────────────────────────────────────────────────────────

test.describe('書籍一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/books`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      }),
    );
    await page.goto('/');
  });

  test('ページタイトルが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '書籍一覧' })).toBeVisible();
  });

  test('書籍が2冊表示される', async ({ page }) => {
    await expect(page.getByText('Clean Code')).toBeVisible();
    await expect(page.getByText('リーダブルコード')).toBeVisible();
  });

  test('著者名が表示される', async ({ page }) => {
    await expect(page.getByText('Robert C. Martin')).toBeVisible();
    await expect(page.getByText('Dustin Boswell')).toBeVisible();
  });

  test('価格が表示される', async ({ page }) => {
    await expect(page.getByText('¥3,200')).toBeVisible();
    await expect(page.getByText('¥2,640')).toBeVisible();
  });
});

// ─── 書籍詳細ページ ───────────────────────────────────────────────────────────

test.describe('書籍詳細ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/books`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks),
      }),
    );
    await page.route(`${API}/books/1`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks[0]),
      }),
    );
  });

  test('一覧から詳細ページに遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Clean Code').click();
    await expect(page).toHaveURL('/books/1');
  });

  test('書籍タイトルが表示される', async ({ page }) => {
    await page.goto('/books/1');
    await expect(page.getByRole('heading', { name: 'Clean Code' })).toBeVisible();
  });

  test('著者名・価格・説明が表示される', async ({ page }) => {
    await page.goto('/books/1');
    await expect(page.getByText('Robert C. Martin')).toBeVisible();
    await expect(page.getByText('¥3,200')).toBeVisible();
    await expect(page.getByText('クリーンなコードを書くための実践的な指南書です。')).toBeVisible();
  });

  test('「カートに追加」ボタンが表示される', async ({ page }) => {
    await page.goto('/books/1');
    await expect(page.getByRole('button', { name: 'カートに追加' })).toBeVisible();
  });

  test('カートに追加するとボタンが「追加しました!」に変わる', async ({ page }) => {
    await page.goto('/books/1');
    await page.getByRole('button', { name: 'カートに追加' }).click();
    await expect(page.getByRole('button', { name: '追加しました!' })).toBeVisible();
  });

  test('「← 一覧に戻る」ボタンで一覧に戻れる', async ({ page }) => {
    // 一覧ページ経由で遷移してブラウザ履歴を作る（router.back()に必要）
    await page.goto('/');
    await page.getByText('Clean Code').click();
    await expect(page).toHaveURL('/books/1');
    await page.getByRole('button', { name: '← 一覧に戻る' }).click();
    await expect(page).toHaveURL('/');
  });
});
