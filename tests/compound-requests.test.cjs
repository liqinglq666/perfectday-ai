const test = require('node:test');
const assert = require('node:assert/strict');
const { createTsLoader } = require('./helpers/load-ts.cjs');
const load = createTsLoader();
const planner = load('lib/planner');
const journey = load('lib/journey');
const { budgetCap } = load('lib/plan-config');
const { places } = load('data/places');

function checkRoundtrip(input) {
  const plan = planner.createPlan(input);
  assert(plan.totalMinutes <= input.duration);
  assert(plan.totalPrice <= budgetCap(input));
  assert.equal(new Set(plan.stops.map(stop => stop.id)).size, plan.stops.length);
  assert(plan.stops.every(stop => !input.excludedPlaceIds?.includes(stop.id)));
  if (input.indoorOnly) assert(plan.stops.every(stop => stop.indoor));
  const state = journey.startJourney(input);
  assert.equal(state.minutes, input.duration);
  assert.equal(state.cash, budgetCap(input));
  const params = Object.fromEntries(new URLSearchParams(journey.journeyUrl(input, state).split('?')[1]));
  const restored = planner.parseInput(params);
  assert.deepEqual(JSON.parse(JSON.stringify(restored)), JSON.parse(JSON.stringify(input)), 'resolved semantics survive sharing');
  assert.equal(JSON.stringify(journey.readJourney(restored, params)), JSON.stringify(state));
  assert.equal(planner.createPlan(restored).stops.map(stop => stop.id).join(','), plan.stops.map(stop => stop.id).join(','));
  const advanced = journey.advanceJourney(restored, state);
  assert(advanced.minutes >= 0 && advanced.cash >= 0);
  const changed = journey.replanRemaining(restored, advanced, ['rain', 'walk']);
  assert.equal(JSON.stringify(changed.journey.done), JSON.stringify(advanced.done));
  return plan;
}

test('local duration scopes distinguish visiting time from transport and waiting in either order', () => {
  const cases = [
    ['今天逛90分钟，来回坐车需要两小时', 90],
    ['来回坐车需要两小时，今天逛90分钟', 90],
    ['来回坐车需要两小时今天逛90分钟', 90],
    ['今天逛90分钟然后坐车两小时', 90],
    ['等朋友30分钟，再逛一个半小时', 90],
    ['排队需要两小时，只有45分钟逛街', 45],
    ['两小时车程，逛九十分钟', 90],
    ['坐车要两小时，预算50元', 180],
    ['坐车只有两小时', 180],
    ['等车30分钟', 180],
    ['逛半天，回去坐车一个半小时', 240]
  ];
  for (const ai of ['', 'fallback']) for (const [request, duration] of cases) {
    const input = planner.parseInput({ request, ai, duration: '180' });
    assert.equal(input.duration, duration, request);
    checkRoundtrip(input);
  }
});

test('local budget scopes never consume duration or transport cost as a budget', () => {
  for (const request of [
    '预算不限，逛两小时', '预算没想好，逛90分钟', '预算不限逛两小时',
    '预算没想好逛90分钟', '预算待定；逛两小时', '人均不确定。今天逛90分钟',
    '预算90分钟', '来回车费30到50元，逛两小时'
  ]) {
    const input = planner.parseInput({ request, budget: '300' });
    assert.equal(input.budgetLimit, undefined, request);
    assert.equal(budgetCap(input), 300, request);
    checkRoundtrip(input);
  }
  for (const [request, cap] of [
    ['预算五十元，逛两小时，车费30元', 50], ['车费30元，预算不超过50元，逛90分钟', 50],
    ['预算30到50元，只有90分钟', 50], ['预算：0元，来回坐车两小时，逛90分钟', 0],
    ['预算50，逛两小时', 50], ['30到50元，逛两小时', 50]
  ]) {
    const input = planner.parseInput({ request });
    assert.equal(budgetCap(input), cap, request);
    checkRoundtrip(input);
  }
});

test('local weather negations preserve both malls while explicit indoor requests still constrain the route', () => {
  for (const weather of ['今天不会下雨', '今天不下雨', '今天没有下雨', '今天不是雨天']) {
    const input = planner.parseInput({ request: `${weather}，想逛书店和宜得利`, walking: 'normal' });
    assert.equal(input.indoorOnly, false, weather);
    const plan = checkRoundtrip(input);
    for (const id of ['boya-bookstore', 'nitori']) assert(plan.stops.some(stop => stop.id === id));
  }
  for (const request of ['今天不会下雨，但只想室内，想逛书店和宜得利', '上午不下雨，下午下雨，想逛书店和宜得利']) {
    const input = planner.parseInput({ request, walking: 'normal' });
    assert.equal(input.indoorOnly, true);
    assert.equal(new Set(checkRoundtrip(input).stops.map(stop => stop.mall)).size, 1);
  }
});

test('coffee plus dessert keeps two requested stops and keeps exclusions and named coffee behavior', () => {
  for (const request of ['想喝咖啡，也想吃糖水，逛四小时', '想吃糖水，也想喝咖啡，逛四小时']) {
    const input = planner.parseInput({ request });
    const plan = checkRoundtrip(input);
    for (const id of ['daka-coffee', 'holiday-dessert']) {
      assert(input.preferredPlaceIds.includes(id));
      assert(plan.stops.some(stop => stop.id === id));
    }
  }
  const named = planner.parseInput({ request: '想喝瑞幸咖啡，也想吃糖水，逛四小时' });
  assert.equal(named.preferredPlaceIds.includes('daka-coffee'), false);
  const namedPlan = checkRoundtrip(named);
  assert(namedPlan.stops.some(stop => stop.id === 'luckin-coffee'));
  assert(namedPlan.stops.some(stop => stop.id === 'holiday-dessert'));
  for (const [request, present, absent] of [
    ['想吃糖水，逛四小时', 'dessert', 'coffee'],
    ['不喝咖啡，想吃糖水，逛四小时', 'dessert', 'coffee'],
    ['不吃糖水，想喝咖啡，逛四小时', 'coffee', 'dessert']
  ]) {
    const plan = checkRoundtrip(planner.parseInput({ request }));
    assert(plan.stops.some(stop => stop.category === present));
    assert(plan.stops.every(stop => stop.category !== absent));
  }
});

test('post-limit refill finds affordable short mall routes without bypassing any exclusion', () => {
  for (const request of [
    '只逛万象汇，预算50元，逛两小时', '只逛万象汇，只有60分钟',
    '只逛万象汇，预算0元，只有60分钟',
    '只逛万象汇，下雨，不喝咖啡，不吃饭，只有60分钟，预算0元'
  ]) {
    const input = planner.parseInput({ request });
    const plan = checkRoundtrip(input);
    assert(plan.stops.length > 0, request);
    assert(plan.stops.every(stop => stop.mall !== '假日广场' && stop.category !== 'connector'), request);
  }
  const base = planner.parseInput({ request: '只逛万象汇，只有60分钟' });
  for (const input of [
    { ...base, request: '', intentSource: 'bailian', excludedPlaceIds: places.map(place => place.id) },
    { ...base, request: '', intentSource: 'bailian', duration: 1 }
  ]) assert.equal(checkRoundtrip(input).stops.length, 0, 'no route if nothing actually fits');
});

test('validated AI semantics survive decoding, planning, sharing and remaining-trip adjustment', async () => {
  let responseIntent;
  let calls = 0;
  const aiLoad = createTsLoader({
    requireOverrides: { 'server-only': {} },
    globals: {
      process: { env: { DASHSCOPE_API_KEY: 'unit-test-key' } }, AbortController, setTimeout, clearTimeout,
      fetch: async () => {
        calls++;
        return { ok: true, json: async () => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(responseIntent) } }] }) };
      }
    }
  });
  const { interpretWithBailian } = aiLoad('lib/bailian');
  const base = { request: '', scene: 'friends', duration: 240, budget: '500', walking: 'normal' };
  const intent = { ...base, budgetLimit: null, mealIntent: 'none', indoorOnly: false, preferredPlaceIds: [], excludedPlaceIds: [] };
  const cases = [
    ['今天逛90分钟，来回坐车需要两小时', { duration: 90 }],
    ['来回坐车需要两小时，今天逛90分钟', { duration: 90 }],
    ['预算不限，逛两小时', { duration: 120 }],
    ['预算没想好，逛90分钟', { duration: 90 }],
    ['今天不会下雨，想逛书店和宜得利', { preferredPlaceIds: ['boya-bookstore', 'nitori'] }],
    ['我想吃面条', { mealIntent: 'specific', preferredPlaceIds: ['holiday-ajisen'] }],
    ['想吃一碗热汤面', { mealIntent: 'specific', preferredPlaceIds: ['holiday-ajisen'] }],
    ['想喝咖啡，也想吃糖水，逛四小时', { preferredPlaceIds: ['daka-coffee', 'holiday-dessert'] }],
    ['预算50元，逛90分钟，来回坐车两小时', { budget: '100', budgetLimit: 50, duration: 90 }],
    ['雨天带孩子逛三小时', { scene: 'family', duration: 180, indoorOnly: true, preferredPlaceIds: ['golden-family'] }],
    // Semantic budget amounts need not be digits local regular expressions recognize.
    ['拿一张红票子逛街', { budget: '100', budgetLimit: 100 }]
  ];
  for (const [request, fields] of cases) {
    responseIntent = { ...intent, ...fields };
    const resolved = await interpretWithBailian({ ...base, request });
    assert.equal(resolved.intentSource, 'bailian', request);
    for (const key of ['scene', 'duration', 'budget', 'walking', 'indoorOnly', 'mealIntent']) {
      assert.equal(resolved[key], responseIntent[key], `${request}: ${key}`);
    }
    assert.equal(resolved.budgetLimit, responseIntent.budgetLimit ?? undefined);
    const before = calls;
    const restored = planner.parseInput(Object.fromEntries(new URLSearchParams(planner.queryString(resolved))));
    for (const key of ['scene', 'duration', 'budget', 'budgetLimit', 'walking', 'indoorOnly', 'mealIntent']) {
      assert.equal(restored[key], resolved[key], `${request}: restored ${key}`);
    }
    assert.equal(restored.preferredPlaceIds.join(','), responseIntent.preferredPlaceIds.join(','));
    const plan = checkRoundtrip(restored);
    for (const id of responseIntent.preferredPlaceIds) assert(plan.stops.some(stop => stop.id === id), request);
    assert.equal(calls, before, 'links and adjustments never reinterpret the request');
  }
});

test('explicit generic AI meal intent keeps one local dinner without keyword-filtering specific or legacy preferences', () => {
  const candidates = 'boya-bookstore,daka-coffee,golden-food,golden-zhenlong,golden-longfa';
  const generic = planner.parseInput({ request: '喝咖啡，再吃晚饭', ai: 'bailian', meal: 'generic', preferred: candidates });
  const plan = checkRoundtrip(generic);
  assert.equal(plan.stops.filter(stop => stop.category === 'food').length, 1);
  assert.equal(plan.stops.find(stop => stop.category === 'food').mall, '假日广场');
  for (const meal of ['specific', undefined]) {
    const input = planner.parseInput({ request: '我想吃面条', ai: 'bailian', meal, preferred: 'holiday-ajisen' });
    assert(input.preferredPlaceIds.includes('holiday-ajisen'));
    assert(checkRoundtrip(input).stops.some(stop => stop.id === 'holiday-ajisen'));
  }
  const excluded = planner.parseInput({ request: '想吃面条', ai: 'bailian', meal: 'specific', preferred: 'holiday-ajisen', excluded: 'holiday-ajisen' });
  assert(checkRoundtrip(excluded).stops.every(stop => stop.id !== 'holiday-ajisen'));
});
