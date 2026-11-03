# HEC BSc1 Study Hub

Accounts, a one-time TWINT/card payment, and six course pages that only open for accounts that paid.

```
site/                 PUBLIC. Goes to GitHub Pages: sign-in page, paywall, course viewer. No course content.
private/raw/          PRIVATE, git-ignored. The six course pages (build.py writes here).
supabase/migrations/  Database: profiles, entitlements ("who paid"), private storage bucket.
supabase/functions/   create-checkout (Stripe), stripe-webhook (unlocks the account), course (serves a page to payers only).
scripts/              upload_courses.mjs puts the course pages into private storage.
tests/                node --test tests/backend.test.mjs
```

How it works: a visitor signs up (Supabase Auth) → presses **Pay with TWINT** → `create-checkout` opens a Stripe Checkout page → Stripe calls `stripe-webhook` → a row appears in `entitlements` → `course.html` asks the `course` function for the page, which checks the login **and** the payment before it sends a single byte.

## Setup (about 30 minutes)

### 1. Supabase (accounts, database, functions)
1. Create a free project at supabase.com. Pick a region close to you (Zurich or Frankfurt).
2. **SQL Editor** → paste `supabase/migrations/0001_init.sql` → Run.
3. **Authentication → URL Configuration**: set *Site URL* to your GitHub Pages address (step 4) and add it under *Redirect URLs*. Add `http://localhost:8080` too if you test locally.
4. **Authentication → Sign In / Providers → Email**: keep "Confirm email" on, so people must own the address they sign up with.
5. Note three values from **Project Settings → API**: Project URL, `anon` key (public), `service_role` key (secret).

### 2. Stripe (TWINT and card)
1. Create an account at stripe.com. In **Settings → Payment methods**, switch on **TWINT** (availability depends on the account's country, Stripe shows it there). Start in **test mode**.
2. **Developers → Webhooks → Add endpoint**
   - URL: `https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`
   - Copy the **signing secret** (`whsec_…`).
3. Copy the **secret key** (`sk_test_…`) from Developers → API keys.

### 3. Deploy the functions
Install the [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`), then in this folder:

```bash
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase secrets set \
  SITE_URL=https://YOUR-USER.github.io/YOUR-REPO \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  COURSE_PRICE_CHF_CENTS=1500
supabase functions deploy create-checkout stripe-webhook course
```
`COURSE_PRICE_CHF_CENTS` is the price in rappen (1500 = CHF 15.00). Change it here and in `site/config.js` (`PRICE_LABEL`, the text on the button).

### 4. Put the course pages in private storage
```bash
cp .env.example .env        # fill in SUPABASE_URL and the service_role key
node scripts/upload_courses.mjs
```
Run it again whenever a course page changes. `--dry-run` only prepares the files locally.

### 5. GitHub
1. Edit `site/config.js`: paste the Project URL and `anon` key.
2. Create a **public** repo on github.com (GitHub Pages is free for public repos; this is safe because `private/` and `.env` are git-ignored and the repo holds no course content).
3. ```bash
   git init -b main && git add . && git commit -m "Study hub with accounts and payment"
   git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
   git push -u origin main
   ```
4. Repo **Settings → Pages → Source: GitHub Actions**. The workflow in `.github/workflows/pages.yml` publishes `site/` on every push.

### 6. Test before going live
1. Open the site, create an account, confirm the email, log in. Courses show as locked.
2. Press **Pay**. In test mode pay with card `4242 4242 4242 4242` (any future date, any CVC). TWINT can be tested from the Stripe test page.
3. You land back on the site, the courses unlock, and each one opens.
4. Try opening a course while logged out: you are sent to the sign-in page.

Go live: swap `sk_test_…` and the webhook secret for the live ones (`supabase secrets set …`) and create the webhook again in live mode.

## Security notes
- The browser only ever holds the public `anon` key. The `service_role` key and Stripe keys exist only in Supabase secrets and your `.env`.
- Nobody can give themselves access: `entitlements` has no write rule for the browser, only the webhook (which checks Stripe's signature) writes to it.
- A full refund in Stripe removes access automatically.
- Once someone has opened a course they can save it, like any website content. The gate stops sharing of the *link*, not copying by a paying customer.

## Not included yet
Password reset page, receipts/invoices beyond Stripe's own emails, admin screen for granting access by hand (use the Supabase table editor: add a row to `entitlements`).
