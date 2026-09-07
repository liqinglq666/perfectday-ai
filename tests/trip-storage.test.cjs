const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const storage = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/trip-storage.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText, { exports: storage, URL });
const href = '/trip?scene=friends&journey=%7B%22v%22%3A1%7D';
const after = href + '&step=1';
test('recent trip survives serialization and rejects corrupt or unsafe stored links', () => {
  const trip = { v: 1, href, title: '朋友半日游', done: 2, left: 3, savedAt: Date.now() };
  assert.equal(JSON.stringify(storage.readSavedTrip(JSON.stringify(trip))), JSON.stringify(trip));
  for (const raw of [null, '{broken', '[]', 'null']) assert.equal(storage.readSavedTrip(raw), null);
  for (const bad of ['https://evil.example/trip?journey=1', '//evil.example/trip?journey=1', 'javascript:alert(1)', '/guide?journey=1', '/trip?scene=friends'])
    assert.equal(storage.readSavedTrip(JSON.stringify({ ...trip, href: bad })), null);
  for (const overrides of [{ v: 2 }, { done: -1 }, { left: 1.5 }, { savedAt: 0 }, { title: 'x'.repeat(81) }])
    assert.equal(storage.readSavedTrip(JSON.stringify({ ...trip, ...overrides })), null);
});
test('undo is offered only for the exact current trip and cannot redirect outside the app', () => {
  const undo = { from: href, to: after, label: '跳过这一站' };
  assert.equal(JSON.stringify(storage.readTripUndo(JSON.stringify(undo), after)), JSON.stringify(undo));
  assert.equal(storage.readTripUndo(JSON.stringify(undo), href), null);
  for (const overrides of [{ from: after }, { from: 'https://evil.example/trip?journey=1' }, { label: 'x'.repeat(61) }])
    assert.equal(storage.readTripUndo(JSON.stringify({ ...undo, ...overrides }), after), null);
  assert.equal(storage.readTripUndo('{broken', after), null);
});
