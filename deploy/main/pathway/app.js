/**
 * Pathway - Minimal & Interactive Script
 * Inspired by Perry's delightful minimalism and tactile interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMascot();
  initNarrativeBeats();
  initSetupTerminals();
  initKeyTester();
  initFolderSizeSimulator();
  initDownloadLinkButtons();
});

// 0. Light / Dark theme toggle (shared Mac Upgraded behaviour, key: mu-theme)
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
    '⚡️ Enter opens, F2 renames',
    '📁 Folder sizes calculating...',
    '✂️ True Cut & Paste ready',
    '🍏 Native SwiftUI speed'
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

// 2. Interactive Narrative Beats & Simulated Stage View
const BEAT_STAGE_DATA = {
  'enter': {
    title: 'Pathway — Enter to Open',
    highlightRow: 'project_brief',
    statusText: 'Selected: Project_Brief.docx (Tap Enter ↵ to launch immediately)',
    feedback: 'Enter ↵ opens the file instead of renaming it.'
  },
  'f2': {
    title: 'Pathway — F2 Inline Rename',
    highlightRow: 'design_specs',
    statusText: 'Renaming: Design_Specs.pdf (Cursor automatically focused)',
    feedback: 'F2 starts editing filename immediately.'
  },
  'size': {
    title: 'Pathway — Live Folder Calculations',
    highlightRow: 'assets_folder',
    statusText: 'Assets Folder: 2.84 GB (Calculated in background off main thread)',
    feedback: 'Asynchronous actor computes recursive weights.'
  },
  'cut': {
    title: 'Pathway — Standard Cut & Paste',
    highlightRow: 'archive_zip',
    statusText: 'Staged: Archive.zip (Ctrl+X or ⌘X to cut -> Ctrl+V to paste)',
    feedback: 'True move semantics with multi-level undo.'
  }
};

function initNarrativeBeats() {
  const beatItems = document.querySelectorAll('.beat-item');
  const stageTitle = document.getElementById('stageTitle');
  const stageStatus = document.getElementById('stageStatus');

  beatItems.forEach(item => {
    item.addEventListener('click', () => {
      beatItems.forEach(b => b.classList.remove('active'));
      item.classList.add('active');

      const beatKey = item.dataset.beat;
      const data = BEAT_STAGE_DATA[beatKey];
      if (data) {
        if (stageTitle) stageTitle.textContent = data.title;
        if (stageStatus) stageStatus.textContent = data.statusText;

        // Highlight matching row in the simulated table
        document.querySelectorAll('.sim-row').forEach(row => {
          row.classList.remove('selected');
          if (row.dataset.row === data.highlightRow) {
            row.classList.add('selected');
          }
        });
      }
    });
  });
}

// 3. Setup Terminal Tabs & 1-Click Copy (Perry #setup style)
const SETUP_COMMANDS = {
  'dmg': {
    comment: '# Double-click mounted DMG, drag Pathway into Applications',
    cmd: 'open Pathway-1.0.0.dmg',
    desc: 'mounts the notarized disk image'
  },
  'git': {
    comment: '# Clone directly from GitHub repository & run',
    cmd: 'git clone https://github.com/GopiKrishnaRakesh/indiesuite-mac.git && cd "indiesuite-mac/file manager" && ./build.sh && open Build/Build/Products/Release/Pathway.app',
    desc: 'builds and runs from GitHub source'
  },
  'curl': {
    comment: '# One-line automated install directly from GitHub',
    cmd: 'curl -fsSL https://raw.githubusercontent.com/GopiKrishnaRakesh/indiesuite-mac/main/file%20manager/install.sh | bash',
    desc: 'downloads and installs Pathway to /Applications'
  },
  'run': {
    comment: '# Launch Pathway directly from terminal or Spotlight',
    cmd: 'open -a Pathway',
    desc: 'launches native SwiftUI file manager'
  }
};

function initSetupTerminals() {
  // Tab toggling for Step 1
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
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.copy;
      let textToCopy = '';

      if (target === 'install') {
        textToCopy = document.getElementById('installCmd')?.textContent || '';
      } else if (target === 'run') {
        textToCopy = 'open -a Pathway';
      }

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Copied to clipboard');
        });
      }
    });
  });
}

// 4. Tactile Keyboard Tester
function initKeyTester() {
  const feedbackEl = document.getElementById('keyFeedback');
  const keyBtns = document.querySelectorAll('.keycap-btn');

  const keyMap = {
    'Enter': '⚡️ Enter: Opens file or enters directory immediately (no accidental rename!)',
    'F2': '✏️ F2: Focuses filename field for instant inline renaming',
    'Backspace': '⬅️ Backspace: Navigates back or up one parent directory',
    'Ctrl+X': '✂️ Ctrl/⌘+X: Stages selected files for Cut / Move',
    'Ctrl+V': '📋 Ctrl/⌘+V: Pastes files with atomic move and full Undo',
    'Delete': '🗑️ Delete: Moves to Trash directly (Shift+Delete for permanent deletion)',
    'Space': '👁️ Space: Instant macOS Quick Look preview'
  };

  keyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      triggerKeyFeedback(key, btn);
    });
  });

  // Listen to real physical keystrokes on the page!
  window.addEventListener('keydown', (e) => {
    // Prevent accidental browser navigation when testing Backspace
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      let matchedKey = null;
      if (e.key === 'Enter') matchedKey = 'Enter';
      else if (e.key === 'F2') matchedKey = 'F2';
      else if (e.key === 'Backspace') matchedKey = 'Backspace';
      else if (e.key === 'Delete') matchedKey = 'Delete';
      else if (e.key === ' ' && !e.target.closest('button')) matchedKey = 'Space';

      if (matchedKey) {
        const btn = document.querySelector(`.keycap-btn[data-key="${matchedKey}"]`);
        triggerKeyFeedback(matchedKey, btn);
      }
    }
  });

  function triggerKeyFeedback(key, btn) {
    if (feedbackEl && keyMap[key]) {
      feedbackEl.textContent = keyMap[key];
      if (btn) {
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 200);
      }
    }
  }
}

// 5. Interactive Folder Size Calculation Simulation
function initFolderSizeSimulator() {
  const calcRow = document.getElementById('calcFolderSize');
  if (!calcRow) return;

  calcRow.addEventListener('click', () => {
    calcRow.textContent = 'Calculating…';
    setTimeout(() => {
      calcRow.textContent = '2.84 GB';
      showToast('Calculated: 2.84 GB (Cached by timestamp)');
    }, 400);
  });
}

// 6. Copy Direct Download Link (Official GitHub Release URL)
function initDownloadLinkButtons() {
  const GITHUB_DOWNLOAD_URL = 'https://github.com/GopiKrishnaRakesh/indiesuite-mac/releases/latest/download/Pathway-1.0.0.dmg';
  const copyBtns = document.querySelectorAll('.copy-download-link-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(GITHUB_DOWNLOAD_URL).then(() => {
          showToast('GitHub download link copied to clipboard!');
        }).catch(() => {
          copyFallback(GITHUB_DOWNLOAD_URL);
        });
      } else {
        copyFallback(GITHUB_DOWNLOAD_URL);
      }
    });
  });

  function copyFallback(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast('GitHub download link copied to clipboard!');
    } catch (err) {
      prompt('GitHub download link:', text);
    }
    document.body.removeChild(tempInput);
  }
}

