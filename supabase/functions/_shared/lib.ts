// Shared helpers for the Edge Functions.
// No external dependencies on purpose: everything talks to Supabase and Stripe over plain fetch.

export const COURSES = [
  'statistics',
  'mathematics',
  'economics',
  'financial-accounting',
  'computer-models',
  'management-ethics',
];

function raw(name: string): string | undefined {
  const g = globalThis as any;
  return g.Deno?.env?.get ? g.Deno.env.get(name) : g.process?.env?.[name];
}

export function env(name: string): string {
  const v = raw(name);
  if (!v) throw new Error('Missing environment variable ' + name);
  return v;
}

export function envOr(name: string, fallback: string): string {
  return raw(name) || fallback;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID.test(v);
}

// ---------- HTTP helpers ----------

function toOrigin(s: string): string {
  try {
    return new URL(s).origin;
  } catch {
    return s.replace(/\/$/, '');
  }
}

export function corsHeaders(req: Request): Record<string, string> {
  const list = envOr('ALLOWED_ORIGINS', raw('SITE_URL') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(toOrigin);
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': list.includes(origin) ? origin : (list[0] ?? ''),
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  };
}

export function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

// ---------- Supabase ----------

/** Who is calling? Asks Supabase Auth to validate the bearer token. */
export async function getUser(req: Request): Promise<{ id: string; email: string | null } | null> {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get('authorization') ?? '');
  if (!m) return null;
  const r = await fetch(env('SUPABASE_URL') + '/auth/v1/user', {
    headers: { apikey: env('SUPABASE_ANON_KEY'), Authorization: 'Bearer ' + m[1] },
  });
  if (!r.ok) return null;
  const u = await r.json();
  return isUuid(u?.id) ? { id: u.id, email: u.email ?? null } : null;
}

function service(extra: Record<string, string> = {}): Record<string, string> {
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  return { apikey: key, Authorization: 'Bearer ' + key, ...extra };
}

export async function hasEntitlement(userId: string): Promise<boolean> {
  if (!isUuid(userId)) return false;
  const r = await fetch(
    env('SUPABASE_URL') + '/rest/v1/entitlements?select=user_id&limit=1&user_id=eq.' + userId,
    { headers: service() },
  );
  if (!r.ok) throw new Error('entitlement lookup failed: ' + r.status);
  const rows = await r.json();
  return Array.isArray(rows) && rows.length > 0;
}

export async function grantEntitlement(o: {
  userId: string;
  sessionId: string;
  paymentIntent: string | null;
  amount: number | null;
  currency: string | null;
}): Promise<void> {
  const r = await fetch(env('SUPABASE_URL') + '/rest/v1/entitlements?on_conflict=user_id', {
    method: 'POST',
    headers: service({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({
      user_id: o.userId,
      plan: 'all-courses',
      stripe_session_id: o.sessionId,
      stripe_payment_intent: o.paymentIntent,
      amount_total: o.amount,
      currency: o.currency,
      paid_at: new Date().toISOString(),
    }),
  });
  if (!r.ok) throw new Error('grant failed: ' + r.status + ' ' + (await r.text()));
}

export async function revokeByPaymentIntent(paymentIntent: string): Promise<void> {
  if (!/^pi_[A-Za-z0-9_]+$/.test(paymentIntent)) return;
  const r = await fetch(
    env('SUPABASE_URL') + '/rest/v1/entitlements?stripe_payment_intent=eq.' + paymentIntent,
    { method: 'DELETE', headers: service({ Prefer: 'return=minimal' }) },
  );
  if (!r.ok) throw new Error('revoke failed: ' + r.status);
}

/** Download a private course page from Storage. */
export async function downloadCourse(slug: string): Promise<Response> {
  return fetch(env('SUPABASE_URL') + '/storage/v1/object/courses/' + slug + '.html', { headers: service() });
}

// ---------- Stripe ----------

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Checks the `Stripe-Signature` header of a webhook call (HMAC-SHA256, 5 minute tolerance). */
export async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
  toleranceSeconds = 300,
  nowMs = Date.now(),
): Promise<boolean> {
  let t = '';
  const sigs: string[] = [];
  for (const part of header.split(',')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === 't') t = v;
    if (k === 'v1') sigs.push(v);
  }
  const ts = Number(t);
  if (!t || !Number.isFinite(ts) || sigs.length === 0) return false;
  if (Math.abs(nowMs / 1000 - ts) > toleranceSeconds) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(t + '.' + payload)));
  return sigs.some((s) => safeEqual(s, expected));
}
