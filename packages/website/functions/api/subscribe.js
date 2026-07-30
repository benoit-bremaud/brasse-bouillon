// Cloudflare Pages Function — waitlist subscription relay (ADR-0030).
//
// Why a server-side relay exists at all: subscribing calls Brevo with an API
// key, and a key shipped to the browser is a published key. The browser
// therefore posts here, on the site's own origin (no CORS surface), and this
// handler is the only thing that ever sees `BREVO_API_KEY` — an encrypted Pages
// environment variable set by the project owner, never committed (ADR-0030 D4).
//
// Deployed by `.github/workflows/website-deploy.yml`, which stages this
// directory NEXT TO the uploaded assets — not inside them — because that is
// where wrangler looks for it (verified empirically; see the deploy step).
// Route: POST /api/subscribe.

/** Brevo list the confirmed contact joins — `Waitlist FR` (ADR-0030 D2). */
const BREVO_LIST_ID = 3;

/** Brevo double opt-in template that carries the confirmation link. */
const BREVO_DOI_TEMPLATE_ID = 1;

const BREVO_DOI_ENDPOINT = 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation';

/**
 * Turnstile's server-side validation endpoint. The widget's token proves a
 * browser solved the challenge; only this call proves the token is genuine,
 * unused, and issued for our own widget — the token alone is worthless.
 *
 * Why this exists on top of the Cloudflare rate-limiting rule: that rule is
 * per-IP with a 10-second block on the free plan, so it turns a burst into a
 * slow drip rather than stopping it. Plus-tag addressing (`victim+1@…`) defeats
 * Brevo's dedup, so a patient script could still mail-bomb a third party from
 * our authenticated domain and burn the daily quota. Turnstile is what actually
 * stops a script (ADR-0030 D9).
 */
const TURNSTILE_VERIFY_ENDPOINT =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Field name the Turnstile widget injects into the form (implicit rendering). */
const TURNSTILE_TOKEN_FIELD = 'cf-turnstile-response';

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

/** Same idea for the challenge check, but tighter: it runs before Brevo. */
const TURNSTILE_TIMEOUT_MS = 5000;

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

/** Thrown when the body exceeds MAX_BODY_BYTES; mapped to a 413. */
class BodyTooLarge extends Error {}

/**
 * Reads the body while counting bytes, and gives up past the cap.
 *
 * `Content-Length` is optional and client-controlled — a chunked or streamed
 * request simply omits it, and `Number(null)` is 0, which sails through any
 * header-based check. So the cap has to be enforced on what is actually read,
 * and the stream is cancelled the moment it is exceeded rather than after
 * buffering the whole thing.
 */
async function readBoundedBody(request, maxBytes) {
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new BodyTooLarge();
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/**
 * `site.js` posts a `FormData`, but accept JSON too so the endpoint stays
 * usable from a script or a test without pretending to be a browser form.
 *
 * The bounded bytes are re-wrapped in a `Response` purely to reuse the platform
 * parsers: multipart is not something to hand-roll, and this way the size cap
 * and the parsing stay independent of each other.
 */
async function readSubmission(request) {
  const contentType = request.headers.get('Content-Type') || '';
  const bytes = await readBoundedBody(request, MAX_BODY_BYTES);
  const parser = new Response(bytes, { headers: { 'Content-Type': contentType } });

  if (contentType.includes('application/json')) {
    const payload = await parser.json();
    return payload && typeof payload === 'object' ? payload : {};
  }

  const form = await parser.formData();
  return Object.fromEntries(form.entries());
}

const readField = (submission, name) =>
  typeof submission[name] === 'string' ? submission[name].trim() : '';

/**
 * Verifies the widget token with Cloudflare. Returns true only on an explicit
 * `success: true`.
 *
 * Fails CLOSED on every other outcome, including a network error or a timeout:
 * an anti-abuse check that lets requests through when it cannot reach its
 * verifier is decoration. The cost of that choice is that a Cloudflare outage
 * blocks signups — acceptable, because the visitor gets an honest error and can
 * retry, whereas the opposite default would silently reopen the mail-bomb.
 *
 * `remoteip` is deliberately NOT sent. It is optional, it would add nothing to
 * the decision here, and it would mean handing a visitor's IP to a second
 * endpoint for no gain (RGPD data minimisation).
 */
async function verifyTurnstile(token, secret) {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);

  try {
    const response = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS)
    });

    const payload = await response.json();
    if (payload && payload.success === true) {
      return true;
    }

    // The error codes are Cloudflare's own vocabulary (`invalid-input-response`,
    // `timeout-or-duplicate`, …) and contain nothing personal — safe and useful
    // to log, since a systematic failure here would otherwise look like visitors
    // simply not subscribing.
    const codes = Array.isArray(payload && payload['error-codes'])
      ? payload['error-codes'].join(',')
      : 'none';
    console.warn(`[subscribe] turnstile refused: ${codes}`);
    return false;
  } catch {
    console.warn('[subscribe] turnstile unreachable');
    return false;
  }
}

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

  // A declared length over the cap is refused without reading a single byte.
  // This is an optimisation, NOT the control: the header is optional and
  // client-controlled, so the real enforcement is the byte counter inside
  // `readBoundedBody`.
  const declaredLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    logRejection('body_too_large');
    return jsonResponse(413, { ok: false, error: 'payload_too_large' });
  }

  let submission;
  try {
    submission = await readSubmission(request);
  } catch (error) {
    if (error instanceof BodyTooLarge) {
      logRejection('body_too_large');
      return jsonResponse(413, { ok: false, error: 'payload_too_large' });
    }
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

  // Anti-abuse gate, placed AFTER the cheap local checks (no point spending a
  // subrequest on a submission we already know is invalid) and BEFORE anything
  // that sends mail. A missing secret fails closed for the same reason as the
  // Brevo one: a challenge that cannot be verified must not be waved through.
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (!turnstileSecret) {
    logRejection('missing_turnstile_secret');
    return jsonResponse(503, { ok: false, error: 'unavailable' });
  }

  const turnstileToken = readField(submission, TURNSTILE_TOKEN_FIELD);
  if (!turnstileToken) {
    logRejection('turnstile_token_missing');
    return jsonResponse(400, { ok: false, error: 'challenge_required' });
  }

  if (!(await verifyTurnstile(turnstileToken, turnstileSecret))) {
    return jsonResponse(400, { ok: false, error: 'challenge_failed' });
  }

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
