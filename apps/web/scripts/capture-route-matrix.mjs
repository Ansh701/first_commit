import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const phase = process.env.ROUTE_QA_PHASE ?? "final";
const outputDirectory = path.resolve(import.meta.dirname, `../../../docs/screenshots/route-qa/${phase}`);
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 1024, height: 900 },
  { name: "compact", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const routes = [
  "/contact",
  "/help",
  "/organizations/udaan-learning-foundation",
  "/how-trust-works",
  "/volunteer",
  "/for-corporate-teams",
  "/for-organizations",
  "/compass",
  "/faq",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/session-expired",
  "/auth/callback",
  "/app/onboarding",
  "/app/items",
  "/app/volunteers",
  "/app/team",
  "/app/analytics",
  "/account",
  "/corporate",
  "/corporate/discover",
  "/corporate/shortlist",
  "/corporate/matching",
  "/donor",
  "/donor/donations",
  "/donor/items",
  "/admin",
  "/admin/donations",
  "/admin/organizations",
  "/admin/organizations/org-udaan-learning",
  "/app/evidence",
  "/review",
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch();
const findings = [];

try {
  for (const route of routes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, colorScheme: "light" });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("pageerror", (error) => consoleErrors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      try {
        const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 20000 });
        const status = response?.status() ?? 0;
        if (status >= 400 || consoleErrors.length) findings.push({ phase, route, viewport: viewport.name, status, consoleErrors });
        await page.screenshot({ path: path.join(outputDirectory, `${route.replaceAll("/", "_") || "home"}-${viewport.name}.png`), fullPage: true });
      } catch (error) {
        findings.push({ phase, route, viewport: viewport.name, error: error instanceof Error ? error.message : String(error) });
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ phase, routeCount: routes.length, viewportCount: viewports.length, findings }, null, 2));
