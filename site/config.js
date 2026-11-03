// Public settings. The anon key is meant to be public: the database rules and the
// functions decide what it can do. NEVER put the service role or Stripe keys here.
window.HEC_CONFIG = {
  SUPABASE_URL: 'https://ydskynnlzmrdumipsgpp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_OasdnWFKFJ-f0Tf9xjAqZg_2J22dzG3',
  // Shown on the pay button. The real amount is COURSE_PRICE_CHF_CENTS in the Supabase function secrets.
  PRICE_LABEL: 'CHF 29'
};
