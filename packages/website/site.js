(function (global) {
  'use strict';

  function toggleQuestionnaire(options) {
    const { lang } = options;
    const formId = `questionnaireForm${lang === 'fr' ? 'Fr' : 'En'}`;
    const buttonId = `questionnaireToggle${lang === 'fr' ? 'Fr' : 'En'}`;
    const form = document.getElementById(formId);
    const button = document.getElementById(buttonId);
    if (!form || !button) return;

    const isOpen = form.dataset.open === 'true';
    const next = !isOpen;

    form.dataset.open = String(next);
    button.setAttribute('aria-expanded', String(next));

    // Keep the collapsed form out of keyboard / screen-reader navigation.
    form.inert = !next;
  }

  function setupCheckboxLimit(form, fieldName, maxChoices, message) {
    const checkboxes = form.querySelectorAll(`input[type="checkbox"][name="${fieldName}"]`);
    if (!checkboxes.length) return;

    checkboxes.forEach((box) => {
      box.addEventListener('change', () => {
        const checkedCount = Array.from(checkboxes).filter((item) => item.checked).length;
        if (checkedCount > maxChoices) {
          box.checked = false;
          alert(message);
        }
      });
    });
  }

  function hasMinimumChecked(form, fieldName, minRequired) {
    const checked = form.querySelectorAll(`input[type="checkbox"][name="${fieldName}"]:checked`).length;
    return checked >= minRequired;
  }

  function resolveHttpErrorMessage(response, messages) {
    if (response.status === 400) return messages.http400;
    if (response.status === 429) return messages.http429;
    if (response.status >= 500 && response.status < 600) return messages.http5xx;
    return messages.httpGeneric;
  }

  function resolveCatchErrorMessage(error, messages) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return messages.offline;
    if (error && error.name === 'AbortError') return messages.aborted;
    if (error instanceof TypeError) return messages.networkOrCors;
    return messages.unexpected;
  }

  function setStatus(statusNode, className, message) {
    statusNode.className = `form-status ${className}`;
    statusNode.textContent = message;
  }

  function setupQuestionnaire(options) {
    const {
      formId,
      statusId,
      endpoint,
      messages,
      checkboxLimits = [],
      requiredCheckboxGroups = []
    } = options;

    const form = document.getElementById(formId);
    const status = document.getElementById(statusId);
    if (!form || !status) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    checkboxLimits.forEach((limitConfig) => {
      setupCheckboxLimit(form, limitConfig.fieldName, limitConfig.maxChoices, limitConfig.message);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!endpoint) {
        setStatus(status, 'error', messages.endpointMissing);
        return;
      }

      for (const group of requiredCheckboxGroups) {
        if (!hasMinimumChecked(form, group.fieldName, group.minRequired)) {
          setStatus(status, 'error', group.message);
          return;
        }
      }

      if (!form.reportValidity()) {
        return;
      }

      submitBtn.disabled = true;
      setStatus(status, 'loading', messages.sending);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (response.ok) {
          form.reset();
          setStatus(status, 'success', messages.success);
          return;
        }

        setStatus(status, 'error', resolveHttpErrorMessage(response, messages));
      } catch (error) {
        console.error('Form submission error:', error);
        setStatus(status, 'error', resolveCatchErrorMessage(error, messages));
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /**
   * Wires the mobile header burger button to the collapsible nav. The nav's
   * open state is held on `data-open`; CSS reveals it only at the mobile
   * breakpoint. Closes after following an in-page link and on Escape (then
   * returns focus to the toggle). No-ops when either element is absent.
   */
  function setupMenu(options = {}) {
    const navId = options.navId || 'headerNav';
    const toggleId = options.toggleId || 'navToggle';
    const labels = options.labels || { open: 'Ouvrir le menu', close: 'Fermer le menu' };

    const nav = document.getElementById(navId);
    const toggle = document.getElementById(toggleId);
    if (!nav || !toggle) return;

    function setOpen(next) {
      nav.dataset.open = String(next);
      toggle.setAttribute('aria-expanded', String(next));
      toggle.setAttribute('aria-label', next ? labels.close : labels.open);
    }

    setOpen(false);

    toggle.addEventListener('click', () => {
      setOpen(nav.dataset.open !== 'true');
    });

    // Close after following an in-page link. Focus would otherwise stay on
    // the link CSS is about to hide, so move it to the destination section
    // (same-page hash) — falling back to the toggle — to keep keyboard /
    // assistive-tech focus on a visible element.
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (nav.dataset.open !== 'true') return;
        setOpen(false);

        const hash = link.getAttribute('href') || '';
        const target = hash.startsWith('#') ? document.getElementById(hash.slice(1)) : null;
        if (target) {
          if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        } else {
          toggle.focus();
        }
      });
    });

    // Close on Escape and return focus to the toggle.
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.dataset.open === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /**
   * Populates a `.bubbles` layer with rising CO₂ bubbles, like gas in a
   * glass of beer. Each bubble gets randomized custom properties (size,
   * horizontal position, duration, start delay, sway amplitude, opacity)
   * consumed by the CSS `bubble-rise` animation. No-ops when the user
   * prefers reduced motion or when no `.bubbles` layer is present.
   */
  function setupBubbles(options) {
    const layer = document.querySelector('.bubbles');
    if (!layer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Bubble count adapts to the device so big screens feel lush while weaker
    // phones stay smooth. Each bubble is a richly-painted, continuously
    // animated element, so we keep the compositor comfortable:
    //  - scale with viewport area (≈ 1 bubble per 6500 px²),
    //  - halve it on low-memory / few-core devices,
    //  - drop to a minimum when Data Saver is on,
    //  - (prefers-reduced-motion already disabled the layer above).
    function adaptiveBubbleCount() {
      const area = window.innerWidth * window.innerHeight;
      let n = Math.round(area / 6500);
      // Data Saver: a deliberate hard minimum of 60, intentionally below the
      // normal floor (lightest possible while still hinting the effect).
      if (navigator.connection?.saveData) return 60;
      const memory = navigator.deviceMemory;
      const cores = navigator.hardwareConcurrency;
      if ((memory && memory <= 4) || (cores && cores <= 4)) n = Math.round(n * 0.5);
      // Otherwise floor low so small screens really are sparser; cap kept
      // moderate so big screens stay lush but smooth. Gradient (≈): phone ~70,
      // tablet ~120, laptop ~160, desktop/ultrawide capped at 200.
      return Math.max(70, Math.min(n, 200));
    }

    const count = (options && options.count) || adaptiveBubbleCount();
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const bubble = document.createElement('span');
      bubble.className = 'bubble';

      // Strong skew towards small bubbles with a few bigger ones (like real
      // CO2): the bulk are tiny 2–6px fizz, some medium, the largest ~15px.
      const sizeFactor = Math.pow(Math.random(), 1.3);
      const size = 2 + sizeFactor * 13;
      // Larger bubbles tend to be a touch more opaque and rise faster.
      const opacity = 0.45 + sizeFactor * 0.3 + Math.random() * 0.25;
      const duration = 5 + (1 - sizeFactor) * 8 + Math.random() * 2;

      bubble.style.setProperty('--size', `${size.toFixed(1)}px`);
      bubble.style.setProperty('--x', `${(Math.random() * 100).toFixed(2)}vw`);
      bubble.style.setProperty('--dur', `${duration.toFixed(1)}s`);
      bubble.style.setProperty('--delay', `${(-Math.random() * 20).toFixed(1)}s`);
      bubble.style.setProperty('--sway', `${(6 + Math.random() * 26).toFixed(0)}px`);
      bubble.style.setProperty('--op', Math.min(opacity, 0.9).toFixed(2));
      fragment.appendChild(bubble);
    }

    layer.appendChild(fragment);
  }

  /**
   * Adds condensation (dew) droplets clinging to the front of each card,
   * like beads on a cold glass. A measured few static beads per card, plus
   * one or two that trickle down with a faint wet trail. Foreground layer,
   * pointer-events disabled so it never blocks interaction. Trickling is
   * skipped under prefers-reduced-motion.
   */
  function setupDew(options) {
    const selector =
      (options && options.selector) ||
      '.hero, .journey-step, .feature-card, .faq-item, .participate';
    const cards = document.querySelectorAll(selector);
    if (!cards.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dewLayers = [];

    cards.forEach((card) => {
      // A closed <details> hides every child except its <summary>, so for
      // those cards attach the dew to the always-visible <summary>.
      const host =
        card.tagName === 'DETAILS'
          ? card.querySelector(':scope > summary') || card
          : card;

      if (host.querySelector(':scope > .dew-layer')) return;
      if (window.getComputedStyle(host).position === 'static') {
        host.style.position = 'relative';
      }

      const layer = document.createElement('span');
      layer.className = 'dew-layer';

      // Density proportional to card area so small and large cards keep a
      // consistent look (≈ one bead per 18000 px²), clamped to sane bounds.
      // offsetWidth/Height are read only to size bead counts — the layer
      // itself is stretched to the host in CSS (100%/100%), so it stays in
      // sync after a resize instead of overflowing with a stale px width.
      const cardW = host.offsetWidth || 300;
      const cardH = host.offsetHeight || 240;
      const area = cardW * cardH;
      const beads = Math.min(45, Math.max(6, Math.round(area / 18000)));
      for (let i = 0; i < beads; i += 1) {
        const drop = document.createElement('span');
        drop.className = 'dew';
        drop.style.setProperty('--dx', `${(5 + Math.random() * 90).toFixed(1)}%`);
        drop.style.setProperty('--dy', `${(5 + Math.random() * 88).toFixed(1)}%`);
        // skew small: lots of fine beads, a few larger ones
        const beadSize = 3 + Math.pow(Math.random(), 1.8) * 11;
        drop.style.setProperty('--ds', `${beadSize.toFixed(1)}px`);
        layer.appendChild(drop);
      }

      host.appendChild(layer);
      dewLayers.push({ layer, host });
    });

    startDewRunner(dewLayers, reduce);
  }

  /**
   * Drives the trickling drops globally: exactly ONE drop falls at a time,
   * from a random card at a random position, then the next is scheduled a
   * short while later. A single live runner at once keeps the page light and
   * guarantees two drops never overlap. Skipped under prefers-reduced-motion.
   */
  function startDewRunner(layers, reduce) {
    if (reduce || !layers.length) return;

    // Only cards currently on screen are eligible — no point animating drops
    // on cards scrolled out of view. Checked once per drip (cheap).
    function visibleLayers() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return layers.filter(({ host }) => {
        const r = host.getBoundingClientRect();
        return r.height > 0 && r.bottom > 0 && r.top < vh;
      });
    }

    function dropOnce() {
      const candidates = visibleLayers();
      if (!candidates.length) {
        scheduleNext();
        return;
      }
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const cardH = target.host.offsetHeight || 240;
      const dyPct = 5 + Math.random() * 20;
      const startPx = cardH * (dyPct / 100);

      const run = document.createElement('span');
      run.className = 'dew-run';
      run.style.setProperty('--dx', `${(8 + Math.random() * 84).toFixed(1)}%`);
      run.style.setProperty('--dy', `${dyPct.toFixed(1)}%`);
      run.style.setProperty('--ds', `${(8 + Math.random() * 5).toFixed(1)}px`);
      // Travel just past the card's bottom edge: the clipped layer hides the
      // bead as it leaves the card, so it slides off instead of stopping.
      run.style.setProperty('--dr-dist', `${Math.round(cardH - startPx + 28)}px`);
      run.style.setProperty('--dr-trail', `${(135 + Math.random() * 105).toFixed(0)}px`);
      run.style.setProperty('--dr-dur', `${(2.6 + Math.random() * 1.4).toFixed(1)}s`);

      const bead = document.createElement('span');
      bead.className = 'dew-run__bead';
      run.appendChild(bead);

      run.addEventListener(
        'animationend',
        () => {
          run.remove();
          scheduleNext();
        },
        { once: true }
      );
      target.layer.appendChild(run);
    }

    function scheduleNext() {
      // 2.5–6.5 s between drops: a drip "every so often" (a bit more often than
      // before), but never two at once — the next is queued only after the
      // current one finishes.
      window.setTimeout(dropOnce, 2500 + Math.random() * 4000);
    }

    scheduleNext();
  }

  function onReady(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  onReady(function () {
    setupBubbles();
  });

  // Pause the ambient animations while the tab is hidden — no point spending
  // CPU/battery animating bubbles and drops nobody is looking at.
  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('anim-paused', document.hidden);
  });

  // Dew density depends on final card sizes — run once layout is settled.
  if (document.readyState === 'complete') {
    setupDew();
  } else {
    window.addEventListener('load', setupDew);
  }

  global.BBShared = {
    toggleQuestionnaire,
    setupQuestionnaire,
    setupMenu,
    setupBubbles,
    setupDew
  };
}(window));
