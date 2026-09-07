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
const { places } = load('data/places');
const base = { request: '', scene: 'friends', duration: 240, budget: '500', walking: 'normal' };
function checkRoute(plan, duration = 480, budget = 800) {
  assert(plan.totalMinutes <= duration);
  assert(plan.totalPrice <= budget);
  assert.equal(new Set(plan.stops.map(stop => stop.id)).size, plan.stops.length);
  let elapsed = 840;
  for (const stop of plan.stops) {
    assert(places.some(place => place.id === stop.id));
    assert.equal(stop.time, `${Math.floor(elapsed / 60) % 24}`.padStart(2, '0') + ':' + `${elapsed % 60}`.padStart(2, '0'));
    elapsed += stop.duration + stop.walkMinutes;
  }
  assert.equal(plan.totalMinutes, elapsed - 840);
  const connector = plan.stops.findIndex(stop => stop.category === 'connector');
  if (connector >= 0) {
    assert(connector > 0 && connector < plan.stops.length - 1, 'no orphan mall connectors');
    assert.notEqual(plan.stops[connector - 1].mall, plan.stops[connector + 1].mall);
  }
}
test('Chinese hours, named preferences and negative coffee request work without AI', () => {
  const input = planner.parseInput({ request: '一个人逛两小时，不喝咖啡，想逛宜得利，预算100元' });
  assert.equal(input.duration, 120);
  assert.equal(input.scene, 'solo');
  const plan = planner.createPlan(input);
  assert(plan.stops.some(stop => stop.id === 'nitori'));
  assert(plan.stops.every(stop => stop.category !== 'coffee'));
  checkRoute(plan, 120, 100);
  assert.equal(planner.parseInput({ request: '陪父母四个小时' }).duration, 240);
  assert.equal(planner.parseInput({ request: '一个半小时' }).duration, 90);
  assert.equal(planner.parseInput({ request: '两小时半' }).duration, 150);
  assert.equal(planner.parseInput({ request: '半天' }).duration, 240);
});
test('reviewed Holiday Plaza alternatives avoid crossing only because the local catalog was thin', () => {
  const dateLow = planner.createPlan({ ...base, scene: 'date', walking: 'low' });
  assert(dateLow.stops.length > 0);
  assert(dateLow.stops.every(stop => stop.mall === '假日广场'));
  assert(dateLow.stops.some(stop => stop.id === 'holiday-cafe-de-coral'));
  assert(dateLow.stops.every(stop => stop.category !== 'connector'));
  checkRoute(dateLow, 240, 500);

  const soloLow = planner.createPlan({ ...base, scene: 'solo', walking: 'low' });
  assert(soloLow.stops.every(stop => stop.mall === '假日广场'));
  assert(soloLow.stops.some(stop => stop.id === 'holiday-uniqlo'));
  checkRoute(soloLow, 240, 500);

  const dessertInput = planner.parseInput({ request: '一个人想吃糖水，少走路，逛两小时，预算100元' });
  const dessertPlan = planner.createPlan(dessertInput);
  assert(dessertPlan.stops.some(stop => stop.id === 'holiday-dessert'));
  assert(dessertPlan.stops.every(stop => stop.mall === '假日广场'));
  checkRoute(dessertPlan, 120, 100);
});
test('all scene, time, budget and walking combinations respect limits', () => {
  for (const scene of ['date', 'family', 'parents', 'friends', 'solo', 'rain'])
    for (const duration of [90, 120, 180, 240, 360, 480])
      for (const [budget, cap] of [['100', 100], ['300', 300], ['500', 500], ['plus', 800]])
        for (const walking of ['normal', 'low']) checkRoute(planner.createPlan({ ...base, scene, duration, budget, walking }), duration, cap);
});
test('rain, walking and budget changes compose, persist and report real differences', () => {
  const original = planner.createPlan(base);
  const combined = planner.adjustPlan(base, ['rain', 'walk', 'budget']);
  assert(combined.stops.every(stop => stop.indoor));
  assert(new Set(combined.stops.map(stop => stop.mall)).size <= 1);
  assert(combined.totalPrice < original.totalPrice);
  assert(combined.totalWalkMinutes < original.totalWalkMinutes);
  checkRoute(combined, base.duration, 500);
  const qs = planner.queryString(base) + planner.changeQuery(['rain', 'budget']);
  const decoded = Object.fromEntries(new URLSearchParams(qs));
  assert.equal(planner.parseChanges(decoded).join(','), 'rain,budget');
  assert.equal(planner.parseChanges({ change: 'queue' }).join(','), 'queue');
  assert.equal(planner.parseChanges({ changes: 'rain,evil,rain,walk' }).join(','), 'rain,walk');
  const indoor = { ...base, scene: 'rain' };
  assert.match(planner.describeChanges(planner.createPlan(indoor), planner.adjustPlan(indoor, 'rain')), /无需额外调整/);
});
test('explicit exclusions and tight limits never manufacture a route', () => {
  const resolved = { ...base, intentSource: 'bailian', duration: 90, budget: '100', preferredPlaceIds: ['nitori'], excludedPlaceIds: ['daka-coffee', 'golden-coffee', 'luckin-coffee'], indoorOnly: true };
  const plan = planner.createPlan(resolved);
  assert(plan.stops.some(stop => stop.id === 'nitori'));
  assert(plan.stops.every(stop => stop.indoor && stop.category !== 'coffee'));
  checkRoute(plan, 90, 100);
  assert.equal(planner.createPlan({ ...resolved, excludedPlaceIds: places.map(place => place.id) }).stops.length, 0);
  for (const request of ['不想去瑞幸', '不要逛宜得利', '不想吃晚饭']) {
    const input = planner.parseInput({ request });
    assert(planner.createPlan(input).stops.every(stop => !input.excludedPlaceIds.includes(stop.id)));
  }
});
