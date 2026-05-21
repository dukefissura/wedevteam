// Scroll to top on page load/refresh
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ------ Reading progress bar ------
(function () {
  const bar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = docHeight > 0 ? (scrollTop / docHeight * 100).toFixed(2) + '%' : '0%';
  }, { passive: true });
})();

// ------ Back to top button ------
(function () {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ------ Typewriter ------
(function () {
  const el = document.getElementById('tw-text');
  const words = ['transforma.', 'conecta.', 'escala.', 'converte.', 'impressiona.'];
  let wi = 0, ci = 0, deleting = false;
  const PAUSE_END = 2200, PAUSE_START = 420, TYPE_SPEED = 72, DELETE_SPEED = 38;
  function tick() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, PAUSE_END); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, PAUSE_START); return; }
    }
    setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
  }
  setTimeout(tick, 900);
})();

// ------ Lightbox ------
(function () {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbTitle   = document.getElementById('lb-title');
  const lbTag     = document.getElementById('lb-tag');
  const lbCounter = document.getElementById('lb-counter');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');

  // Only collect .gi items that have an <img> (video cards are excluded)
  const allGis = Array.from(document.querySelectorAll('.gi'));
  const imgGis = allGis.filter(gi => gi.querySelector('img'));
  const items = imgGis.map(gi => ({
    src:   gi.querySelector('img').src,
    alt:   gi.querySelector('img').alt,
    title: gi.querySelector('.gi-cap-title')?.textContent || '',
    tag:   gi.querySelector('.gi-cap-tag')?.textContent   || '',
  }));

  let current = 0;

  function open(index) {
    current = index;
    render();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function render() {
    const item = items[current];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbTitle.textContent = item.title;
    lbTag.textContent   = item.tag;
    lbCounter.textContent = `${current + 1} / ${items.length}`;
  }
  function prev() { current = (current - 1 + items.length) % items.length; render(); }
  function next() { current = (current + 1) % items.length; render(); }

  // Attach click only to image-based .gi cards
  imgGis.forEach((gi, i) => {
    gi.addEventListener('click', () => open(i));
  });
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });
})();

(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const COUNT = 220;
  let scrollRaw = 0;
  let scrollSmooth = 0;

  // Capture raw scroll without triggering layout
  window.addEventListener('scroll', () => {
    scrollRaw = window.scrollY;
  }, { passive: true });

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < COUNT; i++) {
      stars.push({
        x:           Math.random() * canvas.width,
        y:           Math.random() * canvas.height,
        r:           Math.random() * 1.1 + 0.25,
        baseOpacity: Math.random() * 0.55 + 0.15,
        phase:       Math.random() * Math.PI * 2,
        speed:       0.0004 + Math.random() * 0.0007,
        // Depth layer: 0.04–0.22. Larger = closer = faster parallax
        parallax:    0.04 + Math.random() * 0.18,
      });
    }
  }

  function draw() {
    if (document.hidden) return; // pause when tab is inactive
    // Smooth-lerp scroll value — eases the parallax motion
    scrollSmooth += (scrollRaw - scrollSmooth) * 0.07;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      s.phase += s.speed * 16;
      const op = Math.max(0.05, s.baseOpacity + Math.sin(s.phase) * 0.22);

      // Parallax offset — different depth per star
      const rawOffset = scrollSmooth * s.parallax;
      // Wrap vertically so stars loop seamlessly as you scroll
      let drawY = ((s.y - rawOffset) % canvas.height + canvas.height) % canvas.height;

      ctx.beginPath();
      ctx.arc(s.x, drawY, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestAnimationFrame(draw);
  });
  resize();
  requestAnimationFrame(draw);
})();

// ------ Scroll reveal via IntersectionObserver ------
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.r').forEach(el => observer.observe(el));

// ------ Navbar scroll opacity ------
const navInner = document.getElementById('navInner');
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      navInner.style.background = window.scrollY > 48
        ? 'rgba(5, 5, 5, 0.90)'
        : 'rgba(8, 8, 8, 0.72)';
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ------ Mobile hamburger + menu ------
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Close menu on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});

// ------ Active nav link on scroll ------
(function () {
  const sections = Array.from(document.querySelectorAll('section[id], div[id]')).filter(el =>
    ['home','features','process','gallery','testimonials','about-sec','contact'].includes(el.id)
  );
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => sectionObserver.observe(s));
})();

// ------ Counter animation para métricas ------
(function () {
  const metrics = document.querySelectorAll('.metric-n');

  function parseTarget(text) {
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    const suffix = text.replace(/[0-9.]/g, '').trim();
    return { num, suffix };
  }

  function animateCounter(el) {
    const raw = el.textContent.trim();
    const { num, suffix } = parseTarget(raw);
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * num;
      const display = Number.isInteger(num) ? Math.round(current) : current.toFixed(1);
      el.textContent = display + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  metrics.forEach(m => counterObserver.observe(m));
})();

// ------ Scroll-driven video — Sobre Nós ------
// Uses JS translateY pinning (avoids CSS sticky browser quirks)
(function () {
  var video = document.getElementById('about-video');
  var track = document.querySelector('.about-scroll-track');
  var wrap  = document.querySelector('.about-sticky-wrap');
  if (!video || !track || !wrap) return;

  if (window.matchMedia('(max-width: 900px)').matches) {
    video.autoplay = true;
    video.loop = true;
    video.play().catch(function () {});
    return;
  }

  video.load();

  // Measure track position (document-relative, recomputed on resize)
  var trackTop = 0;
  var scrollable = 0;
  function measure() {
    var r = track.getBoundingClientRect();
    trackTop   = r.top + window.scrollY;
    scrollable = track.offsetHeight - window.innerHeight;
  }
  measure();
  window.addEventListener('resize', measure, { passive: true });

  var raf = null;
  function update() {
    raf = null;
    if (scrollable <= 0) return;
    var clamped = Math.max(0, Math.min(scrollable, window.scrollY - trackTop));
    // Translate the sticky wrapper to keep it pinned in view
    wrap.style.transform = 'translateY(' + clamped + 'px)';
    // Scrub video
    if (video.duration && isFinite(video.duration)) {
      video.currentTime = (clamped / scrollable) * video.duration;
    }
  }

  function onScroll() {
    if (!raf) raf = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  video.addEventListener('loadedmetadata', update);
  update();
})();

// ------ Contact form validation ------
(function () {
  const form      = document.getElementById('contactForm');
  const nameEl    = document.getElementById('cf-name');
  const emailEl   = document.getElementById('cf-email');
  const msgEl     = document.getElementById('cf-msg');
  const nameErr   = document.getElementById('cf-name-err');
  const emailErr  = document.getElementById('cf-email-err');
  const msgErr    = document.getElementById('cf-msg-err');
  const feedback  = document.getElementById('cfFeedback');
  const submitBtn = document.getElementById('cfSubmitBtn');

  function validate() {
    let ok = true;

    if (!nameEl.value.trim()) {
      nameEl.classList.add('error');
      nameErr.textContent = 'Por favor informe seu nome.';
      ok = false;
    } else {
      nameEl.classList.remove('error');
      nameErr.textContent = '';
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailEl.value.trim() || !emailRx.test(emailEl.value.trim())) {
      emailEl.classList.add('error');
      emailErr.textContent = 'Informe um e-mail válido.';
      ok = false;
    } else {
      emailEl.classList.remove('error');
      emailErr.textContent = '';
    }

    if (msgEl.value.trim().length < 10) {
      msgEl.classList.add('error');
      msgErr.textContent = 'Mensagem muito curta (mínimo 10 caracteres).';
      ok = false;
    } else {
      msgEl.classList.remove('error');
      msgErr.textContent = '';
    }

    return ok;
  }

  [nameEl, emailEl, msgEl].forEach(el => {
    el.addEventListener('blur', validate, { passive: true });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Client-side cooldown — 60 s between submissions
    const COOLDOWN_KEY = 'wd_last_submit';
    const lastSubmit = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    if (Date.now() - lastSubmit < 60_000) {
      feedback.style.color = '#ff453a';
      feedback.textContent = 'Aguarde um momento antes de enviar novamente.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    submitBtn.style.transform = 'scale(0.97)';

    try {
      const data = new FormData(form);
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      });
      const json = await res.json();

      if (json.success) {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        feedback.style.color = 'var(--accent-green)';
        feedback.textContent = 'Mensagem enviada! Retornaremos em até 24h.';
        form.reset();
        setTimeout(() => { feedback.textContent = ''; }, 6000);
      } else {
        feedback.style.color = '#ff453a';
        feedback.textContent = 'Erro ao enviar. Tente novamente.';
      }
    } catch {
      feedback.style.color = '#ff453a';
      feedback.textContent = 'Erro de conexão. Tente novamente.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      submitBtn.style.transform = '';
    }
  });
})();
