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

    const count = (options && options.count) || 48;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const bubble = document.createElement('span');
      bubble.className = 'bubble';
      bubble.style.setProperty('--size', `${(3 + Math.random() * 9).toFixed(1)}px`);
      bubble.style.setProperty('--x', `${(Math.random() * 100).toFixed(2)}vw`);
      bubble.style.setProperty('--dur', `${(9 + Math.random() * 13).toFixed(1)}s`);
      bubble.style.setProperty('--delay', `${(-Math.random() * 22).toFixed(1)}s`);
      bubble.style.setProperty('--sway', `${(6 + Math.random() * 22).toFixed(0)}px`);
      bubble.style.setProperty('--op', (0.18 + Math.random() * 0.4).toFixed(2));
      fragment.appendChild(bubble);
    }

    layer.appendChild(fragment);
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

  global.BBShared = {
    toggleQuestionnaire,
    setupQuestionnaire,
    setupBubbles
  };
}(window));
