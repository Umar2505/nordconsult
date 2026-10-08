const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const MOTION = Object.freeze({ micro: 420, short: 650, standard: 980, cinematic: 1380, camera: 1200, photo: 1250 });

// Storyboard compositions in the existing choreography. These identifiers are
// internal only; visitors see the nine chapter indicator.
export const CINEMATIC_STAGES = Object.freeze([
  { id: 'decision-intro', chapter: 0, progress: 0, duration: 'short' },
  { id: 'passport-approach', chapter: 0, progress: .54, duration: 'short' },
  { id: 'passport-page', chapter: 0, progress: 1, duration: 'short' },

  { id: 'map-appears', chapter: 1, progress: .40, duration: 'standard' },
  { id: 'globe-forms', chapter: 1, progress: .92, duration: 'cinematic' },

  { id: 'capital-constellation', chapter: 2, progress: .55, duration: 'photo' },

  { id: 'roadmap-intro', chapter: 3, progress: .115, duration: 'standard' },
  { id: 'roadmap-profile', chapter: 3, progress: .16, duration: 'short' },
  { id: 'roadmap-destination', chapter: 3, progress: .25, duration: 'camera' },
  { id: 'roadmap-university', chapter: 3, progress: .375, duration: 'standard' },
  { id: 'roadmap-documents', chapter: 3, progress: .47, duration: 'standard' },
  { id: 'roadmap-application', chapter: 3, progress: .58, duration: 'standard' },
  { id: 'roadmap-wait', chapter: 3, progress: .69, duration: 'standard' },
  { id: 'roadmap-acceptance', chapter: 3, progress: .79, duration: 'cinematic' },
  { id: 'roadmap-visa', chapter: 3, progress: .88, duration: 'standard' },
  { id: 'roadmap-flight', chapter: 3, progress: .975, duration: 'cinematic' },

  { id: 'stories-intro', chapter: 4, progress: .16, duration: 'standard' },
  { id: 'stories-first', chapter: 4, progress: .36, duration: 'standard' },
  { id: 'stories-second', chapter: 4, progress: .52, duration: 'standard' },
  { id: 'stories-network', chapter: 4, progress: .70, duration: 'standard' },
  { id: 'stories-question', chapter: 4, progress: .99, duration: 'standard' },

  { id: 'builder-intro', chapter: 5, progress: .12, duration: 'standard' },
  { id: 'builder-questions', chapter: 5, progress: .26, duration: 'short', gate: 'builder' },
  { id: 'builder-profile', chapter: 5, progress: .55, duration: 'standard' },

  { id: 'norway-portal', chapter: 6, progress: .09, duration: 'cinematic' },
  { id: 'norway-campus', chapter: 6, progress: .19, duration: 'photo' },
  { id: 'university-life', chapter: 6, progress: .34, duration: 'photo' },
  { id: 'student-life', chapter: 6, progress: .415, duration: 'photo' },
  { id: 'campus-day', chapter: 6, progress: .50, duration: 'photo' },
  { id: 'trondheim', chapter: 6, progress: .545, duration: 'standard' },
  { id: 'city-life', chapter: 6, progress: .58, duration: 'short' },
  { id: 'norway-landscape', chapter: 6, progress: .64, duration: 'photo' },
  { id: 'norway-seasons', chapter: 6, progress: .708, duration: 'photo' },
  { id: 'everyday-life', chapter: 6, progress: .80, duration: 'photo' },
  { id: 'feels-like-home', chapter: 6, progress: .875, duration: 'photo' },
  { id: 'arrival-callback', chapter: 6, progress: .955, duration: 'standard' },
  { id: 'arrival-finale', chapter: 6, progress: 1, duration: 'cinematic' },

  { id: 'behind-outcome', chapter: 7, progress: .05, duration: 'standard' },
  { id: 'behind-workspace', chapter: 7, progress: .18, duration: 'camera' },
  { id: 'university-research', chapter: 7, progress: .275, duration: 'standard' },
  { id: 'university-shortlist', chapter: 7, progress: .39, duration: 'standard' },
  { id: 'first-draft', chapter: 7, progress: .445, duration: 'standard' },
  { id: 'document-preparation', chapter: 7, progress: .485, duration: 'standard' },
  { id: 'final-draft', chapter: 7, progress: .51, duration: 'short' },
  { id: 'deadline-check', chapter: 7, progress: .59, duration: 'short' },
  { id: 'human-decisions', chapter: 7, progress: .645, duration: 'photo' },
  { id: 'consultant-reveal', chapter: 7, progress: .695, duration: 'photo' },
  { id: 'admissions-guidance', chapter: 7, progress: .74, duration: 'photo' },
  { id: 'team-reveal', chapter: 7, progress: .773, duration: 'photo' },
  { id: 'personal-plan', chapter: 7, progress: .855, duration: 'standard' },
  { id: 'work-and-outcome', chapter: 7, progress: .917, duration: 'standard' },
  { id: 'behind-brand', chapter: 7, progress: .955, duration: 'standard' },
  { id: 'visitor-returns', chapter: 7, progress: .99, duration: 'cinematic' },

  { id: 'final-entry', chapter: 8, progress: .20, duration: 'standard' },
  { id: 'final-profile', chapter: 8, progress: .40, duration: 'standard' },
  { id: 'final-passport', chapter: 8, progress: .48, duration: 'cinematic' },
  { id: 'final-somewhere', chapter: 8, progress: .56, duration: 'short' },
  { id: 'final-start-here', chapter: 8, progress: .67, duration: 'short' },
  { id: 'first-conversation', chapter: 8, progress: .79, duration: 'standard' },
  { id: 'final-closing', chapter: 8, progress: .98, duration: 'cinematic' }
]);

const HASH_STAGES = Object.freeze({
  '#decision': 'decision-intro', '#opening': 'passport-approach', '#destinations': 'map-appears',
  '#roadmap-start': 'roadmap-intro', '#stories-start': 'stories-intro', '#build-start': 'builder-intro',
  '#behind-start': 'behind-outcome', '#story-start': 'final-entry', '#journey-end': 'final-entry'
});

const easeInOutCubic = value => value < .5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2;
const isEditableTarget = target => Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"], [role="button"]'));

export function createCinematicScroll({ resolveOffset, canAdvance, onStageChange, reducedMotion }) {
  let currentIndex = 0, transition = null;
  let wheelTotal = 0, wheelConsumed = false, wheelTimer = 0, touchStartY = null, lastKeyAt = 0;
  let normalMode = false, lastStableOffset = 0;
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const openForm = () => document.querySelector('#builder-contact.is-visible, #final-contact[aria-hidden="false"]');
  const scrollable = target => { const node = target?.closest?.('[data-scroll-region]'); return node && node.scrollHeight > node.clientHeight + 2 ? node : null; };
  const indexById = new Map(CINEMATIC_STAGES.map((stage, index) => [stage.id, index]));
  const currentStage = () => CINEMATIC_STAGES[currentIndex];
  const durationFor = stage => reducedMotion.matches ? 0 : MOTION[stage.duration] || MOTION.standard;

  function setMode(nextNormal) {
    normalMode = nextNormal;
    const footer = document.getElementById?.('site-footer');
    if (footer) footer.inert = !normalMode;
    if (normalMode) transition = null;
    document.documentElement.classList.toggle('is-cinematic', !normalMode);
    document.documentElement.classList.toggle('is-normal-scroll', normalMode);
  }

  function valueAt(now) {
    if (!transition) return lastStableOffset;
    transition.progress = transition.duration === 0 ? 1 : clamp((now - transition.startedAt) / transition.duration);
    return transition.from + (transition.to - transition.from) * easeInOutCubic(transition.progress);
  }

  function settle(index, notify = true) {
    currentIndex = clamp(index, 0, CINEMATIC_STAGES.length - 1);
    transition = null;
    lastStableOffset = resolveOffset(currentStage());
    window.scrollTo(0, lastStableOffset);
    if (notify) onStageChange?.(currentStage(), currentIndex);
  }

  function begin(targetIndex, { immediate = false } = {}) {
    targetIndex = clamp(targetIndex, 0, CINEMATIC_STAGES.length - 1);
    if (targetIndex === currentIndex && !transition) return;
    const targetStage = CINEMATIC_STAGES[targetIndex];
    if (immediate) { currentIndex = targetIndex; settle(currentIndex); return; }
    const now = performance.now();
    transition = {
      from: transition ? valueAt(now) : lastStableOffset,
      to: resolveOffset(targetStage), targetIndex, startedAt: now,
      duration: durationFor(targetStage), progress: 0
    };
  }

  function request(direction) {
    if (normalMode || !direction || openForm()) return false;
    // A gesture owns exactly one completed transition. Never queue momentum
    // or reverse a camera halfway through opening a page or changing a photo.
    if (transition) return true;
    if (direction > 0 && currentStage().gate && !canAdvance?.(currentStage())) return true;
    const target = currentIndex + direction;
    if (target < 0) return true;
    if (target >= CINEMATIC_STAGES.length) { setMode(true); return false; }
    begin(target);
    return true;
  }

  function tick(now) {
    if (!transition) {
      if (!normalMode && Math.abs(window.scrollY - lastStableOffset) > 1) window.scrollTo(0, lastStableOffset);
      return normalMode ? window.scrollY : lastStableOffset;
    }
    const value = valueAt(now);
    window.scrollTo(0, value);
    if (transition.progress >= 1) {
      currentIndex = transition.targetIndex;
      transition = null;
      lastStableOffset = resolveOffset(currentStage());
      window.scrollTo(0, lastStableOffset);
      onStageChange?.(currentStage(), currentIndex);

    }
    return value;
  }

  function onWheel(event) {
    if (event.ctrlKey) return;
    if (normalMode) {
      if (event.deltaY < 0 && window.scrollY <= lastStableOffset + 2) { setMode(false); settle(currentIndex); }
      else return;
    }
    if (scrollable(event.target) || openForm()?.contains(event.target)) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? innerHeight : 1;
    const delta = event.deltaY * unit;
    if (!delta) return;
    clearTimeout(wheelTimer);
    // A long timeout intentionally absorbs inertial tails from trackpads and
    // high-resolution wheels into the same gesture burst.
    wheelTimer = window.setTimeout(() => { wheelTotal = 0; wheelConsumed = false; }, 560);
    if (wheelConsumed) {
      if (Math.sign(delta) !== Math.sign(wheelTotal) && Math.abs(delta) >= 55) {
        wheelTotal = delta;
        request(Math.sign(delta));
      }
      return;
    }
    if (wheelTotal && Math.sign(wheelTotal) !== Math.sign(delta)) wheelTotal = 0;
    wheelTotal += delta;
    if (Math.abs(wheelTotal) < 72) return;
    wheelConsumed = true;
    request(Math.sign(wheelTotal));
  }

  function onKeyDown(event) {
    if (event.defaultPrevented || isEditableTarget(event.target) || openForm()) return;
    if (normalMode) {
      if (['ArrowUp', 'PageUp'].includes(event.key) && window.scrollY <= lastStableOffset + 2) { setMode(false); settle(currentIndex); }
      else return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); jumpTo(event.key === 'Home' ? 'decision-intro' : 'final-closing'); return;
    }
    if (event.key === ' ' && event.target?.closest?.('button, a, [role="button"]')) return;
    let direction = 0;
    if (event.key === 'ArrowDown' || event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey)) direction = 1;
    if (event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)) direction = -1;
    if (!direction) return;
    event.preventDefault();
    const now = performance.now();
    if (event.repeat || now - lastKeyAt < 360) return;
    lastKeyAt = now;
    request(direction);
  }

  function onTouchStart(event) {
    touchStartY = null;
    if (normalMode && window.scrollY <= lastStableOffset + 2) { setMode(false); settle(currentIndex); }
    if (normalMode || event.touches.length !== 1 || scrollable(event.target) || openForm()?.contains(event.target)) return;
    touchStartY = event.touches[0].clientY;
  }
  function onTouchMove(event) { if (!normalMode && touchStartY !== null) event.preventDefault(); }
  function onTouchEnd(event) {
    if (normalMode || touchStartY === null) return;
    const distance = touchStartY - (event.changedTouches[0]?.clientY ?? touchStartY);
    touchStartY = null;
    if (Math.abs(distance) >= 48) request(Math.sign(distance));
  }

  function jumpTo(id, { immediate = true } = {}) {
    const index = indexById.get(id);
    if (index === undefined) return false;
    setMode(false); wheelTotal = 0; wheelConsumed = false;
    if (index === currentIndex && !transition) settle(index);
    else begin(index, { immediate });
    return true;
  }

  function onLinkClick(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash === '#site-footer') { setMode(true); return; }
    const stageId = HASH_STAGES[hash];
    if (!stageId) return;
    event.preventDefault(); history.replaceState(null, '', hash); jumpTo(stageId);
  }

  window.addEventListener('wheel', onWheel, { ...options, passive: false });
  window.addEventListener('keydown', onKeyDown, options);
  window.addEventListener('touchstart', onTouchStart, { ...options, passive: true });
  window.addEventListener('touchmove', onTouchMove, { ...options, passive: false });
  window.addEventListener('touchend', onTouchEnd, { ...options, passive: true });
  document.addEventListener('click', onLinkClick, options);
  window.addEventListener('touchcancel', () => { touchStartY = null; }, options);
  window.addEventListener('hashchange', () => { const id = HASH_STAGES[location.hash]; if (id) jumpTo(id); }, options);

  const auditStage = import.meta.env?.DEV ? new URLSearchParams(location.search).get('stage') : null;
  let translatedStage = null;
  try { translatedStage = sessionStorage.getItem('nord-language-stage'); sessionStorage.removeItem('nord-language-stage'); } catch {}
  currentIndex = indexById.get(translatedStage || auditStage || HASH_STAGES[location.hash] || 'decision-intro') ?? 0;
  setMode(false); settle(currentIndex);

  return {
    tick, request, jumpTo,
    enableNormalMode: () => setMode(true),
    resumeCinematicMode: () => { setMode(false); settle(currentIndex, false); },
    realign: () => { if (!normalMode) settle(transition?.targetIndex ?? currentIndex, false); },
    destroy: () => { listeners.abort(); clearTimeout(wheelTimer); },
    getStage: currentStage,
    isNormalMode: () => normalMode
  };
}
