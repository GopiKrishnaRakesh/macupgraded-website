# Tip Jar — Apple Pay & Google Pay setup (Stripe)

The "Buy me a coffee" section on the homepage takes one-off tips with a real
**Apple Pay / Google Pay** sheet on the page, plus a **card** fallback. It is
powered by [Stripe](https://stripe.com) — there are no card details stored on
your server, and no monthly fee (Stripe takes its standard per-transaction cut).

> **Why Stripe?** Apple Pay and Google Pay on the web are *payment sheets*, not
> payment processors — they always need a gateway behind them to actually move
> money. Stripe is that gateway and supports both natively.

## Files involved
| File | Role |
|---|---|
| `index.html` | `#support` section + loads `js.stripe.com/v3` |
| `app.js` | `initTipJar()` — amount picker, Payment Request Button, card redirect |
| `stripe-tip.php` | Server endpoint (PaymentIntent + Checkout Session) |
| `stripe-config.example.php` | **Template** — copy to `stripe-config.php` |
| `stripe-config.php` | **Your private keys** (gitignored, create on the server) |

---

## 1. Create a Stripe account
Sign up at <https://dashboard.stripe.com>. Nothing in this repo needs your
password — you only paste two API keys.

## 2. Add your keys
Copy the template and fill in the keys from
<https://dashboard.stripe.com/apikeys>:

```bash
cp stripe-config.example.php stripe-config.php
```

```php
return [
  'secret_key'      => 'sk_live_xxx',   // or sk_test_xxx while testing
  'publishable_key' => 'pk_live_xxx',   // or pk_test_xxx
  'currency' => 'gbp',
  'country'  => 'GB',
  'label'    => 'Mac Upgraded — tip',
];
```

`stripe-config.php` is in `.gitignore` and must **never** be committed or made
public. On Hostinger you can create/edit it directly in the File Manager inside
`public_html/`.

## 3. Turn on Apple Pay & Google Pay
In the Stripe Dashboard:

1. **Settings → Payment methods** → enable **Apple Pay** and **Google Pay**.
2. **Settings → Payment method domains** → **Add domain** → `macupgraded.com`.
   Stripe verifies the domain automatically for Payment Request Buttons; if it
   asks for a verification file, download it and place it at:
   `public_html/.well-known/apple-developer-merchantid-domain-association`
   (no extension). The included `.htaccess` already allows `.well-known`.

Apple Pay only appears in **Safari on Apple devices**; Google Pay appears in
**Chrome / Android**. On unsupported browsers the wallet button hides itself and
the **"Tip with card"** button is used instead — this is expected.

## 4. Content-Security-Policy
`scripts/build.mjs` already ships a CSP that allowlists Stripe
(`js.stripe.com`, `api.stripe.com`, Stripe frames) and the `payment`
permission. No action needed unless you host the CSP elsewhere.

## 5. Test
1. `node ../scripts/build.mjs` and upload `deploy/zips/main.zip` to Hostinger
   (see `../DEPLOY.md`), **including** your `stripe-config.php`.
2. With **test** keys, open the site and tip — use Stripe's
   [test cards](https://stripe.com/docs/testing) (`4242 4242 4242 4242`) for the
   card path, and a real device for Apple/Google Pay in test mode.
3. Confirm the payment shows in **Dashboard → Payments**.
4. Swap to **live** keys to accept real tips.

## How a payment flows
- **Apple/Google Pay:** `app.js` asks `stripe-tip.php?action=payment_intent`
  for a client secret, then confirms it in the wallet sheet — money is captured
  immediately.
- **Card:** `app.js` asks `stripe-tip.php?action=checkout_session`, then
  redirects to Stripe's hosted page; on success the user returns to
  `/?tip=success#support`.

Amounts are validated **server-side** (£1–£500) regardless of what the browser
sends.
