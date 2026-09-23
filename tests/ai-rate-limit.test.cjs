const test = require('node:test');
const assert = require('node:assert/strict');
const { createTsLoader } = require('./helpers/load-ts.cjs');

const load = createTsLoader();
const { aiClientKey, consumeAiAllowance, AI_RATE_LIMITS } = load('lib/ai-rate-limit');

test('changing User-Agent cannot grant a fresh IP allowance', () => {
  const ip = '192.0.2.42';
  for (let index = 0; index < AI_RATE_LIMITS.perMinute; index++) {
    assert(consumeAiAllowance(aiClientKey(ip, `browser-${index}`), 1_000_000));
  }
  assert.equal(consumeAiAllowance(aiClientKey(ip, 'another-browser'), 1_000_000), false);
  assert.equal(aiClientKey(ip), aiClientKey(` ${ip} `));
  assert.notEqual(aiClientKey(ip), aiClientKey('192.0.2.43'));
});

test('AI limiter allows normal use and blocks bursts', () => {
  const key = `burst-${Date.now()}`;
  const now = 1_000_000;

  for (let index = 0; index < AI_RATE_LIMITS.perMinute; index += 1) {
    assert.equal(consumeAiAllowance(key, now), true);
  }
  assert.equal(consumeAiAllowance(key, now), false);
  assert.equal(consumeAiAllowance(key, now + 60_001), true);
});

test('AI limiter keeps an hourly ceiling across minute resets', () => {
  const key = `hour-${Date.now()}`;
  const start = 2_000_000;
  let accepted = 0;

  for (let minute = 0; minute < 20 && accepted < AI_RATE_LIMITS.perHour; minute += 1) {
    const now = start + minute * 60_001;
    for (let index = 0; index < AI_RATE_LIMITS.perMinute && accepted < AI_RATE_LIMITS.perHour; index += 1) {
      assert.equal(consumeAiAllowance(key, now), true);
      accepted += 1;
    }
  }

  assert.equal(accepted, AI_RATE_LIMITS.perHour);
  assert.equal(consumeAiAllowance(key, start + 19 * 60_001), false);
  assert.equal(consumeAiAllowance(key, start + 60 * 60_000 + 1), true);
});
