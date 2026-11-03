// POST /functions/v1/create-checkout
// Signed-in visitor -> Stripe Checkout (TWINT + card, CHF). Returns { url } to redirect to.
import { corsHeaders, env, envOr, getUser, hasEntitlement, json } from '../_shared/lib.ts';

export async function handle(req: Request): Promise<Response> {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, cors);

  const user = await getUser(req);
  if (!user) return json({ error: 'not_signed_in' }, 401, cors);

  try {
    if (await hasEntitlement(user.id)) return json({ alreadyPaid: true }, 200, cors);

    const site = env('SITE_URL').replace(/\/$/, '');
    const cents = Number(envOr('COURSE_PRICE_CHF_CENTS', '1500'));
    if (!Number.isInteger(cents) || cents < 50) throw new Error('COURSE_PRICE_CHF_CENTS must be a whole number of rappen');

    const form = new URLSearchParams();
    form.set('mode', 'payment');
    form.set('payment_method_types[0]', 'twint');
    form.set('payment_method_types[1]', 'card');
    form.set('line_items[0][quantity]', '1');
    form.set('line_items[0][price_data][currency]', 'chf');
    form.set('line_items[0][price_data][unit_amount]', String(cents));
    form.set('line_items[0][price_data][product_data][name]', 'HEC BSc1 Study Hub: access to all six courses');
    form.set('client_reference_id', user.id);
    form.set('metadata[user_id]', user.id);
    if (user.email) form.set('customer_email', user.email);
    form.set('success_url', site + '/?paid=1');
    form.set('cancel_url', site + '/?canceled=1');

    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env('STRIPE_SECRET_KEY'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });
    const data = await r.json();
    if (!r.ok || !data?.url) {
      console.error('Stripe refused the checkout session:', data?.error?.message ?? r.status);
      return json({ error: 'checkout_unavailable' }, 502, cors);
    }
    return json({ url: data.url }, 200, cors);
  } catch (e) {
    console.error('create-checkout failed:', e instanceof Error ? e.message : e);
    return json({ error: 'server_error' }, 500, cors);
  }
}

const g = globalThis as any;
if (g.Deno?.serve) g.Deno.serve(handle);
