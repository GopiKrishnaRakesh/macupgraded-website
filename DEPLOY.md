# Deploying to Hostinger — Mac Upgraded (Single Domain, No Subdomains)

All applications and the master studio homepage are organized as clean, dedicated paths under **`https://macupgraded.com/`**:

| Page / App | Live Production URL | Included in Upload |
|---|---|---|
| **Mac Upgraded (Master Homepage)** | `https://macupgraded.com/` | `deploy/zips/main.zip` |
| **Paperleaf** | `https://macupgraded.com/paperleaf/` | `deploy/zips/main.zip` |
| **Pathway** | `https://macupgraded.com/pathway/` | `deploy/zips/main.zip` |
| **Murmur** | `https://macupgraded.com/murmur/` | `deploy/zips/main.zip` |
| **Paperbeam** | `https://macupgraded.com/paperbeam/` | `deploy/zips/main.zip` |
| **NFC Pocket** | `https://macupgraded.com/nfcpocket/` | `deploy/zips/main.zip` |
| **Brickr** | `https://macupgraded.com/brickr/` | `deploy/zips/main.zip` |
| **Direct Contact Handler** | `https://macupgraded.com/contact.php` | `deploy/zips/main.zip` |
| **Legal: Privacy Policy** | `https://macupgraded.com/privacy.html` | `deploy/zips/main.zip` |
| **Legal: Terms of Service** | `https://macupgraded.com/terms.html` | `deploy/zips/main.zip` |

---

## 1. Production Build Package

The entire unified site is built into:
- Directory: `websites/deploy/main/`
- Zip Archive: **`websites/deploy/zips/main.zip`**

To rebuild at any time:
```bash
cd websites
node scripts/build.mjs
```

---

## 2. Deploying to Hostinger (Step-by-Step)

### Option A: Using Hostinger hPanel File Manager (Easiest & Fastest, 2 Minutes)
1. Log in to your Hostinger dashboard (**hPanel**).
2. Go to **Websites** › find `macupgraded.com` › click **Manage**.
3. Under **Files**, open **File Manager** (or File Manager for `macupgraded.com`).
4. Double-click to open the **`public_html`** directory.
   *(If there is an existing default `default.php` or older test files, delete them or move them to a backup folder)*.
5. In the top toolbar, click the **Upload** button (icon with an arrow pointing up) › select **File**.
6. Select and upload **`deploy/zips/main.zip`**.
7. Once uploaded, right-click `main.zip` in File Manager › click **Extract**.
8. In the extraction destination prompt, enter `.` or select `public_html` so the contents extract directly into `public_html`.
9. Delete `main.zip` from `public_html` to save disk space.

### Result in `public_html`:
```text
public_html/
├── index.html                 (Master Homepage)
├── app.js                     (Studio scripts)
├── styles.css                 (Studio design system)
├── contact.php                (Direct email dispatch to contact@rakeshkode.co.uk)
├── privacy.html               (GDPR / CCPA Zero-Cookie policy)
├── terms.html                 (Terms of service)
├── 404.html                   (Branded custom 404 page)
├── .htaccess                  (HTTPS 301, security headers, caching, anti-bot)
├── sitemap.xml                (Full canonical XML sitemap)
├── robots.txt                 (Search engine crawling rules)
├── favicon.svg / .ico         (Favicons)
├── paperleaf/                 (Paperleaf app page & downloads)
├── pathway/                   (Pathway app page & downloads)
├── murmur/                    (Murmur app page & downloads)
├── paperbeam/                 (Paperbeam app page & guides)
├── nfcpocket/                 (NFC Pocket app page & guides)
└── brickr/                    (Brickr app page & guides)
```

---

## 3. Hostinger Server Verification

1. **SSL Certificate (HTTPS)**:
   - In hPanel › **Security › SSL**, ensure `macupgraded.com` (and `www.macupgraded.com`) has **Active** status.
   - The included `.htaccess` automatically forces all HTTP traffic to HTTPS (301 redirect).

2. **PHP Version**:
   - In hPanel › **Advanced › PHP Configuration**, ensure PHP 8.1, 8.2, or 8.3 is active (default on Hostinger).
   - PHP `mail()` is enabled by default on Hostinger, enabling `contact.php` to immediately forward inquiries directly to `contact@rakeshkode.co.uk`.

3. **Verify Live**:
   - Open `https://macupgraded.com/` in your browser.
   - Scroll to **Direct Contact & Inquiries**, fill out a test inquiry, and submit to verify direct inbox delivery.
