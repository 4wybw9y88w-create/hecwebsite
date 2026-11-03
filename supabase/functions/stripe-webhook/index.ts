// POST /functions/v1/stripe-webhook   (called by Stripe, not by the browser)
// A paid Checkout Session unlocks the account. A full refund locks it again.
import { env, grantEntitlement, isUuid, revokeByPaymentIntent, verifyStripeSignature } from '../_shared/lib.ts';

const PAID_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];

export async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const payload = await req.text();
  const valid = await verifyStripeSignature(payload, req.headers.get('stripe-signature') ?? '', env('STRIPE_WEBHOOK_SECRET'));
  if (!valid) return new Response('invalid signature', { status: 400 });

  let event: any;
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response('bad payload', { status: 400 });
  }

  try {
    if (PAID_EVENTS.includes(event.type)) {
      const s = event.data?.object ?? {};
      const userId = s.client_reference_id ?? s.metadata?.user_id;
      // TWINT confirms instantly, but wait for "paid" on any delayed method.
      if (s.payment_status === 'paid' && isUuid(userId)) {
        await grantEntitlement({
          userId,
          sessionId: s.id,
          paymentIntent: typeof s.payment_intent === 'string' ? s.payment_intent : null,
          amount: typeof s.amount_total === 'number' ? s.amount_total : null,
          currency: typeof s.currency === 'string' ? s.currency : null,
        });
      }
    } else if (event.type === 'charge.refunded') {
      const c = event.data?.object ?? {};
      if (c.refunded === true && typeof c.payment_intent === 'string') await revokeByPaymentIntent(c.payment_intent);
    }
  } catch (e) {
    console.error('webhook handling failed:', e instanceof Error ? e.message : e);
    return new Response('server error', { status: 500 }); // Stripe retries on 5xx
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

const g = globalThis as any;
if (g.Deno?.serve) g.Deno.serve(handle);
