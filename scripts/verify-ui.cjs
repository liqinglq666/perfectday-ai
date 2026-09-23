/** Reproducible browser review: npm run build, then node scripts/verify-ui.cjs.
 * Review-only packages: @playwright/test and @axe-core/playwright. No app dependency changes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const port = 3024;
const origin = `http://127.0.0.1:${port}`;
const dir = path.join(process.cwd(), 'artifacts/ui-review');
fs.mkdirSync(dir, { recursive: true });
const report = { layouts: [], interactions: [], accessibility: [], errors: [] };
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
  env: { ...process.env, BAILIAN_API_KEY: '', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe']
});
const log = fs.createWriteStream(path.join(dir, 'server.log'));
server.stdout.pipe(log); server.stderr.pipe(log);
let browser;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function ready() {
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error('Review server exited before becoming ready');
    try { const res = await fetch(origin); if (res.ok) return; } catch {}
    await pause(200);
  }
  throw new Error('Review server did not become ready');
}
function done(name) { report.interactions.push(name); console.log(`PASS: ${name}`); }
async function run() {
  await ready(); browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  const trip = '/trip?scene=date&duration=360&budget=300&walking=normal';
  const pages = { home: '/', trip, adjust: trip.replace('/trip', '/adjust'), guide: '/guide' };
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [name, href] of Object.entries(pages)) {
      await page.goto(origin + href, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => ({
        viewport: innerWidth, content: document.documentElement.scrollWidth,
        mainCount: document.querySelectorAll('main').length,
        headings: document.querySelectorAll('h1').length,
        overflow: [...document.querySelectorAll('main *')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && getComputedStyle(el).position !== 'absolute' && (r.right > innerWidth + 1 || r.left < -1);
        }).map(el => ({ tag: el.tagName, class: el.className })).slice(0, 10)
      }));
      report.layouts.push({ page: name, ...layout });
      if (width === 390 || width === 1440) {
        await page.locator('footer, .value-note, .estimate-note, .photo-note').last().scrollIntoViewIfNeeded().catch(() => {});
        await page.evaluate(async () => { await Promise.all([...document.images].filter(i => i.getBoundingClientRect().width).map(i => i.decode().catch(() => {}))); });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(dir, `${name}-${width}.png`), fullPage: true, animations: 'disabled' });
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        report.accessibility.push({ page: name, width, violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({target: n.target, summary: n.failureSummary})) })) });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin, { waitUntil: 'networkidle' });
  const defaults = await page.locator('#request').inputValue();
  const initialBudget = await page.locator('[name=budget]').inputValue();
  await page.getByRole('button', { name: '陪爸妈慢逛', exact: true }).click();
  assert.equal(await page.locator('[name=scene]').inputValue(), 'parents');
  assert.equal(await page.locator('[name=duration]').inputValue(), '120');
  assert.equal(await page.locator('[name=budget]').inputValue(), '100');
  assert.match(await page.locator('#request').inputValue(), /宜得利/);
  await page.locator('[name=budget]').selectOption('500');
  assert.equal(await page.getByRole('button', { name: '陪爸妈慢逛', exact: true }).getAttribute('aria-pressed'), 'false');
  done('Preset populates preferences; editing a preference clears stale selection');
  await page.getByRole('button', { name: '重置规划偏好', exact: true }).click();
  assert.equal(await page.locator('#request').inputValue(), defaults);
  assert.equal(await page.locator('[name=budget]').inputValue(), initialBudget);
  done('Reset restores initial input');
  const order = await page.evaluate(() => ({ form: document.querySelector('#planner').getBoundingClientRect().top, art: document.querySelector('.home-hero').getBoundingClientRect().top }));
  assert.ok(order.form < order.art);
  assert.equal(await page.locator('.home-hero img').count(), 1);
  assert.match(await page.locator('.home-hero img').evaluate(i => decodeURIComponent(i.currentSrc)), /hero-home-mobile/);
  done('Mobile form precedes artwork and picture loads the mobile source');
  await page.getByRole('button', { name: '朋友聚一聚', exact: true }).click();
  await page.locator('.main-cta').click();
  await page.waitForURL('**/trip?**');
  await page.waitForLoadState('networkidle');
  done('Planner submits through the existing Server Action');
  await page.goto(origin + trip, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: '这一站逛完了', exact: true }).click();
  await page.waitForURL(u => u.searchParams.has('journey'));
  const afterDone = new URL(page.url());
  const previous = JSON.parse(afterDone.searchParams.get('journey'));
  assert.ok(previous.done.length > 0);
  await page.getByRole('link', { name: '重排剩余行程', exact: true }).click();
  await page.waitForURL('**/adjust?**');
  await page.locator('[name=left]').fill('60');
  await page.locator('[name=cash]').fill('100');
  await page.locator('[name=left]').fill('');
  assert.ok(await page.getByRole('button', { name: '保存这次调整', exact: true }).isDisabled());
  await page.locator('[name=left]').fill('60');
  await page.screenshot({ path: path.join(dir, 'adjust-edited-390.png'), fullPage: true });
  await page.getByRole('button', { name: '保存这次调整', exact: true }).click();
  await page.waitForURL('**/trip?**');
  const saved = JSON.parse(new URL(page.url()).searchParams.get('journey'));
  assert.deepEqual(saved.done, previous.done);
  done('Invalid adjustment is blocked; saving preserves completed stops');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('test denied')) } }));
  await page.getByRole('button', { name: '复制行程与进度链接', exact: true }).click();
  const fallback = page.getByRole('textbox', { name: '完整行程链接', exact: true });
  await fallback.waitFor();
  assert.equal(await fallback.inputValue(), page.url());
  assert.ok(await fallback.evaluate(el => document.activeElement === el && el.selectionEnd === el.value.length));
  done('Clipboard denial produces a focused and selected complete journey link');
  await page.goto(origin + '/guide', { waitUntil: 'networkidle' });
  const total = await page.locator('.directory-card').count();
  await page.getByRole('group', { name: '按体验类型筛选' }).getByRole('button', { name: '阅读', exact: true }).click();
  assert.ok(await page.locator('.directory-card').count() > 0);
  assert.ok(await page.locator('.directory-card').count() < total);
  await page.locator('#place-search').fill('博雅');
  assert.ok((await page.locator('.directory-card').allTextContents()).every(text => text.includes('博雅')));
  await page.getByRole('group', { name: '按商场筛选' }).getByRole('button', { name: '石岐万象汇', exact: true }).click();
  assert.equal(await page.locator('.directory-card').count(), 0);
  await page.getByRole('button', { name: '查看全部地点', exact: true }).click();
  assert.equal(await page.locator('.directory-card').count(), total);
  assert.ok(await page.locator('#place-search').evaluate(el => document.activeElement === el));
  done('Search, mall and category filters combine; empty-state reset restores all places and focus');
  await page.goto(origin, { waitUntil: 'networkidle' });
  assert.ok(await page.locator('.recent-trip').count() > 0);
  done('Returning home surfaces the saved journey');
  assert.deepEqual(report.errors, [], 'Browser JavaScript errors');
  const overflowing = report.layouts.filter(r => r.content > r.viewport + 1);
  assert.deepEqual(overflowing, [], 'Horizontal overflow');
  const serious = report.accessibility.flatMap(r => r.violations.filter(v => ['critical', 'serious'].includes(v.impact)).map(v => ({page:r.page,width:r.width,...v})));
  assert.deepEqual(serious, [], 'Serious/critical automated accessibility findings');
  assert.ok(report.layouts.every(r => r.mainCount === 1 && r.headings === 1));
  done('28 viewport/page combinations have no document overflow; audited pages have no serious/critical axe findings');
}
run().catch(error => { report.failure = error.stack; console.error(error); process.exitCode = 1; }).finally(async () => {
  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
  if (browser) await browser.close();
  server.kill('SIGTERM'); log.end();
});
