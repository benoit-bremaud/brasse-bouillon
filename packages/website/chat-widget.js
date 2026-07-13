/**
 * Brasse-Bouillon public FAQ chat widget (self-hosted, no CDN).
 *
 * A floating "Ask a question" bubble that answers curious visitors about the
 * Brasse-Bouillon PROJECT only (vision, features, how it works, joining the beta).
 * It is NOT a brewing assistant — the backend prompt enforces that scope (ADR-0022).
 *
 * Sovereignty & privacy (ADR-0022):
 *   - First-party only: it talks to our own NestJS `faq-bot` API, never a third party.
 *   - The ALTCHA proof-of-work is solved here with the browser's Web Crypto API,
 *     mirroring `altcha-lib` (`SHA-256(salt + number)` hex) — no third-party script.
 *   - RGPD-minimal: no cookies, no storage, no tracking, and NO network request is
 *     made on page load. The first call happens only when the visitor actually asks,
 *     so the widget never fires before an explicit user action.
 *
 * Activation is host-gated via WIDGET_HOSTS; live on the public production site since the
 * 2026-07-13 go-live (ADR-0022 activation addendum). Instant rollback stays server-side
 * (FAQ_BOT_ENABLED=false) — no website redeploy needed.
 */

/** Hosts where the widget is allowed to mount (production + staging + local review). */
const WIDGET_HOSTS = [
  'brasse-bouillon.com',
  'www.brasse-bouillon.com',
  'staging.brasse-bouillon-website.pages.dev',
  'localhost',
  '127.0.0.1',
];

/** The single live NestJS API on Fly (the faq-bot module is part of it). */
const LIVE_API_ORIGIN = 'https://brasse-bouillon-api.fly.dev';

/**
 * NestJS `faq-bot` API origin per host. Localhost points at the dev API (PORT=3000).
 *
 * Activation topology (ADR-0022, Option A): rather than standing up a separate staging API,
 * the staging site canaries directly against the single live API, with exposure gated by the
 * server-side `FAQ_BOT_ENABLED` kill-switch. Until the bot is enabled the live API answers
 * `/ask` with 503 (or 400 when the anti-bot handshake cannot complete), so the widget shows
 * "unavailable" and nothing is exercised. Production go-live flipped 2026-07-13 (bot enabled,
 * language-lock verified by live canary): the production hosts are now in `WIDGET_HOSTS`.
 */
const API_BASE_BY_HOST = {
  localhost: 'http://localhost:3000',
  '127.0.0.1': 'http://localhost:3000',
  'staging.brasse-bouillon-website.pages.dev': LIVE_API_ORIGIN,
  'brasse-bouillon.com': LIVE_API_ORIGIN,
  'www.brasse-bouillon.com': LIVE_API_ORIGIN,
};

/** Upper bound for the proof-of-work search (must be >= the server's maxnumber). */
const POW_FALLBACK_MAX = 200_000;

/** Localized widget chrome. The bot itself answers in the visitor's own language. */
const STRINGS = {
  fr: {
    launcher: 'Une question sur Brasse-Bouillon ?',
    title: 'Poser une question',
    intro: 'Je réponds aux questions sur le projet Brasse-Bouillon (fonctionnalités, bêta…).',
    chips: [
      'C’est quoi Brasse-Bouillon ?',
      'Comment ça marche ?',
      'Comment rejoindre la bêta ?',
    ],
    inputLabel: 'Ta question',
    placeholder: 'Écris ta question…',
    send: 'Envoyer',
    close: 'Fermer',
    notice: 'Assistant IA - ne partage pas d’informations personnelles.',
    thinking: 'Je réfléchis…',
    errorGeneric: 'Je ne peux pas répondre pour le moment. Réessaie dans un instant.',
    errorRate: 'Trop de questions d’un coup. Réessaie dans une minute.',
    errorUnavailable: 'L’assistant est momentanément indisponible. Réessaie plus tard.',
    errorOffline: 'Tu sembles hors ligne. Vérifie ta connexion puis réessaie.',
  },
  en: {
    launcher: 'A question about Brasse-Bouillon?',
    title: 'Ask a question',
    intro: 'I answer questions about the Brasse-Bouillon project (features, beta…).',
    chips: [
      'What is Brasse-Bouillon?',
      'How does it work?',
      'How do I join the beta?',
    ],
    inputLabel: 'Your question',
    placeholder: 'Type your question…',
    send: 'Send',
    close: 'Close',
    notice: 'AI assistant - please don’t share personal information.',
    thinking: 'Thinking…',
    errorGeneric: 'I can’t answer right now. Please try again in a moment.',
    errorRate: 'Too many questions at once. Please try again in a minute.',
    errorUnavailable: 'The assistant is temporarily unavailable. Please try later.',
    errorOffline: 'You appear to be offline. Check your connection and try again.',
  },
};

/** Pick the language pack from the page's <html lang> (defaults to French). */
function resolveStrings() {
  const lang = (document.documentElement.lang || 'fr').toLowerCase();
  return lang.startsWith('en') ? STRINGS.en : STRINGS.fr;
}

/** Resolve the API origin for the current host, or null when unknown. */
function resolveApiBase() {
  return API_BASE_BY_HOST[window.location.hostname] || null;
}

/** Lowercase hex SHA-256 of `input`, matching altcha-lib's `hashHex`. */
async function sha256Hex(input) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Solve an ALTCHA challenge and return the base64 payload the backend verifies.
 * Finds the counter `n` where `SHA-256(salt + n)` equals `challenge`, exactly like
 * `altcha-lib`'s `solveChallenge` / `verifySolution` pair (ADR-0022).
 */
async function solveChallenge(challenge) {
  const algorithm = challenge.algorithm || 'SHA-256';
  // We only implement SHA-256 (altcha-lib's default). Bail on any other algorithm rather
  // than burning the main thread looping to maxnumber on a hash we can never match.
  if (algorithm !== 'SHA-256') {
    return null;
  }
  const max = challenge.maxnumber || POW_FALLBACK_MAX;
  for (let number = 0; number <= max; number += 1) {
    const digest = await sha256Hex(challenge.salt + number);
    if (digest === challenge.challenge) {
      return btoa(
        JSON.stringify({
          algorithm,
          challenge: challenge.challenge,
          number,
          salt: challenge.salt,
          signature: challenge.signature,
        }),
      );
    }
  }
  return null;
}

/** Widget CSS. Colors/radius/shadow/easing come from site.css design tokens. */
const WIDGET_STYLES = `
.bb-chat { position: fixed; right: 20px; bottom: 20px; z-index: 1100;
  font-family: var(--font-body); }
.bb-chat__launcher { display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 18px; border: none; cursor: pointer;
  background: var(--copper); color: var(--color-card); font: inherit; font-weight: 600;
  border-radius: var(--radius-lg); box-shadow: var(--shadow-md);
  transition: transform 0.25s var(--ease-out-soft), box-shadow 0.25s var(--ease-out-soft); }
.bb-chat__launcher:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.bb-chat__launcher:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
.bb-chat__icon { width: 20px; height: 20px; flex: none; }
.bb-chat__panel { position: absolute; right: 0; bottom: calc(100% + 12px);
  width: min(360px, calc(100vw - 40px)); max-height: min(70vh, 560px);
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--color-card); color: var(--ink);
  border: 1px solid var(--line); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg); }
.bb-chat__panel[hidden] { display: none; }
.bb-chat__header { display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 16px; background: var(--foam);
  border-bottom: 1px solid var(--line); }
.bb-chat__title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--ink); }
.bb-chat__close { border: none; background: transparent; cursor: pointer;
  font-size: 1.5rem; line-height: 1; color: var(--muted); padding: 0 4px; }
.bb-chat__close:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
.bb-chat__log { flex: 1 1 auto; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 12px; }
.bb-chat__intro { margin: 0; color: var(--muted); font-size: 0.9rem; }
.bb-chat__msg { max-width: 85%; padding: 10px 14px; border-radius: var(--radius-md);
  font-size: 0.95rem; line-height: 1.45; white-space: pre-wrap; word-wrap: break-word; }
.bb-chat__msg--user { align-self: flex-end; background: var(--copper); color: var(--color-card);
  border-bottom-right-radius: var(--radius-sm); }
.bb-chat__msg--bot { align-self: flex-start; background: var(--foam); color: var(--ink);
  border-bottom-left-radius: var(--radius-sm); }
.bb-chat__msg--error { background: var(--color-accent-soft); color: var(--color-error); }
.bb-chat__msg--pending { opacity: 0.7; font-style: italic; }
.bb-chat__chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 12px; }
.bb-chat__chips[hidden] { display: none; }
.bb-chat__chip { padding: 7px 12px; cursor: pointer; font: inherit; font-size: 0.85rem;
  color: var(--copper-deep); background: transparent;
  border: 1px solid var(--line); border-radius: var(--radius-xl);
  transition: background 0.2s var(--ease-out-soft); }
.bb-chat__chip:hover { background: var(--color-accent-soft); }
.bb-chat__chip:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
.bb-chat__form { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--line); }
.bb-chat__input { flex: 1 1 auto; min-width: 0; padding: 10px 12px; font: inherit;
  color: var(--ink); background: var(--color-card);
  border: 1px solid var(--line); border-radius: var(--radius-md); }
.bb-chat__input:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 1px; }
.bb-chat__submit { flex: none; padding: 10px 16px; cursor: pointer; font: inherit;
  font-weight: 600; color: var(--color-card); background: var(--copper); border: none;
  border-radius: var(--radius-md); }
.bb-chat__submit:disabled { opacity: 0.5; cursor: default; }
.bb-chat__submit:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
.bb-chat__notice { margin: 0; padding: 0 16px 14px; color: var(--muted); font-size: 0.75rem; }
.bb-chat__visually-hidden { position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
@media (prefers-reduced-motion: reduce) {
  .bb-chat__launcher, .bb-chat__chip { transition: none; }
  .bb-chat__launcher:hover { transform: none; }
}
`;

/** Inject the widget stylesheet once (a <style> element, not inline attributes). */
function injectStyles() {
  if (document.getElementById('bb-chat-widget-styles')) {
    return;
  }
  const style = document.createElement('style');
  style.id = 'bb-chat-widget-styles';
  style.textContent = WIDGET_STYLES;
  document.head.appendChild(style);
}

/** Small createElement helper (class + text, never innerHTML — XSS-safe). */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Build the launcher's chat-bubble icon as real SVG DOM nodes (never innerHTML). */
function buildChatIcon() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'bb-chat__icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute(
    'd',
    'M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z',
  );
  svg.appendChild(path);
  return svg;
}

/**
 * Build and mount the widget. Wires host-gating, the ALTCHA round-trip, a11y
 * (aria-expanded, role="dialog", aria-live log, Escape-to-close, focus moves),
 * and graceful error handling per HTTP status.
 */
function mountChatWidget() {
  const apiBase = resolveApiBase();
  if (!apiBase) {
    return;
  }
  const t = resolveStrings();
  injectStyles();

  const root = el('div', 'bb-chat');

  const launcher = el('button', 'bb-chat__launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'bbChatPanel');
  launcher.setAttribute('aria-label', t.launcher);
  launcher.appendChild(buildChatIcon());
  launcher.appendChild(el('span', undefined, t.launcher));

  const panel = el('section', 'bb-chat__panel');
  panel.id = 'bbChatPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-label', t.title);
  panel.hidden = true;

  const header = el('header', 'bb-chat__header');
  header.appendChild(el('h2', 'bb-chat__title', t.title));
  const closeBtn = el('button', 'bb-chat__close', '×');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', t.close);
  header.appendChild(closeBtn);

  const log = el('div', 'bb-chat__log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
  log.appendChild(el('p', 'bb-chat__intro', t.intro));

  const chips = el('div', 'bb-chat__chips');
  const form = el('form', 'bb-chat__form');
  const label = el('label', 'bb-chat__visually-hidden', t.inputLabel);
  label.setAttribute('for', 'bbChatInput');
  const input = el('input', 'bb-chat__input');
  input.id = 'bbChatInput';
  input.type = 'text';
  input.maxLength = 500;
  input.autocomplete = 'off';
  input.placeholder = t.placeholder;
  const submit = el('button', 'bb-chat__submit', t.send);
  submit.type = 'submit';
  form.append(label, input, submit);

  const notice = el('p', 'bb-chat__notice', t.notice);

  panel.append(header, log, chips, form, notice);
  root.append(launcher, panel);
  document.body.appendChild(root);

  let busy = false;

  const scrollLog = () => {
    log.scrollTop = log.scrollHeight;
  };

  const addMessage = (role, text, variant) => {
    const msg = el('div', `bb-chat__msg bb-chat__msg--${role}`, text);
    if (variant) {
      msg.classList.add(`bb-chat__msg--${variant}`);
    }
    log.appendChild(msg);
    scrollLog();
    return msg;
  };

  const setOpen = (open) => {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) {
      input.focus();
    } else {
      launcher.focus();
    }
  };

  const errorFor = (status, hadProof) => {
    if (status === 429) {
      return t.errorRate;
    }
    if (status === 503) {
      return t.errorUnavailable;
    }
    // #1314: a 400 with no anti-bot proof attached means the ALTCHA challenge round-trip
    // failed (endpoint down / unsolvable) and the guard rejected the unproven request. That
    // is an availability problem, not a malformed question — surface "unavailable", not the
    // generic "try again in a moment". (In dev the guard bypasses, so this path never hits.)
    if (status === 400 && !hadProof) {
      return t.errorUnavailable;
    }
    return t.errorGeneric;
  };

  const ask = async (question) => {
    const trimmed = question.trim();
    if (!trimmed || busy) {
      return;
    }
    busy = true;
    submit.disabled = true;
    input.value = '';
    // Suggestion chips are conversation starters: hide them once the first question is
    // sent so the freed space (~25% of the panel) goes to reading the bot's answers.
    chips.hidden = true;
    addMessage('user', trimmed);
    const pending = addMessage('bot', t.thinking, 'pending');

    try {
      // Fetch + solve the anti-bot challenge (skipped server-side when unconfigured).
      let altcha;
      try {
        const challengeRes = await fetch(`${apiBase}/faq-bot/challenge`);
        if (challengeRes.ok) {
          const challengeBody = await challengeRes.json();
          altcha = await solveChallenge(challengeBody.data);
        }
      } catch {
        /* Challenge is best-effort; the guard bypasses when no key is configured. */
      }

      const body = altcha ? { question: trimmed, altcha } : { question: trimmed };
      const res = await fetch(`${apiBase}/faq-bot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        pending.textContent = errorFor(res.status, Boolean(altcha));
        pending.classList.remove('bb-chat__msg--pending');
        pending.classList.add('bb-chat__msg--error');
        return;
      }

      const payload = await res.json();
      const answer = payload && payload.data ? payload.data.answer : undefined;
      pending.textContent = answer || t.errorGeneric;
      pending.classList.remove('bb-chat__msg--pending');
      if (!answer) {
        pending.classList.add('bb-chat__msg--error');
      }
    } catch {
      const offline =
        typeof navigator !== 'undefined' && navigator.onLine === false;
      pending.textContent = offline ? t.errorOffline : t.errorGeneric;
      pending.classList.remove('bb-chat__msg--pending');
      pending.classList.add('bb-chat__msg--error');
    } finally {
      busy = false;
      submit.disabled = false;
      scrollLog();
    }
  };

  t.chips.forEach((question) => {
    const chip = el('button', 'bb-chat__chip', question);
    chip.type = 'button';
    chip.addEventListener('click', () => {
      void ask(question);
    });
    chips.appendChild(chip);
  });

  launcher.addEventListener('click', () => setOpen(panel.hidden));
  closeBtn.addEventListener('click', () => setOpen(false));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void ask(input.value);
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  });
}

// Mount only on the allow-listed hosts (production included since the 2026-07-13 go-live —
// ADR-0022 activation addendum, Option A). Instant rollback stays server-side: disabling
// FAQ_BOT_ENABLED makes the widget show "unavailable" without any website redeploy.
if (WIDGET_HOSTS.includes(window.location.hostname)) {
  mountChatWidget();
}
