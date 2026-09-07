const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const modules = new Map();
const fakeEnv = {};
const logs = [];
let calls = [];
let reply;
let simulateTimeout = false;
function load(relative) {
  if (modules.has(relative)) return modules.get(relative);
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, relative + '.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const exports = {};
  const context = {
    exports, require: name => name === 'server-only' ? {} : load(name.replace(/^@\//, '')),
    process: { env: fakeEnv }, URL, URLSearchParams, AbortController,
    console: { warn: message => logs.push(message) },
    setTimeout: (callback, delay) => setTimeout(callback, simulateTimeout ? 5 : delay),
    clearTimeout,
    fetch: async (url, options) => {
      calls.push({ url: String(url), options });
      return reply(url, options);
    }
  };
  vm.runInNewContext(compiled, context, { filename: relative + '.ts' });
  modules.set(relative, exports);
  return exports;
}
const { interpretWithBailian } = load('lib/bailian');
const planner = load('lib/planner');
const { places } = load('data/places');
const base = { request: '带父母逛四个小时，不喝咖啡，想逛宜得利，尽量待在室内', scene: 'friends', duration: 240, budget: '300', walking: 'low' };
const valid = { scene: 'parents', duration: 240, budget: '300', walking: 'low', preferredPlaceIds: ['nitori'], excludedPlaceIds: ['daka-coffee', 'luckin-coffee'], indoorOnly: true };
const ok = (intent = valid) => ({ ok: true, status: 200, json: async () => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(intent) } }] }) });
async function run() {
  assert.equal(await interpretWithBailian(base), base);
  assert.equal(calls.length, 0, 'missing key must never call network');
  fakeEnv.DASHSCOPE_API_KEY = '误粘贴的示例文字';
  assert.equal((await interpretWithBailian(base)).intentSource, 'fallback');
  assert.equal(calls.length, 0, 'malformed key must not reach fetch');
  fakeEnv.DASHSCOPE_API_KEY = 'unit-test-key-never-a-real-secret';
  assert.equal((await interpretWithBailian({ ...base, request: '' })).intentSource, undefined);
  assert.equal(calls.length, 0, 'blank request must not incur a call');
  reply = () => ok();
  const resolved = await interpretWithBailian(base);
  assert.equal(resolved.intentSource, 'bailian');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.model, 'qwen-plus');
  assert.equal(body.enable_thinking, false);
  assert.equal(body.response_format.type, 'json_object');
  assert.equal(body.max_tokens, 800);
  assert.match(body.messages[0].content, /JSON/);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer unit-test-key-never-a-real-secret');
  assert.equal(calls[0].options.cache, 'no-store');
  const roundtrip = planner.parseInput(Object.fromEntries(new URLSearchParams(planner.queryString(resolved))));
  const plan = planner.createPlan(roundtrip);
  assert(plan.stops.some(stop => stop.id === 'nitori'));
  assert(plan.stops.every(stop => stop.category !== 'coffee' && stop.indoor));
  assert(plan.stops.every(stop => places.some(place => place.id === stop.id)));
  assert(plan.totalMinutes <= 240 && plan.totalPrice <= 300);
  for (const change of ['rain', 'walk', 'budget', 'queue']) planner.adjustPlan(roundtrip, change);
  assert.equal(calls.length, 1, 'viewing and adjusting must not call provider');
  assert(!planner.queryString(resolved).includes(fakeEnv.DASHSCOPE_API_KEY));
  for (const status of [400, 401, 403, 429, 500]) {
    reply = () => ({ ok: false, status });
    assert.equal((await interpretWithBailian(base)).intentSource, 'fallback');
  }
  for (const intent of [null, {}, { ...valid, scene: '__proto__' }, { ...valid, duration: 999999 }, { ...valid, budget: 'abc' }, { ...valid, preferredPlaceIds: ['invented-shop'] }, { ...valid, indoorOnly: 'true' }]) {
    reply = () => ok(intent);
    assert.equal((await interpretWithBailian(base)).intentSource, 'fallback');
  }
  reply = () => ({ ok: true, json: async () => ({ choices: [{ finish_reason: 'length', message: { content: JSON.stringify(valid) } }] }) });
  assert.equal((await interpretWithBailian(base)).intentSource, 'fallback');
  reply = () => { throw new Error('network failure with a secret: ' + fakeEnv.DASHSCOPE_API_KEY); };
  assert.equal((await interpretWithBailian(base)).intentSource, 'fallback');
  simulateTimeout = true;
  reply = (_, options) => new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted'))));
  assert.equal((await interpretWithBailian(base)).intentSource, 'fallback');
  simulateTimeout = false;
  fakeEnv.DASHSCOPE_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/';
  fakeEnv.DASHSCOPE_MODEL = 'custom-qwen-model';
  reply = () => ok();
  await interpretWithBailian(base);
  assert.equal(calls.at(-1).url, 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions');
  assert.equal(JSON.parse(calls.at(-1).options.body).model, 'custom-qwen-model');
  const invalid = planner.parseInput({ scene: '__proto__', budget: 'garbage', duration: 'NaN', walking: 'yes' });
  assert.equal(invalid.scene, 'friends');
  assert.equal(invalid.budget, '500');
  assert.equal(invalid.duration, 240);
  assert(planner.createPlan(invalid).stops.length);
  for (const scene of ['date', 'family', 'parents', 'friends', 'solo', 'rain']) {
    for (const duration of [90, 120, 240, 480]) {
      const constrained = planner.createPlan({ ...resolved, scene, duration, budget: '100' });
      assert(constrained.totalMinutes <= duration && constrained.totalPrice <= 100);
      assert(constrained.stops.every(stop => stop.indoor && stop.category !== 'coffee'));
    }
  }
  assert(!logs.join('\n').includes(fakeEnv.DASHSCOPE_API_KEY));
  console.log('PASS: provider defaults, success, no-key/no-text, errors, invalid JSON fields, timeout, overrides, URL roundtrip, no repeat calls, known-place constraints, budget/time matrix and sanitized logs.');
}
require('node:test')('Bailian integration safeguards and fallback', run);