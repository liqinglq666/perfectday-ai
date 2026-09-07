const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const modules = new Map();
function load(name) {
  if (modules.has(name)) return modules.get(name);
  const code = ts.transpileModule(fs.readFileSync(path.join(root, name + '.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => load(name.replace(/^@\//, '')), URLSearchParams });
  modules.set(name, exports);
  return exports;
}
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
test('share links round trip completion, skipped stops, replacement, current position and balances', () => {
  let state = stateWith(['daka-coffee', 'connector', 'golden-food'], { current: 'holiday' });
  state = j.advanceJourney(base, state, true);
  state = j.advanceJourney(base, state);
  state = j.replanRemaining(base, state, ['queue']).journey;
  state = j.applyRemainingFields(state, { left: '80', cash: '123', from: '17:35', current: 'golden' });
  const params = Object.fromEntries(new URLSearchParams(j.journeyUrl(base, state).split('?')[1]));
  const decoded = j.readJourney(planner.parseInput(params), params);
  assert.equal(JSON.stringify(decoded), JSON.stringify(state));
  assert.equal(j.journeyPlan(decoded, base).stops[0].time, '17:35');
  assert.equal(j.journeyPlan(decoded, base).stops[0].status, 'replaced');
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
