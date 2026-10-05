/* Optional editorial motion. No hidden-content fallback and no cursor replacement. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktopPointer = matchMedia('(min-width:900px) and (hover:hover) and (pointer:fine)');
  let manualPause = false;
  let effectivePause = false;
  let previousPause = null;

  const contact = document.querySelector('.contact-main') || document.querySelector('.contact-inner');
  const pauseButton = contact ? document.createElement('button') : null;
  if (pauseButton) {
    pauseButton.type = 'button';
    pauseButton.className = 'motion-all-toggle';
    pauseButton.setAttribute('aria-pressed', 'false');
    pauseButton.textContent = 'Pausar efeitos';
    contact.append(pauseButton);
  }

  let entranceObserver = null;
  const entrances = [...document.querySelectorAll(
    '.projects .section-intro,.resume-copy,.career .section-intro,.foundation > div:not(.technical),.contact-main'
  )];
  const reveal = node => {
    node.classList.remove('entrance-pending');
    node.classList.add('entrance-visible');
    entranceObserver?.unobserve(node);
  };
  const finishEntrances = () => entrances.forEach(reveal);
  if (!reduced.matches && !document.hidden && typeof IntersectionObserver === 'function') {
    entranceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, { threshold:.08 });
    document.body.classList.add('motion-enhanced');
    entrances.forEach(node => {
      node.dataset.entrance = 'true';
      if (node.getBoundingClientRect().top < innerHeight || node.contains(document.activeElement)) reveal(node);
      else { node.classList.add('entrance-pending'); entranceObserver.observe(node); }
    });
  }
  document.addEventListener('focusin', event => {
    const node = event.target.closest?.('[data-entrance]');
    if (node) reveal(node);
  });

  const tiltNodes = [...document.querySelectorAll('.timeline article,.technical')];
  let tiltFrame = 0;
  const tiltPending = new Map();
  const resetTilt = node => {
    tiltPending.delete(node);
    node.style.removeProperty('--tilt-x');
    node.style.removeProperty('--tilt-y');
  };
  const resetTilts = () => {
    cancelAnimationFrame(tiltFrame); tiltFrame = 0;
    tiltNodes.forEach(resetTilt);
  };
  tiltNodes.forEach(node => {
    node.classList.add('refined-tilt');
    node.addEventListener('pointermove', event => {
      if (effectivePause || !desktopPointer.matches || event.pointerType !== 'mouse' || node.matches(':focus-within')) return;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.width > 640 || rect.height > 700) { resetTilt(node); return; }
      const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
      const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
      tiltPending.set(node, { x:-y * 2.8, y:x * 2.8 });
      if (!tiltFrame) tiltFrame = requestAnimationFrame(() => {
        tiltFrame = 0;
        if (effectivePause || !desktopPointer.matches) { resetTilts(); return; }
        tiltPending.forEach((value, item) => {
          item.style.setProperty('--tilt-x', `${value.x.toFixed(3)}deg`);
          item.style.setProperty('--tilt-y', `${value.y.toFixed(3)}deg`);
        });
        tiltPending.clear();
      });
    }, { passive:true });
    node.addEventListener('pointerleave', () => resetTilt(node));
    node.addEventListener('pointercancel', () => resetTilt(node));
    node.addEventListener('focusin', () => resetTilt(node));
  });

  const pointer = document.createElement('div');
  pointer.className = 'refined-pointer';
  pointer.setAttribute('aria-hidden','true');
  document.body.append(pointer);
  let pointerFrame = 0, lastStamp = 0, pointerVisible = false;
  let x = 0, y = 0, targetX = 0, targetY = 0, vx = 0, vy = 0;
  let ringWidth = 20, ringHeight = 20, hovered = null;
  const hidePointer = () => {
    pointerVisible = false;
    pointer.style.opacity = '0';
    cancelAnimationFrame(pointerFrame); pointerFrame = 0; lastStamp = 0;
    hovered = null; vx = vy = 0;
  };
  const pointerTick = now => {
    pointerFrame = 0;
    if (!pointerVisible || effectivePause || !desktopPointer.matches) { hidePointer(); return; }
    const dt = Math.min(32, now - lastStamp || 16) / 16;
    lastStamp = now;
    let tx = targetX, ty = targetY, desiredWidth = 20, desiredHeight = 20;
    if (hovered?.isConnected) {
      const rect = hovered.getBoundingClientRect();
      desiredWidth = Math.min(76, rect.width + 8);
      desiredHeight = Math.min(38, rect.height + 6);
      tx = rect.left + rect.width / 2 + (targetX - rect.left - rect.width / 2) * .3;
      ty = rect.top + rect.height / 2 + (targetY - rect.top - rect.height / 2) * .3;
    }
    const damping = Math.pow(.62,dt);
    vx = (vx + (tx - x) * .15 * dt) * damping;
    vy = (vy + (ty - y) * .15 * dt) * damping;
    x += vx * dt; y += vy * dt;
    ringWidth += (desiredWidth - ringWidth) * Math.min(1,.19 * dt);
    ringHeight += (desiredHeight - ringHeight) * Math.min(1,.19 * dt);
    const speed = Math.hypot(vx,vy);
    const stretch = hovered ? 0 : Math.min(.3,speed * .015);
    const angle = hovered ? 0 : Math.atan2(vy,vx) * 180 / Math.PI;
    pointer.style.width = `${ringWidth.toFixed(2)}px`;
    pointer.style.height = `${ringHeight.toFixed(2)}px`;
    pointer.style.borderRadius = hovered ? '18px' : '50%';
    pointer.style.transform = `translate3d(${(x-ringWidth/2).toFixed(2)}px,${(y-ringHeight/2).toFixed(2)}px,0) rotate(${angle.toFixed(2)}deg) scale(${1+stretch},${1-stretch*.35})`;
    if (Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(desiredWidth-ringWidth)+Math.abs(desiredHeight-ringHeight)+speed > .12) {
      pointerFrame = requestAnimationFrame(pointerTick);
    }
  };
  document.addEventListener('pointermove', event => {
    if (effectivePause || !desktopPointer.matches || event.pointerType !== 'mouse') { hidePointer(); return; }
    targetX = event.clientX; targetY = event.clientY;
    const candidate = event.target.closest?.('a,button,summary');
    hovered = candidate && !candidate.disabled && !candidate.matches('.portrait-trigger') ? candidate : null;
    if (!pointerVisible) {
      pointerVisible = true; x = targetX; y = targetY; vx = vy = 0;
      pointer.style.opacity = '.4';
    }
    if (!pointerFrame) pointerFrame = requestAnimationFrame(pointerTick);
  }, { passive:true });
  document.documentElement.addEventListener('pointerleave',hidePointer);
  window.addEventListener('blur', () => { hidePointer(); resetTilts(); });
  window.addEventListener('scroll',hidePointer,{ passive:true });
  document.addEventListener('keydown', event => { if (event.key === 'Tab') hidePointer(); });
  desktopPointer.addEventListener('change', () => { hidePointer(); resetTilts(); });

  function updateMotion() {
    effectivePause = manualPause || reduced.matches || document.hidden;
    document.body.classList.toggle('effects-paused',effectivePause);
    if (pauseButton) {
      pauseButton.setAttribute('aria-pressed',String(effectivePause));
      pauseButton.textContent = effectivePause ? 'Retomar efeitos' : 'Pausar efeitos';
      pauseButton.disabled = reduced.matches;
      pauseButton.title = reduced.matches ? 'Seu dispositivo está configurado para reduzir movimento.' : '';
    }
    if (effectivePause) { hidePointer(); resetTilts(); finishEntrances(); }
    if (effectivePause !== previousPause) {
      previousPause = effectivePause;
      document.dispatchEvent(new CustomEvent('visual:motion',{ detail:{ paused:effectivePause } }));
    }
  }
  pauseButton?.addEventListener('click', () => { manualPause = !manualPause; updateMotion(); });
  reduced.addEventListener('change',updateMotion);
  document.addEventListener('visibilitychange',updateMotion);
  updateMotion();
})();
