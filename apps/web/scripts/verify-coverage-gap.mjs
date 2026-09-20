import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import http from "node:http";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const outputDirectory = path.resolve(
  import.meta.dirname,
  "../../../docs/screenshots/verification"
);

await mkdir(outputDirectory, { recursive: true });

async function checkServer(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    }).on('error', () => {
      resolve(false);
    });
  });
}

const serverRunning = await checkServer(baseUrl);
if (!serverRunning) {
  console.error(`Error: Server at ${baseUrl} is not running. Please start it with pnpm start or pnpm dev.`);
  process.exit(1);
}

const browser = await chromium.launch();
const routes = [
  "/",
  "/app/onboarding",
  "/discover",
  "/organizations/udaan-learning-foundation",
  "/how-trust-works"
];

const adminRoutes = [
  "/admin",
  "/admin/organizations"
];

const widths = [390, 768, 1280, 1440];
const themes = ["light", "dark"];

const findings = [];

try {
  for (const route of routes) {
    for (const width of widths) {
      for (const theme of themes) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          deviceScaleFactor: 1,
          colorScheme: theme,
        });

        if (theme === "dark") {
          await context.addInitScript(() => {
            window.localStorage.setItem("insips-theme", "dark");
          });
        }

        const page = await context.newPage();
        const consoleErrors = [];
        const failedRequests = [];

        page.on("console", (msg) => {
          if (msg.type() === "error") {
            consoleErrors.push(msg.text());
          }
        });

        page.on("requestfailed", (req) => {
          failedRequests.push(`${req.url()} (${req.failure()?.errorText})`);
        });

        try {
          const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 15000 });
          if (!response || response.status() >= 400) {
            findings.push({
              route,
              width,
              theme,
              defect: `HTTP Status ${response ? response.status() : 'No Response'}`
            });
          }
        } catch (e) {
          findings.push({
            route,
            width,
            theme,
            defect: `Navigation failed: ${e.message}`
          });
          await context.close();
          continue;
        }

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        if (overflow) {
          findings.push({
            route,
            width,
            theme,
            defect: `Horizontal overflow detected (scrollWidth > clientWidth)`
          });
        }

        if (consoleErrors.length > 0) {
          findings.push({
            route,
            width,
            theme,
            defect: `Console errors: ${consoleErrors.join("; ")}`
          });
        }

        if (failedRequests.length > 0) {
          findings.push({
            route,
            width,
            theme,
            defect: `Failed assets/requests: ${failedRequests.join("; ")}`
          });
        }

        const safeName = route.replace(/\//g, "_") || "home";
        await page.screenshot({
          path: path.join(outputDirectory, `${safeName}-${width}-${theme}.png`),
          fullPage: true,
        });

        await context.close();
      }
    }
  }

  // Admin routes verification at desktop (1280) and mobile (390)
  for (const route of adminRoutes) {
    for (const width of [390, 1280]) {
      for (const theme of themes) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          deviceScaleFactor: 1,
          colorScheme: theme,
        });
        const page = await context.newPage();
        try {
          await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 15000 });
          const safeName = route.replace(/\//g, "_");
          await page.screenshot({
            path: path.join(outputDirectory, `${safeName}-${width}-${theme}.png`),
            fullPage: true,
          });
        } catch (e) {
          findings.push({
            route,
            width,
            theme,
            defect: `Admin navigation failed: ${e.message}`
          });
        }
        await context.close();
      }
    }
  }

  console.log(JSON.stringify(findings, null, 2));
} finally {
  await browser.close();
}
