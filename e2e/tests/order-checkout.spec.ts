import { test, expect } from "@playwright/test";

test.describe("注文フォーム・注文完了画面 (004-order-checkout)", () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前に、書籍を1冊カートに追加し、注文フォーム画面まで遷移する
    await page.goto("/");
    await page.locator('a[href^="/books/"]').first().click();
    await page.getByRole("button", { name: "カートに追加" }).click();
    await expect(page.getByRole("button", { name: "カートに追加しました" })).toBeVisible();

    await page.getByRole("link", { name: "カート" }).click();
    await page.getByRole("link", { name: "注文手続きへ" }).click();
    await expect(page).toHaveURL("/order");
  });

  test("注文商品と合計金額、氏名・住所・メールアドレスの入力欄が表示される (US1)", async ({
    page,
  }) => {
    await expect(page.locator(".order-summary__item")).toHaveCount(1);
    await expect(page.locator(".order-summary__total")).toContainText("合計:");

    await expect(page.getByLabel("氏名")).toBeVisible();
    await expect(page.getByLabel("住所")).toBeVisible();
    await expect(page.getByLabel("メールアドレス")).toBeVisible();
  });

  test("未入力のまま「注文する」を押すとエラーが表示され、画面に留まる (US2)", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "注文する" }).click();

    await expect(page.getByText("氏名を入力してください")).toBeVisible();
    await expect(page).toHaveURL("/order");
  });

  test("メールアドレスの形式が不正だとエラーが表示され、画面に留まる (US2)", async ({ page }) => {
    await page.getByLabel("氏名").fill("山田太郎");
    await page.getByLabel("住所").fill("東京都千代田区1-1-1");
    await page.getByLabel("メールアドレス").fill("invalid-email");
    await page.getByRole("button", { name: "注文する" }).click();

    await expect(page.getByText("メールアドレスの形式が正しくありません")).toBeVisible();
    await expect(page).toHaveURL("/order");
  });

  test("すべて正しく入力すると注文完了画面へ遷移し、注文番号が表示される (US2, US3)", async ({
    page,
  }) => {
    await page.getByLabel("氏名").fill("山田太郎");
    await page.getByLabel("住所").fill("東京都千代田区1-1-1");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByRole("button", { name: "注文する" }).click();

    await expect(page).toHaveURL(/\/order\/complete\?orderNumber=ORD-\d+/);
    await expect(page.getByText("ご注文ありがとうございました")).toBeVisible();
    await expect(page.locator(".order-complete__order-number")).toContainText("ORD-");
  });

  test("注文完了画面の「商品一覧へ戻る」リンクで商品一覧に戻れる (US3)", async ({ page }) => {
    await page.getByLabel("氏名").fill("山田太郎");
    await page.getByLabel("住所").fill("東京都千代田区1-1-1");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByRole("button", { name: "注文する" }).click();

    await expect(page).toHaveURL(/\/order\/complete/);
    await page.getByRole("link", { name: "商品一覧へ戻る" }).click();
    await expect(page).toHaveURL("/");
  });

  test("注文確定後、カートが空になる (research.md #6)", async ({ page }) => {
    await page.getByLabel("氏名").fill("山田太郎");
    await page.getByLabel("住所").fill("東京都千代田区1-1-1");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByRole("button", { name: "注文する" }).click();

    await expect(page).toHaveURL(/\/order\/complete/);

    await page.goto("/cart");
    await expect(page.getByText("カートに書籍がありません")).toBeVisible();
  });

  test("入力欄・ボタン・戻るリンクはキーボード操作だけで到達・実行できる (WCAG 2.1 AA, 憲法セクション3)", async ({
    page,
  }) => {
    await page.getByLabel("氏名").focus();
    await expect(page.getByLabel("氏名")).toBeFocused();
    await page.keyboard.type("山田太郎");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("住所")).toBeFocused();
    await page.keyboard.type("東京都千代田区1-1-1");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("メールアドレス")).toBeFocused();
    await page.keyboard.type("taro@example.com");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "注文する" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/order\/complete/);

    const backLink = page.getByRole("link", { name: "商品一覧へ戻る" });
    await backLink.focus();
    await expect(backLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");
  });
});
