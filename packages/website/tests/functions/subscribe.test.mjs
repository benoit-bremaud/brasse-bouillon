// Tests for the waitlist relay (ADR-0030). Run: `npm run test:functions`
// from packages/website, or `node --test tests/functions/`.
//
// Node's built-in runner, no dependency added: this package deliberately ships
// no JS toolchain, and the handler needs none — it only uses web-platform APIs
// (Request/Response/fetch/FormData) that Node 20 provides natively, which is
// exactly what the Workers runtime exposes.

import { strict as assert } from 'node:assert';
import { afterEach, describe, it } from 'node:test';

import { onRequest, onRequestPost } from '../../functions/api/subscribe.js';

const API_KEY = 'test-key-never-real';

/** Captures what the handler sent to Brevo, and controls what it gets back. */
function stubFetch(reply) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init, body: init && init.body ? JSON.parse(init.body) : null });
    if (reply instanceof Error) throw reply;
    // 204/304 are null-body statuses: constructing a Response with a body
    // throws, so the stub must respect that rather than fake a body.
    const nullBody = reply.status === 204 || reply.status === 304;
    return new Response(nullBody ? null : (reply.body ?? '{}'), {
      status: reply.status
    });
  };
  return calls;
}

const formRequest = (fields) => {
  const form = new FormData();
  for (const [name, value] of Object.entries(fields)) form.append(name, value);
  return new Request('https://brasse-bouillon.com/api/subscribe', {
    method: 'POST',
    body: form
  });
};

const jsonRequest = (payload) =>
  new Request('https://brasse-bouillon.com/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

const validFields = {
  email: 'brasseur@example.com',
  newsletter_consent: 'accepted',
  lang: 'fr'
};

const call = (request, env = { BREVO_API_KEY: API_KEY }) =>
  onRequestPost({ request, env });

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('happy path', () => {
  it('subscribes a consenting visitor and reports success', async () => {
    const calls = stubFetch({ status: 201 });

    const response = await call(formRequest(validFields));

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      'https://api.brevo.com/v3/contacts/doubleOptinConfirmation'
    );
    assert.equal(calls[0].init.headers['api-key'], API_KEY);
    assert.deepEqual(calls[0].body, {
      email: 'brasseur@example.com',
      includeListIds: [3],
      templateId: 1,
      redirectionUrl: 'https://brasse-bouillon.com/merci'
    });
  });

  it('sends an English visitor to the English confirmation page', async () => {
    const calls = stubFetch({ status: 201 });

    await call(formRequest({ ...validFields, lang: 'en' }));

    assert.equal(
      calls[0].body.redirectionUrl,
      'https://brasse-bouillon.com/merci-en'
    );
  });

  it('accepts a JSON body as well as a form body', async () => {
    const calls = stubFetch({ status: 201 });

    const response = await call(jsonRequest(validFields));

    assert.equal(response.status, 200);
    assert.equal(calls.length, 1);
  });

  it('normalises the address so casing cannot create a duplicate contact', async () => {
    const calls = stubFetch({ status: 201 });

    await call(formRequest({ ...validFields, email: '  Brasseur@Example.COM  ' }));

    assert.equal(calls[0].body.email, 'brasseur@example.com');
  });

  it('treats an unknown lang value as French rather than failing', async () => {
    const calls = stubFetch({ status: 201 });

    await call(formRequest({ ...validFields, lang: 'de' }));

    assert.equal(calls[0].body.redirectionUrl, 'https://brasse-bouillon.com/merci');
  });
});

describe('input rejected before any provider call', () => {
  it('refuses a submission without the consent checkbox', async () => {
    const calls = stubFetch({ status: 201 });

    const response = await call(
      formRequest({ email: 'brasseur@example.com', lang: 'fr' })
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      ok: false,
      error: 'consent_required'
    });
    // The point of the check: no address reaches Brevo without a lawful basis.
    assert.equal(calls.length, 0);
  });

  it('refuses a consent value it did not expect', async () => {
    const calls = stubFetch({ status: 201 });

    const response = await call(
      formRequest({ ...validFields, newsletter_consent: 'on' })
    );

    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  });

  for (const [label, email] of [
    ['an empty address', ''],
    ['a missing TLD', 'brasseur@example'],
    ['a trailing dot', 'brasseur@example.'],
    ['an embedded space', 'bras seur@example.com'],
    ['a double at-sign', 'brasseur@@example.com'],
    ['a missing local part', '@example.com'],
    ['an over-long address', `${'a'.repeat(250)}@example.com`]
  ]) {
    it(`refuses ${label}`, async () => {
      const calls = stubFetch({ status: 201 });

      const response = await call(formRequest({ ...validFields, email }));

      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { ok: false, error: 'invalid_email' });
      assert.equal(calls.length, 0);
    });
  }

  it('drops a honeypot submission silently, telling the bot nothing', async () => {
    const calls = stubFetch({ status: 201 });

    const response = await call(formRequest({ ...validFields, _gotcha: 'spam' }));

    // Indistinguishable from a real success on purpose.
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(calls.length, 0);
  });

  it('rejects a malformed JSON body without throwing', async () => {
    stubFetch({ status: 201 });

    const response = await call(
      new Request('https://brasse-bouillon.com/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ not json'
      })
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { ok: false, error: 'invalid_request' });
  });

  it('forwards no field other than the address', async () => {
    const calls = stubFetch({ status: 201 });

    await call(
      formRequest({
        ...validFields,
        message: 'injected content',
        _subject: 'injected subject',
        source: 'newsletter'
      })
    );

    assert.deepEqual(Object.keys(calls[0].body).sort(), [
      'email',
      'includeListIds',
      'redirectionUrl',
      'templateId'
    ]);
  });
});

describe('guards whose failure would be a real bypass', () => {
  // The whole fail-closed property of readField: a non-string value must never
  // slip past the string checks. A File entry is the way to attempt that.
  it('fails closed when a field is a File instead of a string', async () => {
    const calls = stubFetch({ status: 201 });
    const form = new FormData();
    form.append('email', new Blob(['brasseur@example.com']), 'email.txt');
    form.append('newsletter_consent', 'accepted');

    const response = await call(
      new Request('https://brasse-bouillon.com/api/subscribe', {
        method: 'POST',
        body: form
      })
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { ok: false, error: 'invalid_email' });
    assert.equal(calls.length, 0);
  });

  for (const variant of ['Accepted', 'ACCEPTED', 'true', 'on', '1', ' accepted ']) {
    it(`refuses consent spelled ${JSON.stringify(variant)}`, async () => {
      const calls = stubFetch({ status: 201 });

      const response = await call(
        formRequest({ ...validFields, newsletter_consent: variant })
      );

      // ' accepted ' is the one that must PASS: readField trims. Everything
      // else is a strict-allowlist rejection, pinned here because RGPD consent
      // is not a place for lenient parsing.
      if (variant === ' accepted ') {
        assert.equal(response.status, 200);
        assert.equal(calls.length, 1);
      } else {
        assert.equal(response.status, 400);
        assert.equal(calls.length, 0);
      }
    });
  }

  it('treats an empty honeypot as a normal submission', async () => {
    const calls = stubFetch({ status: 201 });

    // The common case: browsers submit hidden inputs as empty strings.
    const response = await call(formRequest({ ...validFields, _gotcha: '' }));

    assert.equal(response.status, 200);
    assert.equal(calls.length, 1);
  });

  it('rejects an oversized body before parsing it', async () => {
    const calls = stubFetch({ status: 201 });

    const response = await call(
      new Request('https://brasse-bouillon.com/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': '999999' },
        body: JSON.stringify(validFields)
      })
    );

    assert.equal(response.status, 413);
    assert.deepEqual(await response.json(), {
      ok: false,
      error: 'payload_too_large'
    });
    assert.equal(calls.length, 0);
  });

  for (const [label, body] of [
    ['null', 'null'],
    ['a bare string', '"brasseur@example.com"'],
    ['an array', '["brasseur@example.com"]']
  ]) {
    it(`rejects a JSON body that is ${label}`, async () => {
      const calls = stubFetch({ status: 201 });

      const response = await call(
        new Request('https://brasse-bouillon.com/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        })
      );

      assert.equal(response.status, 400);
      assert.equal(calls.length, 0);
    });
  }

  it('ignores a prototype-polluting payload rather than trusting it', async () => {
    const calls = stubFetch({ status: 201 });

    const response = await call(
      new Request('https://brasse-bouillon.com/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"__proto__":{"email":"attacker@example.com","newsletter_consent":"accepted"}}'
      })
    );

    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  });

  it('keeps the last value when a field is sent twice', async () => {
    const calls = stubFetch({ status: 201 });
    const form = new FormData();
    form.append('email', 'first@example.com');
    form.append('email', 'second@example.com');
    form.append('newsletter_consent', 'accepted');

    await call(
      new Request('https://brasse-bouillon.com/api/subscribe', {
        method: 'POST',
        body: form
      })
    );

    // Documents the FormData semantics we rely on; a refactor to getAll()
    // would change this and should have to say so.
    assert.equal(calls[0].body.email, 'second@example.com');
  });
});

describe('provider and configuration failures', () => {
  it('accepts an empty 204 as success, as the defensive branch claims', async () => {
    stubFetch({ status: 204 });

    const response = await call(formRequest(validFields));

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });

  it('fails closed when the secret is missing, without saying why', async () => {
    const calls = stubFetch({ status: 201 });

    const response = await call(formRequest(validFields), {});
    const payload = await response.json();

    assert.equal(response.status, 503);
    assert.deepEqual(payload, { ok: false, error: 'unavailable' });
    assert.equal(calls.length, 0);
  });

  it('reports success for an address already in the flow (no enumeration oracle)', async () => {
    stubFetch({ status: 400, body: '{"code":"duplicate_parameter"}' });

    const response = await call(formRequest(validFields));

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });

  // The regression this suite exists for: a wrong templateId or list id also
  // answers 400, and reporting THAT as a success would hide our own
  // misconfiguration behind a cheerful message forever.
  it('does not mistake a configuration error for an existing subscriber', async () => {
    stubFetch({
      status: 400,
      body: '{"code":"invalid_parameter","message":"templateId not found"}'
    });

    const response = await call(formRequest(validFields));

    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { ok: false, error: 'provider_error' });
  });

  it('surfaces an address Brevo itself rejects as a fixable input error', async () => {
    stubFetch({
      status: 400,
      body: '{"code":"invalid_parameter","message":"Invalid email address"}'
    });

    const response = await call(formRequest(validFields));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { ok: false, error: 'invalid_email' });
  });

  it('treats an unrecognised 400 code as a real error, not a success', async () => {
    stubFetch({ status: 400, body: '{"code":"some_future_code","message":"?"}' });

    const response = await call(formRequest(validFields));

    assert.equal(response.status, 502);
  });

  it('survives a 400 with an unparseable body', async () => {
    stubFetch({ status: 400, body: 'not json at all' });

    const response = await call(formRequest(validFields));

    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { ok: false, error: 'provider_error' });
  });

  it('reports an honest error when the provider fails', async () => {
    stubFetch({ status: 500 });

    const response = await call(formRequest(validFields));

    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { ok: false, error: 'provider_error' });
  });

  it('reports an honest error when the provider is unreachable', async () => {
    stubFetch(new Error('network down'));

    const response = await call(formRequest(validFields));

    // Never a false success: the visitor must know no e-mail is coming.
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), {
      ok: false,
      error: 'provider_unreachable'
    });
  });

  it('never leaks the API key or provider detail in a response body', async () => {
    stubFetch({ status: 500, body: `{"message":"invalid key ${API_KEY}"}` });

    const response = await call(formRequest(validFields));
    const body = await response.text();

    assert.ok(!body.includes(API_KEY), 'the API key must never be echoed');
    assert.ok(!body.includes('invalid key'), 'provider wording must not be proxied');
  });
});

describe('non-POST methods', () => {
  it('answers 405 without touching the provider', async () => {
    const calls = stubFetch({ status: 201 });

    const response = await onRequest();

    assert.equal(response.status, 405);
    assert.deepEqual(await response.json(), {
      ok: false,
      error: 'method_not_allowed'
    });
    assert.equal(calls.length, 0);
  });
});

describe('response hygiene', () => {
  it('marks every answer no-store so no cache keeps a subscription outcome', async () => {
    stubFetch({ status: 201 });

    const response = await call(formRequest(validFields));

    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.match(response.headers.get('Content-Type'), /application\/json/);
  });
});
