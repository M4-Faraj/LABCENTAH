/* ============================================================
   E MARKETING LAB CO. — main.js
   ============================================================ */

/* ── Budget selector ──────────────────────────────────────── */
function toggleBudget(btn) {
  const siblings = btn.parentElement.querySelectorAll('.budget-btn');
  siblings.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ── Textarea char counter ───────────────────────────────── */
function updateCharCount(textarea) {
  const max      = textarea.maxLength || 500;
  const current  = textarea.value.length;
  const display  = textarea.closest('.form-field')?.querySelector('.char-count span:last-child')
                || document.getElementById('char-display');
  if (display) display.textContent = `${current}/${max}`;
}

/* ── Copy to clipboard ───────────────────────────────────── */
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg viewBox="0 0 14 14" fill="none" width="13" height="13"><path d="M2 7l3.5 3.5L12 3" stroke="#6B21A8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    setTimeout(() => { btn.innerHTML = orig; }, 1800);
  });
}

/* ── Newsletter form ─────────────────────────────────────── */
function handleNewsletter(btn) {
  const input = btn.previousElementSibling?.querySelector('input');
  if (!input || !input.value.includes('@')) {
    input && (input.style.borderBottomColor = '#e11d48');
    return;
  }
  input.style.borderBottomColor = '';
  btn.textContent = '✓ Subscribed!';
  btn.style.background = '#22c55e';
  setTimeout(() => {
    btn.textContent = 'Join Now';
    btn.style.background = '';
    input.value = '';
  }, 3000);
}

/* ── Contact form ────────────────────────────────────────── */
function handleContactForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = '✓ Sent! We\'ll be in touch.';
  btn.style.background = '#22c55e';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 4000);
}

/* ── Mobile nav toggle ───────────────────────────────────── */
function toggleMobileNav() {
  const nav  = document.getElementById('mobile-nav');
  const btn  = document.querySelector('.hamburger');
  if (!nav) return;
  const open = nav.classList.toggle('open');
  if (btn) btn.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

/* close mobile nav on outside click */
document.addEventListener('click', e => {
  const nav = document.getElementById('mobile-nav');
  const btn = document.querySelector('.hamburger');
  if (!nav || !nav.classList.contains('open')) return;
  if (!nav.contains(e.target) && !btn.contains(e.target)) {
    nav.classList.remove('open');
    btn && btn.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ── Navbar search ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `service-detail.html?q=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }
});

/* ── Scroll-triggered fade-up (non-hero) ─────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.style.opacity  = '1';
        en.target.style.transform = 'translateY(0)';
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.why-card, .service-card, .order-summary-card').forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    io.observe(el);
  });
});

/* ============================================================
   CART (persistent — localStorage)
   Items: { id, name, tier, price, qty }
   key   = `${id}::${tier}` so the same service in different tiers
           appears as separate lines.
   ============================================================ */
const CART_KEY = 'eml_cart';

function getCart() {
  try {
    const v = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch(e) { return []; }
}
function saveCart(items) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch(e) {}
  updateCartBadge();
}
function cartKey(it) { return `${it.id}::${it.tier || ''}`; }

function cartAdd(item) {
  if (!item || !item.id) return;
  const it = { id: item.id, name: item.name || item.id, tier: item.tier || '', price: Number(item.price) || 0, qty: 1 };
  const items = getCart();
  const existing = items.find(x => cartKey(x) === cartKey(it));
  if (existing) existing.qty += 1; else items.push(it);
  saveCart(items);
}
function cartSetQty(key, qty) {
  qty = Math.max(0, parseInt(qty, 10) || 0);
  let items = getCart();
  if (qty === 0) {
    items = items.filter(it => cartKey(it) !== key);
  } else {
    const it = items.find(x => cartKey(x) === key);
    if (it) it.qty = qty;
  }
  saveCart(items);
}
function cartRemove(key) { cartSetQty(key, 0); }
function cartClear() { saveCart([]); }

function cartCount() { return getCart().reduce((n, it) => n + (it.qty || 0), 0); }
function cartSubtotal() { return getCart().reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0); }

function updateCartBadge() {
  const n = cartCount();
  document.querySelectorAll('.cart-badge').forEach(b => b.textContent = n);
}

/* Legacy shim — anything still calling updateCartStorage(n) won't break */
function updateCartStorage() { updateCartBadge(); }

/* One-time migration: if a number-only cart sat in sessionStorage, drop it */
(function migrateLegacyCart() {
  try { sessionStorage.removeItem('cartCount'); } catch(e) {}
})();

/* ============================================================
   WISHLIST (persistent — localStorage)
   ============================================================ */
const WL_KEY = 'eml_wishlist';

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); }
  catch(e) { return []; }
}
function saveWishlist(list) {
  try { localStorage.setItem(WL_KEY, JSON.stringify(list)); } catch(e) {}
  updateWishlistBadge();
}
function isInWishlist(id) {
  return getWishlist().some(it => it.id === id);
}
function addToWishlist(item) {
  if (!item || !item.id) return;
  const list = getWishlist();
  if (list.some(it => it.id === item.id)) return;
  list.push({ id: item.id, name: item.name || item.id, icon: item.icon || '✨', desc: item.desc || '' });
  saveWishlist(list);
}
function removeFromWishlist(id) {
  saveWishlist(getWishlist().filter(it => it.id !== id));
}
function toggleWishlistItem(item) {
  if (isInWishlist(item.id)) { removeFromWishlist(item.id); return false; }
  addToWishlist(item); return true;
}
function updateWishlistBadge() {
  const n = getWishlist().length;
  document.querySelectorAll('.wishlist-badge').forEach(el => {
    el.textContent = n;
    el.style.display = n > 0 ? '' : 'none';
  });
}

/* Hydrate the homepage wishlist cards from storage */
function hydrateWishlistCards() {
  document.querySelectorAll('.wl-service-card').forEach(card => {
    const id = card.dataset.service;
    if (!id) return;
    const btn = card.querySelector('.wl-like-btn');
    if (!btn) return;
    if (isInWishlist(id)) {
      btn.classList.add('liked');
      btn.textContent = '♥';
    } else {
      btn.classList.remove('liked');
      btn.textContent = '♡';
    }
  });
  const count = getWishlist().length;
  const el = document.getElementById('wl-liked-summary');
  if (el) el.textContent = count > 0 ? `${count} service${count > 1 ? 's' : ''} saved` : '';
}

/* ============================================================
   AUTH (hardcoded / localStorage demo)
   ============================================================ */
const AUTH_USERS_KEY   = 'eml_users';
const AUTH_CURRENT_KEY = 'eml_current_user';

const DEFAULT_USERS = [
  { firstName: 'Demo',  lastName: 'User', email: 'demo@labcentah.com',  password: 'demo1234', role: 'user'  },
  { firstName: 'Admin', lastName: '',     email: 'admin@labcentah.com', password: 'admin123', role: 'admin' },
];

function getUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || 'null');
    if (Array.isArray(stored) && stored.length) return stored;
  } catch(e) {}
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS.slice();
}
function saveUsers(list) {
  try { localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(list)); } catch(e) {}
}
function findUser(email) {
  email = (email || '').trim().toLowerCase();
  return getUsers().find(u => u.email.toLowerCase() === email) || null;
}
function registerUser({ firstName, lastName, email, password }) {
  email = (email || '').trim().toLowerCase();
  if (!email || !password) return { ok: false, error: 'Email and password are required.' };
  if (findUser(email)) return { ok: false, error: 'An account with this email already exists.' };
  const users = getUsers();
  const user = { firstName: firstName || '', lastName: lastName || '', email, password };
  users.push(user);
  saveUsers(users);
  setCurrentUser(user);
  return { ok: true, user };
}
function signInUser(email, password) {
  const user = findUser(email);
  if (!user) return { ok: false, error: 'No account found with this email.' };
  if (user.password !== password) return { ok: false, error: 'Incorrect password.' };
  setCurrentUser(user);
  return { ok: true, user };
}
function setCurrentUser(user) {
  const role = user.role
    || ((user.email || '').toLowerCase() === 'admin@labcentah.com' ? 'admin' : 'user');
  try { localStorage.setItem(AUTH_CURRENT_KEY, JSON.stringify({ email: user.email, firstName: user.firstName, lastName: user.lastName, role })); } catch(e) {}
}
function isAdmin(user) {
  user = user || getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin') return true;
  /* Fallback for sessions saved before role was added */
  return (user.email || '').toLowerCase() === 'admin@labcentah.com';
}
function postSignInRedirect() {
  window.location.href = isAdmin() ? 'admin.html' : 'index.html';
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_CURRENT_KEY) || 'null'); }
  catch(e) { return null; }
}
function signOut() {
  try { localStorage.removeItem(AUTH_CURRENT_KEY); } catch(e) {}
  window.location.href = 'index.html';
}

/* Reflect signed-in state in the navbar across pages */
function updateAuthNav() {
  const user = getCurrentUser();
  document.querySelectorAll('.nav-signin-btn').forEach(btn => {
    if (user) {
      const name = user.firstName || user.email.split('@')[0];
      btn.textContent = `Hi, ${name} · Sign out`;
      btn.setAttribute('href', '#');
      btn.onclick = (e) => { e.preventDefault(); signOut(); };
      btn.title = 'Click to sign out';
    } else {
      btn.textContent = 'Sign In';
      btn.setAttribute('href', 'signin.html');
      btn.onclick = null;
      btn.title = '';
    }
  });
  const mobileSignIn = document.querySelector('.mobile-nav a[href="signin.html"]');
  const mobileSignUp = document.querySelector('.mobile-nav a[href="signup.html"]');
  if (user) {
    if (mobileSignIn) { mobileSignIn.textContent = 'Sign Out'; mobileSignIn.setAttribute('href', '#'); mobileSignIn.onclick = (e) => { e.preventDefault(); signOut(); }; }
    if (mobileSignUp) mobileSignUp.style.display = 'none';
  } else {
    if (mobileSignUp) mobileSignUp.style.display = '';
  }
}

/* ============================================================
   ACCESSIBILITY — shared fallback. Wrapped in an IIFE so the
   inline copies on some pages (which redeclare A11Y_KEY etc.)
   don't collide. The handlers are exposed on window only when
   the page hasn't already defined them.
   ============================================================ */
(function () {
  const A11Y_KEY = 'eml_a11y';
  let a11yFs = 0;

  function a11yAnnounce(msg) {
    const el = document.getElementById('a11y-announce');
    if (el) { el.textContent = ''; setTimeout(() => el.textContent = msg, 50); }
  }
  function toggleA11yPanel() {
    const panel = document.getElementById('a11y-panel');
    const trigger = document.getElementById('a11y-trigger');
    if (!panel) return;
    const open = panel.classList.toggle('open');
    panel.setAttribute('aria-hidden', !open);
    if (trigger) trigger.setAttribute('aria-expanded', open);
    if (open) panel.querySelector('.a11y-close')?.focus();
  }
  function applyContrast(on) {
    document.body.classList.toggle('high-contrast', on);
    a11yAnnounce(on ? 'High contrast mode enabled' : 'High contrast mode disabled');
    saveA11y();
  }
  function applyDyslexia(on) {
    document.body.classList.toggle('dyslexia-font', on);
    a11yAnnounce(on ? 'Dyslexia-friendly font enabled' : 'Standard font restored');
    saveA11y();
  }
  function applyReduceMotion(on) {
    document.body.classList.toggle('reduce-motion', on);
    a11yAnnounce(on ? 'Animations reduced' : 'Animations restored');
    saveA11y();
  }
  function changeSize(dir) {
    a11yFs = Math.max(-2, Math.min(6, a11yFs + dir));
    const pct = 100 + a11yFs * 12.5;
    document.body.style.zoom = pct + '%';
    const label = Math.round(pct) + '%';
    const val = document.getElementById('a11y-size-val');
    if (val) val.textContent = label;
    a11yAnnounce('Text size: ' + label);
    saveA11y();
  }
  function resetA11y() {
    document.body.classList.remove('high-contrast', 'dyslexia-font', 'reduce-motion');
    document.body.style.zoom = '';
    a11yFs = 0;
    ['a11y-contrast','a11y-dyslexia','a11y-motion'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });
    const val = document.getElementById('a11y-size-val');
    if (val) val.textContent = '100%';
    try { localStorage.removeItem(A11Y_KEY); } catch(e) {}
    a11yAnnounce('Accessibility settings reset');
  }
  function saveA11y() {
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify({
        contrast: document.body.classList.contains('high-contrast'),
        dyslexia: document.body.classList.contains('dyslexia-font'),
        motion:   document.body.classList.contains('reduce-motion'),
        fs: a11yFs,
      }));
    } catch(e) {}
  }
  function restoreA11y() {
    try {
      const saved = JSON.parse(localStorage.getItem(A11Y_KEY) || 'null');
      if (saved) {
        if (saved.contrast) { document.body.classList.add('high-contrast');  const el = document.getElementById('a11y-contrast'); if(el) el.checked = true; }
        if (saved.dyslexia) { document.body.classList.add('dyslexia-font');  const el = document.getElementById('a11y-dyslexia'); if(el) el.checked = true; }
        if (saved.motion)   { document.body.classList.add('reduce-motion');  const el = document.getElementById('a11y-motion');   if(el) el.checked = true; }
        if (saved.fs) {
          a11yFs = saved.fs;
          const pct = 100 + a11yFs * 12.5;
          document.body.style.zoom = pct + '%';
          const val = document.getElementById('a11y-size-val');
          if (val) val.textContent = Math.round(pct) + '%';
        }
      }
    } catch(e) {}
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const el = document.getElementById('a11y-motion');
      if (el && !el.checked) { el.checked = true; document.body.classList.add('reduce-motion'); }
    }
  }

  /* Only register fallbacks if the page didn't define its own */
  const handlers = { toggleA11yPanel, applyContrast, applyDyslexia, applyReduceMotion, changeSize, resetA11y };
  for (const [name, fn] of Object.entries(handlers)) {
    if (typeof window[name] !== 'function') window[name] = fn;
  }
  window.__emlRestoreA11y = restoreA11y;
})();

/* ============================================================
   READ ALOUD (Web Speech API — works offline, all browsers)
   Built for blind / low-vision users. Toggle with the button
   in the accessibility helper panel, or press Alt+R anywhere.
   ============================================================ */
(function () {
  if (typeof window.speechSynthesis === 'undefined') {
    window.toggleReadAloud = function () {
      alert('Sorry — read-aloud is not supported in this browser.');
    };
    return;
  }

  let reading = false;
  let currentUtterance = null;

  function gatherText() {
    const main = document.querySelector('main') || document.body;
    /* Skip hidden elements, scripts, styles, and the accessibility panel itself */
    const skip = new Set(['SCRIPT','STYLE','NOSCRIPT']);
    const parts = [];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (skip.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.closest('.a11y-panel, .a11y-trigger, .sr-announce, [aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
        const style = window.getComputedStyle(p);
        if (style.display === 'none' || style.visibility === 'hidden') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = walker.nextNode())) parts.push(n.nodeValue.trim());
    return parts.join('. ').replace(/\s+/g, ' ');
  }

  function announceState(msg) {
    const el = document.getElementById('a11y-announce');
    if (el) { el.textContent = ''; setTimeout(() => el.textContent = msg, 50); }
  }

  function updateButtonLabel() {
    document.querySelectorAll('.a11y-read-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', reading ? 'true' : 'false');
      btn.textContent = reading ? '⏸ Stop reading' : '▶ Read this page aloud';
    });
  }

  function startReadAloud() {
    const text = gatherText();
    if (!text) { announceState('Nothing to read on this page.'); return; }
    window.speechSynthesis.cancel();
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = 1;
    currentUtterance.pitch = 1;
    currentUtterance.lang = document.documentElement.lang || 'en-US';
    currentUtterance.onend = () => { reading = false; updateButtonLabel(); announceState('Finished reading.'); };
    currentUtterance.onerror = () => { reading = false; updateButtonLabel(); };
    window.speechSynthesis.speak(currentUtterance);
    reading = true;
    updateButtonLabel();
    announceState('Reading page aloud. Press the button again to stop.');
  }

  function stopReadAloud() {
    window.speechSynthesis.cancel();
    reading = false;
    updateButtonLabel();
    announceState('Stopped reading.');
  }

  window.toggleReadAloud = function () {
    if (reading) stopReadAloud(); else startReadAloud();
  };

  /* Stop speaking when leaving the page */
  window.addEventListener('beforeunload', () => { window.speechSynthesis.cancel(); });

  /* Keyboard shortcut: Alt + R */
  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      window.toggleReadAloud();
    }
  });

  /* Inject the Read-Aloud option into the accessibility panel */
  function injectReadAloud() {
    const panel = document.getElementById('a11y-panel');
    if (!panel || panel.querySelector('.a11y-read-btn')) return;
    const resetBtn = panel.querySelector('.a11y-reset');
    if (!resetBtn) return;
    const block = document.createElement('div');
    block.className = 'a11y-option a11y-option--full';
    block.innerHTML = `
      <div class="a11y-option__label">
        <span class="a11y-option__icon" aria-hidden="true">🔊</span>
        <div>Read page aloud<div class="a11y-option__sublabel">For low-vision users · shortcut Alt + R</div></div>
      </div>
      <button class="a11y-read-btn" type="button" onclick="toggleReadAloud()" aria-pressed="false">▶ Read this page aloud</button>
    `;
    const divider = document.createElement('hr');
    divider.className = 'a11y-divider';
    resetBtn.parentNode.insertBefore(divider, resetBtn);
    resetBtn.parentNode.insertBefore(block, resetBtn);
  }

  document.addEventListener('DOMContentLoaded', injectReadAloud);
})();

/* Boot — runs on every page that loads main.js */
document.addEventListener('DOMContentLoaded', () => {
  updateWishlistBadge();
  hydrateWishlistCards();
  updateAuthNav();
  updateCartBadge();
  if (typeof window.__emlRestoreA11y === 'function') window.__emlRestoreA11y();
});
