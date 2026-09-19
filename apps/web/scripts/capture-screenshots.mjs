import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const outputDirectory = path.resolve(
  import.meta.dirname,
  "../../../docs/screenshots",
);

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
try {
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
  });
  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  await desktop.screenshot({
    path: path.join(outputDirectory, "landing-desktop.png"),
  });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  await mobile.addInitScript(() => {
    window.localStorage.setItem("insips-theme", "dark");
  });
  await mobile.goto(`${baseUrl}/app/evidence/demo-csr-1`, {
    waitUntil: "networkidle",
  });
  await mobile.screenshot({
    path: path.join(outputDirectory, "evidence-mobile.png"),
  });
} finally {
  await browser.close();
}
