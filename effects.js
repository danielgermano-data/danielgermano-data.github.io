/* Local, original effects. No libraries, tracking, or external requests. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionNodes = [...document.querySelectorAll('.work-visual,.contact-section')];
  const inView = new Map();
  const refreshMotion = () => motionNodes.forEach(node => {
    node.classList.toggle('is-in-view', Boolean(inView.get(node)) && !document.hidden && !reduced.matches);
  });
  const visibility = new IntersectionObserver(entries => {
    entries.forEach(entry => inView.set(entry.target, entry.isIntersecting));
    refreshMotion();
  }, { threshold: 0.05 });
  motionNodes.forEach(node => visibility.observe(node));
  const motionToggle = document.querySelector('.motion-toggle');
  if (motionToggle) {
    motionToggle.hidden = reduced.matches;
    motionToggle.addEventListener('click', () => {
      const paused = motionToggle.closest('.work-visual').classList.toggle('is-paused');
      motionToggle.setAttribute('aria-pressed', String(paused));
      motionToggle.textContent = paused ? 'Retomar animação' : 'Pausar animação';
    });
  }
  document.addEventListener('visibilitychange', refreshMotion);
  reduced.addEventListener('change', () => {
    if (motionToggle) motionToggle.hidden = reduced.matches;
    refreshMotion();
  });

  const surface = document.querySelector('.hero-portrait');
  const portrait = surface?.querySelector('img');
  const canvas = surface?.querySelector('canvas');
  const trigger = surface?.querySelector('.portrait-trigger');
  const toggle = document.querySelector('.portrait-switch');
  const ctx = canvas?.getContext('2d');
  if (!surface || !portrait || !ctx || !trigger || !toggle) return;
  const texture = document.createElement('canvas');
  const textureCtx = texture.getContext('2d');
  const fluid = document.createElement('canvas');
  const fluidCtx = fluid.getContext('2d');
  const alpha = document.createElement('canvas');
  const alphaCtx = alpha.getContext('2d');
  if (!textureCtx || !fluidCtx || !alphaCtx) return;

  const posters = ['assets/project-bankguard.svg', 'assets/project-datatrace.svg'].map(src => {
    const image = new Image(); image.src = src; return image;
  });
  let width = 0, height = 0, scale = 1, ready = false, visible = false;
  let pinned = false, hovered = false, scrollLocked = false, frame = 0, lastFrame = 0, fade = 0;
  let point = { x: 0, y: 0 }, trail = [];

  function buildTexture() {
    textureCtx.setTransform(scale, 0, 0, scale, 0, 0);
    textureCtx.fillStyle = '#241128'; textureCtx.fillRect(0, 0, width, height);
    const cellWidth = width * .56, cellHeight = cellWidth * 1.25;
    for (let row = -1; row < 3; row++) {
      for (let column = 0; column < 2; column++) {
        const asset = posters[(row + column + 4) % posters.length];
        const x = column * cellWidth - width * .08;
        const y = row * cellHeight + (column ? cellHeight * .25 : 0);
        textureCtx.drawImage(asset, x + 5, y + 5, cellWidth - 10, cellHeight - 10);
      }
    }
  }

  function resize() {
    if (!ready) return;
    width = surface.clientWidth; height = surface.clientHeight;
    if (!width || !height) return;
    scale = Math.min(devicePixelRatio || 1, 1.5);
    [canvas, texture, fluid, alpha].forEach(layer => {
      layer.width = Math.round(width * scale); layer.height = Math.round(height * scale);
    });
    point = { x: width * .54, y: height * .43 };
    trail = [];
    alphaCtx.setTransform(scale, 0, 0, scale, 0, 0);
    alphaCtx.clearRect(0, 0, width, height);
    alphaCtx.drawImage(portrait, 0, 0, width, height);
    buildTexture();
    if (pinned || hovered) wake();
  }

  function active() { return ready && visible && !document.hidden && !scrollLocked && (pinned || hovered); }
  function paint(now) {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (fade <= .015 || !width || !height) {
      canvas.classList.remove('is-visible'); surface.classList.remove('is-exploring'); return;
    }
    canvas.classList.add('is-visible'); surface.classList.add('is-exploring');
    const strip = width / 18;
    ctx.globalAlpha = fade;
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 18; i++) {
      const shift = reduced.matches ? 0 : Math.sin(now * .0018 + i * .5) * width * .008;
      ctx.drawImage(texture, i * strip * scale, 0, strip * scale, height * scale, i * strip, shift, strip + 1, height);
    }
    ctx.globalAlpha = 1;
    fluidCtx.setTransform(scale, 0, 0, scale, 0, 0);
    fluidCtx.clearRect(0, 0, width, height);
    const points = reduced.matches ? [point] : [...trail, point];
    points.forEach((p, i) => {
      const progress = (i + 1) / points.length;
      const radius = Math.min(width, height) * (.14 + progress * .08);
      const strength = .15 + progress * .75;
      const glow = fluidCtx.createRadialGradient(p.x, p.y, radius * .3, p.x, p.y, radius);
      glow.addColorStop(0, `rgba(255,255,255,${strength})`);
      glow.addColorStop(.65, `rgba(255,255,255,${strength * .65})`);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      fluidCtx.fillStyle = glow; fluidCtx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
    });
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(fluid, 0, 0, width, height);
    ctx.drawImage(alpha, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }

  function tick(now) {
    frame = 0;
    if (!ready || !visible || document.hidden) { clear(); return; }
    if (now - lastFrame < 32 && !reduced.matches) { frame = requestAnimationFrame(tick); return; }
    lastFrame = now;
    const desired = active() ? 1 : 0;
    fade = reduced.matches ? desired : fade + (desired - fade) * .22;
    if (!reduced.matches) {
      trail.push({ ...point }); if (trail.length > 9) trail.shift();
    }
    paint(now);
    if (!reduced.matches && (desired || fade > .015)) frame = requestAnimationFrame(tick);
  }
  function wake() { if (!frame && ready && visible && !document.hidden) frame = requestAnimationFrame(tick); }
  function clear() {
    cancelAnimationFrame(frame); frame = 0; fade = 0; trail = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.remove('is-visible'); surface.classList.remove('is-exploring');
    surface.style.removeProperty('--portrait-x'); surface.style.removeProperty('--portrait-y');
  }
  function setPinned(value) {
    pinned = value && !scrollLocked;
    if (!pinned) hovered = false;
    [trigger, toggle].forEach(button => button.setAttribute('aria-pressed', String(pinned)));
    toggle.querySelector('.switch-label').textContent = pinned ? 'Fechar exploração' : 'Explorar o retrato';
    trigger.setAttribute('aria-label', pinned ? 'Fechar exploração no retrato' : 'Ativar exploração no retrato');
    if (pinned) point = { x: width * .54, y: height * .43 };
    wake();
  }
  function move(event) {
    const box = surface.getBoundingClientRect();
    point = { x: Math.max(0, Math.min(width, (event.clientX - box.left) / box.width * width)), y: Math.max(0, Math.min(height, (event.clientY - box.top) / box.height * height)) };
    if (!reduced.matches) {
      surface.style.setProperty('--portrait-x', `${(point.x / width - .5) * 5}px`);
      surface.style.setProperty('--portrait-y', `${(point.y / height - .5) * 3}px`);
    }
    wake();
  }
  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch' && !reduced.matches) { hovered = true; move(event); }
  });
  trigger.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch' || pinned) move(event);
  });
  trigger.addEventListener('pointerleave', () => {
    hovered = false;
    surface.style.removeProperty('--portrait-x'); surface.style.removeProperty('--portrait-y');
    wake();
  });
  trigger.addEventListener('pointercancel', () => { hovered = false; wake(); });
  [trigger, toggle].forEach(button => {
    button.addEventListener('click', () => setPinned(!pinned));
    button.addEventListener('keydown', event => {
      if (event.key === 'Escape') { hovered = false; setPinned(false); clear(); }
    });
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) wake(); else { hovered = false; clear(); }
  }).observe(surface);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); else wake(); });
  reduced.addEventListener('change', () => { hovered = false; clear(); wake(); });
  document.addEventListener('portrait:scroll', event => {
    scrollLocked = event.detail.active;
    if (event.detail.active) { hovered = false; setPinned(false); clear(); }
  });
  const loaded = image => image.complete && image.naturalWidth ? Promise.resolve() : new Promise((resolve, reject) => {
    image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', reject, { once: true });
  });
  Promise.all([loaded(portrait), ...posters.map(loaded)]).then(() => {
    ready = true; resize(); trigger.hidden = false; toggle.hidden = false;
    surface.dataset.effects = 'ready';
    new ResizeObserver(resize).observe(surface);
  }).catch(() => { trigger.hidden = true; toggle.hidden = true; clear(); });
})();
