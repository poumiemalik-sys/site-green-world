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

  /* ---- 3. Panier (compteur local + toast) ---------------------------- */
  let cart = parseInt(localStorage.getItem('gw_cart') || '0', 10);
  const counters = document.querySelectorAll('.cart-count');
  const renderCart = () => counters.forEach(c => {
    c.textContent = cart;
    c.style.display = cart > 0 ? 'grid' : 'none';
  });
  renderCart();

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
      cart++;
      localStorage.setItem('gw_cart', cart);
      renderCart();
      showToast(`${btn.dataset.add} ajouté au panier`);
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
