// src/jobs/scrape.company.job.ts
import 'dotenv/config';
import { chromium, Browser, Page } from 'playwright';

export async function scrape(url: string): Promise<{ snippet: string }> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  const timeout = parseInt(process.env.SCRAPE_TIME_OUT || '60_000');

  try {
    browser = await chromium.launch();
    page = await browser.newPage();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout,
    });

    const text = await page.locator('body').innerText();
    const snippet = text
      .split(/\s+/)
      .slice(0, 500)
      .join(' ');

    return { snippet };

  } catch (err) {
    console.error(`[scrape] Error fetching ${url}:`, err);
    throw err;

  } finally {
    // ensure we always close page and browser
    if (page) {
      try {
        await page.close();
      } catch (closeErr) {
        console.warn(`[scrape] Failed to close page for ${url}:`, closeErr);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.warn(`[scrape] Failed to close browser for ${url}:`, closeErr);
      }
    }
  }
}
