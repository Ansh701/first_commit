import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const outputDirectory = path.resolve(
  import.meta.dirname,
  "../../../docs/screenshots/redesign",
);

await mkdir(outputDirectory, { recursive: true });

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
}

async function capture(page, route, name, fullPage = false) {
  await page.goto(`${baseUrl}${route}`);
  await settle(page);
  if (fullPage && (await page.locator(".landing-hero").count())) {
    for (const selector of [
      "#platform",
      ".action-section",
      ".audience-section",
      ".story-section",
      ".trust-section",
      ".privacy-section",
      ".final-marketing-cta",
      ".site-footer",
    ]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(760);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
  }
  await page.screenshot({
    path: path.join(outputDirectory, name),
    fullPage,
  });
}

const browser = await chromium.launch();
try {
  const publicContext = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
  });
  const publicPage = await publicContext.newPage();
  await capture(publicPage, "/", "landing-desktop-full.png", true);
  await capture(publicPage, "/auth/sign-in", "sign-in-desktop.png");
  await capture(publicPage, "/auth/sign-up", "sign-up-desktop.png");
  await capture(
    publicPage,
    "/organizations/udaan-learning-foundation",
    "public-profile-desktop.png",
    true,
  );
  await capture(
    publicPage,
    "/causes/learning-kits-2026",
    "cause-donation-desktop.png",
    true,
  );
  await capture(publicPage, "/items", "item-donation-public-desktop.png", true);
  await capture(publicPage, "/privacy", "privacy-footer-desktop.png", true);
  await publicContext.close();

  const tabletContext = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    deviceScaleFactor: 1,
  });
  const tabletPage = await tabletContext.newPage();
  await capture(tabletPage, "/", "landing-tablet-full.png", true);
  await tabletContext.close();

  const workspaceContext = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });
  await workspaceContext.addInitScript(() => {
    window.localStorage.setItem("insips-theme", "dark");
    window.localStorage.setItem(
      "insips-demo-v1",
      JSON.stringify({
        profileSaved: true,
        suggestions: {
          "claim-csr1": "accepted",
          "claim-legal-name": "pending",
          "claim-80g": "pending",
        },
        submissionStatus: "submitted",
        review: {
          "claim-csr1": "pending",
          "claim-legal-name": "pending",
          "claim-80g": "pending",
        },
        shortlist: ["udaan-learning-foundation"],
      }),
    );
  });
  const workspacePage = await workspaceContext.newPage();
  await capture(workspacePage, "/app", "organization-dashboard-dark.png");
  await capture(
    workspacePage,
    "/app/evidence/demo-csr-1",
    "evidence-detail-dark.png",
  );
  await capture(workspacePage, "/review", "review-queue-dark.png");
  await capture(
    workspacePage,
    "/review/submission-demo",
    "review-detail-dark.png",
  );
  await capture(workspacePage, "/csr/discover", "csr-discovery-dark.png");
  await capture(
    workspacePage,
    "/app/onboarding",
    "organization-onboarding-dark.png",
  );
  await capture(
    workspacePage,
    "/admin/organizations/org-udaan-learning",
    "organization-verification-dark.png",
  );
  await capture(
    workspacePage,
    "/app/donations",
    "organization-donations-dark.png",
  );
  await capture(workspacePage, "/app/items", "item-donations-dark.png");
  await capture(workspacePage, "/donor/donations", "donor-history-dark.png");
  await capture(
    workspacePage,
    "/corporate/discover",
    "corporate-discovery-dark.png",
  );
  await workspaceContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const mobilePage = await mobileContext.newPage();
  await capture(mobilePage, "/", "landing-mobile-full.png", true);
  await capture(mobilePage, "/auth/sign-in", "sign-in-mobile.png", true);
  await capture(
    mobilePage,
    "/app/onboarding",
    "organization-onboarding-mobile.png",
    true,
  );
  await capture(
    mobilePage,
    "/causes/learning-kits-2026",
    "cause-donation-mobile.png",
    true,
  );
  await mobileContext.close();
} finally {
  await browser.close();
}
