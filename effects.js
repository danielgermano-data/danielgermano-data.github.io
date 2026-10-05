/* Original local effects: organic portrait reveal, project wall and light. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const paused = () => document.body.classList.contains('effects-paused');
  const staticMotion = () => reduced.matches || paused();
  const motionNodes = [...document.querySelectorAll('.work-visual,.contact-section')];
  const inView = new Map();
  const refreshMotion = () => motionNodes.forEach(node => {
    node.classList.toggle('is-in-view', Boolean(inView.get(node)) && !document.hidden && !staticMotion());
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
      const stopped = motionToggle.closest('.work-visual').classList.toggle('is-paused');
      motionToggle.setAttribute('aria-pressed', String(stopped));
      motionToggle.textContent = stopped ? 'Retomar animação' : 'Pausar animação';
    });
  }
  document.addEventListener('visibilitychange', refreshMotion);
  document.addEventListener('visual:motion', refreshMotion);
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

  const artwork = [
    { name: 'BankGuard', src: 'assets/project-bankguard.svg' },
    { name: 'DataTrace AI', src: 'assets/project-datatrace.svg' }
  ].map(art => ({ ...art, image: new Image(), texture: document.createElement('canvas') }));
  artwork.forEach(art => { art.image.src = art.src; });
  const alpha = document.createElement('canvas');
  const alphaCtx = alpha.getContext('2d');
  // A small interpolated mask gives fluid edges without a full-size pixel loop.
  const fluid = document.createElement('canvas');
  const fluidCtx = fluid.getContext('2d');
  if (!alphaCtx || !fluidCtx || artwork.some(art => !art.texture.getContext('2d'))) return;

  const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  let width = 0, height = 0, scale = 1, maskPixels;
  let ready = false, visible = false, pinned = false, hovered = false, scrollLocked = false;
  let frame = 0, lastFrame = 0, fade = 0, idleTimer = 0, idleStarted = 0;
  let selected = 0, previous = 0, switchedAt = 0, nextCycleAt = 0;
  let point = { x: 0, y: 0 }, trail = [], gesture = null, suppressClickUntil = 0;

  function updateLabels() {
    const action = pinned ? 'Fechar exploração' : 'Explorar o retrato';
    [trigger, toggle].forEach(button => {
      button.setAttribute('aria-pressed', String(pinned));
      button.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight Escape');
    });
    trigger.setAttribute('aria-label', (pinned ? 'Fechar' : 'Ativar') + ' exploração no retrato. Arte: ' + artwork[selected].name + '. Use as setas para trocar.');
    toggle.setAttribute('aria-label', action + '. Arte: ' + artwork[selected].name + '. Use as setas para trocar.');
    toggle.querySelector('.switch-label').textContent = action;
    surface.dataset.artwork = artwork[selected].name;
  }

  function selectArtwork(direction, now = performance.now()) {
    previous = selected;
    selected = (selected + direction + artwork.length) % artwork.length;
    switchedAt = now;
    nextCycleAt = now + 2400;
    updateLabels();
    wake();
  }

  function buildTextures() {
    artwork.forEach(art => {
      art.texture.width = Math.round(width * scale);
      art.texture.height = Math.round(height * scale);
      const context = art.texture.getContext('2d');
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.fillStyle = '#241128';
      context.fillRect(0, 0, width, height);
      const factor = Math.max(width / art.image.naturalWidth, height / art.image.naturalHeight);
      const artWidth = art.image.naturalWidth * factor, artHeight = art.image.naturalHeight * factor;
      context.drawImage(art.image, (width - artWidth) / 2, (height - artHeight) / 2, artWidth, artHeight);
    });
  }

  function resize() {
    if (!ready) return;
    width = surface.clientWidth; height = surface.clientHeight;
    if (!width || !height) return;
    scale = Math.min(devicePixelRatio || 1, 1.5);
    [canvas, alpha].forEach(layer => {
      layer.width = Math.round(width * scale);
      layer.height = Math.round(height * scale);
    });
    fluid.width = Math.min(128, Math.max(64, Math.round(width / 4)));
    fluid.height = Math.max(1, Math.round(fluid.width * height / width));
    maskPixels = fluidCtx.createImageData(fluid.width, fluid.height);
    for (let i = 0; i < maskPixels.data.length; i += 4) {
      maskPixels.data[i] = maskPixels.data[i + 1] = maskPixels.data[i + 2] = 255;
    }
    point = { x: width * .54, y: height * .43 };
    trail = [];
    alphaCtx.setTransform(scale, 0, 0, scale, 0, 0);
    alphaCtx.clearRect(0, 0, width, height);
    alphaCtx.drawImage(portrait, 0, 0, width, height);
    buildTextures();
    wake();
    scheduleIdle();
  }

  function exploring() { return pinned || hovered; }
  function mayPaint() { return ready && visible && !document.hidden && !scrollLocked; }
  function stopIdle() {
    clearTimeout(idleTimer); idleTimer = 0; idleStarted = 0;
  }
  function scheduleIdle() {
    if (idleTimer || !mayPaint() || staticMotion() || exploring() || idleStarted) return;
    idleTimer = setTimeout(() => {
      idleTimer = 0;
      if (!mayPaint() || staticMotion() || exploring()) return;
      idleStarted = performance.now();
      point = { x: width * .52, y: height * .4 };
      trail = [];
      wake();
    }, 8000);
  }

  function buildMask(now, still) {
    const ratio = fluid.width / width;
    const radius = Math.min(width, height) * .22;
    const phase = still ? 0 : now * .0014;
    const blobs = [{ x: point.x, y: point.y, radius, strength: 1 }];
    for (let i = 0; i < 3; i++) {
      const angle = phase + i * Math.PI * 2 / 3;
      blobs.push({
        x: point.x + Math.cos(angle) * radius * .6,
        y: point.y + Math.sin(angle * 1.13) * radius * .48,
        radius: radius * (.48 + .06 * Math.sin(phase * 1.5 + i)), strength: .85
      });
    }
    trail = still ? [] : trail.filter(p => now - p.born < 480);
    trail.forEach(p => blobs.push({ x: p.x, y: p.y, radius: radius * .5, strength: (1 - (now - p.born) / 480) * .3 }));
    const fields = blobs.map(blob => ({
      x: blob.x * ratio, y: blob.y * ratio,
      radius2: (blob.radius * ratio) ** 2, strength: blob.strength
    }));
    for (let y = 0, pixel = 3; y < fluid.height; y++) {
      for (let x = 0; x < fluid.width; x++, pixel += 4) {
        let field = 0;
        for (const blob of fields) {
          const dx = x - blob.x, dy = y - blob.y;
          field += blob.strength * blob.radius2 / (dx * dx + dy * dy + blob.radius2 * .25);
        }
        maskPixels.data[pixel] = Math.round(smooth((field - .9) / .75) * 255);
      }
    }
    fluidCtx.putImageData(maskPixels, 0, 0);
  }

  function drawWarp(texture, now, still) {
    if (still) { ctx.drawImage(texture, 0, 0, width, height); return; }
    const columns = 18, rows = Math.max(1, Math.ceil(height / (width / columns)));
    const cellWidth = width / columns, cellHeight = height / rows;
    const influence = Math.min(width, height) * .46;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const x = column * cellWidth, y = row * cellHeight;
        const dx = x + cellWidth / 2 - point.x, dy = y + cellHeight / 2 - point.y;
        const distance = Math.hypot(dx, dy);
        const falloff = Math.max(0, 1 - distance / influence);
        const wave = Math.sin(distance * .047 - now * .004) * Math.min(width, height) * .012 * falloff * falloff;
        const amount = distance > 1 ? wave / distance : 0;
        const sourceX = clamp(x - dx * amount, 0, width - cellWidth);
        const sourceY = clamp(y - dy * amount, 0, height - cellHeight);
        ctx.drawImage(texture, sourceX * scale, sourceY * scale, cellWidth * scale, cellHeight * scale,
          x, y, cellWidth + .3, cellHeight + .3);
      }
    }
  }

  function paint(now, still) {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (fade <= .015 || !width || !height || !maskPixels) {
      canvas.classList.remove('is-visible'); surface.classList.remove('is-exploring'); return;
    }
    canvas.classList.add('is-visible'); surface.classList.add('is-exploring');
    ctx.imageSmoothingEnabled = true;
    const blend = still || selected === previous ? 1 : smooth((now - switchedAt) / 550);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    if (blend < 1) {
      drawWarp(artwork[previous].texture, now, still);
      ctx.globalAlpha = blend;
    }
    drawWarp(artwork[selected].texture, now, still);
    ctx.globalAlpha = fade;
    ctx.globalCompositeOperation = 'destination-in';
    buildMask(now, still);
    ctx.drawImage(fluid, 0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.drawImage(alpha, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }

  function tick(now) {
    frame = 0;
    if (!mayPaint()) { clear(); return; }
    const still = staticMotion();
    if (now - lastFrame < 32 && !still) { frame = requestAnimationFrame(tick); return; }
    lastFrame = now;
    if (exploring()) {
      stopIdle();
      if (!nextCycleAt) nextCycleAt = now + 2400;
      if (!still && now >= nextCycleAt) selectArtwork(1, now);
    } else nextCycleAt = 0;
    const idleProgress = idleStarted ? (now - idleStarted) / 1100 : 0;
    if (idleProgress >= 1 || still) idleStarted = 0;
    const desired = exploring() ? 1 : idleStarted ? Math.sin(idleProgress * Math.PI) * .26 : 0;
    fade = still ? desired : fade + (desired - fade) * .25;
    paint(now, still);
    if (!still && (exploring() || idleStarted || fade > .015)) {
      if (!frame) frame = requestAnimationFrame(tick);
    } else scheduleIdle();
  }
  function wake() { if (!frame && mayPaint()) frame = requestAnimationFrame(tick); }
  function clear() {
    cancelAnimationFrame(frame); frame = 0; fade = 0; trail = []; nextCycleAt = 0;
    stopIdle();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.remove('is-visible'); surface.classList.remove('is-exploring');
    surface.style.removeProperty('--portrait-x'); surface.style.removeProperty('--portrait-y');
  }
  function setPinned(value) {
    pinned = value && !scrollLocked;
    if (!pinned) hovered = false;
    stopIdle();
    if (pinned) point = { x: width * .54, y: height * .43 };
    updateLabels(); wake(); scheduleIdle();
  }
  function move(event) {
    const box = surface.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const next = {
      x: clamp((event.clientX - box.left) / box.width * width, 0, width),
      y: clamp((event.clientY - box.top) / box.height * height, 0, height)
    };
    if (!staticMotion() && Math.hypot(next.x - point.x, next.y - point.y) > 3) {
      trail.push({ ...point, born: performance.now() });
      if (trail.length > 4) trail.shift();
    }
    point = next;
    if (!staticMotion()) {
      surface.style.setProperty('--portrait-x', ((point.x / width - .5) * 5) + 'px');
      surface.style.setProperty('--portrait-y', ((point.y / height - .5) * 3) + 'px');
    }
    wake();
  }

  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch' && !staticMotion()) { hovered = true; stopIdle(); move(event); }
  });
  trigger.addEventListener('pointermove', event => { if (event.pointerType !== 'touch' || pinned) move(event); });
  trigger.addEventListener('pointerleave', () => {
    hovered = false;
    surface.style.removeProperty('--portrait-x'); surface.style.removeProperty('--portrait-y');
    wake(); scheduleIdle();
  });
  trigger.addEventListener('pointerdown', event => {
    gesture = pinned && event.pointerType === 'touch' ? { x: event.clientX, y: event.clientY, id: event.pointerId } : null;
  });
  trigger.addEventListener('pointerup', event => {
    if (gesture?.id === event.pointerId) {
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        selectArtwork(dx < 0 ? 1 : -1);
        suppressClickUntil = performance.now() + 350;
      }
    }
    gesture = null;
  });
  trigger.addEventListener('pointercancel', () => { gesture = null; hovered = false; wake(); });
  [trigger, toggle].forEach(button => {
    button.addEventListener('click', () => {
      if (performance.now() < suppressClickUntil) return;
      setPinned(!pinned);
    });
    button.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (!pinned) setPinned(true);
        selectArtwork(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && pinned) { event.preventDefault(); setPinned(false); clear(); scheduleIdle(); }
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { wake(); scheduleIdle(); }
    else { hovered = false; clear(); }
  }).observe(surface);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clear(); else { wake(); scheduleIdle(); }
  });
  const onMotion = () => {
    hovered = false; clear(); wake(); scheduleIdle();
  };
  reduced.addEventListener('change', onMotion);
  document.addEventListener('visual:motion', onMotion);
  document.addEventListener('portrait:scroll', event => {
    scrollLocked = event.detail.active;
    if (scrollLocked) { hovered = false; setPinned(false); clear(); }
    else { wake(); scheduleIdle(); }
  });

  const loaded = image => {
    if (image.complete) return image.naturalWidth ? Promise.resolve() : Promise.reject(new Error('Imagem indisponível.'));
    return new Promise((resolve, reject) => {
      const cleanup = () => { image.removeEventListener('load', onLoad); image.removeEventListener('error', onError); };
      const onLoad = () => { cleanup(); resolve(); };
      const onError = () => { cleanup(); reject(new Error('Imagem indisponível.')); };
      image.addEventListener('load', onLoad, { once: true });
      image.addEventListener('error', onError, { once: true });
    });
  };
  Promise.all([loaded(portrait), ...artwork.map(art => loaded(art.image))]).then(() => {
    ready = true; resize(); trigger.hidden = false; toggle.hidden = false;
    updateLabels(); surface.dataset.effects = 'ready';
    new ResizeObserver(resize).observe(surface);
  }).catch(() => { ready = false; trigger.hidden = true; toggle.hidden = true; clear(); });
})();

