import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const footerRoutes = [
  "/discover",
  "/for-organizations",
  "/for-csr-teams",
  "/trust-methodology",
  "/compass",
  "/how-trust-works",
  "/faq",
  "/security-privacy",
  "/help",
  "/about",
  "/contact",
  "/hackathon",
  "/privacy",
  "/terms",
  "/cookies",
  "/accessibility",
] as const;

const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/session-expired",
] as const;

test("public brand, message, and footer stay product-safe", async ({
  page,
  request,
}) => {
  await page.goto("/");

  await expect(
    page.locator('img[src*="insips-logo.png"]').first(),
  ).toBeVisible();
  await expect(page).toHaveTitle(/INSIPS/);
  await expect(page.locator("body")).not.toContainText(
    new RegExp(["Pass", "port"].join(""), "i"),
  );
  await expect(page.locator("body")).not.toContainText(
    /GuardDuty|Textract|Step Functions|Private S3|Amazon Bedrock/i,
  );

  const footer = page.getByRole("contentinfo");
  for (const group of ["Platform", "Resources", "Company", "Legal"]) {
    await expect(footer.getByRole("heading", { name: group })).toBeVisible();
  }

  for (const route of footerRoutes) {
    await expect(footer.locator(`a[href="${route}"]`)).toHaveCount(1);
    const response = await request.get(route);
    expect(response.ok(), `${route} should resolve`).toBeTruthy();
  }
});

test("authentication routes render as one branded system", async ({ page }) => {
  for (const route of authRoutes) {
    await page.goto(route);
    await expect(page.getByRole("link", { name: "INSIPS home" })).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  }
});

test("theme control and mobile navigation work", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Switch to dark theme" })
    .first()
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /For organizations/ }).last(),
  ).toBeVisible();
});

test("reduced motion disables ambient loops", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".marquee-track")).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("keyboard focus and zoom-equivalent reflow remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBeFalsy();
});

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

test("representative product routes have no serious accessibility violations", async ({
  page,
}) => {
  for (const route of [
    "/auth/sign-in",
    "/app",
    "/app/evidence/demo-csr-1",
    "/review/submission-demo",
    "/csr/discover",
    "/organizations/udaan-learning-foundation",
  ]) {
    await page.goto(route);
    await page.waitForTimeout(850);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(
      results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact ?? ""),
      ),
      `${route} should have no serious or critical axe findings`,
    ).toEqual([]);
  }
});
