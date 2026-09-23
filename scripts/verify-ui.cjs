/** Browser review: npm run build, then node scripts/verify-ui.cjs.
 * Review-only dependencies: @playwright/test and @axe-core/playwright.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const origin = 'http://127.0.0.1:3024';
const dir = path.join(process.cwd(), 'artifacts/ui-review');
fs.mkdirSync(dir, { recursive: true });
const report = { layouts: [], interactions: [], accessibility: [], errors: [] };
const persist = () => fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3024'], {
  env: { ...process.env, BAILIAN_API_KEY: '', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe']
});
const log = fs.createWriteStream(path.join(dir, 'server.log'));
server.stdout.pipe(log); server.stderr.pipe(log);
let browser;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function ready() {
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error('Review server exited');
    try { if ((await fetch(origin)).ok) return; } catch {}
    await pause(200);
  }
  throw new Error('Review server did not become ready');
}
function done(name) { report.interactions.push(name); persist(); console.log(`PASS: ${name}`); }
async function navigate(page, href) {
  // Next prefetch can keep the network busy after a page is ready to use.
  const response = await page.goto(origin + href, { waitUntil: 'domcontentloaded' });
  assert.ok(response.ok(), `HTTP ${response.status()} for ${href}`);
  await page.locator('main h1').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
}
async function screenshot(page, name) {
  // Visit each viewport so lazy images load before a full-page capture.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate(y => scrollTo(0, y), y);
    await page.waitForTimeout(30);
  }
  await page.waitForFunction(() => [...document.images].filter(i => i.getBoundingClientRect().width > 0).every(i => i.complete && i.naturalWidth > 0), null, { timeout: 15000 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true, animations: 'disabled' });
}
async function run() {
  await ready(); browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', locale: 'zh-CN' });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  const trip = '/trip?scene=date&duration=360&budget=300&walking=normal';
  const pages = { home: '/', trip, adjust: trip.replace('/trip', '/adjust'), guide: '/guide' };
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [name, href] of Object.entries(pages)) {
      await navigate(page, href);
      const layout = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth, mainCount: document.querySelectorAll('main').length, headings: document.querySelectorAll('h1').length }));
      report.layouts.push({ page: name, ...layout });
      if (width === 390 || width === 1440) {
        await screenshot(page, `${name}-${width}`);
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        report.accessibility.push({ page: name, width, violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
      }
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
      persist();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await navigate(page, '/');
  const defaults = await page.locator('#request').inputValue();
  const initialBudget = await page.locator('[name=budget]').inputValue();
  await page.getByRole('button', { name: '陪爸妈慢逛', exact: true }).click();
  await expect(page.locator('[name=scene]')).toHaveValue('parents');
  await expect(page.locator('[name=duration]')).toHaveValue('120');
  await expect(page.locator('[name=budget]')).toHaveValue('100');
  await expect(page.locator('#request')).toHaveValue(/宜得利/);
  await page.locator('[name=budget]').selectOption('500');
  await expect(page.getByRole('button', { name: '陪爸妈慢逛', exact: true })).toHaveAttribute('aria-pressed', 'false');
  done('Preset fills preferences; editing clears stale selection');
  await page.getByRole('button', { name: '重置规划偏好', exact: true }).click();
  await expect(page.locator('#request')).toHaveValue(defaults);
  await expect(page.locator('[name=budget]')).toHaveValue(initialBudget);
  done('Reset restores initial input');
  assert.ok(await page.evaluate(() => document.querySelector('#planner').getBoundingClientRect().top < document.querySelector('.home-hero').getBoundingClientRect().top));
  await expect(page.locator('.home-hero img')).toHaveCount(1);
  assert.match(await page.locator('.home-hero img').evaluate(i => decodeURIComponent(i.currentSrc)), /hero-home-mobile/);
  done('Mobile form precedes artwork and picture uses mobile source');
  await page.getByRole('button', { name: '朋友聚一聚', exact: true }).click();
  await page.locator('.main-cta').click();
  await page.waitForURL('**/trip?**', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.next-stop-panel')).toBeVisible();
  done('Planner submits through existing Server Action');
  await navigate(page, trip);
  await page.getByRole('link', { name: '这一站逛完了', exact: true }).click();
  await page.waitForURL(u => u.searchParams.has('journey'), { waitUntil: 'domcontentloaded' });
  const previous = JSON.parse(new URL(page.url()).searchParams.get('journey'));
  assert.ok(previous.done.length > 0);
  await page.getByRole('link', { name: '重排剩余行程', exact: true }).click();
  await page.waitForURL('**/adjust?**', { waitUntil: 'domcontentloaded' });
  await page.locator('[name=left]').fill('60');
  await page.locator('[name=cash]').fill('100');
  await page.locator('[name=left]').fill('');
  await expect(page.getByRole('button', { name: '保存这次调整', exact: true })).toBeDisabled();
  await page.locator('[name=left]').fill('60');
  await screenshot(page, 'adjust-edited-390');
  await page.getByRole('button', { name: '保存这次调整', exact: true }).click();
  await page.waitForURL('**/trip?**', { waitUntil: 'domcontentloaded' });
  const saved = JSON.parse(new URL(page.url()).searchParams.get('journey'));
  assert.deepEqual(saved.done, previous.done);
  done('Invalid adjustment is blocked; saving preserves completed stops');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('test denied')) } }));
  await page.getByRole('button', { name: '复制行程与进度链接', exact: true }).click();
  const fallback = page.getByRole('textbox', { name: '完整行程链接', exact: true });
  await expect(fallback).toBeFocused();
  await expect(fallback).toHaveValue(page.url());
  assert.ok(await fallback.evaluate(el => el.selectionEnd === el.value.length));
  done('Clipboard denial shows focused and selected complete journey link');
  await navigate(page, '/guide');
  const total = await page.locator('.directory-card').count();
  await page.getByRole('group', { name: '按体验类型筛选' }).getByRole('button', { name: '阅读', exact: true }).click();
  await expect.poll(() => page.locator('.directory-card').count()).toBeGreaterThan(0);
  assert.ok(await page.locator('.directory-card').count() < total);
  await page.locator('#place-search').fill('博雅');
  await expect.poll(() => page.locator('.directory-card').count()).toBeGreaterThan(0);
  assert.ok((await page.locator('.directory-card').allTextContents()).every(text => text.includes('博雅')));
  await page.getByRole('group', { name: '按商场筛选' }).getByRole('button', { name: '石岐万象汇', exact: true }).click();
  await expect(page.locator('.directory-card')).toHaveCount(0);
  await page.getByRole('button', { name: '查看全部地点', exact: true }).click();
  await expect(page.locator('.directory-card')).toHaveCount(total);
  await expect(page.locator('#place-search')).toBeFocused();
  done('Search, mall and category combine; empty-state reset restores all places and focus');
  await navigate(page, '/');
  await expect(page.locator('.recent-trip')).toBeVisible();
  done('Home surfaces saved journey');
  assert.deepEqual(report.errors, [], 'Browser JavaScript errors');
  assert.deepEqual(report.layouts.filter(r => r.content > r.viewport + 1), [], 'Horizontal overflow');
  const serious = report.accessibility.flatMap(r => r.violations.filter(v => ['critical', 'serious'].includes(v.impact)).map(v => ({ page: r.page, width: r.width, ...v })));
  assert.deepEqual(serious, [], 'Serious/critical axe findings');
  assert.equal(report.layouts.length, 28);
  assert.ok(report.layouts.every(r => r.mainCount === 1 && r.headings === 1));
  done('28 responsive layouts have no overflow; 8 axe audits have no serious/critical findings');
}
run().catch(error => { report.failure = error.stack; console.error(error); process.exitCode = 1; }).finally(async () => {
  persist(); if (browser) await browser.close(); server.kill('SIGTERM'); log.end();
});
