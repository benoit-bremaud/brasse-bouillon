(function (global) {
  'use strict';

  // Formspree endpoints — shared by both languages (the hidden `lang` field is
  // the discriminator, ADR-0027 D3), so they are language-neutral constants.
  const QUESTIONNAIRE_ENDPOINT = 'https://formspree.io/f/xeellqan';
  const NEWSLETTER_ENDPOINT = 'https://formspree.io/f/mqaqqvab';

  // Per-language UI string catalogs. Kept here (not inline in the page) so the
  // home's bootstrap <script> stays language-neutral and build_i18n.py only has
  // to swap the `'fr'` argument to `'en'` for en.html (ADR-0027 D1.3 / D3).
  const MENU_LABELS = {
    fr: { open: 'Ouvrir le menu', close: 'Fermer le menu' },
    en: { open: 'Open menu', close: 'Close menu' }
  };

  const FORM_MESSAGES = {
    fr: {
      questionnaire: {
        endpointMissing: 'Endpoint Formspree du questionnaire non configuré.',
        sending: 'Envoi en cours…',
        success: 'Merci ! Ton retour a bien été envoyé.',
        http400: 'Certaines informations semblent invalides. Vérifie le formulaire puis réessaie.',
        http429: 'Trop de demandes. Attends un peu avant de réessayer.',
        http5xx: 'Erreur du serveur. Réessaie dans quelques minutes ou contacte le support.',
        httpGeneric: 'Impossible d’envoyer pour le moment. Réessaie dans quelques minutes.',
        offline: 'Tu sembles hors ligne. Vérifie ta connexion Internet puis réessaie.',
        aborted: 'La requête a été interrompue. Réessaie l’envoi du formulaire.',
        networkOrCors: 'Impossible de contacter le serveur (problème réseau ou CORS). Réessaie dans quelques instants.',
        unexpected: 'Une erreur est survenue lors de l’envoi. Réessaie dans quelques instants.'
      },
      newsletter: {
        endpointMissing: 'Endpoint newsletter non configuré.',
        sending: 'Inscription en cours…',
        success: 'Super ! Ton inscription à la waitlist est confirmée.',
        http400: 'Adresse email invalide ou incomplète. Vérifie puis réessaie.',
        http429: 'Trop de tentatives. Merci d’attendre un instant avant de réessayer.',
        http5xx: 'Le service est temporairement indisponible. Réessaie un peu plus tard.',
        httpGeneric: 'Impossible d’enregistrer l’inscription pour le moment. Réessaie dans quelques minutes.',
        offline: 'Tu sembles hors ligne. Vérifie ta connexion puis réessaie.',
        aborted: 'La requête a été interrompue. Réessaie l’inscription.',
        networkOrCors: 'Impossible de contacter le service (réseau/CORS). Réessaie bientôt.',
        unexpected: 'Une erreur inattendue est survenue. Réessaie dans quelques instants.'
      }
    },
    en: {
      questionnaire: {
        endpointMissing: 'Questionnaire Formspree endpoint is not configured.',
        sending: 'Sending…',
        success: 'Thanks! Your feedback has been sent.',
        http400: 'Some answers look invalid. Check the form and try again.',
        http429: 'Too many requests. Give it a moment before trying again.',
        http5xx: 'Server error. Try again in a few minutes or contact support.',
        httpGeneric: 'Couldn’t send right now. Try again in a few minutes.',
        offline: 'You seem to be offline. Check your connection and try again.',
        aborted: 'The request was interrupted. Send the form again.',
        networkOrCors: 'Couldn’t reach the server (network or CORS issue). Try again in a moment.',
        unexpected: 'Something went wrong while sending. Try again in a moment.'
      },
      newsletter: {
        endpointMissing: 'Newsletter endpoint is not configured.',
        sending: 'Signing you up…',
        success: 'You’re in! Your waitlist spot is confirmed.',
        http400: 'That email looks invalid or incomplete. Check it and try again.',
        http429: 'Too many attempts. Please wait a moment before trying again.',
        http5xx: 'The service is temporarily unavailable. Try again a bit later.',
        httpGeneric: 'Couldn’t save your signup right now. Try again in a few minutes.',
        offline: 'You seem to be offline. Check your connection and try again.',
        aborted: 'The request was interrupted. Sign up again.',
        networkOrCors: 'Couldn’t reach the service (network/CORS). Try again soon.',
        unexpected: 'An unexpected error occurred. Try again in a moment.'
      }
    }
  };

  /**
   * Toggles the questionnaire form open/closed on a home page. Options:
   * `{ lang }` ('fr' | 'en') — selects the `questionnaireForm…` /
   * `questionnaireToggle…` DOM id pair. Invoked by the pages' inline
   * `onclick` handlers; no-ops when either element is absent.
   */
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

  /**
   * Wires one Formspree form (questionnaire or newsletter) on a home page.
   * Options: `formId` / `statusId` (DOM ids), `endpoint` (Formspree URL),
   * `lang` ('fr' | 'en', defaults to 'fr'), `kind` ('questionnaire' |
   * 'newsletter' — selects the FORM_MESSAGES catalog entry), and optional
   * `checkboxLimits` / `requiredCheckboxGroups` constraint configs.
   * No-ops when the form, status node, or message catalog is absent.
   */
  function setupQuestionnaire(options) {
    const {
      formId,
      statusId,
      endpoint,
      checkboxLimits = [],
      requiredCheckboxGroups = []
    } = options;

    // Messages come from the per-language catalog by `lang` + `kind`.
    const lang = options.lang === 'en' ? 'en' : 'fr';
    const messages = FORM_MESSAGES[lang] && FORM_MESSAGES[lang][options.kind];

    const form = document.getElementById(formId);
    const status = document.getElementById(statusId);
    if (!form || !status || !messages) return;

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
    const lang = options.lang === 'en' ? 'en' : 'fr';
    const labels = MENU_LABELS[lang];

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
    //  - scale with viewport area (≈ 1 bubble per 9000 px²), capped at 100 —
    //    the cap is the main lever against sustained GPU load on big screens,
    //  - halve it on low-memory / few-core devices,
    //  - drop to a minimum when Data Saver is on,
    //  - (prefers-reduced-motion already disabled the layer above).
    function adaptiveBubbleCount() {
      const area = window.innerWidth * window.innerHeight;
      let n = Math.round(area / 9000);
      // Data Saver: a deliberate hard minimum, below the normal floor (lightest
      // possible while still hinting the effect).
      if (navigator.connection?.saveData) return 45;
      const memory = navigator.deviceMemory;
      const cores = navigator.hardwareConcurrency;
      if ((memory && memory <= 4) || (cores && cores <= 4)) n = Math.round(n * 0.5);
      // Each bubble is a continuously-composited gradient, so the count is kept
      // deliberately lean: a big screen doesn't need hundreds to read as "fizzy",
      // and the cap is what spares laptops/desktops from sustained GPU work (and
      // the thermal throttling it causes) on a long visit. Gradient (≈): phone
      // ~50, tablet ~85, laptop/desktop capped at 100.
      return Math.max(50, Math.min(n, 100));
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

  /**
   * Pause in-place ambient loops (decorative spins, shimmers, "breathing"
   * micro-animations) while their element is scrolled out of view, and resume
   * them when it returns. CSS animations keep compositing off-screen by default,
   * so on a long visit that motion heats the device and makes it throttle for
   * nothing. Transiting effects (rising bubbles/embers) are deliberately kept
   * always-on — freezing one off-screen would strand it and drain the stream —
   * and one-shot entrance animations are ignored since they finish on their own.
   * No-op under prefers-reduced-motion or without IntersectionObserver /
   * getAnimations support.
   */
  function setupOffscreenAnimationPausing() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (
      typeof IntersectionObserver !== 'function' ||
      typeof document.getAnimations !== 'function'
    ) {
      return;
    }

    // Keyframes that travel across the viewport: pausing one off-screen breaks the
    // effect (a frozen bubble never rises back into view), so their host stays
    // always-on — enforced per-element below (any transiting animation vetoes its
    // whole host), not just per-animation.
    const TRANSITING = new Set(['bubble-rise', 'bubble-sway', 'emberRise']);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('bb-anim-off', !entry.isIntersecting);
        });
      },
      // Resume a touch before the element scrolls in so it is never visibly frozen.
      { rootMargin: '200px' }
    );

    // A ::before/::after animation's target is a CSSPseudoElement (no nodeType);
    // resolve it to its originating element so the host is what we tag (the CSS
    // rule pauses the pseudo-element via its ::before/::after variants — this is
    // what pauses the hero's large floatSlow gradient blobs off-screen).
    const hostOf = (anim) => {
      const target = anim.effect && anim.effect.target;
      if (!target) return null;
      const host = target.nodeType === 1 ? target : target.element;
      return host && host.nodeType === 1 ? host : null;
    };

    const infinite = document.getAnimations().filter((anim) => {
      const timing =
        anim.effect && anim.effect.getTiming ? anim.effect.getTiming() : null;
      return timing && timing.iterations === Infinity;
    });

    // Pause is element-wide, so any transiting animation vetoes its whole host: if
    // an element ever carried both a transiting loop (bubble/ember) and another
    // infinite one, tagging it would freeze the transiting stream too. Collect the
    // vetoed hosts first, then observe only the non-transiting hosts left clear.
    const excluded = new Set();
    infinite.forEach((anim) => {
      if (!TRANSITING.has(anim.animationName)) return;
      const host = hostOf(anim);
      if (host) excluded.add(host);
    });

    const targets = new Set();
    infinite.forEach((anim) => {
      if (TRANSITING.has(anim.animationName)) return;
      const host = hostOf(anim);
      if (host && !excluded.has(host)) targets.add(host);
    });
    targets.forEach((el) => observer.observe(el));
  }

  /**
   * One-call bootstrap for a home page (FR `index.html` or the generated EN
   * `en.html`). Wires the mobile menu and both Formspree forms for the given
   * language, pulling every UI string from the catalogs above. The page's
   * inline <script> only needs `BBShared.initHome({ lang: 'fr' })`; build_i18n.py
   * swaps the `'fr'` literal to `'en'` (and the `…Fr` DOM ids to `…En`) when it
   * generates `en.html`, so the bootstrap itself carries no translatable text.
   */
  function initHome(options) {
    const lang = options && options.lang === 'en' ? 'en' : 'fr';
    const suffix = lang === 'en' ? 'En' : 'Fr';

    setupMenu({ lang });

    setupQuestionnaire({
      formId: `questionnaireForm${suffix}`,
      statusId: `questionnaireStatus${suffix}`,
      endpoint: QUESTIONNAIRE_ENDPOINT,
      lang,
      kind: 'questionnaire'
    });

    setupQuestionnaire({
      formId: `newsletterForm${suffix}`,
      statusId: `newsletterStatus${suffix}`,
      endpoint: NEWSLETTER_ENDPOINT,
      lang,
      kind: 'newsletter'
    });
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

  // Dew density depends on final card sizes — run once layout is settled, then
  // register the off-screen pauser. The rAF lets the freshly-appended dew/bubble
  // elements' animations show up in document.getAnimations() before we scan.
  function setupAmbientAfterLayout() {
    setupDew();
    requestAnimationFrame(setupOffscreenAnimationPausing);
  }
  if (document.readyState === 'complete') {
    setupAmbientAfterLayout();
  } else {
    window.addEventListener('load', setupAmbientAfterLayout);
  }

  global.BBShared = {
    initHome,
    toggleQuestionnaire,
    setupQuestionnaire,
    setupMenu,
    setupBubbles,
    setupDew
  };
}(window));
