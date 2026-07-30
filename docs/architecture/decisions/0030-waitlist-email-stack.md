# ADR-0030 — Waitlist Email Stack: Brevo Double Opt-In, Relayed by a Cloudflare Pages Function

**Status**  Accepted
**Date**    2026-07-29
**Owners**  @benoit-bremaud
**Related** ADR-0014 (Cloudflare Pages hosting), ADR-0027 (website i18n), ADR-0003 (consent as a single source of truth), ADR-0028 (zero-footprint privacy posture)

---

## Context

The beta waitlist is the marketing site's primary conversion. Until this ADR the
flow was: the visitor submits `newsletterForm*`, `site.js` posts the form to
**Formspree** (`https://formspree.io/f/mqaqqvab`), Formspree forwards it to a
mailbox. Three consequences of that design:

1. **No confirmation e-mail and no proof of consent.** Nothing verified that the
   address belonged to the person typing it, and nothing recorded *when* and
   *how* consent was given — the evidence RGPD Article 7(1) requires the
   controller to be able to produce.
2. **No usable list.** Addresses accumulated in an inbox, not in a system able
   to send the beta-opening announcement the form promises.
3. **The success message over-promised.** It claimed the subscription was
   "confirmée" when nothing had been confirmed. Corrected in #1550, but the
   underlying gap remained.

A Brevo account has since been configured and verified independently of this
diff: the domain is authenticated (DKIM + DMARC), the sender is
`Brasse-Bouillon <contact@brasse-bouillon.com>`, a double opt-in template
(id 1) and a welcome template (id 6) exist, and the `Waitlist FR` list is id 3.
Nothing reaches any of it, because the site still posts to Formspree. This ADR
closes that gap.

Constraints that shaped the decision:

- **Sovereignty-first house rule.** French/EU vendors preferred; US vendors only
  when no viable EU alternative exists.
- **The API key is a secret.** It must never appear in client-side JavaScript,
  in Git, or in a chat transcript. A browser-side call to Brevo is therefore
  impossible — a relay is structurally required, not a convenience.
- **Zero-footprint privacy posture** (ADR-0028): no third-party script, no
  cookie, and `privacy(-en).html` enumerates *every* subprocessor.
- **The site is a build-less static deploy** (ADR-0014) published by
  `website-deploy.yml`; the CI quality gate enforces structural invariants.
- **Bilingual FR+EN** (ADR-0027): a new visitor-facing page needs its twin.

---

## Decision

### D1 — Brevo is the e-mail service provider

Brevo (ex-Sendinblue) is French, hosts EU-side, and offers double opt-in, list
management and automation on its free tier. It satisfies the sovereignty rule
without trade-off, so no comparison against Mailchimp/ConvertKit was run: the
house rule decides, and the incumbent alternative (Formspree, US) is precisely
what is being retired for the waitlist.

Formspree is **not** removed from the package: the questionnaire form still uses
it (`QUESTIONNAIRE_ENDPOINT`). Only the waitlist migrates. `privacy(-en).html`
must therefore list **both** Brevo and Formspree, not swap one for the other.

### D2 — Subscription is double opt-in, always

The endpoint calls `POST /v3/contacts/doubleOptinConfirmation`. The contact is
added to list 3 **only after** clicking the link in the confirmation e-mail.

This is the load-bearing decision, and it is deliberately the less convenient
one: single opt-in would convert better. Double opt-in buys (a) proof of
consent, dated and attributable, (b) protection against a third party
subscribing someone else's address, and (c) list hygiene — a typo never becomes
a permanent bounce. For a pre-launch list whose whole purpose is one
announcement months from now, deliverability at that moment matters more than
signup-funnel friction today.

### D3 — The relay is a Cloudflare Pages Function, not a standalone Worker

`functions/api/subscribe.js` inside `packages/website`, served at
`/api/subscribe` on the site's own origin, deployed by the existing
`website-deploy.yml` run.

Weighted matrix (weights reflect *today's* single-consumer reality):

| Criterion | Weight | Pages Function | Standalone Worker |
|---|---|---|---|
| Operational surface (pipelines, projects to watch) | 30% | 5 — none added | 2 — second project, second deploy |
| Failure modes | 25% | 5 — same origin, no CORS | 3 — CORS misconfiguration breaks the form opaquely |
| Time to ship | 15% | 5 — one file | 3 — project + DNS + CORS |
| Secret handling | 10% | 5 — one Pages secret | 5 — equivalent |
| Reuse by other clients | 15% | 2 — site-scoped | 5 — callable from anywhere |
| Independence from a site rebuild | 5% | 2 | 5 |
| **Weighted total** | | **4.45** | **3.20** |

The Worker's only real advantage is reuse, and that need is hypothetical: the
mobile app has its own NestJS backend (ADR-0002), so the day the product needs
Brevo it will call it from there, not from a website Worker. Paying two
pipelines today for that is the case YAGNI describes. Extraction later is cheap
— the handler is provider-agnostic request/response logic; only the deployment
target changes.

### D4 — The API key lives only in Cloudflare's secret store

`BREVO_API_KEY` is set as an encrypted Pages environment variable, by the
project owner, via the Cloudflare dashboard or
`wrangler pages secret put`. It is never committed, never printed in logs, never
echoed in an error response. The handler reads it from `env` and fails closed
(503, generic message) when it is absent, so a missing secret degrades to "try
again later" rather than leaking configuration state.

### D5 — Server-side validation is mandatory and minimal

The handler accepts POST only, rejects anything but an e-mail-shaped string,
caps the length, and sends **only** the address to Brevo — no free-text field is
forwarded. Client-side `type="email"` validation is a convenience for the user,
never a control: the endpoint is public and must assume hostile input.

Brevo's own response is not proxied back verbatim; the client receives a
neutral JSON status. Rationale: a provider error message can disclose account
internals (list ids, plan limits, whether an address already exists) — the last
one being an enumeration oracle. The visitor sees the same success wording
whether the address is new or already subscribed.

### D6 — The confirmation redirect page is `noindex` and out of the sitemap

`redirectionUrl` is a required parameter of the Brevo DOI endpoint, so a landing
page must exist: `merci.html` with its `merci-en.html` twin. It carries
`<meta name="robots" content="noindex">` and stays out of `sitemap.xml`: it is a
transactional dead-end with no search intent, and indexing it would put a page
saying "your address is confirmed" in front of people who confirmed nothing.

### D7 — The privacy policy names Brevo before the endpoint ships

Brevo processes personal data (e-mail addresses) on our behalf, so it is a
subprocessor and must be enumerated in `privacy(-en).html` with its purpose and
the transfer basis — in the **same PR** that activates the endpoint, in both
locales. This is not documentation housekeeping: shipping the endpoint without
it would put the site in breach of its own published policy.

### D8 — The welcome automation is activated only once the trigger can fire

The Brevo automation that sends the welcome e-mail stays **Inactive** until this
endpoint is live, because until then nothing enters list 3 and activation could
not be verified. Activating it is the last step of the rollout, followed by one
real end-to-end subscription test.

---

## Consequences

**Gained**

- Every subscriber is verified, and consent is dated and provable.
- The waitlist becomes an addressable list, so the promise the form makes
  ("on te préviendra") becomes keepable.
- One less US subprocessor on the site's primary conversion path.
- No new pipeline, no new domain, no CORS surface.

**Accepted costs**

- The endpoint is coupled to the site's deploy: publishing a fix to it requires
  a site deployment. Acceptable — they change together anyway.
- Brevo becomes a hard dependency of the signup path. If Brevo is down the form
  fails; the handler must therefore return an honest error rather than a false
  success, so the visitor knows to retry.
- The welcome e-mail exists twice (`docs/email/welcome-fr.html` and the
  automation's drag-and-drop design), because Brevo's automation editor cannot
  consume raw HTML. Known duplication, documented in `docs/email/README.md`;
  moving the send to the API from this same handler would remove it, and is the
  natural follow-up if the duplication ever bites.

**Rollback**

Point `NEWSLETTER_ENDPOINT` back at the Formspree URL and redeploy. The
Formspree form remains live and untouched, so rollback is one constant and
loses nothing but the confirmation step.

---

## Alternatives rejected

- **Browser calls Brevo directly.** Requires shipping the API key to every
  visitor. Not an option at any price.
- **Keep Formspree and forward manually.** Retains the consent-proof gap and
  makes the beta announcement a manual copy-paste job.
- **NestJS API endpoint** (`packages/api`). Architecturally defensible — one
  backend for everything — but the marketing site would then depend on the
  product API's availability and deploy cadence for a pre-launch signup form,
  and the API is not currently exposed to the public internet for the website's
  benefit. Reconsider if the site ever needs authenticated product data.
- **Single opt-in with a welcome e-mail only.** Better conversion, but no proof
  of consent and no protection against third-party subscription. Rejected on
  D2's reasoning.
