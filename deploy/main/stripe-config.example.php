<?php
/**
 * Mac Upgraded — Stripe tip-jar configuration TEMPLATE.
 *
 * 1. Copy this file to  stripe-config.php  (same folder).
 * 2. Paste your real keys from https://dashboard.stripe.com/apikeys
 * 3. Keep stripe-config.php private — it is .gitignored and must never be committed.
 *
 * Use test keys (sk_test_… / pk_test_…) while trying it out, then swap to
 * live keys (sk_live_… / pk_live_…) when you are ready to accept real tips.
 */

return [
    // SECRET key — server only. NEVER expose this to the browser.
    'secret_key'      => 'sk_test_REPLACE_WITH_YOUR_SECRET_KEY',

    // PUBLISHABLE key — safe to send to the browser.
    'publishable_key' => 'pk_live_51URbtuLMm2E51ycPEuvappBvtmBUGy7bVfkBgO6YsZhivK1WojSCLdDOfYCn6962Bml3oKk5xzxCdLqaofcGXq2400j8aBpKnh',

    'currency' => 'gbp',   // ISO currency code
    'country'  => 'GB',    // Merchant country (ISO 3166-1 alpha-2)
    'label'    => 'Mac Upgraded — tip',
];
