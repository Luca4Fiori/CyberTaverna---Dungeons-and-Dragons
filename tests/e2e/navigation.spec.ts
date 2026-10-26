import { test, expect } from "@playwright/test";
test("navega sem apresentar funcionalidades fictícias", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Toda lenda começa/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explorar campanhas" }).click();
  await expect(
    page.getByRole("heading", { name: "Entrar na taverna", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("preferências persistem após recarregar", async ({ page }) => {
  await page.goto("/preferencias");
  await page.getByRole("checkbox", { name: /Reduzir movimento/ }).check();
  await page.getByRole("checkbox", { name: /Efeitos ambientais/ }).uncheck();
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: /Reduzir movimento/ }),
  ).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-effects", "off");
});
