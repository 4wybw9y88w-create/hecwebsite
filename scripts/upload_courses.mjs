// Uploads the course pages to the PRIVATE Supabase Storage bucket "courses".
//
//   node scripts/upload_courses.mjs            upload all six courses
//   node scripts/upload_courses.mjs --dry-run  only write the prepared files to private/prepared/
//
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (from .env or the environment).
// The service role key is a secret: it stays on your computer and never goes into site/.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const COURSES = ['statistics', 'mathematics', 'economics', 'financial-accounting', 'computer-models', 'management-ethics'];
const dry = process.argv.includes('--dry-run');

// tiny .env reader, so no packages are needed
const envFile = join(root, '.env');
if (existsSync(envFile)) {
  for (const line of (await readFile(envFile, 'utf8')).split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

/** Course pages link to each other as "economics.html"; on the live site they open through course.html. */
export function prepare(html) {
  let out = html;
  for (const slug of COURSES) out = out.split(`href="${slug}.html"`).join(`href="course.html?c=${slug}"`);
  return out;
}

const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!dry && (!url || !key)) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first (see .env.example).');
  process.exit(1);
}

let failed = 0;
for (const slug of COURSES) {
  const src = join(root, 'private', 'raw', `${slug}.html`);
  if (!existsSync(src)) {
    console.error(`missing   ${slug}.html (expected at private/raw/)`);
    failed++;
    continue;
  }
  const body = prepare(await readFile(src, 'utf8'));
  const kb = Math.round(Buffer.byteLength(body) / 1024);
  if (dry) {
    const out = join(root, 'private', 'prepared', `${slug}.html`);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, body);
    console.log(`prepared  ${slug}.html  ${kb} KB`);
    continue;
  }
  const r = await fetch(`${url}/storage/v1/object/courses/${slug}.html`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'x-upsert': 'true', 'Content-Type': 'text/html; charset=utf-8' },
    body,
  });
  if (r.ok) console.log(`uploaded  ${slug}.html  ${kb} KB`);
  else {
    failed++;
    console.error(`FAILED    ${slug}.html  ${r.status} ${await r.text()}`);
  }
}
if (failed) process.exit(1);
