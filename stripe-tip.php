<?php
/**
 * Mac Upgraded — "Buy me a coffee" tip jar backend (Stripe)
 * ----------------------------------------------------------------------------
 * Powers the on-page Apple Pay / Google Pay sheet and the card checkout.
 * No Composer / SDK required — talks to the Stripe REST API over cURL.
 *
 * Endpoints (same origin, called by app.js):
 *   POST/GET  ?action=config            -> { configured, publishableKey, currency, country, label }
 *   POST      ?action=payment_intent    -> { clientSecret }        (Apple Pay / Google Pay)
 *   POST      ?action=checkout_session  -> { url }                 (hosted card checkout fallback)
 *
 * Secrets live in stripe-config.php (NOT committed). See stripe-config.example.php.
 */

error_reporting(0);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

/* ----------------------------------------------------------------------------
   Config
---------------------------------------------------------------------------- */
$CONFIG = @include __DIR__ . '/stripe-config.php';
if (!is_array($CONFIG)) {
    $CONFIG = [];
}
// Support environment variables as fallback
$env_sec = getenv('STRIPE_SECRET_KEY') ?: (isset($_ENV['STRIPE_SECRET_KEY']) ? $_ENV['STRIPE_SECRET_KEY'] : (isset($_SERVER['STRIPE_SECRET_KEY']) ? $_SERVER['STRIPE_SECRET_KEY'] : null));
$env_pub = getenv('STRIPE_PUBLISHABLE_KEY') ?: (isset($_ENV['STRIPE_PUBLISHABLE_KEY']) ? $_ENV['STRIPE_PUBLISHABLE_KEY'] : (isset($_SERVER['STRIPE_PUBLISHABLE_KEY']) ? $_SERVER['STRIPE_PUBLISHABLE_KEY'] : null));
if (!empty($env_sec) && empty($CONFIG['secret_key'])) {
    $CONFIG['secret_key'] = $env_sec;
}
if (!empty($env_pub) && empty($CONFIG['publishable_key'])) {
    $CONFIG['publishable_key'] = $env_pub;
}
if (empty($CONFIG['publishable_key'])) {
    $CONFIG['publishable_key'] = 'pk_live_51URbtuLMm2E51ycPEuvappBvtmBUGy7bVfkBgO6YsZhivK1WojSCLdDOfYCn6962Bml3oKk5xzxCdLqaofcGXq2400j8aBpKnh';
}
$MIN_PENCE = 100;    // £1.00
$MAX_PENCE = 50000;  // £500.00

function out($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function body_json() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $d = json_decode($raw, true);
    return is_array($d) ? $d : [];
}

function cfg_ready($c) {
    return is_array($c)
        && !empty($c['secret_key'])
        && !empty($c['publishable_key'])
        && strpos($c['secret_key'], 'sk_') === 0
        && strpos($c['secret_key'], 'REPLACE') === false;
}

/**
 * POST form-encoded (supports nested arrays) to the Stripe API.
 */
function stripe_request($path, $params, $secret) {
    $ch = curl_init('https://api.stripe.com/v1/' . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($params),
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $secret,
            'Content-Type: application/x-www-form-urlencoded',
        ],
        CURLOPT_TIMEOUT        => 25,
    ]);
    $res  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    if ($res === false) return [0, ['error' => ['message' => $err ?: 'Network error contacting Stripe.']]];
    return [$code, json_decode($res, true)];
}

function valid_amount($raw, $min, $max) {
    if (!is_numeric($raw)) return false;
    $pence = (int) round($raw);
    if ($pence < $min || $pence > $max) return false;
    return $pence;
}

/* ----------------------------------------------------------------------------
   Routing
---------------------------------------------------------------------------- */
$action   = isset($_GET['action']) ? $_GET['action'] : '';
$currency = (is_array($CONFIG) && !empty($CONFIG['currency'])) ? $CONFIG['currency'] : 'gbp';
$country  = (is_array($CONFIG) && !empty($CONFIG['country']))  ? $CONFIG['country']  : 'GB';
$label    = (is_array($CONFIG) && !empty($CONFIG['label']))    ? $CONFIG['label']    : 'Mac Upgraded — tip';

/* ---- config: safe public values only ---- */
if ($action === 'config') {
    out([
        'configured'     => cfg_ready($CONFIG),
        'publishableKey' => cfg_ready($CONFIG) ? $CONFIG['publishable_key'] : null,
        'currency'       => $currency,
        'country'        => $country,
        'label'          => $label,
    ]);
}

if (!cfg_ready($CONFIG)) {
    out(['error' => 'The tip jar is not configured yet. Add your Stripe keys to stripe-config.php.'], 503);
}
$secret = $CONFIG['secret_key'];

$data  = body_json();
$pence = valid_amount(isset($data['amount']) ? $data['amount'] : null, $MIN_PENCE, $MAX_PENCE);
if ($pence === false) {
    out(['error' => 'Please choose a tip between £1 and £500.'], 422);
}

/* ---- PaymentIntent: used by the Apple Pay / Google Pay sheet ---- */
if ($action === 'payment_intent') {
    list($code, $resp) = stripe_request('payment_intents', [
        'amount'      => $pence,
        'currency'    => $currency,
        'description' => $label,
        'automatic_payment_methods' => ['enabled' => 'true'],
    ], $secret);

    if ($code === 200 && !empty($resp['client_secret'])) {
        out(['clientSecret' => $resp['client_secret']]);
    }
    out(['error' => isset($resp['error']['message']) ? $resp['error']['message'] : 'Could not start the payment.'], 502);
}

/* ---- Checkout Session: hosted card page (also shows wallets) ---- */
if ($action === 'checkout_session') {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host   = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
    $base   = $scheme . '://' . $host . '/';

    list($code, $resp) = stripe_request('checkout/sessions', [
        'mode'                 => 'payment',
        'success_url'          => $base . '?tip=success#support',
        'cancel_url'           => $base . '?tip=cancel#support',
        'submit_type'          => 'donate',
        'line_items'           => [[
            'quantity'   => 1,
            'price_data' => [
                'currency'     => $currency,
                'unit_amount'  => $pence,
                'product_data' => ['name' => $label],
            ],
        ]],
    ], $secret);

    if ($code === 200 && !empty($resp['url'])) {
        out(['url' => $resp['url']]);
    }
    out(['error' => isset($resp['error']['message']) ? $resp['error']['message'] : 'Could not start checkout.'], 502);
}

out(['error' => 'Unknown action.'], 400);
