(function (global) {
  'use strict';

  function createPhaseCard(phase, getStateLabel) {
    const article = document.createElement('article');
    article.className = 'phase-card';

    const head = document.createElement('div');
    head.className = 'phase-head';

    const title = document.createElement('h3');
    title.className = 'phase-title';
    title.textContent = `Phase ${phase.phase} — ${phase.title}`;

    const state = document.createElement('span');
    state.className = `phase-state ${phase.state}`;
    state.textContent = getStateLabel(phase.state);

    head.appendChild(title);
    head.appendChild(state);

    const body = document.createElement('div');
    body.className = 'phase-body';

    const list = document.createElement('ul');
    phase.points.forEach((point) => {
      const item = document.createElement('li');
      item.textContent = point;
      list.appendChild(item);
    });

    body.appendChild(list);
    article.appendChild(head);
    article.appendChild(body);

    return article;
  }

  function renderRoadmap(options) {
    const { rootId, phases, filter, getStateLabel } = options;
    const root = document.getElementById(rootId);
    if (!root) return;

    const list = filter === 'all' ? phases : phases.filter((phase) => phase.state === filter);
    root.replaceChildren();

    const fragment = document.createDocumentFragment();
    list.forEach((phase) => {
      fragment.appendChild(createPhaseCard(phase, getStateLabel));
    });

    root.appendChild(fragment);
  }

  function setActiveRoadmapFilter(options) {
    const { controlsSelector, activeElement } = options;
    document.querySelectorAll(controlsSelector).forEach((chip) => {
      chip.classList.remove('active');
      chip.setAttribute('aria-pressed', 'false');
    });

    if (activeElement) {
      activeElement.classList.add('active');
      activeElement.setAttribute('aria-pressed', 'true');
    }
  }

  function toggleQuestionnaire(options) {
    const { lang, labels } = options;
    const form = document.getElementById(lang === 'fr' ? 'questionnaireFormFr' : 'questionnaireFormEn');
    const button = document.getElementById(lang === 'fr' ? 'questionnaireToggleFr' : 'questionnaireToggleEn');
    if (!form || !button) return;

    const isHidden = form.hasAttribute('hidden');

    if (isHidden) {
      form.removeAttribute('hidden');
      button.textContent = labels[lang].close;
    } else {
      form.setAttribute('hidden', '');
      button.textContent = labels[lang].open;
    }

    button.setAttribute('aria-expanded', String(isHidden));
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
        console.error('Questionnaire submission error:', error);
        setStatus(status, 'error', resolveCatchErrorMessage(error, messages));
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  global.BBShared = {
    renderRoadmap,
    setActiveRoadmapFilter,
    toggleQuestionnaire,
    setupQuestionnaire
  };
}(window));
