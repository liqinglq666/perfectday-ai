const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { JSDOM } = require('jsdom');
const { createTsLoader } = require('./helpers/load-ts.cjs');

test('real completion and undo components track consecutive navigations in StrictMode', async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://perfectday.local' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = require('react-dom/client');
  const router = { push: () => {} };
  const Link = ({ prefetch, scroll, children, ...props }) => React.createElement('a', props, children);
  const load = createTsLoader({
    globals: { localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage },
    requireOverrides: {
      'next/link': { default: Link },
      'next/navigation': { useRouter: () => router },
      '@/app/components/ui-icon': { default: () => null }
    }
  });
  const { RememberTrip } = load('app/components/trip/trip-memory');
  const ActionLink = load('app/components/action-link').default;
  const { LAST_TRIP_KEY, UNDO_TRIP_KEY } = load('lib/trip-storage');
  const href = step => `/trip?journey=fixture&step=${step}`;
  function Host({ initial = 0 }) {
    const [step, setStep] = React.useState(initial);
    router.push = target => setStep(Number(new URL(target, 'https://perfectday.local').searchParams.get('step')));
    return React.createElement(React.Fragment, null,
      React.createElement(RememberTrip, { href: href(step), title: '测试路线', done: step, left: 4 - step }),
      React.createElement(ActionLink, { href: href(step + 1), beforeHref: href(step), label: '这一站逛完了', className: 'complete' }));
  }
  const click = async selector => {
    const element = document.querySelector(selector);
    assert(element, `missing ${selector}`);
    await React.act(async () => element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true })));
  };
  let root = createRoot(document.getElementById('root'));
  try {
    await React.act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(Host))));
    assert.equal(document.querySelector('.undo-notice'), null);
    await click('.complete');
    assert.equal(document.querySelector('.undo-notice a').getAttribute('href'), href(0));
    assert.equal(JSON.parse(dom.window.localStorage.getItem(LAST_TRIP_KEY)).href, href(1));
    await click('.complete');
    assert.equal(document.querySelector('.undo-notice a').getAttribute('href'), href(1));
    assert.equal(dom.window.sessionStorage.getItem(UNDO_TRIP_KEY), null);
    await click('.undo-notice a');
    assert.equal(JSON.parse(dom.window.localStorage.getItem(LAST_TRIP_KEY)).href, href(1));
    assert.equal(document.querySelector('.undo-notice'), null, 'old undo target clears after going back');

    await React.act(async () => root.unmount());
    dom.window.sessionStorage.setItem(UNDO_TRIP_KEY, JSON.stringify({ from: href(0), to: href(1), label: '保存这次调整' }));
    root = createRoot(document.getElementById('root'));
    await React.act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(Host, { initial: 1 }))));
    assert.equal(document.querySelector('.undo-notice a').getAttribute('href'), href(0));
    await click('.complete');
    assert.equal(document.querySelector('.undo-notice a').getAttribute('href'), href(1), 'new completion replaces the adjustment undo');
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    delete global.window;
    delete global.document;
    delete global.IS_REACT_ACT_ENVIRONMENT;
  }
});
