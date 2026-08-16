import { test, expect } from "@playwright/test";

test.describe("カート画面 (003-cart-management)", () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前に、書籍を1冊カートに追加した状態を作る
    await page.goto("/");
    await page.locator('a[href^="/books/"]').first().click();
    await page.getByRole("button", { name: "カートに追加" }).click();
    await expect(page.getByRole("button", { name: "カートに追加しました" })).toBeVisible();
  });

  test("一覧・詳細画面からカートへの導線がある (FR-012)", async ({ page }) => {
    await page.getByRole("link", { name: "カート" }).click();
    await expect(page).toHaveURL("/cart");
    await expect(page.getByRole("heading", { name: "カート" })).toBeVisible();
  });

  test("カート画面に書名・単価・数量・小計・合計が表示される (FR-001, FR-002)", async ({ page }) => {
    await page.goto("/cart");

    await expect(page.locator(".cart-item")).toHaveCount(1);
    await expect(page.locator(".cart-item__title")).toBeVisible();
    await expect(page.locator(".cart-item__price")).toBeVisible();
    await expect(page.locator(".cart-item__quantity")).toHaveText("1");
    await expect(page.locator(".cart-total")).toContainText("合計:");
  });

  test("数量を増やすと小計・合計がその場で更新される (FR-003, FR-004)", async ({ page }) => {
    await page.goto("/cart");

    const priceText = await page.locator(".cart-item__price").textContent();
    const price = Number(priceText!.replace(/[^\d]/g, ""));

    await page.getByRole("button", { name: "数量を増やす" }).click();

    await expect(page.locator(".cart-item__quantity")).toHaveText("2");
    await expect(page.locator(".cart-item__subtotal")).toContainText(
      (price * 2).toLocaleString("ja-JP")
    );
  });

  test("数量が1のとき「−」ボタンは無効化されている (FR-009)", async ({ page }) => {
    await page.goto("/cart");

    await expect(page.getByRole("button", { name: "数量を減らす" })).toBeDisabled();
  });

  test("書籍を削除するとカートが空になり空状態が表示される (FR-005, FR-006)", async ({ page }) => {
    await page.goto("/cart");

    await page.getByRole("button", { name: "削除" }).click();

    await expect(page.getByText("カートに書籍がありません")).toBeVisible();
  });

  test("カートに書籍がある場合、注文手続きへ進める (FR-007)", async ({ page }) => {
    await page.goto("/cart");

    await expect(page.getByRole("link", { name: "注文手続きへ" })).toHaveAttribute(
      "href",
      "/order"
    );
  });

  test("カートが空の場合、注文手続きへボタンは無効化される (FR-011)", async ({ page }) => {
    await page.goto("/cart");
    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText("カートに書籍がありません")).toBeVisible();

    await expect(page.getByRole("link", { name: "注文手続きへ" })).toHaveCount(0);
  });

  test("数量増加ボタンはキーボード操作だけで押せる (WCAG 2.1 AA, 憲法セクション3)", async ({ page }) => {
    await page.goto("/cart");

    const increaseButton = page.getByRole("button", { name: "数量を増やす" });
    await increaseButton.focus();
    await expect(increaseButton).toBeFocused();

    await page.keyboard.press("Enter");

    await expect(page.locator(".cart-item__quantity")).toHaveText("2");
  });
});
