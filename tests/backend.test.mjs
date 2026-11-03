// Run with:  node --test tests/backend.test.mjs
// Exercises the three Edge Functions with Supabase and Stripe replaced by in-memory fakes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

process.env.SUPABASE_URL = 'https://proj.supabase.co';
process.env.SUPABASE_ANON_KEY = 'anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
process.env.SITE_URL = 'https://niko.github.io/hecwebsite';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

const { handle: course } = await import('../supabase/functions/course/index.ts');
const { handle: checkout } = await import('../supabase/functions/create-checkout/index.ts');
const { handle: webhook } = await import('../supabase/functions/stripe-webhook/index.ts');
const { verifyStripeSignature } = await import('../supabase/functions/_shared/lib.ts');

const PAID_USER = '11111111-1111-4111-8111-111111111111';
const FREE_USER = '22222222-2222-4222-8222-222222222222';

// ---- fake Supabase + Stripe ----
let entitlements;
let stripeCalls;
let stripeReply;
function reset() {
  entitlements = new Map([[PAID_USER, { stripe_payment_intent: 'pi_old' }]]);
  stripeCalls = [];
  stripeReply = { ok: true, body: { url: 'https://checkout.stripe.com/c/pay/cs_test_abc' } };
}
reset();

globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  const h = init.headers ?? {};
  if (url === 'https://proj.supabase.co/auth/v1/user') {
    const token = (h.Authorization ?? '').replace('Bearer ', '');
    const id = { 'tok-paid': PAID_USER, 'tok-free': FREE_USER }[token];
    return id ? Response.json({ id, email: id + '@example.com' }) : new Response('{}', { status: 401 });
  }
  if (url.startsWith('https://proj.supabase.co/rest/v1/entitlements')) {
    assert.equal(h.Authorization, 'Bearer service-key', 'database access must use the service role');
    if (!init.method || init.method === 'GET') {
      const id = new URL(url).searchParams.get('user_id').replace('eq.', '');
      return Response.json(entitlements.has(id) ? [{ user_id: id }] : []);
    }
    if (init.method === 'POST') {
      const row = JSON.parse(init.body);
      entitlements.set(row.user_id, row);
      return new Response(null, { status: 201 });
    }
    if (init.method === 'DELETE') {
      const pi = new URL(url).searchParams.get('stripe_payment_intent').replace('eq.', '');
      for (const [k, v] of entitlements) if (v.stripe_payment_intent === pi) entitlements.delete(k);
      return new Response(null, { status: 204 });
    }
  }
  if (url.startsWith('https://proj.supabase.co/storage/v1/object/courses/')) {
    assert.equal(h.Authorization, 'Bearer service-key');
    return url.endsWith('/economics.html')
      ? new Response('<!doctype html><title>Economics I</title>', { status: 200 })
      : new Response('{}', { status: 404 });
  }
  if (url === 'https://api.stripe.com/v1/checkout/sessions') {
    stripeCalls.push({ headers: h, form: new URLSearchParams(String(init.body)) });
    return new Response(JSON.stringify(stripeReply.body), { status: stripeReply.ok ? 200 : 400 });
  }
  throw new Error('unexpected fetch ' + url);
};

const get = (path, token, origin = 'https://niko.github.io') =>
  new Request('https://proj.supabase.co/functions/v1/' + path, {
    headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), Origin: origin },
  });

// ---- course ----
test('course: no token -> 401', async () => {
  assert.equal((await course(get('course?c=economics'))).status, 401);
});
test('course: signed in but unpaid -> 402, no content', async () => {
  const r = await course(get('course?c=economics', 'tok-free'));
  assert.equal(r.status, 402);
  assert.ok(!(await r.text()).includes('Economics I'));
});
test('course: paid -> 200 with the page, never cached', async () => {
  const r = await course(get('course?c=economics', 'tok-paid'));
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/html/);
  assert.equal(r.headers.get('cache-control'), 'private, no-store');
  assert.match(await r.text(), /Economics I/);
});
test('course: unknown slug and path tricks -> 400', async () => {
  for (const c of ['nope', '../secrets', 'economics.html', 'economics/../x', '']) {
    const r = await course(get('course?c=' + encodeURIComponent(c), 'tok-paid'));
    assert.equal(r.status, 400, c);
  }
});
test('course: valid course missing in storage -> 404', async () => {
  assert.equal((await course(get('course?c=statistics', 'tok-paid'))).status, 404);
});
test('course: a forged token is rejected', async () => {
  assert.equal((await course(get('course?c=economics', 'made-up'))).status, 401);
});
test('cors: only the site origin is echoed back', async () => {
  const ok = await course(get('course?c=economics', 'tok-paid', 'https://niko.github.io'));
  assert.equal(ok.headers.get('access-control-allow-origin'), 'https://niko.github.io');
  const evil = await course(get('course?c=economics', 'tok-paid', 'https://evil.example'));
  assert.equal(evil.headers.get('access-control-allow-origin'), 'https://niko.github.io');
  const pre = await course(new Request('https://x/functions/v1/course', { method: 'OPTIONS', headers: { Origin: 'https://niko.github.io' } }));
  assert.equal(pre.status, 204);
});

// ---- create-checkout ----
const post = (token) => new Request('https://proj.supabase.co/functions/v1/create-checkout', {
  method: 'POST',
  headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), Origin: 'https://niko.github.io' },
});
test('checkout: requires sign-in', async () => {
  assert.equal((await checkout(post())).status, 401);
});
test('checkout: builds a TWINT + card CHF session tied to the user', async () => {
  reset();
  const r = await checkout(post('tok-free'));
  assert.equal(r.status, 200);
  assert.equal((await r.json()).url, 'https://checkout.stripe.com/c/pay/cs_test_abc');
  const f = stripeCalls[0].form;
  assert.equal(stripeCalls[0].headers.Authorization, 'Bearer sk_test_123');
  assert.equal(f.get('mode'), 'payment');
  assert.equal(f.get('payment_method_types[0]'), 'twint');
  assert.equal(f.get('payment_method_types[1]'), 'card');
  assert.equal(f.get('line_items[0][price_data][currency]'), 'chf');
  assert.equal(f.get('line_items[0][price_data][unit_amount]'), '2900');
  assert.equal(f.get('client_reference_id'), FREE_USER);
  assert.equal(f.get('success_url'), 'https://niko.github.io/hecwebsite/?paid=1');
  assert.equal(f.get('cancel_url'), 'https://niko.github.io/hecwebsite/?canceled=1');
});
test('checkout: already paid -> no new Stripe session', async () => {
  reset();
  const r = await checkout(post('tok-paid'));
  assert.deepEqual(await r.json(), { alreadyPaid: true });
  assert.equal(stripeCalls.length, 0);
});
test('checkout: Stripe error -> 502 without leaking details', async () => {
  reset();
  stripeReply = { ok: false, body: { error: { message: 'TWINT is not enabled for this account' } } };
  const r = await checkout(post('tok-free'));
  assert.equal(r.status, 502);
  assert.ok(!(await r.text()).includes('TWINT'));
});

// ---- webhook ----
function signed(event, { secret = 'whsec_test', ts = Math.floor(Date.now() / 1000) } = {}) {
  const payload = JSON.stringify(event);
  const sig = createHmac('sha256', secret).update(ts + '.' + payload).digest('hex');
  return new Request('https://proj.supabase.co/functions/v1/stripe-webhook', {
    method: 'POST',
    headers: { 'stripe-signature': `t=${ts},v1=${sig}` },
    body: payload,
  });
}
const session = (over = {}) => ({
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_1', client_reference_id: FREE_USER, payment_status: 'paid', payment_intent: 'pi_new', amount_total: 2900, currency: 'chf', ...over } },
});
test('webhook: bad or missing signature -> 400 and nothing granted', async () => {
  reset();
  assert.equal((await webhook(signed(session(), { secret: 'whsec_wrong' }))).status, 400);
  assert.equal((await webhook(new Request('https://x', { method: 'POST', body: '{}' }))).status, 400);
  assert.equal(entitlements.has(FREE_USER), false);
});
test('webhook: old timestamp is rejected (replay)', async () => {
  reset();
  const old = Math.floor(Date.now() / 1000) - 3600;
  assert.equal((await webhook(signed(session(), { ts: old }))).status, 400);
  assert.equal(entitlements.has(FREE_USER), false);
});
test('webhook: paid session grants access', async () => {
  reset();
  assert.equal((await webhook(signed(session()))).status, 200);
  const row = entitlements.get(FREE_USER);
  assert.equal(row.stripe_session_id, 'cs_test_1');
  assert.equal(row.stripe_payment_intent, 'pi_new');
  assert.equal(row.amount_total, 2900);
  // and the course now opens for that account
  entitlements.set(FREE_USER, row);
  assert.equal((await course(get('course?c=economics', 'tok-free'))).status, 200);
});
test('webhook: unpaid session or bad user id grants nothing', async () => {
  reset();
  await webhook(signed(session({ payment_status: 'unpaid' })));
  await webhook(signed(session({ client_reference_id: "x'; drop table entitlements;--" })));
  assert.equal(entitlements.has(FREE_USER), false);
  assert.equal(entitlements.size, 1);
});
test('webhook: delayed payment success also grants', async () => {
  reset();
  await webhook(signed({ ...session(), type: 'checkout.session.async_payment_succeeded' }));
  assert.equal(entitlements.has(FREE_USER), true);
});
test('webhook: retried delivery is harmless', async () => {
  reset();
  await webhook(signed(session()));
  await webhook(signed(session()));
  assert.equal(entitlements.size, 2);
});
test('webhook: full refund removes access, partial refund keeps it', async () => {
  reset();
  await webhook(signed({ type: 'charge.refunded', data: { object: { refunded: false, payment_intent: 'pi_old' } } }));
  assert.equal(entitlements.has(PAID_USER), true);
  await webhook(signed({ type: 'charge.refunded', data: { object: { refunded: true, payment_intent: 'pi_old' } } }));
  assert.equal(entitlements.has(PAID_USER), false);
});
test('webhook: unrelated events are acknowledged', async () => {
  assert.equal((await webhook(signed({ type: 'customer.created', data: { object: {} } }))).status, 200);
});
test('signature check accepts multiple v1 values and rejects tampered bodies', async () => {
  const body = '{"a":1}', ts = Math.floor(Date.now() / 1000);
  const good = createHmac('sha256', 's').update(ts + '.' + body).digest('hex');
  assert.equal(await verifyStripeSignature(body, `t=${ts},v1=deadbeef,v1=${good}`, 's'), true);
  assert.equal(await verifyStripeSignature(body + ' ', `t=${ts},v1=${good}`, 's'), false);
});
