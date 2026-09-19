import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("golden evidence-to-publication flow", async ({ page }) => {
  await page.goto("/app/evidence/demo-csr-1");
  await expect(
    page.getByRole("heading", { name: "Review what Compass found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Accept" }).first().click();
  await page.getByRole("link", { name: /Continue with 1 claim/ }).click();
  await page.getByRole("button", { name: /Submit for human review/ }).click();
  await page.getByRole("link", { name: /Switch to reviewer queue/ }).click();
  await page.getByRole("link", { name: /Start review/ }).click();
  await expect(
    page.getByRole("heading", { name: "Udaan Learning Foundation" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Approved" })).toHaveCount(0);
  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(
    page.getByText("Review complete", { exact: true }),
  ).toBeVisible();
  await Promise.all([
    page.waitForURL("**/organizations/udaan-learning-foundation"),
    page.getByRole("link", { name: /View public result/ }).click(),
  ]);
  await expect(
    page
      .locator(".public-claim-value")
      .getByText("CSR00018427", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Restricted", { exact: true })).toHaveCount(0);
});

test("key public page has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});
