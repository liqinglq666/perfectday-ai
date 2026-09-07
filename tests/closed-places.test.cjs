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
const planner = load('lib/planner');
const closed = load('lib/closed-places');

const baseParams = { scene: 'friends', duration: '240', budget: '300', walking: 'normal' };

test('Tims request is explained and redirected to a current coffee candidate', () => {
  const notices = closed.closedPlaceNotices('想去Tims天好咖啡坐一会');
  assert.equal(notices.length, 1);
  assert.equal(notices[0].closedAt, '2026-05-25');
  assert(notices[0].alternatives.some(item => item.id === 'luckin-coffee'));

  const input = planner.parseInput({ ...baseParams, request: '想去Tims天好咖啡坐一会' });
  assert(input.preferredPlaceIds.includes('luckin-coffee'));
  const plan = planner.createPlan(input);
  assert(plan.stops.some(stop => stop.id === 'luckin-coffee'));
});

test('explicitly rejected first replacement falls through to the next reviewed candidate', () => {
  const input = planner.parseInput({ ...baseParams, request: '想去Tims天好咖啡，但是不要瑞幸' });
  assert(input.excludedPlaceIds.includes('luckin-coffee'));
  assert(input.preferredPlaceIds.includes('daka-coffee'));
  assert(!input.preferredPlaceIds.includes('luckin-coffee'));
  const plan = planner.createPlan(input);
  assert(plan.stops.some(stop => stop.id === 'daka-coffee'));
});

test('closed restaurants redirect to a reviewed restaurant rather than becoming unknown text', () => {
  for (const [request, id, date] of [
    ['想吃湊湊火锅', 'closed-coucou-shiqi', '2026-05-31'],
    ['想去金阁佬吃饭', 'closed-jingelao-shiqi', '2026-05-06']
  ]) {
    const notices = closed.closedPlaceNotices(request);
    assert.equal(notices[0].id, id);
    assert.equal(notices[0].closedAt, date);
    const input = planner.parseInput({ ...baseParams, request });
    assert(input.preferredPlaceIds.includes('golden-food'));
    assert(planner.createPlan(input).stops.some(stop => stop.id === 'golden-food'));
  }
});

test('negative mention does not create a replacement or closure banner', () => {
  assert.equal(closed.closedPlaceNotices('不想去Tims').length, 0);
  const input = planner.parseInput({ ...baseParams, request: '不想去Tims' });
  assert(!input.preferredPlaceIds?.includes('luckin-coffee'));
});

test('closed-place correction also survives AI-resolved inputs', () => {
  const input = {
    request: '想去Tims喝咖啡', scene: 'friends', duration: 240, budget: '300', walking: 'normal',
    intentSource: 'bailian', preferredPlaceIds: [], excludedPlaceIds: [], indoorOnly: false
  };
  const plan = planner.createPlan(input);
  assert(plan.stops.some(stop => stop.id === 'luckin-coffee'));
});
