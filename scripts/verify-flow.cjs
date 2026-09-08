const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3017'], { cwd: process.cwd(), env: { ...process.env, DASHSCOPE_API_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
const origin = 'http://127.0.0.1:3017';
const ready = new Promise((resolve, reject) => { server.stdout.on('data', chunk => { if (chunk.toString().includes('Ready')) resolve(); }); server.on('exit', code => reject(new Error('server exited ' + code))); });
const timeout = setTimeout(() => server.kill(), 25000);
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
    let html = await page('/trip?scene=friends&duration=360&budget=300&walking=normal');
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
    console.log('PASS: server-rendered home, simplified guide, trip intent explanation, completion, adjustment form with multiple flags, save, reload, finish, direct-save of edited conditions, and no-key form action.');
  } finally { clearTimeout(timeout); server.kill(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
