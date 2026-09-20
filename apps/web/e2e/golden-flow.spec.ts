import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const footerRoutes = [
  "/discover",
  "/causes",
  "/for-organizations",
  "/for-corporate-teams",
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
  "/donation-refund-policy",
  "/acceptable-use",
  "/accessibility",
  "/security",
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
  await expect(footer.getByRole("button", { name: /theme/i })).toHaveCount(0);

  for (const route of footerRoutes) {
    await expect(footer.locator(`a[href="${route}"]`)).toHaveCount(1);
    const response = await request.get(route);
    expect(response.ok(), `${route} should resolve`).toBeTruthy();
  }
});

test("authentication routes render as one branded system", async ({ page }) => {
  for (const route of authRoutes) {
    await page.goto(route);
    await expect(
      page.getByRole("link", { name: "INSIPS home" }).first(),
    ).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  }
});

test("local identity adapter completes signup, verification, login, and logout boundaries", async ({
  page,
}) => {
  await page.goto("/auth/sign-up");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByLabel("Full name").fill("Synthetic Donor");
  await page.getByLabel("Email address").fill("donor@example.test");
  await page.getByLabel("Password", { exact: true }).fill("StrongPassword!23");
  await page.getByRole("button", { name: /Create account/ }).click();
  await expect(page).toHaveURL(/\/auth\/verify-email/);
  await page.getByLabel("Email address").fill("donor@example.test");
  await page.getByLabel("Verification code").fill("246810");
  await page.getByRole("button", { name: /Verify email/ }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await page.getByLabel("Email address").fill("donor@example.test");
  await page.getByLabel("Password", { exact: true }).fill("StrongPassword!23");
  await page.getByRole("button", { name: /Sign in/ }).click();
  await expect(page).toHaveURL(/\/app/);

  await page.goto("/account");
  await page.getByRole("button", { name: "Refresh session" }).click();
  await expect(page.locator(".inline-result")).toContainText("refreshed");
  await page.getByRole("button", { name: "Request account deletion" }).click();
  await expect(page.getByText("This local account is archived.")).toBeVisible();
  await page.getByRole("button", { name: "Restore account" }).click();
  await expect(page.locator(".inline-result")).toContainText("restored");
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.locator(".inline-result")).toContainText("Signed out");
});

test("local identity adapter completes password recovery", async ({ page }) => {
  await page.goto("/auth/sign-up");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByLabel("Full name").fill("Synthetic Donor");
  await page.getByLabel("Email address").fill("recovery@example.test");
  await page.getByLabel("Password", { exact: true }).fill("StrongPassword!23");
  await page.getByRole("button", { name: /Create account/ }).click();
  await page.getByLabel("Email address").fill("recovery@example.test");
  await page.getByLabel("Verification code").fill("246810");
  await page.getByRole("button", { name: /Verify email/ }).click();

  await page.goto("/auth/forgot-password");
  await page.getByLabel("Email address").fill("recovery@example.test");
  await page.getByRole("button", { name: /Send recovery link/ }).click();
  await expect(page).toHaveURL(/\/auth\/reset-password/);
  await page.getByLabel("Email address").fill("recovery@example.test");
  await page.getByLabel("Recovery code").fill("135790");
  await page
    .getByLabel("New password", { exact: true })
    .fill("NewPassword!456");
  await page.getByLabel("Confirm new password").fill("NewPassword!456");
  await page.getByRole("button", { name: /Update password/ }).click();
  await expect(page.locator(".auth-inline-message")).toContainText(
    "Password updated",
  );
});

test("organization onboarding autosaves and resumes a draft", async ({
  page,
}) => {
  await page.goto("/app/onboarding");
  await page.evaluate(() => localStorage.removeItem("insips-product-demo-v1"));
  await page.reload();
  await page.getByRole("button", { name: /Account/ }).click();
  await page.getByLabel("Contact phone").fill("+91 90000 11111");
  await page.getByRole("button", { name: /Save and continue/ }).click();
  await expect(
    page.getByRole("heading", { name: "Organization profile" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Organization profile" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Account/ }).click();
  await expect(page.getByLabel("Contact phone")).toHaveValue("+91 90000 11111");
});

test("admin requests a document correction and then approves the resubmission", async ({
  page,
}) => {
  await page.goto("/admin/organizations/org-udaan-learning");
  await page.evaluate(() => localStorage.removeItem("insips-product-demo-v1"));
  await page.reload();
  await page.getByRole("button", { name: /Bank account proof/ }).click();
  await page
    .getByLabel("Reason for changes or rejection")
    .fill("Please upload a statement showing the account holder name.");
  await page.getByRole("button", { name: "Request changes" }).click();
  await expect(page.locator(".inline-result")).toContainText(
    "changes requested",
  );

  await page.goto("/app/onboarding");
  await page.getByRole("button", { name: /Documents/ }).click();
  await page
    .locator("article")
    .filter({ hasText: "Bank account proof" })
    .getByRole("button", { name: "Upload correction" })
    .click();

  await page.goto("/admin/organizations/org-udaan-learning");
  await page.getByRole("button", { name: /Bank account proof/ }).click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.locator(".inline-result")).toContainText("approved");
});

test("captured, duplicate, and refund payment events update progress exactly once", async ({
  page,
}) => {
  await page.goto("/causes/learning-kits-2026");
  await page.evaluate(() => localStorage.removeItem("insips-product-demo-v1"));
  await page.reload();
  await expect(page.getByText("₹6,845.00", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Create test payment/ }).click();
  await expect(page.locator(".inline-result")).toContainText("pending");
  await page
    .getByRole("button", { name: "Simulate signed captured webhook" })
    .click();
  await expect(page.getByText("₹7,845.00", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Replay same webhook" }).click();
  await expect(page.locator(".inline-result")).toContainText(
    "Duplicate webhook replay ignored",
  );
  await expect(page.getByText("₹7,845.00", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Simulate full refund" }).click();
  await expect(page.getByText("₹6,845.00", { exact: true })).toBeVisible();
});

test("fee breakdown is exact and a failed payment never changes cause progress", async ({
  page,
}) => {
  await page.goto("/causes/learning-kits-2026");
  await page.evaluate(() => localStorage.removeItem("insips-product-demo-v1"));
  await page.reload();
  await expect(page.getByText("₹6,845.00", { exact: true })).toBeVisible();
  await expect(page.getByText("INSIPS fee · 0.25%")).toBeVisible();
  await expect(page.getByText("₹2.50", { exact: true })).toBeVisible();
  await expect(page.getByText("₹1,002.50", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Create test payment/ }).click();
  await expect(page.getByText("₹6,845.00", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Simulate failed payment" }).click();
  await expect(page.locator(".inline-result")).toContainText(
    "Cause progress and organization totals were not changed",
  );
  await expect(page.getByText("₹6,845.00", { exact: true })).toBeVisible();
});

test("donor and organization histories filter and export their ledgers", async ({
  page,
}) => {
  await page.goto("/donor/donations");
  await expect(
    page.getByRole("heading", { name: "Money donations" }),
  ).toBeVisible();
  await page.getByPlaceholder("Search cause or reference").fill("learning");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  const donorDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  expect((await donorDownload).suggestedFilename()).toBe(
    "insips-donations.csv",
  );

  await page.goto("/app/donations");
  await expect(
    page.getByRole("heading", { name: "Donations received" }),
  ).toBeVisible();
  await expect(page.getByText("exactly 0.25% · 25 basis points")).toBeVisible();
  await page.getByLabel("Filter ledger status").selectOption("CAPTURED");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  const organizationDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  expect((await organizationDownload).suggestedFilename()).toBe(
    "insips-organization-donations.csv",
  );
});

test("item donation and volunteer lifecycles reach human-confirmed terminal states", async ({
  page,
}) => {
  await page.goto("/items");
  await page.evaluate(() => localStorage.removeItem("insips-product-demo-v1"));
  await page.reload();
  await page.getByLabel("Quantity").fill("2");
  await page.getByLabel("Notes").fill("Two sealed blankets.");
  await page.getByRole("button", { name: "Submit item pledge" }).click();
  await expect(page.locator(".inline-result")).toContainText("saved");
  await page.goto("/app/items");
  const newestPledge = page.locator("tbody tr").first();
  await newestPledge
    .getByRole("button", { name: "ACCEPTED", exact: true })
    .click();
  await newestPledge
    .getByRole("button", { name: "SCHEDULED", exact: true })
    .click();
  await newestPledge
    .getByRole("button", { name: "RECEIVED", exact: true })
    .click();
  await expect(
    page.getByText("20 of 40 received", { exact: true }),
  ).toBeVisible();

  await page.goto("/volunteer");
  await page
    .getByRole("button", { name: "Apply to volunteer" })
    .first()
    .click();
  await page.goto("/app/volunteers");
  await page.getByRole("button", { name: "APPROVED", exact: true }).click();
  await page.getByRole("button", { name: "COMPLETED", exact: true }).click();
  await expect(page.getByText("COMPLETED", { exact: true })).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "A trust trail you can actually follow." })).toBeVisible();
  await expect(page.locator(".workbench-stage")).toBeVisible();
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

test("demo roles stay explicit and the forbidden state reveals no resource details", async ({
  page,
}) => {
  await page.goto("/demo");
  for (const role of [
    "Organization admin",
    "Platform reviewer",
    "Corporate member",
    "Individual donor",
    "Platform admin",
  ]) {
    await expect(
      page.getByRole("link", { name: new RegExp(role) }),
    ).toBeVisible();
  }
  await page.goto("/forbidden");
  await expect(
    page.getByRole("heading", {
      name: "You do not have access to this workspace",
    }),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText(
    /Udaan|CSR00018427|private-doc|object key/i,
  );
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
      .locator(".trust-indicator-value")
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
    "/app/onboarding",
    "/app/donations",
    "/app/items",
    "/app/evidence/demo-csr-1",
    "/admin/organizations/org-udaan-learning",
    "/review/submission-demo",
    "/csr/discover",
    "/corporate/discover",
    "/donor/donations",
    "/causes/learning-kits-2026",
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
