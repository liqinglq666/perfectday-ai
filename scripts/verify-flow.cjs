const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const { createTsLoader } = require('../tests/helpers/load-ts.cjs');
const { places } = createTsLoader()('data/places');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3017'], { cwd: process.cwd(), env: { ...process.env, DASHSCOPE_API_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
const origin = 'http://127.0.0.1:3017';
const ready = new Promise((resolve, reject) => { server.stdout.on('data', chunk => { if (chunk.toString().includes('Ready')) resolve(); }); server.on('exit', code => reject(new Error('server exited ' + code))); });
const timeout = setTimeout(() => server.kill(), 45000);
const anchor = (html, phrase) => {
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) if (match[2].includes(phrase)) return match[1].replace(/&amp;/g, '&');
  throw new Error('Missing link: ' + phrase);
};
// A loading boundary lets Next stream a page redirect as a refresh tag.
// Follow that navigation just as a browser does, then inspect the destination.
async function navigate(path, options) {
  let response = await fetch(new URL(path, origin), options);
  for (let hop = 0; hop < 4; hop++) {
    const html = await response.clone().text();
    const refresh = html.match(/<meta\b(?=[^>]*id="__next-page-redirect")[^>]*content="\d+;url=([^"]+)"/);
    if (!refresh) return response;
    const target = new URL(refresh[1].replace(/&amp;/g, '&'), origin);
    assert.equal(target.origin, origin, 'redirect stays inside the app');
    response = await fetch(target);
  }
  throw new Error('Redirect did not settle');
}
async function page(path) { const r = await navigate(path); assert.equal(r.status, 200, path); return r.text(); }
(async () => {
  try {
    await ready;
    const home = await page('/'); assert(home.includes('商圈指南'));
    const guide = await page('/guide');
    assert(guide.includes('商圈地点，一起看看'));
    assert(guide.includes('1F · 2216'));
    assert(!guide.includes('试着处理一次途中变化'));
    assert(!guide.includes('非试用记录'));
    let html = await page('/trip?scene=date&duration=360&budget=300&walking=normal');
    assert(html.includes('本次为你考虑'));
    html = await page(anchor(html, '这一站逛完了'));
    html = await page(anchor(html, '这一站逛完了'));
    const adjustment = anchor(html, '重排剩余行程');
    const url = new URL(adjustment, origin), original = JSON.parse(url.searchParams.get('journey'));
    assert.equal(original.done.length, 2);
    const formHtml = await page(adjustment); assert(formHtml.includes('name="left"')); assert(formHtml.includes('name="changes"'));
    url.searchParams.set('left', '60'); url.searchParams.set('cash', '50'); url.searchParams.set('from', '16:35'); url.searchParams.set('current', 'holiday');
    url.searchParams.append('changes', 'rain'); url.searchParams.append('changes', 'walk');
    html = await page(url.href); assert(html.includes('16:35')); assert(html.includes('为什么移除'));
    assert(html.includes('form="remaining-form"'));
    url.searchParams.set('mode', 'save');
    const saveResponse = await navigate(url.href);
    const saved = saveResponse.url;
    const state = JSON.parse(new URL(saved, origin).searchParams.get('journey'));
    assert.equal(JSON.stringify(state.done), JSON.stringify(original.done));
    assert.equal(state.pending.length, 1); assert.equal(state.pending[0].id, 'daka-coffee');
    html = await page(saved); assert(html.replace(/<[^>]*>/g, '').includes('已完成 2 站')); assert(html.includes('16:35'));
    html = await page(anchor(html, '这一站逛完了')); assert(html.includes('告一段落')); assert(html.replace(/<[^>]*>/g, '').includes('已完成 3 站'));
    // Save newly typed values directly, without a separate preview request.
    url.searchParams.set('left', '30'); url.searchParams.set('cash', '10');
    const directSave = await navigate(url.href);
    const directState = JSON.parse(new URL(directSave.url).searchParams.get('journey'));
    assert.equal(directState.minutes, 30); assert.equal(directState.cash, 10);
    assert.equal(directState.pending.length, 0); assert.equal(directState.done.length, 2);
    // Competition flow: completed book/coffee remain byte-for-byte intact after a named meal swap.
    const mainQuery = new URLSearchParams({ request: '和朋友逛书店、喝咖啡，再吃晚饭。', scene: 'friends', duration: '240', budget: '300', walking: 'low', ai: 'fallback' });
    let demo = await page('/trip?' + mainQuery);
    demo = await page(anchor(demo, '这一站逛完了'));
    demo = await page(anchor(demo, '这一站逛完了'));
    const queueUrl = new URL(anchor(demo, '重排剩余行程'), origin);
    const beforeQueue = JSON.parse(queueUrl.searchParams.get('journey'));
    assert.equal(beforeQueue.done.map(s => s.id).join(','), 'boya-bookstore,daka-coffee');
    assert.equal(beforeQueue.pending[0].id, 'holiday-cafe-de-coral');
    queueUrl.searchParams.set('changes', 'queue'); queueUrl.searchParams.set('mode', 'save');
    const queued = await navigate(queueUrl.href);
    const afterQueue = JSON.parse(new URL(queued.url).searchParams.get('journey'));
    assert.equal(JSON.stringify(afterQueue.done), JSON.stringify(beforeQueue.done));
    assert.equal(afterQueue.current, 'holiday'); assert.equal(afterQueue.pending[0].id, 'holiday-ajisen');
    assert((await queued.text()).includes('味千拉面'));
    const queueAgain = new URL(queued.url);
    queueAgain.pathname = '/adjust';
    queueAgain.searchParams.set('changes', 'queue'); queueAgain.searchParams.set('mode', 'save');
    const exhausted = await navigate(queueAgain.href);
    const exhaustedState = JSON.parse(new URL(exhausted.url).searchParams.get('journey'));
    assert.equal(exhaustedState.pending[0].q, 1);
    assert.equal(exhaustedState.unavailableMeals.join(','), 'holiday-cafe-de-coral,holiday-ajisen');
    assert.equal(JSON.stringify(exhaustedState.done), JSON.stringify(beforeQueue.done));
    const action = home.match(/name="(\$ACTION_ID_[^"]+)"/)[1];
    const body = new FormData(); body.set(action, ''); body.set('request', '一个人逛两小时，不喝咖啡，想逛宜得利'); body.set('scene', 'solo'); body.set('duration', '120'); body.set('budget', '100'); body.set('walking', 'low');
    const result = await navigate(origin, { method: 'POST', body, headers: { Origin: origin } });
    assert.equal(result.status, 200); assert(result.url.includes('/trip?'));
    const resultPage = await result.text();
    assert(resultPage.includes('NITORI'));
    assert(resultPage.includes('本次为你考虑'));
    assert(resultPage.includes('想去 NITORI 宜得利'));
    assert(resultPage.includes('不安排咖啡'));
    assert(/基础(?:路线)?规划/.test(resultPage));
    body.set('request', '预算50元，只有90分钟，和朋友逛街');
    body.set('scene', 'friends'); body.set('duration', '240'); body.set('budget', '500');
    const constrained = await navigate(origin, { method: 'POST', body, headers: { Origin: origin } });
    const constrainedPage = await constrained.text();
    assert(constrainedPage.includes('¥50内'));
    const constrainedUrl = new URL(anchor(constrainedPage, '重排剩余行程'), origin);
    const constrainedState = JSON.parse(constrainedUrl.searchParams.get('journey'));
    assert.equal(constrainedState.cash, 50); assert.equal(constrainedState.minutes, 90);
    const compoundCases = [
      { request: '今天逛90分钟，来回坐车需要两小时', minutes: 90, cash: 500 },
      { request: '来回坐车需要两小时，今天逛90分钟', minutes: 90, cash: 500 },
      { request: '预算不限，逛两小时', minutes: 120, cash: 500 },
      { request: '预算没想好，逛90分钟', minutes: 90, cash: 500 },
      { request: '只逛万象汇，预算50元，逛两小时', minutes: 120, cash: 50, mall: 'golden' },
      { request: '只逛万象汇，只有60分钟', minutes: 60, cash: 500, mall: 'golden' },
      { request: '今天不会下雨，想逛书店和宜得利', minutes: 240, cash: 500, ids: ['boya-bookstore', 'nitori'] },
      { request: '想喝咖啡，也想吃糖水，逛四小时', minutes: 240, cash: 500, ids: ['daka-coffee', 'holiday-dessert'] }
    ];
    for (const example of compoundCases) {
      body.set('request', example.request); body.set('walking', 'normal');
      const response = await navigate(origin, { method: 'POST', body, headers: { Origin: origin } });
      assert.equal(response.status, 200);
      const rendered = await response.text();
      const shared = new URL(anchor(rendered, '重排剩余行程'), origin);
      const snapshot = JSON.parse(shared.searchParams.get('journey'));
      assert.equal(snapshot.minutes, example.minutes, example.request);
      assert.equal(snapshot.cash, example.cash, example.request);
      assert(snapshot.pending.length > 0, example.request);
      const stops = snapshot.pending.map(ref => places.find(place => place.id === ref.id));
      assert(stops.reduce((total, stop) => total + stop.duration + stop.walkMinutes, 0) <= snapshot.minutes);
      assert(stops.reduce((total, stop) => total + stop.price, 0) <= snapshot.cash);
      if (example.mall) assert(stops.every(stop => stop.mall !== '假日广场' && stop.category !== 'connector'));
      for (const id of example.ids || []) assert(stops.some(stop => stop.id === id), example.request);
      shared.pathname = '/trip';
      const reloaded = await page(shared.href);
      const restored = JSON.parse(new URL(anchor(reloaded, '重排剩余行程'), origin).searchParams.get('journey'));
      assert.equal(JSON.stringify(restored), JSON.stringify(snapshot));
    }
    // The provider decoder is mocked in unit tests; exercise its resolved URL in real rendering here.
    const noodles = await page('/trip?' + new URLSearchParams({ request: '我想吃面条', scene: 'friends', duration: '240', budget: '300', walking: 'low', ai: 'bailian', meal: 'specific', preferred: 'holiday-ajisen' }));
    const noodlesState = JSON.parse(new URL(anchor(noodles, '重排剩余行程'), origin).searchParams.get('journey'));
    assert(noodlesState.pending.some(stop => stop.id === 'holiday-ajisen'));
    assert(noodles.includes('味千拉面'));
    console.log('PASS: server-rendered home, guide, completion, adjustment, save/reload, finish, no-key action, compound duration/budget/weather/meal requests, post-limit refill, and persistent queue exhaustion.');
  } finally { clearTimeout(timeout); server.kill(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
