/*
  Captures real screenshots of the deployed projects.

  Run with `npm run capture`. Only reachable deployments are listed — a project
  with no live site gets bespoke artwork on the portfolio instead of a stand-in
  screenshot of something else.

  Some targets are driven before capture (filling a form, running a search) so
  the shot shows the thing working rather than an empty initial state. Anything
  that lands on an error state is discarded rather than shipped.
*/
import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../src/assets/work/', import.meta.url));
const file = (name) => `${OUT}${name}.png`;

const targets = [
  {
    slug: 'reguna-hero',
    url: 'https://veternity-app.fly.dev',
    settle: 3500,
  },
  {
    slug: 'reguna-market',
    url: 'https://veternity-app.fly.dev',
    settle: 3500,
    async act(page) {
      await page.evaluate(() => window.scrollTo(0, 880));
      await page.waitForTimeout(1500);
    },
    /* The second row had a product whose image 404s upstream. Framing the
       header and first row shows the real catalogue without shipping that. */
    clip: { x: 0, y: 0, width: 1440, height: 640 },
  },
  {
    slug: 'dompetku',
    url: 'https://valtzyy.github.io/DompetKu/',
    settle: 1500,
    async act(page) {
      const entries = [
        ['Uang saku bulanan', '1500000'],
        ['Makan siang', '-25000'],
        ['Beli buku kuliah', '-120000'],
        ['Freelance desain', '350000'],
      ];
      for (const [label, amount] of entries) {
        await page.fill('#text', label);
        await page.fill('#amount', amount);
        await page.click('form#form button.btn');
        await page.waitForTimeout(300);
      }
      await page.waitForTimeout(800);
    },
  },
  {
    slug: 'carianime',
    url: 'https://valtzyy.github.io/CariAnime/',
    settle: 2000,
    async act(page) {
      await page.fill('input', 'jujutsu kaisen');
      await page.waitForTimeout(4000);
    },
    /* The API is reached from the browser, so a blocked network shows the app's
       own error banner. Better no image than a screenshot of a failure. */
    reject: (text) => /gagal mengambil data|tidak ditemukan/i.test(text),
  },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  ignoreHTTPSErrors: true,
});

for (const t of targets) {
  const page = await context.newPage();
  try {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
        await page.waitForTimeout(1500 * attempt);
      }
    }
    if (lastError) throw lastError;

    await page.waitForTimeout(t.settle ?? 1500);
    if (t.act) await t.act(page);

    if (t.reject) {
      const text = await page.evaluate(() => document.body.innerText);
      if (t.reject(text)) {
        await rm(file(t.slug), { force: true });
        console.log(`skipped   ${t.slug}  (page is showing an error state)`);
        continue;
      }
    }

    await page.screenshot({ path: file(t.slug), type: 'png', clip: t.clip });
    console.log(`captured  ${t.slug}  <- ${t.url}`);
  } catch (error) {
    console.log(`FAILED    ${t.slug}  ${String(error).split('\n')[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();
