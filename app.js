/**
 * Mac Upgraded — Master Interactive Frontend
 * Handles interactive macOS stage, animated dock switcher,
 * auto-cycling showcase, 3D tilt micro-animation, and platform filtering.
 */

const APPS_STAGE_DATA = {
  paperleaf: {
    id: 'paperleaf',
    name: 'Paperleaf',
    title: 'Paperleaf — Private Invoicing, Inventory & POS',
    platform: 'macOS 14+ · Windows 10/11',
    tagline: 'Private invoicing, POS, barcode scanning, Goods-In receiving & thermal receipts.',
    img: 'assets/screens/paperleaf-hero.jpg',
    url: 'paperleaf/index.html'
  },
  pathway: {
    id: 'pathway',
    name: 'Pathway',
    title: 'Pathway — Dual-Pane File Manager',
    platform: 'macOS 14+',
    tagline: 'Enter opens, F2 renames, true Cut & Paste, and dual-pane navigation.',
    img: 'assets/screens/pathway-hero.jpg',
    url: 'pathway/index.html'
  },
  paperbeam: {
    id: 'paperbeam',
    name: 'Paperbeam',
    title: 'Paperbeam — On-Device PDF Scanner & OCR',
    platform: 'iPhone iOS 16+ · Launching Soon',
    tagline: 'On-device Vision OCR, Face ID protection, and searchable PDF export.',
    img: 'assets/screens/paperbeam-render.png',
    url: 'paperbeam/index.html'
  },
  nfcpocket: {
    id: 'nfcpocket',
    name: 'NFC Pocket',
    title: 'NFC Pocket — NFC Tag Studio & Cloner',
    platform: 'iPhone iOS 17+ · Launching Soon',
    tagline: 'Read, write, dump memory and clone any NFC tag right from your iPhone.',
    img: 'assets/screens/nfcpocket-home.png',
    url: 'nfcpocket/index.html'
  },
  brickr: {
    id: 'brickr',
    name: 'Brickr',
    title: 'Brickr — Screen Time & Habit Blocker',
    platform: 'iPhone iOS 16+ · On App Store',
    tagline: 'Full-screen app limits you cannot swipe away until you tap your NFC tag.',
    img: 'assets/screens/brickr-home.png',
    url: 'brickr/index.html'
  },
  murmur: {
    id: 'murmur',
    name: 'Murmur',
    title: 'Murmur — Liquid-Glass AI Voice Dictation & Notes',
    platform: 'macOS 14+',
    tagline: '100% on-device Whisper dictation and system audio meeting transcription.',
    img: 'assets/screens/murmur-hero.jpg',
    url: 'murmur/index.html'
  }
};

const APP_KEYS = ['paperleaf', 'pathway', 'murmur', 'paperbeam', 'nfcpocket', 'brickr'];
let currentAppIndex = 0;
let autoCycleTimer = null;
let isUserInteracting = false;

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeroStage();
  initTiltEffect();
  initPlatformFilters();
  initSmoothScroll();
  initContactForm();
  initCookieBanner();
  initTipJar();
});

/* ==========================================================================
   0. Theme toggle (light / dark) — persists in localStorage
   ========================================================================== */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const resolved = () => root.getAttribute('data-theme') || (media.matches ? 'dark' : 'light');

  toggle.addEventListener('click', () => {
    const next = resolved() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mu-theme', next); } catch (e) {}
    const meta = document.querySelector('meta[name="theme-color"]:not([media])') || document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#0a0b0d' : '#ffffff');
  });
}

/* ==========================================================================
   1. Interactive Hero Stage & macOS Dock
   ========================================================================== */
function initHeroStage() {
  const dockItems = document.querySelectorAll('.dock-item');
  const stageCard = document.getElementById('heroStageCard');

  dockItems.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      isUserInteracting = true;
      clearInterval(autoCycleTimer);
      selectApp(index);
    });

    btn.addEventListener('mouseenter', () => {
      selectApp(index);
    });
  });

  // Pause auto-cycle when hovering over stage
  if (stageCard) {
    stageCard.addEventListener('mouseenter', () => {
      clearInterval(autoCycleTimer);
    });

    stageCard.addEventListener('mouseleave', () => {
      if (!isUserInteracting) {
        startAutoCycle();
      }
    });
  }

  // Initial auto cycle
  startAutoCycle();
}

function selectApp(index) {
  currentAppIndex = index;
  const appKey = APP_KEYS[index];
  const app = APPS_STAGE_DATA[appKey];
  if (!app) return;

  // Update Dock UI
  const dockItems = document.querySelectorAll('.dock-item');
  dockItems.forEach((item, idx) => {
    const isActive = idx === index;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update Window Elements
  const titleEl = document.getElementById('stageWindowTitle');
  const platformEl = document.getElementById('stagePlatformPill');
  const nameEl = document.getElementById('stageAppName');
  const taglineEl = document.getElementById('stageAppTagline');
  const imgEl = document.getElementById('stageImg');
  const ctaEl = document.getElementById('stageCtaBtn');

  if (titleEl) titleEl.textContent = app.title;
  if (platformEl) platformEl.textContent = app.platform;
  if (nameEl) nameEl.textContent = app.name;
  if (taglineEl) taglineEl.textContent = app.tagline;

  if (ctaEl) {
    ctaEl.setAttribute('href', app.url);
    ctaEl.innerHTML = `<span>Open ${app.name}</span><span class="btn-arrow" aria-hidden="true">↗</span>`;
  }

  const stageWrap = document.querySelector('.stage-screen-wrap');
  if (stageWrap) {
    const isMobile = app.platform.includes('iPhone') || app.platform.includes('iOS');
    stageWrap.classList.toggle('is-mobile', isMobile);
  }

  if (imgEl && imgEl.getAttribute('src') !== app.img) {
    imgEl.style.opacity = '0.3';
    imgEl.style.transform = 'scale(0.985)';
    setTimeout(() => {
      imgEl.src = app.img;
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1)';
    }, 150);
  }
}

function startAutoCycle() {
  clearInterval(autoCycleTimer);
  autoCycleTimer = setInterval(() => {
    currentAppIndex = (currentAppIndex + 1) % APP_KEYS.length;
    selectApp(currentAppIndex);
  }, 4500);
}

/* ==========================================================================
   2. Subtle 3D Card Tilt on Mouse Move
   ========================================================================== */
function initTiltEffect() {
  const stageWindow = document.getElementById('stageWindow');
  const stageCard = document.getElementById('heroStageCard');

  if (!stageWindow || !stageCard || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  stageCard.addEventListener('mousemove', (e) => {
    const rect = stageCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    stageWindow.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  });

  stageCard.addEventListener('mouseleave', () => {
    stageWindow.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}

/* ==========================================================================
   3. Platform Filters (All / macOS / iOS)
   ========================================================================== */
function initPlatformFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.project-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const filter = pill.getAttribute('data-filter');

      // Update pill states
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      // Filter cards
      cards.forEach(card => {
        const cardPlatform = card.getAttribute('data-platform');
        if (filter === 'all' || cardPlatform === filter) {
          card.style.display = 'grid';
          setTimeout(() => {
            card.style.opacity = '1';
          }, 10);
        } else {
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   4. Smooth Anchor Scrolling
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   5. Interactive Contact Form & Copy Email
   ========================================================================== */
function initContactForm() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const form = document.getElementById('contactForm');
  const emailAddr = 'contact@rakeshkode.co.uk';

  if (copyBtn && copyBtnText) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(emailAddr).then(() => {
        const originalText = copyBtnText.textContent;
        copyBtnText.textContent = 'Copied to clipboard!';
        copyBtn.style.background = '#059669';
        copyBtn.style.color = '#fff';
        copyBtn.style.borderColor = '#059669';

        setTimeout(() => {
          copyBtnText.textContent = originalText;
          copyBtn.style.background = '';
          copyBtn.style.color = '';
          copyBtn.style.borderColor = '';
        }, 2200);
      }).catch(() => {
        window.location.href = `mailto:${emailAddr}`;
      });
    });
  }

  if (form) {
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const appSelect = document.getElementById('contactApp');
    const messageInput = document.getElementById('contactMessage');
    const honeypot = form.querySelector('.form-honeypot');
    const successBox = document.getElementById('formSuccessMessage');
    const successDetail = document.getElementById('formSuccessDetail');
    const errorBox = document.getElementById('formErrorMessage');
    const errorTitle = document.getElementById('formErrorTitle');
    const errorDetail = document.getElementById('formErrorDetail');
    const submitBtn = document.getElementById('formSubmitBtn');
    const fallbackMailtoBtn = document.getElementById('fallbackMailtoBtn');
    const fallbackCopyBtn = document.getElementById('fallbackCopyBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Anti-spam honeypot
      if (honeypot && honeypot.value.trim() !== '') {
        // Quietly pretend success to bot
        if (successBox) successBox.style.display = 'flex';
        form.reset();
        return;
      }

      let isValid = true;

      // Validate name
      const nameVal = nameInput ? nameInput.value.trim() : '';
      const groupName = document.getElementById('groupName');
      if (!nameVal) {
        isValid = false;
        if (groupName) groupName.classList.add('has-error');
      } else if (groupName) {
        groupName.classList.remove('has-error');
      }

      // Validate email
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const groupEmail = document.getElementById('groupEmail');
      if (!emailVal || !emailRegex.test(emailVal)) {
        isValid = false;
        if (groupEmail) groupEmail.classList.add('has-error');
      } else if (groupEmail) {
        groupEmail.classList.remove('has-error');
      }

      // Validate message
      const msgVal = messageInput ? messageInput.value.trim() : '';
      const groupMsg = document.getElementById('groupMessage');
      if (!msgVal || msgVal.length < 10) {
        isValid = false;
        if (groupMsg) groupMsg.classList.add('has-error');
      } else if (groupMsg) {
        groupMsg.classList.remove('has-error');
      }

      if (!isValid) return;

      const appVal = appSelect ? appSelect.value : 'General';
      const subject = `[${appVal}] Inquiry from ${nameVal}`;

      // Reset previous notices
      if (successBox) successBox.style.display = 'none';
      if (errorBox) errorBox.style.display = 'none';

      // Set loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="form-spinner" aria-hidden="true"></span><span>Sending directly...</span>`;
      }

      const payload = {
        name: nameVal,
        email: emailVal,
        app: appVal,
        message: msgVal,
        _gotcha: honeypot ? honeypot.value : ''
      };

      try {
        const response = await fetch('contact.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        let data = null;
        try {
          data = await response.json();
        } catch (_) {
          // Response is not JSON
        }

        if (response.ok && data && data.success) {
          // DIRECT SUCCESS VIA BACKEND
          if (successBox) {
            if (successDetail && data.message) {
              successDetail.textContent = data.message;
            }
            successBox.style.display = 'flex';
            successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          form.reset();
        } else {
          // Server returned error or static environment
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const errorMsg = data && data.message ? data.message : (data && data.error ? data.error : null);

          if (errorBox) {
            if (isLocal) {
              if (errorTitle) errorTitle.textContent = 'Local Preview Notice';
              if (errorDetail) {
                errorDetail.innerHTML = `Your form inputs are valid! On your live Hostinger server, <code>contact.php</code> sends this directly to <code>${emailAddr}</code>. On this local Python preview server, PHP execution is not active.`;
              }
            } else if (errorMsg) {
              if (errorTitle) errorTitle.textContent = 'Submission Note';
              if (errorDetail) errorDetail.textContent = errorMsg;
            } else {
              if (errorTitle) errorTitle.textContent = 'Mail Service Unavailable';
              if (errorDetail) {
                errorDetail.innerHTML = `Unable to connect to the mail server right now. Please email directly to <code>${emailAddr}</code> or use the fallback buttons below.`;
              }
            }

            // Set up fallback options so user never loses their message
            const mailtoUri = `mailto:${emailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hello Rakesh,\n\nName: ${nameVal}\nEmail: ${emailVal}\nApplication: ${appVal}\n\nMessage:\n${msgVal}\n\n---\nSent via Mac Upgraded studio form`)}`;
            if (fallbackMailtoBtn) {
              fallbackMailtoBtn.href = mailtoUri;
            }

            if (fallbackCopyBtn) {
              fallbackCopyBtn.onclick = () => {
                const fullText = `To: ${emailAddr}\nSubject: ${subject}\nName: ${nameVal}\nEmail: ${emailVal}\nApplication: ${appVal}\n\nMessage:\n${msgVal}`;
                navigator.clipboard.writeText(fullText).then(() => {
                  fallbackCopyBtn.textContent = 'Copied to Clipboard!';
                  setTimeout(() => { fallbackCopyBtn.textContent = 'Copy Message Details'; }, 2500);
                });
              };
            }

            errorBox.style.display = 'flex';
            errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      } catch (err) {
        // Network error / offline
        if (errorBox) {
          if (errorTitle) errorTitle.textContent = 'Network Notice';
          if (errorDetail) {
            errorDetail.innerHTML = `Could not reach the server. Please write directly to <code>${emailAddr}</code> or use the fallback actions below.`;
          }
          const mailtoUri = `mailto:${emailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hello Rakesh,\n\nName: ${nameVal}\nEmail: ${emailVal}\nApplication: ${appVal}\n\nMessage:\n${msgVal}`)}`;
          if (fallbackMailtoBtn) fallbackMailtoBtn.href = mailtoUri;

          if (fallbackCopyBtn) {
            fallbackCopyBtn.onclick = () => {
              const fullText = `To: ${emailAddr}\nSubject: ${subject}\nName: ${nameVal}\nEmail: ${emailVal}\nApplication: ${appVal}\n\nMessage:\n${msgVal}`;
              navigator.clipboard.writeText(fullText).then(() => {
                fallbackCopyBtn.textContent = 'Copied to Clipboard!';
                setTimeout(() => { fallbackCopyBtn.textContent = 'Copy Message Details'; }, 2500);
              });
            };
          }

          errorBox.style.display = 'flex';
          errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span id="formSubmitText">Send Message</span><span class="btn-arrow" id="formSubmitArrow" aria-hidden="true">→</span>`;
        }
      }
    });
  }
}

/* ==========================================================================
   6. Zero-Cookie Privacy Notice Banner
   ========================================================================== */
function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  const dismissBtn = document.getElementById('dismissCookieBanner');
  if (!banner || !dismissBtn) return;

  const isDismissed = localStorage.getItem('zero_cookie_banner_dismissed') === 'true';
  if (isDismissed) {
    banner.classList.add('hidden');
    return;
  }

  dismissBtn.addEventListener('click', () => {
    banner.classList.add('hidden');
    try {
      localStorage.setItem('zero_cookie_banner_dismissed', 'true');
    } catch {
      // LocalStorage unavailable in strict sandbox
    }
  });
}

/* ==========================================================================
   7. Buy me a coffee — tip jar with Apple Pay / Google Pay (Stripe)
   ========================================================================== */
function initTipJar() {
  const jar = document.getElementById('tipJar');
  if (!jar) return;

  const amountsWrap = document.getElementById('tipAmounts');
  const options = Array.from(amountsWrap ? amountsWrap.querySelectorAll('.tip-option') : []);
  const customInput = document.getElementById('tipCustom');
  const cardBtn = document.getElementById('tipCardBtn');
  const cardBtnText = document.getElementById('tipCardBtnText');
  const statusEl = document.getElementById('tipStatus');
  const prButtonEl = document.getElementById('tip-payment-request-button');
  const walletNote = document.getElementById('tipWalletNote');
  const divider = document.getElementById('tipDivider');

  const MIN = 1, MAX = 500;
  const state = { amount: 5, currency: 'gbp', symbol: '£', label: 'Mac Upgraded — tip', endpoint: 'stripe-tip.php' };
  let stripe = null;
  let paymentRequest = null;

  const toPence = (pounds) => Math.round(pounds * 100);
  const fmt = (pounds) => state.symbol + (Number.isInteger(pounds) ? pounds : pounds.toFixed(2));

  function showStatus(kind, msg) {
    if (!statusEl) return;
    statusEl.className = 'tip-status show ' + kind;
    statusEl.textContent = msg;
  }
  function clearStatus() { if (statusEl) statusEl.className = 'tip-status'; }

  function clampAmount(v) {
    const n = parseFloat(v);
    if (isNaN(n)) return null;
    return Math.min(MAX, Math.max(MIN, n));
  }

  function syncUI() {
    options.forEach((o) => {
      const match = parseFloat(o.dataset.amount) === state.amount && document.activeElement !== customInput;
      o.classList.toggle('selected', match);
      o.setAttribute('aria-pressed', match ? 'true' : 'false');
    });
    if (cardBtnText) cardBtnText.textContent = `Tip ${fmt(state.amount)} with card`;
    if (paymentRequest) {
      paymentRequest.update({ total: { label: state.label, amount: toPence(state.amount) } });
    }
  }

  options.forEach((o) => {
    o.addEventListener('click', () => {
      state.amount = parseFloat(o.dataset.amount);
      if (customInput) customInput.value = '';
      clearStatus();
      syncUI();
    });
  });

  if (customInput) {
    customInput.addEventListener('input', () => {
      const v = clampAmount(customInput.value);
      if (v !== null) { state.amount = v; clearStatus(); }
      options.forEach((o) => { o.classList.remove('selected'); o.setAttribute('aria-pressed', 'false'); });
      if (cardBtnText) cardBtnText.textContent = `Tip ${fmt(state.amount)} with card`;
      if (paymentRequest && v !== null) paymentRequest.update({ total: { label: state.label, amount: toPence(state.amount) } });
    });
  }

  async function postJSON(action, body) {
    const res = await fetch(`${state.endpoint}?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) throw new Error((data && (data.error || data.message)) || 'Payment service unavailable.');
    return data;
  }

  /* ---- Card fallback: redirect to Stripe Checkout (also offers wallets there) ---- */
  if (cardBtn) {
    cardBtn.addEventListener('click', async () => {
      clearStatus();
      cardBtn.disabled = true;
      const original = cardBtnText ? cardBtnText.textContent : '';
      if (cardBtnText) cardBtnText.innerHTML = '<span class="tip-spinner" aria-hidden="true"></span> Redirecting…';
      try {
        const { url } = await postJSON('checkout_session', { amount: toPence(state.amount) });
        if (url) { window.location.href = url; return; }
        throw new Error('Could not start checkout.');
      } catch (err) {
        showStatus('error', err.message || 'Something went wrong. Please try again.');
        cardBtn.disabled = false;
        if (cardBtnText) cardBtnText.textContent = original;
      }
    });
  }

  /* ---- Apple Pay / Google Pay via Stripe Payment Request Button ---- */
  async function initStripeWallets() {
    let cfg;
    try {
      const res = await fetch(`${state.endpoint}?action=config`, { headers: { 'Accept': 'application/json' } });
      cfg = await res.json();
    } catch (e) {
      // No PHP backend reachable (e.g. local static preview). Keep card button but inform.
      showStatus('info', 'Live payments activate on the published site (Stripe backend required).');
      if (cardBtn) cardBtn.disabled = true;
      return;
    }

    if (!cfg || !cfg.configured || !cfg.publishableKey) {
      if (cfg && cfg.publishableKey && !cfg.configured) {
        showStatus('info', 'Publishable key active. Stripe secret_key (sk_live_...) is required on Hostinger to enable checkout.');
      } else {
        showStatus('info', 'Tip jar is almost ready — add your Stripe keys to go live.');
      }
      if (cardBtn) cardBtn.disabled = true;
      return;
    }

    state.currency = cfg.currency || state.currency;
    state.label = cfg.label || state.label;

    if (typeof Stripe === 'undefined') return; // Stripe.js blocked/offline — card button still works

    stripe = Stripe(cfg.publishableKey);
    paymentRequest = stripe.paymentRequest({
      country: cfg.country || 'GB',
      currency: state.currency,
      total: { label: state.label, amount: toPence(state.amount) },
      requestPayerName: false,
      requestPayerEmail: true
    });

    const prButton = stripe.elements().create('paymentRequestButton', {
      paymentRequest,
      style: { paymentRequestButton: { type: 'default', theme: 'dark', height: '48px' } }
    });

    const result = await paymentRequest.canMakePayment();
    if (result && prButtonEl) {
      prButton.mount('#tip-payment-request-button');
      if (walletNote) walletNote.hidden = false;
      if (divider) divider.hidden = false;
    }

    paymentRequest.on('paymentmethod', async (ev) => {
      try {
        const { clientSecret } = await postJSON('payment_intent', { amount: toPence(state.amount) });
        const { error: confirmErr, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret, { payment_method: ev.paymentMethod.id }, { handleActions: false }
        );
        if (confirmErr) { ev.complete('fail'); showStatus('error', confirmErr.message); return; }
        ev.complete('success');
        if (paymentIntent && paymentIntent.status === 'requires_action') {
          const { error: actionErr } = await stripe.confirmCardPayment(clientSecret);
          if (actionErr) { showStatus('error', actionErr.message); return; }
        }
        showStatus('success', 'Thank you so much for the support! ☕');
      } catch (err) {
        ev.complete('fail');
        showStatus('error', err.message || 'Payment could not be completed.');
      }
    });
  }

  // Confirmation banner after a successful Checkout redirect (?tip=success)
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tip') === 'success') {
      showStatus('success', 'Thank you so much for the support! ☕');
      history.replaceState(null, '', window.location.pathname + '#support');
    } else if (params.get('tip') === 'cancel') {
      showStatus('info', 'No worries — the tip was cancelled. The apps stay free either way.');
      history.replaceState(null, '', window.location.pathname + '#support');
    }
  } catch (e) {}

  syncUI();
  initStripeWallets();
}

