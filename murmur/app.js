/**
 * Murmur - Minimalist & Interactive Script
 * Matches Pathway's delightful tactile interactions, live audio HUD simulation,
 * interactive keycap playground, and terminal installation tabs.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMascot();
  initNarrativeBeats();
  initSetupTerminals();
  initKeyTester();
  initDownloadLinkButtons();
});

// Light / Dark theme toggle (shared Mac Upgraded behaviour, key: mu-theme)
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  const current = () => {
    const forced = root.getAttribute('data-theme');
    if (forced === 'light' || forced === 'dark') return forced;
    return prefersDark && prefersDark.matches ? 'dark' : 'light';
  };
  toggle.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mu-theme', next); } catch (e) {}
  });
}

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

// 1. Playful Mascot Poke Interaction (Perry-style)
function initMascot() {
  const mascotBtn = document.getElementById('mascotBtn');
  const mascotHint = document.getElementById('mascotHint');
  const phrases = [
    '← click me again',
    '🎙️ Tap ⌃⌥D to dictate',
    '🧠 Whisper on Neural Engine',
    '✨ Stripping "um" & "uh"',
    '🔒 100% on-device & private'
  ];
  let pokeIndex = 0;

  if (mascotBtn) {
    mascotBtn.addEventListener('click', () => {
      pokeIndex = (pokeIndex + 1) % phrases.length;
      if (mascotHint) {
        mascotHint.textContent = phrases[pokeIndex];
        mascotHint.style.color = '#0071e3';
      }
      mascotBtn.style.transform = 'scale(0.88) rotate(-10deg)';
      setTimeout(() => {
        mascotBtn.style.transform = '';
      }, 180);
    });
  }
}

// 2. Interactive Narrative Beats & Simulated Live Speech HUD
const BEAT_HUD_DATA = {
  'hotkey': {
    title: 'Murmur — Universal ⌃⌥D HUD',
    badge: 'Focused: Slack / VS Code',
    cleanedTag: 'System-Wide Injection Active',
    text: '“Let’s schedule our release sprint review for this Thursday at 10 AM and finalize the remaining App Store Connect assets.”',
    footerLeft: 'Cleaned text inserted directly at active text cursor',
    footerRight: '154 WPM · 0ms Cloud Latency'
  },
  'filler': {
    title: 'Murmur — Smart Clean Filter',
    badge: 'Filler & Stutter Stripper',
    cleanedTag: 'Removed: "um, you know, th-that"',
    text: '“We need to review the Q3 quarterly budget and approve the new database migration strategy.”',
    footerLeft: 'Hesitation sounds & stutters stripped in real-time in RAM',
    footerRight: 'Neural Engine Filtered'
  },
  'meetings': {
    title: 'Murmur — Two-Way Meeting Capture',
    badge: 'Mic + System Audio Recorded',
    cleanedTag: 'Zoom & Microsoft Teams Dual Capture',
    text: '“Alex proposed moving the cache to Redis. Sarah agreed and will open the pull request by tomorrow afternoon.”',
    footerLeft: 'Both sides of call synchronized into one searchable transcript',
    footerRight: '2 Audio Streams Combined'
  },
  'notes': {
    title: 'Murmur — On-Device Searchable Notes',
    badge: 'Private Application Support Vault',
    cleanedTag: 'Executive Action Items Generated',
    text: '• Action 1: Deploy notarized DMG build to public release.<br>• Action 2: Update documentation and privacy statement.',
    footerLeft: 'Saved locally as Markdown in ~/Library/Application Support/Murmur',
    footerRight: 'Zero Cloud Storage'
  }
};

function initNarrativeBeats() {
  const beatItems = document.querySelectorAll('.beat-item');
  const stageTitle = document.getElementById('stageTitle');
  const stageBadge = document.getElementById('stageBadge');
  const hudCleanedTag = document.getElementById('hudCleanedTag');
  const hudTranscription = document.getElementById('hudTranscription');
  const hudFooterLeft = document.getElementById('hudFooterLeft');
  const hudFooterRight = document.getElementById('hudFooterRight');

  beatItems.forEach(item => {
    item.addEventListener('click', () => {
      beatItems.forEach(b => b.classList.remove('active'));
      item.classList.add('active');

      const beatKey = item.dataset.beat;
      const data = BEAT_HUD_DATA[beatKey];
      if (data) {
        if (stageTitle) stageTitle.textContent = data.title;
        if (stageBadge) stageBadge.textContent = data.badge;
        if (hudCleanedTag) hudCleanedTag.textContent = data.cleanedTag;
        if (hudTranscription) hudTranscription.innerHTML = data.text;
        if (hudFooterLeft) hudFooterLeft.textContent = data.footerLeft;
        if (hudFooterRight) hudFooterRight.textContent = data.footerRight;
      }
    });
  });
}

// 3. Setup Terminal Tabs & 1-Click Copy
const SETUP_COMMANDS = {
  'dmg': {
    comment: '# Double-click mounted DMG, drag Murmur into Applications',
    cmd: 'open Murmur-1.0.1.dmg',
    desc: 'mounts the notarized disk image'
  },
  'git': {
    comment: '# Clone directly from GitHub repository & run with Xcode',
    cmd: 'git clone https://github.com/GopiKrishnaRakesh/Murmur.git && cd Murmur && ./build.sh run',
    desc: 'builds and launches Murmur on Apple Silicon'
  },
  'curl': {
    comment: '# One-line automated download and run via terminal',
    cmd: 'curl -L -O https://github.com/GopiKrishnaRakesh/Murmur/releases/latest/download/Murmur-1.0.1.dmg && open Murmur-1.0.1.dmg',
    desc: 'fetches latest notarized release from GitHub'
  },
  'run': {
    comment: '# Launch Murmur directly from Spotlight or Applications',
    cmd: 'open -a Murmur',
    desc: 'starts liquid-glass menu bar voice agent'
  }
};

function initSetupTerminals() {
  const osTabs = document.querySelectorAll('.os-tab');
  const installCmdEl = document.getElementById('installCmd');
  const installCommentEl = document.getElementById('installComment');
  const installDescEl = document.getElementById('installDesc');

  osTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      osTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const mode = tab.dataset.mode;
      const data = SETUP_COMMANDS[mode];
      if (data && installCmdEl) {
        installCmdEl.textContent = data.cmd;
        if (installCommentEl) installCommentEl.textContent = data.comment;
        if (installDescEl) installDescEl.textContent = data.desc;
      }
    });
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.copy;
      let textToCopy = '';
      if (type === 'install' && installCmdEl) {
        textToCopy = installCmdEl.textContent.trim();
      } else if (type === 'run') {
        textToCopy = 'open -a Murmur';
      }

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Command copied to clipboard!');
        }).catch(() => {
          const ta = document.createElement('textarea');
          ta.value = textToCopy;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast('Command copied to clipboard!');
        });
      }
    });
  });
}

const KEY_FEEDBACKS = {
  'Ctrl+Opt+D': '⌃⌥D (Ctrl+Opt+D) — Toggles the liquid-glass dictation HUD anywhere on your Mac. Starts listening instantly.',
  'Cmd+M': '⌘M (Cmd+M) — Toggles Meeting Recording mode (mic + system audio recorded together).',
  'Space': 'Space ␣ — Toggles pause and resume while dictating without closing the active transcript.',
  'Enter': 'Enter ↵ — Commits the transcribed text into your focused application and closes HUD.',
  'Escape': 'Esc ⎋ — Cancels current recording immediately without inserting any text.'
};

function initKeyTester() {
  const keyBtns = document.querySelectorAll('.keycap-btn');
  const feedbackEl = document.getElementById('keyFeedback');

  keyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      keyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.dataset.key;
      const msg = KEY_FEEDBACKS[key] || `Key registered: ${key}`;
      if (feedbackEl) {
        feedbackEl.textContent = msg;
        feedbackEl.style.color = '#0071e3';
      }
    });
  });

  // Physical keyboard listener
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.ctrlKey && e.altKey && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      triggerKeycap('Ctrl+Opt+D');
    } else if (e.key === 'Escape') {
      triggerKeycap('Escape');
    }
  });

  function triggerKeycap(keyId) {
    keyBtns.forEach(btn => {
      if (btn.dataset.key === keyId) {
        btn.click();
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 400);
      }
    });
  }
}

// 5. Copy Download Link Buttons
function initDownloadLinkButtons() {
  document.querySelectorAll('.copy-download-link-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const downloadUrl = window.location.origin + window.location.pathname.replace(/\/+$/, '') + '/downloads/Murmur-1.0.1.dmg';
      navigator.clipboard.writeText(downloadUrl).then(() => {
        showToast('Direct DMG download link copied to clipboard!');
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = downloadUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Direct DMG download link copied to clipboard!');
      });
    });
  });
}
