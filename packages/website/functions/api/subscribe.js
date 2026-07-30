// Cloudflare Pages Function — waitlist subscription relay (ADR-0030).
//
// Why a server-side relay exists at all: subscribing calls Brevo with an API
// key, and a key shipped to the browser is a published key. The browser
// therefore posts here, on the site's own origin (no CORS surface), and this
// handler is the only thing that ever sees `BREVO_API_KEY` — an encrypted Pages
// environment variable set by the project owner, never committed (ADR-0030 D4).
//
// Deployed by `.github/workflows/website-deploy.yml`, which stages this
// directory into the deployment root so `wrangler pages deploy` registers it.
// Route: POST /api/subscribe.

/** Brevo list the confirmed contact joins — `Waitlist FR` (ADR-0030 D2). */
const BREVO_LIST_ID = 3;

/** Brevo double opt-in template that carries the confirmation link. */
const BREVO_DOI_TEMPLATE_ID = 1;

const BREVO_DOI_ENDPOINT = 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation';

/**
 * Where Brevo sends the visitor after they click the confirmation link. This is
 * a REQUIRED parameter of the DOI endpoint, which is why `merci(-en).html`
 * exists at all (ADR-0030 D6). Keyed by the form's hidden `lang` field so an
 * English visitor does not land on a French page.
 */
const REDIRECTION_URLS = {
  fr: 'https://brasse-bouillon.com/merci',
  en: 'https://brasse-bouillon.com/merci-en'
};

/**
 * Upper bound on the submitted address. RFC 5321 caps a path at 256 octets;
 * anything longer is not a mistyped address, it is someone probing.
 */
const MAX_EMAIL_LENGTH = 254;

/** Give up on Brevo rather than hold the visitor's request open indefinitely. */
const BREVO_TIMEOUT_MS = 8000;

/**
 * A legitimate submission is a few hundred bytes. Reject anything absurd before
 * `formData()` buffers it into the isolate: a ~50 MB multipart would blow the
 * CPU budget and hand the visitor a Cloudflare error page instead of our JSON.
 * Self-limiting (isolates are per-request) but free to prevent.
 */
const MAX_BODY_BYTES = 4096;

/**
 * Rejections are logged by KIND only — never the address, never the body.
 *
 * Without this the endpoint is silent by construction: abuse, a broken template
 * id, or a flood of invalid input would all look like nothing at all, and the
 * first sign of trouble would be a provider complaint. Logging the kind is
 * enough to see a pattern in the Cloudflare Pages logs; logging the address
 * would turn those logs into an unnecessary store of personal data (RGPD data
 * minimisation), which is exactly what we do not want.
 */
function logRejection(kind) {
  console.warn(`[subscribe] rejected: ${kind}`);
}

/**
 * Deliberately stricter than the RFC and deliberately not a "full" e-mail
 * regex: this is a cheap sanity gate before spending a network call, not an
 * authority on address validity. Brevo is the authority, and the double opt-in
 * is the real proof the address exists.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/**
 * Same payload for every outcome the visitor is allowed to distinguish.
 *
 * A "this address is already subscribed" response would turn the endpoint into
 * an enumeration oracle: anyone could test whether a given person is on the
 * list. So a duplicate reads exactly like a new signup (ADR-0030 D5).
 */
function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Never let an intermediary cache a subscription outcome.
      'Cache-Control': 'no-store'
    }
  });
}

const successResponse = () => jsonResponse(200, { ok: true });

/**
 * `site.js` posts a `FormData`, but accept JSON too so the endpoint stays
 * usable from a script or a test without pretending to be a browser form.
 */
async function readSubmission(request) {
  const contentType = request.headers.get('Content-Type') || '';

  if (contentType.includes('application/json')) {
    const payload = await request.json();
    return payload && typeof payload === 'object' ? payload : {};
  }

  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

const readField = (submission, name) =>
  typeof submission[name] === 'string' ? submission[name].trim() : '';

/**
 * Brevo's documented error shape is `{ code, message }`. Never let a malformed
 * or empty error body throw here: we are already on the failure path, and a
 * second failure would turn a clean 502 into an unhandled exception.
 */
async function readProviderFailure(response) {
  try {
    const payload = await response.json();
    return payload && typeof payload === 'object' ? payload : {};
  } catch {
    return {};
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const declaredLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    logRejection('body_too_large');
    return jsonResponse(413, { ok: false, error: 'payload_too_large' });
  }

  let submission;
  try {
    submission = await readSubmission(request);
  } catch {
    // Malformed body — not something a real form produces.
    logRejection('malformed_body');
    return jsonResponse(400, { ok: false, error: 'invalid_request' });
  }

  // Honeypot: a hidden field only an automated filler completes. Answer with a
  // success the bot cannot distinguish from the real thing, and send nothing to
  // Brevo — a visible rejection just teaches the next attempt what to skip.
  //
  // Known trade-off: an over-eager password manager or autofill that populates
  // the hidden field turns a real visitor into a silent non-subscriber. The
  // field carries `autocomplete="off"` and `tabindex="-1"` in the markup to make
  // that unlikely, and the log line below is what would reveal it if it happens
  // at scale.
  if (readField(submission, '_gotcha')) {
    logRejection('honeypot');
    return successResponse();
  }

  const email = readField(submission, 'email').toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    logRejection('invalid_email');
    return jsonResponse(400, { ok: false, error: 'invalid_email' });
  }

  // Consent is re-checked server-side, not because the client checkbox is
  // unreliable UX but because the endpoint is public: a submission that reaches
  // Brevo without it would mean storing an address with no lawful basis
  // (ADR-0003, RGPD art. 7). The checkbox is a convenience; this is the control.
  if (readField(submission, 'newsletter_consent') !== 'accepted') {
    logRejection('consent_missing');
    return jsonResponse(400, { ok: false, error: 'consent_required' });
  }

  const lang = readField(submission, 'lang') === 'en' ? 'en' : 'fr';

  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) {
    // Fail closed and stay quiet about *why*: a missing secret is our problem,
    // not a hint to hand out. The visitor gets "retry later", we get the 503 in
    // the Pages logs.
    logRejection('missing_secret');
    return jsonResponse(503, { ok: false, error: 'unavailable' });
  }

  const timeout = AbortSignal.timeout(BREVO_TIMEOUT_MS);

  let brevoResponse;
  try {
    brevoResponse = await fetch(BREVO_DOI_ENDPOINT, {
      method: 'POST',
      signal: timeout,
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      // Only the address is forwarded. No free-text field from the form ever
      // reaches Brevo, so the form cannot be used to inject content into our
      // contact database (ADR-0030 D5).
      body: JSON.stringify({
        email,
        includeListIds: [BREVO_LIST_ID],
        templateId: BREVO_DOI_TEMPLATE_ID,
        redirectionUrl: REDIRECTION_URLS[lang]
      })
    });
  } catch {
    // Network failure or timeout. Report it honestly: a false success would
    // leave the visitor believing an e-mail is on its way (ADR-0030).
    logRejection('provider_unreachable');
    return jsonResponse(502, { ok: false, error: 'provider_unreachable' });
  }

  // 201 is the documented success. 204 is tolerated defensively — some Brevo
  // endpoints answer with an empty body and it would be absurd to fail a
  // subscription that actually went through.
  if (brevoResponse.status === 201 || brevoResponse.status === 204) {
    return successResponse();
  }

  // Brevo reports failures as `{ code, message }`. The code is what we branch
  // on, deliberately as a narrow allow-list: treating the whole 400 class as
  // "already subscribed" would swallow OUR OWN misconfiguration — a wrong
  // templateId or list id also answers 400 — and report "you're subscribed" to
  // a visitor who will never receive anything, with nothing surfacing anywhere.
  // An unrecognised code is therefore a real error, loudly.
  const failure = await readProviderFailure(brevoResponse);

  // Server-side only, never in the response body: this is the breadcrumb that
  // makes a broken template/list id visible in the Cloudflare Pages logs
  // instead of silent. The key is never part of `failure`.
  console.warn(
    `[subscribe] Brevo ${brevoResponse.status} code=${failure.code || 'unknown'} message=${failure.message || 'none'}`
  );

  if (brevoResponse.status === 400) {
    // The address is already in the double opt-in flow. Nothing is wrong from
    // the visitor's side, and distinguishing this case would leak list
    // membership, so it reads exactly like a fresh signup (ADR-0030 D5).
    if (failure.code === 'duplicate_parameter') {
      return successResponse();
    }

    // `invalid_parameter` is ambiguous: Brevo uses it both for an address it
    // rejects (the visitor's typo, which our regex is too permissive to catch)
    // and for a bad templateId or list id (our misconfiguration). The code
    // alone cannot separate them, so we look at the message — a heuristic, with
    // a deliberately safe default: anything we do not recognise as an address
    // problem falls through to the 502 below. Worst case for a visitor is one
    // "try again later" on an address Brevo dislikes; worst case the other way
    // round would be telling every visitor their address is invalid while the
    // real fault is ours.
    if (failure.code === 'invalid_parameter' && /e-?mail/i.test(failure.message || '')) {
      return jsonResponse(400, { ok: false, error: 'invalid_email' });
    }
  }

  return jsonResponse(502, { ok: false, error: 'provider_error' });
}

/**
 * Anything that is not a POST.
 *
 * Safe to export alongside `onRequestPost`: the Pages runtime gives a
 * verb-specific handler precedence over the `onRequest` catch-all, so a POST
 * never reaches this one. It exists so a GET gets an explicit 405 instead of a
 * default, and so crawlers do not treat the route as a page.
 */
export function onRequest() {
  return jsonResponse(405, { ok: false, error: 'method_not_allowed' });
}
