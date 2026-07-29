# Email templates — source of truth

Brevo is the **runtime** for every automated email (double opt-in, welcome).
The files here are the **source of truth for their design and copy**: a Brevo
template lives only inside the account, so without this directory a lost or
suspended account would take the templates with it.

## Files

| File | Brevo template | Status |
|---|---|---|
| `welcome-fr.html` | `Bienvenue - Waitlist FR` (id 6) | Active — sent by automation `Welcome message` (id 1) on contact added to list `Waitlist FR` (id 3) |

The double opt-in confirmation (`DOI - Confirmation Waitlist FR`, id 1) is not
yet mirrored here; it still exists only in Brevo.

## Editing procedure

These files are **not built or deployed** by any workflow — nothing reads them
automatically. Brevo is updated by hand, so the two can drift. Keep them in
step:

1. Edit the file here first, in the same PR as any copy or design change.
2. In Brevo: *Templates* → open the template → **Edit** (raw HTML editor) →
   replace the whole document → *Save*.
3. Send a test to yourself (*Preview & test* → *Send test email*) before
   trusting it — the Brevo preview is not a real mail client.

## Constraints that shaped these templates

- **Sender** is `contact@brasse-bouillon.com` (domain authenticated, DKIM +
  DMARC). Never send from the Gmail address: Google's DMARC policy makes Brevo
  rewrite the visible sender to `@brevosend.com`.
- **Reply-To** is the Gmail address as long as no MX record exists on
  `brasse-bouillon.com` — otherwise replies from subscribers bounce.
- Assets must be **absolute URLs on the public site** (`logo-mascot.png`);
  an email has no document base for relative paths.
- **PNG, never WebP or SVG** for images: Outlook for Windows renders through
  Word and decodes neither.
- Inline `style` attributes and table layout are mandatory — mail clients strip
  stylesheets. This is why the `packages/website` ban on inline styles does not
  apply to this directory.
- Marketing emails must carry an unsubscribe link (`{{ unsubscribe }}`, a Brevo
  tag resolved per contact at send time). Transactional confirmations do not.
