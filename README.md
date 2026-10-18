# Mac Upgraded — Master Website & Unified App Portal

Official website repository for **Mac Upgraded** ([https://macupgraded.com/](https://macupgraded.com/)), the native software studio for Mac and iPhone by Rakesh Kode.

## Architecture

- **`master/`**: Studio master homepage source, stylesheet design system, interactive stage dock, and contact handler.
- **`deploy/main/`**: Pre-built, unified production release ready for hosting. Includes the master homepage and all application portals:
  - **Paperleaf** (`/paperleaf/`): Private invoicing, inventory, Goods-In intake, POS & thermal receipts.
  - **Pathway** (`/pathway/`): Dual-pane native file manager for macOS.
  - **Murmur** (`/murmur/`): On-device liquid-glass AI voice dictation.
  - **Paperbeam** (`/paperbeam/`): Private PDF scanner & OCR for iOS.
  - **NFC Pocket** (`/nfcpocket/`): NFC tag management on-device.
  - **Brickr** (`/brickr/`): Screen time blocker powered by physical NFC.
- **`scripts/build.mjs`**: Studio compilation script to re-bundle and version the entire portal.

## Hosting & Deployment

### 1. GitHub Pages (Automated)
This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys `deploy/main/` to GitHub Pages with custom domain `macupgraded.com` and SSL on every push.

To enable in GitHub:
1. Go to repository **Settings** › **Pages**.
2. Under **Build and deployment** › **Source**, select **GitHub Actions**.

### 2. Vercel / Cloudflare Pages
- **Root / Output Directory**: `deploy/main`
- **Build Command**: None (or `node scripts/build.mjs`)

### 3. Hostinger / Apache Web Server
Upload `deploy/zips/main.zip` to `public_html` and extract, as detailed in `DEPLOY.md`.
