const test = require('node:test');
const assert = require('node:assert/strict');
const { createTsLoader } = require('./helpers/load-ts.cjs');
const load = createTsLoader();
const planner = load('lib/planner');
const journey = load('lib/journey');
const { budgetCap } = load('lib/plan-config');
const { places } = load('data/places');

test('explicit budget is preserved through planning, sharing and completion', () => {
  for (const ai of ['', 'fallback', 'bailian']) {
    for (const amount of [0, 9, 20, 50, 150, 299]) {
      const input = planner.parseInput({ request: `预算${amount}元，和朋友逛半天`, ai, walking: 'low',
        ...(ai === 'bailian' ? { cap: String(amount), budget: amount <= 100 ? '100' : '300' } : {}) });
      assert.equal(budgetCap(input), amount);
      const plan = planner.createPlan(input);
      assert(plan.totalPrice <= amount, `route exceeds ${amount}`);
      const state = journey.startJourney(input);
      assert.equal(state.cash, amount);
      const params = Object.fromEntries(new URLSearchParams(journey.journeyUrl(input, state).split('?')[1]));
      assert.equal(budgetCap(planner.parseInput(params)), amount);
      const after = journey.advanceJourney(input, state);
      assert.equal(after.cash, amount - (plan.stops[0]?.price || 0));
    }
  }
  assert.equal(budgetCap(planner.parseInput({ request: '预算五十元' })), 50);
  assert.equal(budgetCap(planner.parseInput({ request: '预算30到50元' })), 50);
  assert.equal(planner.parseInput({ request: '只有90到120分钟' }).budget, '500');
  for (const cap of ['-1', 'NaN', 'Infinity', '10001', '1.5']) {
    assert.equal(planner.parseInput({ cap }).budgetLimit, undefined);
  }
});

test('minute, Chinese numeral and mixed-unit durations survive links without rounding up', () => {
  const examples = [['只有90分钟，想去书店和喝咖啡', 90], ['九十分钟', 90], ['一个小时30分钟', 90],
    ['一个半小时', 90], ['两小时半', 150], ['半小时', 30], ['只有45分钟', 45], ['一小时', 60]];
  for (const [request, duration] of examples) {
    for (const ai of ['', 'fallback', 'bailian']) {
      const input = planner.parseInput({ request, ai, ...(ai === 'bailian' ? { duration: String(duration) } : {}) });
      assert.equal(input.duration, duration, request);
      assert(planner.createPlan(input).totalMinutes <= duration);
      assert.equal(journey.startJourney(input).minutes, duration);
      const restored = planner.parseInput(Object.fromEntries(new URLSearchParams(planner.queryString(input))));
      assert.equal(restored.duration, duration);
    }
  }
});

test('rain preserves family and parents scene while enforcing indoor routes', () => {
  for (const ai of ['', 'fallback', 'bailian']) {
    const input = planner.parseInput({ request: '雨天带孩子去亲子乐园，逛三小时', ai, scene: 'rain',
      ...(ai === 'bailian' ? { scene: 'family', indoor: '1', duration: '180', preferred: 'golden-family' } : {}) });
    assert.equal(input.scene, 'family');
    assert.equal(input.indoorOnly, true);
    const plan = planner.createPlan(input);
    assert(plan.stops.some(stop => stop.id === 'golden-family'));
    assert(plan.stops.every(stop => stop.indoor));
    assert.equal(new Set(plan.stops.map(stop => stop.mall)).size, 1);
  }
  assert.equal(planner.parseInput({ request: '下雨，陪爸妈逛街' }).scene, 'parents');
});

test('coffee exclusions preserve explicitly requested dessert and survive replan', () => {
  const input = planner.parseInput({ request: '不喝咖啡，想去珠珑入水吃糖水，逛两小时' });
  const plan = planner.createPlan(input);
  assert(plan.stops.some(stop => stop.id === 'holiday-dessert'));
  assert(plan.stops.every(stop => stop.category !== 'coffee'));
  const adjusted = journey.replanRemaining(input, journey.startJourney(input), ['walk', 'rain']);
  assert(journey.journeyPlan(adjusted.journey, input).stops.some(stop => stop.id === 'holiday-dessert'));
  const noDessert = planner.parseInput({ request: '不吃甜品，想喝咖啡' });
  assert(planner.createPlan(noDessert).stops.some(stop => stop.category === 'coffee'));
  assert(planner.createPlan(noDessert).stops.every(stop => stop.category !== 'dessert'));
});

test('an empty template is refilled from eligible catalog entries without relaxing constraints', () => {
  const input = planner.parseInput({ request: '只逛万象汇，不吃饭，只有90分钟，预算0元' });
  const plan = planner.createPlan(input);
  assert(plan.stops.length > 0);
  assert(plan.stops.every(stop => stop.mall !== '假日广场' && !['food', 'connector'].includes(stop.category)));
  assert.equal(plan.totalPrice, 0);
  assert(plan.totalMinutes <= 90);
  assert.equal(planner.createPlan({ ...input, intentSource: 'bailian', request: '',
    excludedPlaceIds: places.map(place => place.id) }).stops.length, 0);
});

test('valid AI cuisine preferences remain while generic dinner does not select every restaurant', () => {
  for (const [request, preferred] of [['我想吃拉面', 'holiday-ajisen'], ['想吃鸡煲', 'golden-longfa'], ['想吃葡式菜', 'golden-zhenlong']]) {
    const input = planner.parseInput({ request, ai: 'bailian', preferred, duration: '240', budget: '300' });
    assert(input.preferredPlaceIds.includes(preferred));
    assert(planner.createPlan(input).stops.some(stop => stop.id === preferred));
  }
});
