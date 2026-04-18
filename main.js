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

/* ── Cart persistence (sessionStorage) ──────────────────── */
(function initCart() {
  try {
    const count = sessionStorage.getItem('cartCount') || '0';
    document.querySelectorAll('.cart-badge').forEach(b => b.textContent = count);
  } catch(e) {}
})();

function updateCartStorage(n) {
  try { sessionStorage.setItem('cartCount', n); } catch(e) {}
  document.querySelectorAll('.cart-badge').forEach(b => b.textContent = n);
}
