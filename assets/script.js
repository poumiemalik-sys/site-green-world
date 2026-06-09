/* =========================================================================
   GREEN WORLD CAMEROUN — interactions
   Menu mobile · bandeau promo · accordéon FAQ · carrousel · quiz · panier
   ========================================================================= */

/* ---- Numéro WhatsApp (à remplacer par le vrai numéro) ----------------- */
const WHATSAPP = '237680190634'; // format international sans +
const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. Bandeau promo alterné -------------------------------------- */
  const promo = document.querySelector('.promo-msg');
  if (promo) {
    const msgs = [
      'Livraison <b>Yaoundé 24h</b> — Paiement à la livraison',
      'Paiement <b>Mobile Money</b> & Orange Money accepté',
    ];
    let i = 0;
    promo.innerHTML = msgs[0];
    setInterval(() => {
      promo.classList.add('is-out');
      setTimeout(() => {
        i = (i + 1) % msgs.length;
        promo.innerHTML = msgs[i];
        promo.classList.remove('is-out');
      }, 400);
    }, 4000);
  }

  /* ---- 2. Drawer / menu mobile --------------------------------------- */
  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawerOverlay');
  const openMenu  = () => { drawer.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; };
  document.getElementById('hamburger')?.addEventListener('click', openMenu);
  document.getElementById('drawerClose')?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ---- 3. Panier -------------------------------------------------------- */
  let cartItems = [];
  try {
    const saved = localStorage.getItem('gw_cart_v2');
    if (saved) cartItems = JSON.parse(saved);
  } catch(e) { cartItems = []; }

  const saveCart     = () => localStorage.setItem('gw_cart_v2', JSON.stringify(cartItems));
  const cartCount    = () => cartItems.reduce((s, i) => s + i.qty, 0);
  const fmtPrice     = (n) => n.toLocaleString('fr-FR') + ' FCFA';

  const counters = document.querySelectorAll('.cart-count');
  const renderCartCount = () => counters.forEach(c => {
    const n = cartCount();
    c.textContent = n;
    c.style.display = n > 0 ? 'grid' : 'none';
  });
  renderCartCount();

  const cartPanel        = document.getElementById('cartPanel');
  const cartPanelOverlay = document.getElementById('cartPanelOverlay');
  const cartEmptyEl      = document.getElementById('cartEmpty');
  const cartContentEl    = document.getElementById('cartContent');
  const cartItemsList    = document.getElementById('cartItemsList');
  const cartTotalEl      = document.getElementById('cartTotal');

  const renderCartPanel = () => {
    const n = cartCount();
    cartEmptyEl.style.display   = n === 0 ? 'flex' : 'none';
    cartContentEl.style.display = n === 0 ? 'none' : 'flex';
    if (n === 0) return;

    cartItemsList.innerHTML = cartItems.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-subtotal">${fmtPrice(item.price * item.qty)}</span>
        </div>
        <div class="cart-item-row2">
          <button class="cart-qty-btn" data-idx="${idx}" data-dir="-1">−</button>
          <span class="cart-qty">${item.qty}</span>
          <button class="cart-qty-btn" data-idx="${idx}" data-dir="1">+</button>
          <span class="cart-unit-price">${fmtPrice(item.price)} / u.</span>
          <button class="cart-remove" data-idx="${idx}" aria-label="Retirer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    cartTotalEl.textContent = fmtPrice(cartItems.reduce((s, i) => s + i.price * i.qty, 0));

    cartItemsList.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        cartItems[idx].qty += parseInt(btn.dataset.dir);
        if (cartItems[idx].qty <= 0) cartItems.splice(idx, 1);
        saveCart(); renderCartCount(); renderCartPanel();
      });
    });
    cartItemsList.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        cartItems.splice(parseInt(btn.dataset.idx), 1);
        saveCart(); renderCartCount(); renderCartPanel();
      });
    });
  };

  const openCart = () => {
    renderCartPanel();
    cartPanel?.classList.add('open');
    cartPanelOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeCart = () => {
    cartPanel?.classList.remove('open');
    cartPanelOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelector('.icon-btn[aria-label="Panier"]')?.addEventListener('click', openCart);
  cartPanelOverlay?.addEventListener('click', closeCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);

  document.getElementById('cartClear')?.addEventListener('click', () => {
    cartItems = []; saveCart(); renderCartCount(); renderCartPanel();
  });

  document.getElementById('cartWhatsApp')?.addEventListener('click', () => {
    if (!cartItems.length) return;
    const lines = cartItems.map(i => `• ${i.name} ×${i.qty} — ${fmtPrice(i.price * i.qty)}`).join('\n');
    const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    const msg = `Bonjour Green World 🌿, je souhaite commander :\n\n${lines}\n\nTotal : ${fmtPrice(total)}\n\nMerci !`;
    window.open(waLink(msg), '_blank');
  });

  const toast = document.getElementById('toast');
  let toastT;
  const showToast = (txt) => {
    if (!toast) return;
    toast.querySelector('span').textContent = txt;
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name  = btn.dataset.add;
      const price = parseInt(btn.dataset.price || '0', 10);
      const existing = cartItems.find(i => i.name === name);
      if (existing) { existing.qty++; } else { cartItems.push({ name, price, qty: 1 }); }
      saveCart(); renderCartCount();
      showToast(`${name} ajouté au panier`);
    });
  });

  /* Liens WhatsApp produits */
  document.querySelectorAll('[data-wa]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.open(waLink(`Bonjour Green World 🌿, je souhaite commander : ${btn.dataset.wa}. Est-il disponible ?`), '_blank');
    });
  });

  /* ---- 4. Accordéon FAQ ---------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(it => {
        it.classList.remove('open');
        it.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- 5. Carrousel témoignages -------------------------------------- */
  const track = document.getElementById('testiTrack');
  if (track) {
    const cards = [...track.children];
    const dotsWrap = document.getElementById('testiDots');
    let index = 0;

    const perView = () => {
      const w = window.innerWidth;
      if (w >= 1000) return 3;
      if (w >= 680)  return 2;
      return 1;
    };
    const maxIndex = () => Math.max(0, cards.length - perView());

    const buildDots = () => {
      dotsWrap.innerHTML = '';
      for (let p = 0; p <= maxIndex(); p++) {
        const s = document.createElement('span');
        if (p === index) s.classList.add('active');
        s.addEventListener('click', () => { index = p; update(); });
        dotsWrap.appendChild(s);
      }
    };
    const update = () => {
      index = Math.min(index, maxIndex());
      const card = cards[0];
      const gap = parseFloat(getComputedStyle(track).gap) || 16;
      const shift = (card.offsetWidth + gap) * index;
      track.style.transform = `translateX(-${shift}px)`;
      [...dotsWrap.children].forEach((d, di) => d.classList.toggle('active', di === index));
    };

    document.getElementById('testiPrev')?.addEventListener('click', () => { index = Math.max(0, index - 1); update(); });
    document.getElementById('testiNext')?.addEventListener('click', () => { index = Math.min(maxIndex(), index + 1); update(); });

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { buildDots(); update(); }, 150); });
    buildDots(); update();
  }

  /* ---- 6. Quiz / diagnostic ------------------------------------------ */
  const quizOptions = document.getElementById('quizOptions');
  const quizResult  = document.getElementById('quizResult');
  if (quizOptions && quizResult) {
    const recos = {
      energie:   ['Cordyceps', 'Multivitamines', 'Vigpower'],
      immunite:  ['Zinc', 'Deep Sea Fish Oil', 'Multivitamines'],
      articul:   ['Arthropower', 'Deep Sea Fish Oil'],
      focus:     ['Ginkgo Biloba', 'Cordyceps'],
    };
    const pills = document.getElementById('resPills');
    quizOptions.querySelectorAll('.quiz-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const list = recos[opt.dataset.need] || [];
        pills.innerHTML = list.map(p => `<span class="res-pill">${p}</span>`).join('');
        quizOptions.classList.add('hide');
        quizResult.classList.add('show');
      });
    });
    document.getElementById('quizBack')?.addEventListener('click', () => {
      quizOptions.classList.remove('hide');
      quizResult.classList.remove('show');
    });
  }

  /* ---- 7. Liens WhatsApp génériques + numéro ------------------------- */
  document.querySelectorAll('[data-wa-generic]').forEach(a => {
    a.href = waLink('Bonjour Green World 🌿, j\'ai une question sur vos produits.');
  });
  document.querySelectorAll('[data-wa-phone]').forEach(el => {
    el.textContent = '+' + WHATSAPP.replace(/^(\d{3})(\d{1})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  });
});
