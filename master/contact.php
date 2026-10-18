<?php
/**
 * Mac Upgraded Studio — Contact Form Handler
 * Direct email transmission to contact@rakeshkode.co.uk
 * Supports both asynchronous fetch (JSON) and traditional form POST.
 */

// Strict error reporting settings for production
error_reporting(0);
ini_set('display_errors', '0');

// Configuration
$TO_EMAIL = 'contact@rakeshkode.co.uk';
$SITE_NAME = 'Mac Upgraded';

// Set JSON header if client requested JSON
$isJsonRequest = (
    (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) ||
    (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false)
);

function respond($success, $message, $statusCode = 200, $data = []) {
    global $isJsonRequest;
    http_response_code($statusCode);
    
    if ($isJsonRequest) {
        header('Content-Type: application/json; charset=UTF-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        echo json_encode(array_merge([
            'success' => $success,
            'message' => $message
        ], $data));
        exit;
    }

    // HTML fallback for non-JS browsers
    header('Content-Type: text/html; charset=UTF-8');
    $color = $success ? '#059669' : '#dc2626';
    $bg = $success ? '#ecfdf5' : '#fef2f2';
    $title = $success ? 'Message Sent' : 'Submission Error';
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title><?php echo htmlspecialchars($title); ?> — <?php echo htmlspecialchars($GLOBALS['SITE_NAME']); ?></title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .card { max-width: 500px; width: 100%; background: #ffffff; border-radius: 18px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08); text-align: center; }
        .icon { font-size: 40px; margin-bottom: 16px; display: inline-block; }
        h1 { font-size: 22px; font-weight: 700; margin: 0 0 10px; color: <?php echo $color; ?>; }
        p { font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px; }
        .btn { display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 980px; font-weight: 600; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon"><?php echo $success ? '✓' : '⚠️'; ?></div>
        <h1><?php echo htmlspecialchars($title); ?></h1>
        <p><?php echo htmlspecialchars($message); ?></p>
        <a href="index.html" class="btn">Return to Website</a>
      </div>
    </body>
    </html>
    <?php
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed. Only POST requests are permitted.', 405);
}

// Read raw body if JSON, otherwise $_POST
$rawInput = file_get_contents('php://input');
$inputData = [];
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $inputData = $decoded;
    }
}
if (empty($inputData)) {
    $inputData = $_POST;
}

// 1. Anti-Spam Honeypot Check
$honeypot = isset($inputData['_gotcha']) ? trim((string)$inputData['_gotcha']) : '';
if ($honeypot !== '') {
    // Bot caught! Quietly return success without sending email
    respond(true, 'Your inquiry has been received. Thank you!', 200);
}

// 2. Extract and Sanitize Fields
$name = isset($inputData['name']) ? trim((string)$inputData['name']) : '';
$email = isset($inputData['email']) ? trim((string)$inputData['email']) : '';
$app = isset($inputData['app']) ? trim((string)$inputData['app']) : 'General';
$message = isset($inputData['message']) ? trim((string)$inputData['message']) : '';

// Anti-Header Injection: Strip CR and LF from header-bound variables
$cleanName = preg_replace('/[\r\n\t]+/', ' ', $name);
$cleanEmail = preg_replace('/[\r\n\t]+/', '', $email);
$cleanApp = preg_replace('/[\r\n\t]+/', ' ', $app);

// 3. Validation
if (empty($cleanName)) {
    respond(false, 'Please enter your name.', 400);
}

if (empty($cleanEmail) || !filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.', 400);
}

if (empty($message) || mb_strlen($message, 'UTF-8') < 10) {
    respond(false, 'Please enter a message of at least 10 characters.', 400);
}

if (mb_strlen($message, 'UTF-8') > 10000) {
    respond(false, 'Message is too long (maximum 10,000 characters).', 400);
}

// 4. Rate Limiting Protection (Max 5 requests per 10 minutes per IP)
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
    $clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    $clientIp = trim($parts[0]);
}

$rateFile = sys_get_temp_dir() . '/mac_upgraded_rate_' . md5($clientIp) . '.json';
$now = time();
$window = 600; // 10 minutes
$maxAttempts = 5;

$rateData = ['count' => 0, 'first' => $now];
if (file_exists($rateFile)) {
    $content = @file_get_contents($rateFile);
    if ($content) {
        $parsed = json_decode($content, true);
        if (is_array($parsed) && isset($parsed['first']) && ($now - $parsed['first'] < $window)) {
            $rateData = $parsed;
        }
    }
}

if ($rateData['count'] >= $maxAttempts) {
    respond(false, 'Too many requests. Please wait a few minutes before submitting again or write directly to ' . $TO_EMAIL, 429);
}

$rateData['count']++;
@file_put_contents($rateFile, json_encode($rateData));

// 5. Construct Email
$subject = "[{$cleanApp}] Inquiry from {$cleanName}";

// Determine sender domain for From header (ensures SPF/DKIM compliance on Hostinger)
$serverHost = !empty($_SERVER['SERVER_NAME']) ? preg_replace('/^www\./', '', $_SERVER['SERVER_NAME']) : 'macupgraded.com';
$serverHost = preg_replace('/[^a-zA-Z0-9\.\-]/', '', $serverHost);
if (empty($serverHost)) $serverHost = 'macupgraded.com';
$fromAddress = 'noreply@' . $serverHost;

$escapedName = htmlspecialchars($cleanName, ENT_QUOTES, 'UTF-8');
$escapedEmail = htmlspecialchars($cleanEmail, ENT_QUOTES, 'UTF-8');
$escapedApp = htmlspecialchars($cleanApp, ENT_QUOTES, 'UTF-8');
$escapedMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
$timestamp = gmdate('Y-m-d H:i:s') . ' UTC';

// Premium Apple-styled HTML Email Body
$htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .header { background: #0f172a; padding: 24px 32px; color: #ffffff; }
    .header h2 { margin: 0 0 4px; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 0; font-size: 13px; color: #94a3b8; }
    .content { padding: 32px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .meta-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #edf2f7; }
    .meta-table tr:last-child td { border-bottom: none; }
    .meta-label { font-weight: 600; color: #64748b; width: 120px; }
    .meta-val { color: #0f172a; font-weight: 500; }
    .meta-val a { color: #2563eb; text-decoration: none; font-weight: 600; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .message-box { background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 8px; padding: 20px; margin-top: 16px; font-size: 15px; line-height: 1.65; color: #1e293b; white-space: pre-wrap; word-break: break-word; }
    .actions { margin-top: 28px; text-align: center; }
    .reply-btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 28px; border-radius: 980px; text-decoration: none; font-size: 14px; font-weight: 600; }
    .footer { padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h2>Mac Upgraded — Direct Inquiry</h2>
      <p>Submitted via studio contact form at {$timestamp}</p>
    </div>
    <div class="content">
      <table class="meta-table">
        <tr>
          <td class="meta-label">From</td>
          <td class="meta-val"><strong>{$escapedName}</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Email</td>
          <td class="meta-val"><a href="mailto:{$escapedEmail}">{$escapedEmail}</a></td>
        </tr>
        <tr>
          <td class="meta-label">Application</td>
          <td class="meta-val"><span class="badge">{$escapedApp}</span></td>
        </tr>
        <tr>
          <td class="meta-label">IP Address</td>
          <td class="meta-val" style="font-family: monospace; font-size: 12px; color: #64748b;">{$clientIp}</td>
        </tr>
      </table>

      <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 20px;">Message:</div>
      <div class="message-box">{$escapedMessage}</div>

      <div class="actions">
        <a href="mailto:{$escapedEmail}?subject=Re:%20{$subject}" class="reply-btn">Reply directly to {$escapedName}</a>
      </div>
    </div>
    <div class="footer">
      Sent from Mac Upgraded Studio (contact@rakeshkode.co.uk)
    </div>
  </div>
</body>
</html>
HTML;

// Headers
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: Mac Upgraded <' . $fromAddress . '>',
    'Reply-To: ' . $cleanName . ' <' . $cleanEmail . '>',
    'X-Mailer: PHP/' . phpversion(),
    'X-Originating-IP: ' . $clientIp
];

// 6. Dispatch Email via native PHP mail()
$mailSent = @mail($TO_EMAIL, $subject, $htmlBody, implode("\r\n", $headers));

// 7. Secure Local Log (Protected by 403 Forbidden header)
$logEntry = [
    'date' => $timestamp,
    'ip' => $clientIp,
    'name' => $cleanName,
    'email' => $cleanEmail,
    'app' => $cleanApp,
    'message' => $message,
    'delivered' => $mailSent ? true : false
];

$logFile = __DIR__ . '/contact_submissions.php';
$logLine = json_encode($logEntry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
if (!file_exists($logFile)) {
    // If creating for the first time, prepend with forbidden script so no one can access it via browser
    @file_put_contents($logFile, "<?php http_response_code(403); exit; ?>\n" . $logLine);
} else {
    @file_put_contents($logFile, $logLine, FILE_APPEND);
}

// 8. Result Response
if ($mailSent) {
    respond(true, "Thank you, {$cleanName}! Your message has been sent directly to contact@rakeshkode.co.uk. We will get back to you shortly.");
} else {
    // If mail() failed on server (e.g. sendmail disabled or unconfigured locally)
    respond(false, "Server mail service is temporarily unavailable. Please email us directly at contact@rakeshkode.co.uk or use the fallback mail link below.", 500, [
        'fallbackMailto' => 'mailto:' . $TO_EMAIL . '?subject=' . rawurlencode($subject) . '&body=' . rawurlencode("Name: {$cleanName}\nEmail: {$cleanEmail}\nApp: {$cleanApp}\n\nMessage:\n{$message}")
    ]);
}
