import { test, expect } from "@playwright/test";
import { mkdirSync } from "fs";
import path from "path";

const BASE_URL = process.env.MINI_READERS_URL ?? "http://localhost:8080";
const SCREENSHOT_PATH = path.join("screenshots", "mini-readers.png");

test("mini-readers capture", async ({ page }) => {
  // Ensure the screenshot directory exists so Playwright can write the file.
  mkdirSync(path.dirname(SCREENSHOT_PATH), { recursive: true });

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  const title = await page.title();
  await expect(title).not.toBe("");

  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
});
