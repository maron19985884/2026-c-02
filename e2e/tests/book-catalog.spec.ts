import { test, expect } from "@playwright/test";

test.describe("商品一覧・商品詳細 (002-book-catalog-detail)", () => {
  test("一覧画面に販売中の書籍がグリッド表示される (FR-001, FR-002)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "商品一覧" })).toBeVisible();

    const cards = page.locator('a[href^="/books/"]');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("書籍をクリックすると商品詳細画面に遷移する (FR-003, FR-004)", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator('a[href^="/books/"]').first();
    const title = await firstCard.locator(".book-card__title").textContent();

    await firstCard.click();

    await expect(page).toHaveURL(/\/books\/\d+/);
    await expect(page.getByRole("heading", { name: title ?? "" })).toBeVisible();
    await expect(page.getByRole("link", { name: /一覧へ戻る/ })).toBeVisible();
  });

  test("カートに追加すると成功したことが画面上で分かる (FR-005)", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href^="/books/"]').first().click();

    await page.getByRole("button", { name: "カートに追加" }).click();

    await expect(page.getByRole("button", { name: "カートに追加しました" })).toBeVisible();
  });

  test("カートに追加後も一覧に戻って他の書籍を閲覧できる (FR-006)", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href^="/books/"]').first().click();
    await page.getByRole("button", { name: "カートに追加" }).click();

    await page.getByRole("link", { name: /一覧へ戻る/ }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "商品一覧" })).toBeVisible();
  });

  test("存在しない書籍IDに直接アクセスすると見つかりません状態になる (FR-009)", async ({ page }) => {
    await page.goto("/books/999999999");

    await expect(page.getByText("書籍が見つかりません")).toBeVisible();
    await expect(page.getByRole("link", { name: /一覧へ戻る/ })).toBeVisible();
  });

  test("カートに追加ボタンはキーボード操作だけで押せる (WCAG 2.1 AA, 憲法セクション3)", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href^="/books/"]').first().click();

    const addButton = page.getByRole("button", { name: "カートに追加" });
    await addButton.focus();
    await expect(addButton).toBeFocused();

    await page.keyboard.press("Enter");

    await expect(page.getByRole("button", { name: "カートに追加しました" })).toBeVisible();
  });
});
