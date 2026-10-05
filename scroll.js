/* Scroll-linked mobile depth. Native scrolling; no wheel/touch interception. */
(() => {
  'use strict';
  const track = document.querySelector('.hero-track');
  const stage = track?.querySelector('.hero');
  if (!track || !stage) return;
  const mobile = matchMedia('(max-width:600px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smoothstep = (low, high, value) => {
    const t = clamp((value - low) / (high - low));
    return t * t * (3 - 2 * t);
  };
  let enabled = false, frame = 0, current = 0, target = 0;
  let distance = 1, lastTime = 0, viewportHeight = 1;
  let zooming = false;
  const about = document.querySelector('.work-visual');
  const cards = [...document.querySelectorAll('.project')];
  function configureCards() {
    cards.forEach((card, index) => {
      const fits = card.offsetHeight <= viewportHeight - (14 + index * 10) - 24;
      card.classList.toggle('sticky-card', enabled && fits);
    });
  }
  function renderAbout() {
    if (!about || !enabled) return;
    const bounds = about.getBoundingClientRect();
    about.style.setProperty('--about-depth', clamp((viewportHeight - bounds.bottom) / (viewportHeight * .8)).toFixed(4));
  }

  function setZooming(value) {
    if (value === zooming) return;
    zooming = value;
    stage.classList.toggle('is-scroll-zooming', value);
    document.dispatchEvent(new CustomEvent('portrait:scroll', { detail: { active: value } }));
  }
  function render() {
    const fade = smoothstep(.025, .23, current);
    stage.style.setProperty('--scene-zoom', (1 + smoothstep(0, .84, current) * 1.9).toFixed(4));
    stage.style.setProperty('--scene-fade', fade.toFixed(4));
    stage.style.setProperty('--scene-veil', smoothstep(.7, .99, current).toFixed(4));
    // This closer portrait needs a smaller downward drift to keep the face in view.
    stage.style.setProperty('--scene-shift', `${(current * 45).toFixed(2)}px`);
    stage.classList.toggle('scene-hides-copy', fade > .99);
    setZooming(current > .08);
  }
  function tick(now) {
    frame = 0;
    if (!enabled || document.hidden) return;
    const dt = Math.min(50, now - lastTime || 16);
    lastTime = now;
    current += (target - current) * (1 - Math.exp(-dt / 75));
    if (Math.abs(target - current) < .0001) current = target;
    render();
    renderAbout();
    if (current !== target) frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (enabled && !frame && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function onScroll() {
    if (!enabled) return;
    const bounds = track.getBoundingClientRect();
    target = clamp(-bounds.top / distance);
    wake();
  }
  function configure() {
    cancelAnimationFrame(frame); frame = 0;
    enabled = mobile.matches && !reduced.matches;
    track.classList.toggle('has-scroll-scene', enabled);
    if (!enabled) {
      track.style.removeProperty('--scene-height');
      stage.style.removeProperty('--stage-top');
      ['--scene-zoom','--scene-fade','--scene-veil','--scene-shift'].forEach(name => stage.style.removeProperty(name));
      stage.classList.remove('scene-hides-copy');
      setZooming(false);
      current = target = 0;
      about?.style.removeProperty('--about-depth');
      configureCards();
      return;
    }
    // svh remains stable while the mobile address bar expands/collapses.
    const stableViewport = CSS.supports('height','100svh') ? stageHeightProbe() : innerHeight;
    viewportHeight = stableViewport;
    const trackHeight = Math.max(1350, stableViewport * 2.1);
    distance = Math.max(1, trackHeight - stage.offsetHeight);
    track.style.setProperty('--scene-height', `${trackHeight}px`);
    const bounds = track.getBoundingClientRect();
    target = clamp(-bounds.top / distance);
    current = target; lastTime = 0; render(); renderAbout(); configureCards();
  }
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden','true');
  probe.style.cssText = 'position:absolute;width:0;height:100svh;visibility:hidden;pointer-events:none;inset:0 auto auto 0';
  document.body.append(probe);
  function stageHeightProbe() { return probe.getBoundingClientRect().height || innerHeight; }
  let measuredWidth = innerWidth;
  let measuredViewport = stageHeightProbe();
  window.addEventListener('resize', () => {
    const stableViewport = stageHeightProbe();
    if (innerWidth !== measuredWidth || Math.abs(stableViewport - measuredViewport) > 1) {
      measuredWidth = innerWidth; measuredViewport = stableViewport; configure();
    }
  }, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  mobile.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { lastTime = 0; onScroll(); }
  });
  new ResizeObserver(configure).observe(stage);
  const cardObserver = new ResizeObserver(configureCards);
  cards.forEach(card => cardObserver.observe(card));
  configure();
})();
