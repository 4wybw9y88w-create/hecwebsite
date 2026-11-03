// Public settings. The anon key is meant to be public: the database rules and the
// functions decide what it can do. NEVER put the service role or Stripe keys here.
window.HEC_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-KEY',
  // Shown on the pay button. The real amount is COURSE_PRICE_CHF_CENTS in the Supabase function secrets.
  PRICE_LABEL: 'CHF 29'
};
