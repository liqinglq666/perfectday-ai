const test = require('node:test');
const assert = require('node:assert/strict');
const { createTsLoader } = require('./helpers/load-ts.cjs');

const load = createTsLoader();
const j = load('lib/journey');
const planner = load('lib/planner');
const base = planner.parseInput({ scene: 'friends', duration: '360', budget: '300', walking: 'normal' });
function stateWith(ids, overrides = {}) {
  return { ...j.startJourney(base), pending: ids.map(id => ({ id })), ...overrides };
}
function assertFits(state, input = base) {
  const plan = j.journeyPlan(state, input);
  assert(plan.totalMinutes <= state.minutes, 'fits remaining minutes including travel');
  assert(plan.totalPrice <= state.cash, 'fits remaining money');
  assert.equal(new Set([...state.pending, ...state.done].map(stop => stop.id)).size, state.pending.length + state.done.length);
  return plan;
}
test('completing one stop preserves its snapshot, advances time and reduces balances', () => {
  const initial = j.startJourney(base), first = j.journeyPlan(initial, base).stops[0];
  const after = j.advanceJourney(base, initial);
  assert.equal(after.done.length, 1);
  assert.equal(after.done[0].id, first.id);
  assert.equal(after.done[0].t, 840);
  assert.equal(after.minutes, initial.minutes - first.duration - first.walkMinutes);
  assert.equal(after.cash, initial.cash - first.price);
  assert.equal(initial.done.length, 0, 'source state stays immutable');
  const next = assertFits(after);
  assert.equal(next.stops[0].time, j.clockText(840 + first.duration + first.walkMinutes));
});
test('completed paid and outdoor stops survive all later adjustments unchanged', () => {
  let state = stateWith(['holiday-start', 'daka-coffee', 'connector', 'golden-food']);
  state = j.advanceJourney(base, state);
  state = j.advanceJourney(base, state);
  const snapshot = JSON.stringify(state.done);
  const result = j.replanRemaining(base, state, ['rain', 'walk', 'budget', 'queue']);
  assert.equal(JSON.stringify(result.journey.done), snapshot);
  assert.equal(result.journey.current, 'holiday');
  assert.equal(result.journey.pending.length, 0, 'no surprise relocation to another mall');
});
test('only remaining budget is used; completed spending is not subtracted twice', () => {
  let state = stateWith(['daka-coffee', 'connector', 'golden-food']);
  state = j.advanceJourney(base, state);
  const result = j.replanRemaining(base, { ...state, cash: 120, minutes: 120 });
  assert(result.journey.pending.some(stop => stop.id === 'golden-food'));
  assertFits(result.journey);
  const limited = j.replanRemaining(base, { ...state, cash: 80, minutes: 120 });
  assert.equal(limited.journey.pending.length, 0);
  assert.match(limited.removed[0].reason, /预算/);
});
test('crossing is retained from the current mall and does not reappear after completion', () => {
  let state = stateWith(['connector', 'nitori'], { current: 'holiday' });
  state = j.replanRemaining(base, state).journey;
  assert.equal(state.pending[0].id, 'connector');
  state = j.advanceJourney(base, state);
  assert.equal(state.current, 'golden');
  assert.equal(state.pending[0].id, 'nitori');
  assert.equal(state.done[0].id, 'connector');
  assertFits(state);
});
test('skip does not spend money or time or claim arrival; refusing crossing removes far stops', () => {
  const initial = stateWith(['daka-coffee', 'connector', 'nitori'], { current: 'holiday' });
  const skipped = j.advanceJourney(base, initial, true);
  assert.equal(skipped.minutes, initial.minutes);
  assert.equal(skipped.cash, initial.cash);
  assert.equal(skipped.done.length, 0);
  assert.equal(skipped.skipped[0], 'daka-coffee');
  const stay = j.advanceJourney(base, skipped, true);
  assert.equal(stay.pending.length, 0);
  assert.equal(stay.current, 'holiday');
});
test('zero budget allows free browsing; zero time creates an honest empty remainder', () => {
  const initial = stateWith(['nitori', 'golden-food'], { current: 'golden', cash: 0 });
  const free = j.replanRemaining(base, initial).journey;
  assert.equal(free.pending.length, 1);
  assert.equal(free.pending[0].id, 'nitori');
  assertFits(free);
  const end = j.replanRemaining(base, { ...initial, minutes: 0 }).journey;
  assert.equal(end.pending.length, 0);
});
test('share links round trip completion, skipped stops, real meal replacement, current position and balances', () => {
  let state = stateWith(['daka-coffee', 'connector', 'golden-food'], { current: 'holiday' });
  state = j.advanceJourney(base, state, true);
  state = j.advanceJourney(base, state);
  state = j.replanRemaining(base, state, ['queue']).journey;
  state = j.applyRemainingFields(state, { left: '80', cash: '123', from: '17:35', current: 'golden' });
  const params = Object.fromEntries(new URLSearchParams(j.journeyUrl(base, state).split('?')[1]));
  const decoded = j.readJourney(planner.parseInput(params), params);
  assert.equal(JSON.stringify(decoded), JSON.stringify(state));
  assert.equal(j.journeyPlan(decoded, base).stops[0].time, '17:35');
  assert.equal(j.journeyPlan(decoded, base).stops[0].id, 'golden-zhenlong');
});
test('preview is repeatable, supports multiselect HTML forms and never mutates history', () => {
  const state = stateWith(['daka-coffee', 'connector', 'golden-food']);
  const flags = planner.parseChanges({ changes: ['queue', 'budget'] });
  assert.equal(flags.join(','), 'queue,budget');
  const a = j.replanRemaining(base, state, flags), b = j.replanRemaining(base, state, flags);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(state.pending.length, 3);
});
test('progress parser rejects unknown IDs, duplicate visits, malformed and oversized state', () => {
  const valid = j.startJourney(base);
  for (const bad of [null, '{', 'x'.repeat(7001), JSON.stringify({ ...valid, v: 2 }), JSON.stringify({ ...valid, minutes: -1 }),
    JSON.stringify({ ...valid, pending: [{ id: '__proto__' }] }), JSON.stringify({ ...valid, pending: [{ id: 'nitori', q: 1 }] }),
    JSON.stringify({ ...valid, pending: [{ id: 'nitori' }, { id: 'nitori' }] }), JSON.stringify({ ...valid, cash: '300' })]) assert.equal(j.decodeJourney(bad), null);
  const edited = j.applyRemainingFields(valid, { left: '-50', cash: 'NaN', from: '25:90', current: 'unknown' });
  assert.equal(JSON.stringify(edited), JSON.stringify(valid));
});
test('full trip can finish across malls without duplicate, lost or resurrected visits', () => {
  let state = j.startJourney(base), expected = state.pending.map(stop => stop.id), steps = 0;
  while (state.pending.length && steps++ < 20) {
    state = j.advanceJourney(base, state);
    const encoded = JSON.stringify(state);
    state = j.decodeJourney(encoded);
    assert(state, 'every intermediate URL state is valid');
    assertFits(state);
  }
  assert.equal(state.pending.length, 0);
  assert.equal(state.done.map(stop => stop.id).join(','), expected.join(','));
  assert.equal(j.advanceJourney(base, state), state, 'completed journeys are stable');
});
test('time fitting preserves a preferred stop where feasible and counts the crossing', () => {
  const input = { ...base, preferredPlaceIds: ['nitori'] };
  const result = j.replanRemaining(input, stateWith(['boya-bookstore', 'connector', 'nitori'], { current: 'holiday', minutes: 60 }));
  const plan = assertFits(result.journey, input);
  assert.equal(plan.totalMinutes, 60);
  assert.equal(result.journey.pending.map(stop => stop.id).join(','), 'connector,nitori');
});
test('rain never re-inserts an unverified sheltered crossing in initial routes', () => {
  const input = { ...base, scene: 'rain', preferredPlaceIds: ['boya-bookstore', 'nitori'] };
  const plan = planner.createPlan(input);
  assert(plan.stops.every(stop => stop.indoor));
  assert.equal(new Set(plan.stops.map(stop => stop.mall)).size, 1);
});
test('walking adjustment replaces a far meal with a reviewed Holiday Plaza meal instead of only deleting it', () => {
  const state = stateWith(['connector', 'golden-food'], { current: 'holiday', minutes: 180, cash: 200 });
  const result = j.replanRemaining(base, state, ['walk']);
  assert.equal(result.journey.pending.map(stop => stop.id).join(','), 'holiday-cafe-de-coral');
  assert.match(result.removed.find(item => item.id === 'golden-food').reason, /大家乐/);
  assertFits(result.journey);
});
test('walking adjustment can replace far shopping with the reviewed Holiday Plaza UNIQLO candidate', () => {
  const state = stateWith(['connector', 'golden-shopping'], { current: 'holiday', minutes: 120, cash: 100 });
  const result = j.replanRemaining(base, state, ['walk']);
  assert.equal(result.journey.pending.map(stop => stop.id).join(','), 'holiday-uniqlo');
  assertFits(result.journey);
});
test('queue adjustment prefers named same-mall restaurants on both sides of the district', () => {
  const golden = j.replanRemaining(base, stateWith(['golden-food'], { current: 'golden', minutes: 120, cash: 200 }), ['queue']);
  assert.equal(golden.journey.pending[0].id, 'golden-zhenlong');
  assert.match(golden.removed[0].reason, /臻龙/);
  assert.equal(j.journeyPlan(golden.journey, base).stops[0].evidenceStatus, 'online_listing');

  const holiday = j.replanRemaining(base, stateWith(['holiday-cafe-de-coral'], { current: 'holiday', minutes: 120, cash: 100 }), ['queue']);
  assert.equal(holiday.journey.pending[0].id, 'holiday-ajisen');
  assert.match(holiday.removed[0].reason, /味千/);
  assert.equal(j.journeyPlan(holiday.journey, base).stops[0].evidenceStatus, 'online_listing');
});
test('rain, walking, queue and shorter time each create a visible remaining-route change', () => {
  const original = stateWith(['holiday-start', 'boya-bookstore', 'daka-coffee', 'connector', 'golden-food'], {
    current: 'holiday', minutes: 240, cash: 300
  });
  const originalSignature = original.pending.map(stop => stop.id).join(',');

  const rain = j.replanRemaining(base, original, ['rain']);
  const rainPlan = assertFits(rain.journey);
  assert.notEqual(rain.journey.pending.map(stop => stop.id).join(','), originalSignature);
  assert(rainPlan.stops.every(stop => stop.indoor));
  assert.equal(new Set(rainPlan.stops.map(stop => stop.mall)).size, 1);

  const walk = j.replanRemaining(base, original, ['walk']);
  const walkPlan = assertFits(walk.journey);
  assert.notEqual(walk.journey.pending.map(stop => stop.id).join(','), originalSignature);
  assert.equal(new Set(walkPlan.stops.map(stop => stop.mall)).size, 1);

  const queue = j.replanRemaining(base, original, ['queue']);
  assert.notEqual(queue.journey.pending.map(stop => stop.id).join(','), originalSignature);
  assert(queue.journey.pending.some(stop => stop.id === 'golden-zhenlong'));
  assert(queue.removed.some(item => /排队时改为同商场备选/.test(item.reason)));
  assertFits(queue.journey);

  const shorter = j.replanRemaining(base, { ...original, minutes: 90 });
  assert(shorter.journey.pending.length < original.pending.length);
  assert(shorter.removed.some(item => /剩余时间不足/.test(item.reason)));
  assertFits(shorter.journey);
});
test('same-mall replacement never resurrects a completed stop and queue can continue to a second real meal fallback', () => {
  const done = [{ id: 'daka-coffee', t: 840, d: 45, p: 32, w: 4 }];
  const state = stateWith(['connector', 'luckin-coffee', 'golden-food'], { current: 'holiday', done, minutes: 180, cash: 200 });
  const result = j.replanRemaining(base, state, ['walk', 'queue']);
  assert(!result.journey.pending.some(stop => stop.id === 'daka-coffee'));
  assert(result.journey.pending.some(stop => stop.id === 'holiday-dessert'));
  assert(result.journey.pending.some(stop => stop.id === 'holiday-ajisen'));
  const food = j.journeyPlan(result.journey, base).stops.find(stop => stop.category === 'food');
  assert(food);
  assert.equal(food.id, 'holiday-ajisen');
  assertFits(result.journey);
});

test('repeated queue changes never return to declined meals and persist through shared links', () => {
  let state = stateWith(['holiday-cafe-de-coral'], { current: 'holiday', minutes: 240, cash: 300 });
  state = j.replanRemaining(base, state, ['queue']).journey;
  assert.equal(state.pending[0].id, 'holiday-ajisen');
  assert.equal(state.unavailableMeals.join(','), 'holiday-cafe-de-coral');
  state = j.decodeJourney(JSON.stringify(state));
  state = j.replanRemaining(base, state, ['queue']).journey;
  assert.equal(state.pending[0].q, 1, 'exhaustion becomes honest area guidance, not another known queued restaurant');
  assert.equal(state.unavailableMeals.join(','), 'holiday-cafe-de-coral,holiday-ajisen');
  const area = JSON.stringify(state);
  assert.equal(JSON.stringify(j.replanRemaining(base, state, ['queue']).journey), area);
  assertFits(state);

  let golden = stateWith(['golden-food'], { current: 'golden', minutes: 240, cash: 300 });
  const visited = [];
  while (!golden.pending[0].q && visited.length < 10) {
    visited.push(golden.pending[0].id);
    golden = j.replanRemaining(base, golden, ['queue']).journey;
    golden = j.decodeJourney(JSON.stringify(golden));
    assert(golden);
  }
  assert.equal(new Set(visited).size, visited.length);
  assert.equal(visited.join(','), 'golden-food,golden-zhenlong,golden-longfa');
  assert.equal(golden.pending[0].q, 1);
});

test('queue history validation rejects non-meal IDs, duplicates and oversized payloads; old links remain valid', () => {
  const state = j.startJourney(base);
  assert(j.decodeJourney(JSON.stringify(state)));
  for (const unavailableMeals of [null, 'golden-food', ['nitori'], ['unknown'], ['golden-food', 'golden-food'], Array(30).fill('golden-food')]) {
    assert.equal(j.decodeJourney(JSON.stringify({ ...state, unavailableMeals })), null);
  }
});
