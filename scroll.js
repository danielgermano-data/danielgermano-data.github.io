/* Native scroll drives a sticky portrait stage; no wheel/touch interception. */
(() => {
  'use strict';
  const track = document.querySelector('.hero-track');
  const stage = track?.querySelector('.hero');
  if (!track || !stage) return;
  const mobile = matchMedia('(max-width:600px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const about = document.querySelector('.work-visual');
  const career = about?.closest('.career');
  const cards = [...document.querySelectorAll('.project')];
  const clamp = value => Math.max(0, Math.min(1, value));
  const smoothstep = (low, high, value) => {
    const t = clamp((value - low) / (high - low));
    return t * t * (3 - 2 * t);
  };
  let enabled = false, paused = false, keyboardMode = false, frame = 0, current = 0, target = 0;
  let distance = 1, lastTime = 0, viewportHeight = 1, zooming = false;
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden','true');
  probe.style.cssText = 'position:absolute;width:0;height:100svh;visibility:hidden;pointer-events:none;inset:0 auto auto 0';
  document.body.append(probe);
  const stableHeight = () => probe.getBoundingClientRect().height || innerHeight;
  function configureCards() {
    let correction = 0;
    cards.forEach((card, index) => {
      const inset = mobile.matches ? 14 + index * 10 : 40 + index * 14;
      const fits = card.offsetHeight <= viewportHeight - inset - 24;
      const wasSticky = card.classList.contains('sticky-card');
      const anchor = card.querySelector('summary') || card;
      const before = wasSticky && !fits ? anchor.getBoundingClientRect().top : null;
      card.classList.toggle('sticky-card', enabled && fits);
      // Expanded content must remain visible when it no longer fits a viewport.
      if (before !== null && before >= 0 && before < viewportHeight) {
        correction = anchor.getBoundingClientRect().top - before;
      }
    });
    if (Math.abs(correction) > 1) window.scrollBy({ top:correction, behavior:'instant' });
  }
  function renderAbout() {
    if (!about) return;
    const bounds = about.getBoundingClientRect();
    const depth = enabled && !paused ? clamp((viewportHeight - bounds.bottom) / (viewportHeight * .8)) : 0;
    about.style.setProperty('--about-depth',depth.toFixed(4));
    career?.style.setProperty('--about-depth',depth.toFixed(4));
  }
  function setZooming(value) {
    if (value === zooming) return;
    zooming = value;
    stage.classList.toggle('is-scroll-zooming',value);
    document.dispatchEvent(new CustomEvent('portrait:scroll',{ detail:{ active:value } }));
  }
  function render() {
    const keyboardFocus = keyboardMode && Boolean(stage.querySelector(':focus-visible'));
    stage.classList.toggle('keyboard-scene',keyboardFocus);
    const progress = paused || keyboardFocus ? 0 : current;
    const fade = smoothstep(.025,.23,progress);
    stage.style.setProperty('--scene-zoom',(1 + smoothstep(0,.84,progress) * 1.9).toFixed(4));
    stage.style.setProperty('--scene-fade',fade.toFixed(4));
    stage.style.setProperty('--scene-veil',smoothstep(.7,.99,progress).toFixed(4));
    stage.style.setProperty('--scene-shift',`${(progress * 45).toFixed(2)}px`);
    stage.classList.toggle('scene-hides-copy',fade > .99);
    setZooming(progress > .08);
  }
  function tick(now) {
    frame = 0;
    if (!enabled || document.hidden) return;
    const dt = Math.min(50,now - lastTime || 16);
    lastTime = now;
    current += (target - current) * (1 - Math.exp(-dt / 75));
    if (Math.abs(target - current) < .0001) current = target;
    render(); renderAbout();
    if (current !== target && !paused) frame = requestAnimationFrame(tick);
  }
  function onScroll() {
    if (!enabled) return;
    target = clamp(-track.getBoundingClientRect().top / distance);
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function configure() {
    cancelAnimationFrame(frame); frame = 0;
    viewportHeight = stableHeight();
    enabled = !reduced.matches && stage.offsetHeight <= viewportHeight + 1;
    track.classList.toggle('has-scroll-scene',enabled);
    if (!enabled) {
      track.style.removeProperty('--scene-height');
      ['--scene-zoom','--scene-fade','--scene-veil','--scene-shift'].forEach(name => stage.style.removeProperty(name));
      stage.classList.remove('scene-hides-copy');
      setZooming(false); current = target = 0;
      renderAbout(); configureCards(); return;
    }
    const trackHeight = stage.offsetHeight * (mobile.matches ? 2.1 : 2.3);
    distance = Math.max(1,trackHeight - stage.offsetHeight);
    track.style.setProperty('--scene-height',`${trackHeight.toFixed(2)}px`);
    target = clamp(-track.getBoundingClientRect().top / distance);
    current = target; lastTime = 0;
    render(); renderAbout(); configureCards();
  }
  let measuredWidth = innerWidth, measuredHeight = stableHeight();
  window.addEventListener('resize',() => {
    const height = stableHeight();
    if (innerWidth !== measuredWidth || Math.abs(height - measuredHeight) > 1) {
      measuredWidth = innerWidth; measuredHeight = height; configure();
    }
  },{ passive:true });
  window.addEventListener('scroll',onScroll,{ passive:true });
  document.addEventListener('keydown',() => { keyboardMode = true; onScroll(); });
  document.addEventListener('pointerdown',() => { keyboardMode = false; onScroll(); },{ passive:true });
  window.addEventListener('wheel',() => { keyboardMode = false; onScroll(); },{ passive:true });
  stage.addEventListener('focusin',onScroll);
  stage.addEventListener('focusout',onScroll);
  mobile.addEventListener('change',configure);
  reduced.addEventListener('change',configure);
  document.addEventListener('visual:motion',event => {
    paused = Boolean(event.detail?.paused);
    if (!document.hidden) { render(); renderAbout(); onScroll(); }
  });
  document.addEventListener('visibilitychange',() => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { lastTime = 0; onScroll(); }
  });
  new ResizeObserver(configure).observe(stage);
  const cardObserver = new ResizeObserver(configureCards);
  cards.forEach(card => cardObserver.observe(card));
  document.fonts.ready.then(configure);
  configure();
})();
