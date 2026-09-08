// Scroll to top on page load/refresh
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ------ Reading progress bar, back-to-top & navbar (single rAF-throttled scroll handler) ------
(function () {
  const bar      = document.getElementById('progress-bar');
  const btn      = document.getElementById('back-to-top');
  const navInner = document.getElementById('navInner');
  let ticking    = false;

  function onScroll() {
    const scrollY   = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = docHeight > 0 ? (scrollY / docHeight * 100).toFixed(2) + '%' : '0%';
    btn.classList.toggle('visible', scrollY > 400);
    navInner.style.background = scrollY > 48
      ? 'rgba(5, 5, 5, 0.90)'
      : 'rgba(8, 8, 8, 0.72)';
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ------ Typewriter ------
(function () {
  const el = document.getElementById('tw-text');
  const box = document.querySelector('.tw-box');
  const words = ['transforma.', 'conecta.', 'escala.', 'converte.', 'impressiona.'];
  let wi = 0, ci = 0, deleting = false;
  const PAUSE_END = 2200, PAUSE_START = 420, TYPE_SPEED = 72, DELETE_SPEED = 38;

  // O título é centrado, então a largura da linha decide onde ela começa. Se a
  // caixa acompanhasse a palavra letra a letra, cada letra recentralizaria o
  // que já está escrito. A caixa recebe a largura final da palavra da vez, e só
  // troca de largura quando está vazia, entre uma palavra e outra.
  let larguras = [];

  function aplicarLargura() {
    if (box && larguras[wi]) box.style.minWidth = larguras[wi] + 'px';
  }

  function medirPalavras() {
    if (!box) return;
    const cs = getComputedStyle(el);
    const medidor = document.createElement('span');
    medidor.style.cssText = 'position:absolute;left:-9999px;top:0;white-space:pre;visibility:hidden;';
    medidor.style.fontFamily    = cs.fontFamily;
    medidor.style.fontSize      = cs.fontSize;
    medidor.style.fontWeight    = cs.fontWeight;
    medidor.style.fontStyle     = cs.fontStyle;
    medidor.style.letterSpacing = cs.letterSpacing;
    document.body.appendChild(medidor);

    // O cursor mora dentro da caixa e ocupa largura própria: sem somá-lo, a
    // palavra cheia estoura a reserva por ~7px no fim da digitação.
    const cursor = box.querySelector('.tw-cursor');
    let extra = 0;
    if (cursor) {
      const cc = getComputedStyle(cursor);
      extra = cursor.getBoundingClientRect().width + (parseFloat(cc.marginLeft) || 0) + (parseFloat(cc.marginRight) || 0);
    }

    // O cursor ocupa esses pixels à direita do texto. Repetir a mesma folga à
    // esquerda deixa a palavra pronta centrada de verdade dentro da caixa.
    box.style.paddingLeft = Math.round(extra) + 'px';

    larguras = words.map(w => {
      medidor.textContent = w;
      return Math.ceil(medidor.getBoundingClientRect().width + extra * 2 + 1);
    });
    medidor.remove();
    aplicarLargura();
  }

  medirPalavras();
  // A fonte de display chega depois do primeiro layout: remede quando ela cair.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirPalavras);
  let redimensiona;
  window.addEventListener('resize', () => {
    clearTimeout(redimensiona);
    redimensiona = setTimeout(medirPalavras, 150);
  }, { passive: true });
  function tick() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, PAUSE_END); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      // Caixa vazia: é a única hora em que trocar a largura não move nada.
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; aplicarLargura(); setTimeout(tick, PAUSE_START); return; }
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
  const COUNT_MAX = 220;
  let scrollRaw = 0;
  let scrollSmooth = 0;
  let lastDraw = 0;
  let running = false;
  const FRAME_MS = 1000 / 30; // cap at 30 fps
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sprite de estrela — gradiente radial pré-renderizado uma vez. Sai muito
  // mais barato que um createRadialGradient por estrela a cada frame, e a borda
  // difusa dá o mesmo ar desfocado das ondas do hero.
  const SPRITE_R = 16;
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = SPRITE_R * 2;
  (function () {
    const sctx = sprite.getContext('2d');
    const g = sctx.createRadialGradient(SPRITE_R, SPRITE_R, 0, SPRITE_R, SPRITE_R, SPRITE_R);
    // Núcleo já entra abaixo de 1 e some cedo: é o que dá o ar desfocado, sem
    // ponto duro no centro.
    g.addColorStop(0,    'rgba(255,255,255,0.92)');
    g.addColorStop(0.10, 'rgba(255,255,255,0.72)');
    g.addColorStop(0.30, 'rgba(255,255,255,0.30)');
    g.addColorStop(0.60, 'rgba(255,255,255,0.08)');
    g.addColorStop(1,    'rgba(255,255,255,0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, SPRITE_R * 2, SPRITE_R * 2);
  })();

  window.addEventListener('scroll', () => {
    scrollRaw = window.scrollY;
  }, { passive: true });

  function populate() {
    stars = [];
    // Densidade por área, não contagem fixa: um telefone não precisa das mesmas
    // 220 estrelas de um monitor, e desenhá-las custa o mesmo por estrela.
    const target = Math.round(
      Math.min(COUNT_MAX, Math.max(70, canvas.width * canvas.height / 6200))
    );
    for (let i = 0; i < target; i++) {
      stars.push({
        x:           Math.random() * canvas.width,
        y:           Math.random() * canvas.height,
        r:           Math.random() * 1.1 + 0.25,
        baseOpacity: Math.random() * 0.55 + 0.15,
        phase:       Math.random() * Math.PI * 2,
        speed:       0.0004 + Math.random() * 0.0007,
        parallax:    0.04 + Math.random() * 0.18,
      });
    }
  }

  function resize() {
    const nw = window.innerWidth, nh = window.innerHeight;
    if (nw === canvas.width && nh === canvas.height) return;

    // No mobile a barra de URL entra e sai e dispara resize a cada scroll. Só a
    // altura mudando não justifica sortear tudo de novo — as estrelas saltariam
    // de lugar durante o scroll. Redistribui só quando a largura muda.
    const widthChanged = nw !== canvas.width;
    canvas.width  = nw;
    canvas.height = nh;
    if (widthChanged || !stars.length) populate();
  }

  function draw(ts) {
    running = true;
    if (document.hidden) { running = false; return; }
    requestAnimationFrame(draw);
    if (ts - lastDraw < FRAME_MS) return;
    const dt = Math.min(ts - lastDraw, 100); // clamp to avoid jumps after tab restore
    lastDraw = ts;

    scrollSmooth += (scrollRaw - scrollSmooth) * 0.07;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      s.phase += s.speed * dt; // delta-time based — frame-rate independent
      const op = Math.max(0.05, s.baseOpacity + Math.sin(s.phase) * 0.22);
      const rawOffset = scrollSmooth * s.parallax;
      const drawY = ((s.y - rawOffset) % canvas.height + canvas.height) % canvas.height;
      const size = s.r * 7;   // o sprite é quase todo halo; o núcleo fica ~1/7
      ctx.globalAlpha = op;
      ctx.drawImage(sprite, s.x - size / 2, drawY - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }

  function drawOnce() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const size = s.r * 7;
      ctx.globalAlpha = s.baseOpacity;
      ctx.drawImage(sprite, s.x - size / 2, s.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }

  resize();

  if (reduced) {
    // Sem cintilação nem parallax: um frame e pronto.
    drawOnce();
    window.addEventListener('resize', () => { resize(); drawOnce(); }, { passive: true });
    return;
  }

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    // Sem a trava, cada volta para a aba empilhava mais um loop de rAF em cima
    // dos anteriores — o canvas ia ficando mais caro a cada troca de aba.
    if (!document.hidden && !running) requestAnimationFrame(draw);
  });
  requestAnimationFrame(draw);
})();

// ------ Hero wavy background ------
// Porte em JS nativo do componente React <WavyBackground> (Aceternity UI).
// O simplex noise 3D vai inline porque o site é estático, sem bundler — não dá
// para importar o pacote `simplex-noise` como módulo.
(function () {
  const canvas = document.getElementById('hero-waves');
  const hero   = document.getElementById('home');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;   // sem canvas 2D o gradiente do ::before continua valendo

  // O componente original usa 5 ondas com a mesma largura, amplitude e
  // velocidade — só a cor e o eixo Y do noise mudam. Isso funciona lá porque as
  // 5 cores são de matizes bem distintos; com a paleta roxa do site as faixas
  // colapsavam num borrão só. Aqui cada onda tem largura, amplitude, offset,
  // frequência e velocidade próprios, então elas se separam mesmo em matizes
  // vizinhos. Ordem = ordem de pintura: grave e larga primeiro, aguda e fina
  // por cima.
  // `t` é o eixo temporal do noise e `seed` o eixo que separa uma onda da outra.
  // Ambos vivem no próprio objeto: o perfil mobile usa um subconjunto das ondas,
  // e um array externo indexado por posição faria as ondas trocarem de fase ao
  // cruzar o breakpoint.
  const WAVES = [
    { color: '#140a33', width: 110, amp: 132, offset:  66, freq: 1 / 940, speed: 0.00160, seed: 0.0, t: 0 },
    { color: '#2b1c6b', width:  86, amp: 122, offset:  22, freq: 1 / 810, speed: 0.00210, seed: 0.3, t: 0 },
    { color: '#5324c9', width:  64, amp: 104, offset: -18, freq: 1 / 690, speed: 0.00270, seed: 0.6, t: 0 },
    { color: '#7b3dff', width:  44, amp:  88, offset: -52, freq: 1 / 590, speed: 0.00340, seed: 0.9, t: 0 },
    { color: '#a03ddb', width:  26, amp:  70, offset: -14, freq: 1 / 500, speed: 0.00420, seed: 1.2, t: 0 },
  ];

  // Os números das ondas acima são para 1440px de largura. Num telefone de
  // 390px eles ocupariam proporcionalmente 3,7x mais tela — a banda virava um
  // borrão cobrindo o hero inteiro. Tudo que é medida em px escala junto com a
  // largura, com piso para não sumir.
  const REF_W = 1440;

  // Perfil mobile: menos ondas, menos blur, menos amostras, menos fps. O
  // gargalo é o ctx.filter = blur, que roda sobre a área toda a cada frame.
  const MOBILE_Q = window.matchMedia('(max-width: 768px)');

  const TRAIL_ALPHA  = 0.62;  // repinte translúcido que gera o rastro
  const STROKE_ALPHA = 0.8;

  const noise3D = createNoise3D();
  let w = 0, h = 0, rafId = 0, lastDraw = 0, visible = true;
  let scale = 1, bandY = 0, waves = WAVES, blur = 10, step = 5, pad = 30;
  let frameMs = 1000 / 45;

  function configure() {
    const mobile = MOBILE_Q.matches;

    // No desktop o hero tem a altura do viewport, então ancorar a banda na
    // altura do hero ou na da janela dá no mesmo. No mobile o hero é bem mais
    // alto que a tela (conteúdo empilha), e uma fração da altura do hero jogaria
    // a banda para fora da primeira dobra. Ancorar na janela mantém a banda
    // sempre visível ao abrir a página.
    const bandH = Math.min(h, window.innerHeight);
    const centerY = mobile ? 0.88 : 0.66;
    bandY = h - bandH + bandH * centerY;

    scale = Math.max(mobile ? 0.5 : 0.7, Math.min(1, w / REF_W));
    waves = mobile ? WAVES.slice(1, 4) : WAVES;   // corta a mais escura e a mais clara
    blur  = mobile ? 6 : 10;
    step  = mobile ? 8 : 5;
    pad   = blur * 3;
    frameMs = mobile ? 1000 / 30 : 1000 / 45;
  }

  function resize() {
    const nw = hero.clientWidth, nh = hero.clientHeight;
    // A barra de URL do mobile entra e sai durante o scroll e dispara resize a
    // cada vez. Redimensionar o canvas limpa o rastro e recomeça a animação, o
    // que pisca. Mudança só de altura, e pequena, não vale o repaint.
    if (nw === w && Math.abs(nh - h) < 120) return;

    w = canvas.width  = nw;
    h = canvas.height = nh;
    configure();
    // Estado do contexto é zerado junto com o tamanho do canvas.
    ctx.filter = `blur(${blur}px)`;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function drawWaves() {
    // 'lighter' soma as cores no cruzamento das ondas, então a sobreposição
    // acende em vez de tapar — é o que dá o brilho e a mistura de matiz.
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = STROKE_ALPHA;

    for (const wave of waves) {
      wave.t += wave.speed;
      ctx.beginPath();
      ctx.lineWidth = wave.width * scale;
      ctx.strokeStyle = wave.color;
      const y0 = bandY + wave.offset * scale;
      const amp = wave.amp * scale;
      for (let x = 0; x <= w; x += step) {
        ctx.lineTo(x, y0 + noise3D(x * wave.freq, wave.seed, wave.t) * amp);
      }
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  // O ctx.filter também borra o fillRect do rastro, então as bordas do retângulo
  // desbotam e nunca limpam de todo. Pintar com folga além do canvas resolve.

  function paint(alpha) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#050505';        // igual a --bg
    ctx.fillRect(-pad, -pad, w + pad * 2, h + pad * 2);
    drawWaves();
    ctx.globalAlpha = 1;
  }

  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (ts - lastDraw < frameMs) return;
    lastDraw = ts;
    paint(TRAIL_ALPHA);
  }

  function start() {
    if (rafId) return;
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Um frame estático já basta com movimento reduzido — nada de animação.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    paint(1);
    canvas.classList.add('ready');
    return;
  }

  // Só anima com o hero em tela e a aba em foco.
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && !document.hidden) start(); else stop();
  }, { threshold: 0 }).observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible) start(); else stop();
  });

  paint(1);
  canvas.classList.add('ready');
  start();

  // Simplex noise 3D — algoritmo de Stefan Gustavson, mesma saída do
  // createNoise3D() do pacote `simplex-noise`.
  function createNoise3D() {
    const grad3 = new Float32Array([
      1, 1, 0,  -1, 1, 0,  1, -1, 0,  -1, -1, 0,
      1, 0, 1,  -1, 0, 1,  1, 0, -1,  -1, 0, -1,
      0, 1, 1,  0, -1, 1,  0, 1, -1,  0, -1, -1,
    ]);

    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const n = Math.floor(Math.random() * (i + 1));
      const tmp = p[i]; p[i] = p[n]; p[n] = tmp;
    }
    const perm = new Uint8Array(512), permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      perm[i] = p[i & 255];
      permMod12[i] = perm[i] % 12;
    }

    const F3 = 1 / 3, G3 = 1 / 6;

    return function noise3D(x, y, z) {
      const s = (x + y + z) * F3;
      const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
      const t = (i + j + k) * G3;
      const x0 = x - (i - t), y0 = y - (j - t), z0 = z - (k - t);

      let i1, j1, k1, i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0)      { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else               { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
      } else {
        if (y0 < z0)       { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0)  { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else               { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      }

      const x1 = x0 - i1 + G3,         y1 = y0 - j1 + G3,         z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2 * G3,     y2 = y0 - j2 + 2 * G3,     z2 = z0 - k2 + 2 * G3;
      const x3 = x0 - 1 + 3 * G3,      y3 = y0 - 1 + 3 * G3,      z3 = z0 - 1 + 3 * G3;

      const ii = i & 255, jj = j & 255, kk = k & 255;
      let n = 0;

      let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 > 0) {
        const g = permMod12[ii + perm[jj + perm[kk]]] * 3;
        t0 *= t0;
        n += t0 * t0 * (grad3[g] * x0 + grad3[g + 1] * y0 + grad3[g + 2] * z0);
      }
      let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 > 0) {
        const g = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
        t1 *= t1;
        n += t1 * t1 * (grad3[g] * x1 + grad3[g + 1] * y1 + grad3[g + 2] * z1);
      }
      let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 > 0) {
        const g = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
        t2 *= t2;
        n += t2 * t2 * (grad3[g] * x2 + grad3[g + 1] * y2 + grad3[g + 2] * z2);
      }
      let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 > 0) {
        const g = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
        t3 *= t3;
        n += t3 * t3 * (grad3[g] * x3 + grad3[g + 1] * y3 + grad3[g + 2] * z3);
      }

      return 32 * n;
    };
  }
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

// Close mobile menu when any nav link is clicked
document.querySelectorAll('#mobileMenu a').forEach(a => {
  a.addEventListener('click', closeMobileMenu);
});

// ------ Active nav link on scroll ------
(function () {
  const sections = Array.from(document.querySelectorAll('section[id], div[id]')).filter(el =>
    ['home','features','process','gallery','testimonials','about-sec','contact'].includes(el.id)
  );
  // Serviços e Portfólio viraram <button> (dropdown), então não casam mais por
  // href — eles declaram a seção que representam em data-section.
  const navItems = document.querySelectorAll('.nav-links a, .nav-links .nm-trigger');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(el => el.classList.remove('active'));
        const active = document.querySelector(
          `.nav-links a[href="#${entry.target.id}"], .nav-links .nm-trigger[data-section="${entry.target.id}"]`
        );
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
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
    } catch (err) {
      feedback.style.color = '#ff453a';
      feedback.textContent = err.name === 'AbortError'
        ? 'Tempo esgotado. Verifique sua conexão.'
        : 'Erro de conexão. Tente novamente.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      submitBtn.style.transform = '';
    }
  });
})();

// ------ Nav dropdown — Base UI NavigationMenu portado para JS nativo ------
(function () {
  const portal   = document.getElementById('navMenuPortal');
  const popup    = document.getElementById('navMenuPopup');
  const arrow    = document.getElementById('navMenuArrow');
  const navInner = document.getElementById('navInner');
  if (!portal || !popup || !arrow || !navInner) return;

  const triggers = Array.from(document.querySelectorAll('.nm-trigger'));
  if (!triggers.length) return;

  const panels = new Map();
  document.querySelectorAll('.nm-panel').forEach(p => panels.set(p.dataset.panel, p));

  const SIDE_OFFSET   = 10;   // vão entre nav e popup; o ::before do popup faz a ponte
  const COLLISION_PAD = 20;
  const ARROW_W       = 20;
  const DURATION      = 350;  // precisa bater com --duration no CSS
  const EXIT_DURATION = 150;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse  = window.matchMedia('(hover: none)');

  let current = null;
  let openTimer = null, closeTimer = null, exitTimer = null;

  const indexOf = key => triggers.findIndex(t => t.dataset.panel === key);

  // Painéis são position:absolute com width:max-content, então offsetWidth e
  // offsetHeight devolvem o tamanho natural mesmo recortados pelo viewport.
  function measure(panel) {
    return { w: panel.offsetWidth, h: panel.offsetHeight };
  }

  function place(trigger, w) {
    const t   = trigger.getBoundingClientRect();
    const top = navInner.getBoundingClientRect().bottom + SIDE_OFFSET;
    const maxLeft = Math.max(COLLISION_PAD, window.innerWidth - w - COLLISION_PAD);
    const left    = Math.max(COLLISION_PAD, Math.min(t.left + t.width / 2 - w / 2, maxLeft));

    portal.style.transform = 'translate(' + Math.round(left) + 'px, ' + Math.round(top) + 'px)';

    const rawArrow = t.left + t.width / 2 - left - ARROW_W / 2;
    arrow.style.left = Math.round(Math.max(14, Math.min(rawArrow, w - ARROW_W - 14))) + 'px';

    // A escala nasce sob a seta, para o popup parecer sair do trigger.
    popup.style.setProperty('--transform-origin', 'top ' + Math.round(rawArrow + ARROW_W / 2) + 'px');
  }

  function activate(key, trigger) {
    const panel = panels.get(key);
    if (!panel || current === key) return;

    clearTimeout(exitTimer);
    const prevKey = current;

    // Precisa sair do hidden ANTES de medir: em display:none o offsetWidth do
    // painel é 0, e o popup nasceria com tamanho zero.
    if (prevKey === null) {
      portal.setAttribute('data-instant', '');
      portal.setAttribute('data-starting-style', '');  // invisível enquanto mede
      portal.hidden = false;
    }

    const size = measure(panel);

    if (prevKey === null) {
      popup.style.width  = size.w + 'px';
      popup.style.height = size.h + 'px';
      place(trigger, size.w);
      panel.setAttribute('data-active', '');
      void popup.offsetWidth;
      portal.removeAttribute('data-starting-style');
      requestAnimationFrame(() => portal.removeAttribute('data-instant'));
    } else {
      // Morphing: o popup redimensiona e desliza enquanto os painéis se cruzam.
      const prev = panels.get(prevKey);
      const dir  = indexOf(key) > indexOf(prevKey) ? 'right' : 'left';

      popup.style.width  = size.w + 'px';
      popup.style.height = size.h + 'px';
      place(trigger, size.w);

      prev.setAttribute('data-activation-direction', dir);
      prev.setAttribute('data-ending-style', '');
      prev.removeAttribute('data-active');

      panel.setAttribute('data-activation-direction', dir);
      panel.setAttribute('data-starting-style', '');
      void panel.offsetWidth;
      panel.setAttribute('data-active', '');
      panel.removeAttribute('data-starting-style');

      setTimeout(() => {
        prev.removeAttribute('data-ending-style');
        prev.removeAttribute('data-activation-direction');
      }, reduced ? 0 : DURATION);
    }

    current = key;
    triggers.forEach(t => t.setAttribute('aria-expanded', String(t.dataset.panel === key)));
  }

  function close() {
    if (current === null) return;
    const panel = panels.get(current);
    current = null;

    portal.setAttribute('data-ending-style', '');
    triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));

    exitTimer = setTimeout(() => {
      if (current !== null) return;   // reabriu no meio da saída
      portal.hidden = true;
      portal.removeAttribute('data-ending-style');
      panel.removeAttribute('data-active');
      popup.style.width  = '';
      popup.style.height = '';
    }, reduced ? 0 : EXIT_DURATION);
  }

  const cancelClose = () => clearTimeout(closeTimer);
  const scheduleClose = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 140);
  };

  triggers.forEach(trigger => {
    const key = trigger.dataset.panel;

    trigger.addEventListener('pointerenter', () => {
      if (coarse.matches) return;      // touch abre no clique, não no hover
      cancelClose();
      clearTimeout(openTimer);
      // Já aberto: troca na hora. Fechado: espera curta contra hover de passagem.
      openTimer = setTimeout(() => activate(key, trigger), current === null ? 110 : 0);
    });

    trigger.addEventListener('pointerleave', () => {
      clearTimeout(openTimer);
      if (!coarse.matches) scheduleClose();
    });

    trigger.addEventListener('click', () => {
      clearTimeout(openTimer);
      if (current === key) close();
      else activate(key, trigger);
    });

    trigger.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activate(key, trigger);
        const first = panels.get(key).querySelector('.nm-card');
        if (first) requestAnimationFrame(() => first.focus());
      }
    });
  });

  popup.addEventListener('pointerenter', cancelClose);
  popup.addEventListener('pointerleave', () => { if (!coarse.matches) scheduleClose(); });

  // Clicar num card fecha o menu e deixa a âncora rolar
  popup.addEventListener('click', e => {
    if (e.target.closest('.nm-card')) close();
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || current === null) return;
    const active = triggers.find(t => t.dataset.panel === current);
    close();
    if (active) active.focus();
  });

  document.addEventListener('pointerdown', e => {
    if (current === null) return;
    if (portal.contains(e.target) || e.target.closest('.nm-trigger')) return;
    close();
  });

  // Tab para fora do conjunto trigger + popup fecha
  document.addEventListener('focusin', e => {
    if (current === null) return;
    if (portal.contains(e.target) || e.target.closest('.nm-trigger')) return;
    close();
  });

  // Medidas e posições ficam obsoletas ao redimensionar
  window.addEventListener('resize', close);
})();

// ------ Acordeão do menu mobile ------
(function () {
  const triggers = document.querySelectorAll('.mob-acc-trigger');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      // Um aberto por vez, senão o overlay estoura a altura da tela.
      triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });
})();
