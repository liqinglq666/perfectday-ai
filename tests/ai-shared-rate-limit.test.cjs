const test = require('node:test');
const assert = require('node:assert/strict');
const { createTsLoader } = require('./helpers/load-ts.cjs');

function instance(env, fetch) {
  return createTsLoader({ requireOverrides: { 'server-only': {} }, globals: {
    process: { env }, fetch, AbortController, setTimeout, clearTimeout
  } })('lib/ai-shared-rate-limit');
}

test('separate runtimes use the same shared IP counters and honor a denied response', async () => {
  const env = { UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'test-token' };
  const commands = [];
  const fetch = async (_, options) => {
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    commands.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ result: commands.length <= 12 ? 1 : 0 }) };
  };
  const a = instance(env, fetch), b = instance(env, fetch);
  for (let i = 0; i < 12; i++) assert(await (i % 2 ? a : b).checkAiAllowance('same-client'));
  assert.equal(await a.checkAiAllowance('same-client'), false);
  assert.equal(commands.length, 13);
  for (const command of commands) {
    assert.equal(command[0], 'EVAL');
    assert.equal(command[2], '2');
    assert.equal(command[3], 'perfectday:ai:{same-client}:minute');
    assert.equal(command[4], 'perfectday:ai:{same-client}:hour');
    assert.deepEqual(command.slice(5), ['12', '120']);
  }
});

test('missing Redis preserves local limits; partial, invalid and failed configurations deny paid calls', async () => {
  const noNetwork = async () => { throw new Error('must not fetch'); };
  assert.equal(await instance({}, noNetwork).checkAiAllowance('local'), true);
  for (const env of [
    { UPSTASH_REDIS_REST_URL: 'https://redis.example' },
    { UPSTASH_REDIS_REST_TOKEN: 'token' },
    { UPSTASH_REDIS_REST_URL: 'http://redis.example', UPSTASH_REDIS_REST_TOKEN: 'token' },
    { UPSTASH_REDIS_REST_URL: 'https://user:password@redis.example', UPSTASH_REDIS_REST_TOKEN: 'token' }
  ]) assert.equal(await instance(env, noNetwork).checkAiAllowance('invalid'), false);

  const env = { KV_REST_API_URL: 'https://redis.example', KV_REST_API_TOKEN: 'test-token' };
  for (const fetch of [noNetwork,
    async () => ({ ok: false }),
    async () => ({ ok: true, json: async () => ({ error: 'unavailable' }) }),
    async () => ({ ok: true, json: async () => ({ result: '1' }) })]) {
    assert.equal(await instance(env, fetch).checkAiAllowance('failed'), false);
  }
});
