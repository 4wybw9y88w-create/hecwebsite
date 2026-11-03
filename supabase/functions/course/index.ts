// GET /functions/v1/course?c=<slug>
// Returns the course page only to a signed-in account that has paid.
import { COURSES, corsHeaders, downloadCourse, getUser, hasEntitlement, json } from '../_shared/lib.ts';

export async function handle(req: Request): Promise<Response> {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, cors);

  const slug = new URL(req.url).searchParams.get('c') ?? '';
  if (!COURSES.includes(slug)) return json({ error: 'unknown_course' }, 400, cors);

  const user = await getUser(req);
  if (!user) return json({ error: 'not_signed_in' }, 401, cors);

  try {
    if (!(await hasEntitlement(user.id))) return json({ error: 'payment_required' }, 402, cors);

    const file = await downloadCourse(slug);
    if (!file.ok || !file.body) {
      console.error('course file missing in storage:', slug, file.status);
      return json({ error: 'course_not_uploaded' }, 404, cors);
    }
    return new Response(file.body, {
      status: 200,
      headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
    });
  } catch (e) {
    console.error('course failed:', e instanceof Error ? e.message : e);
    return json({ error: 'server_error' }, 500, cors);
  }
}

const g = globalThis as any;
if (g.Deno?.serve) g.Deno.serve(handle);
