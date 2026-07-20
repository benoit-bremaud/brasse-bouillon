/**
 * Caller-driven cancellation through `request()` (beer-catalog foundation):
 * aborting the caller's signal must cancel the in-flight network request, so
 * TanStack Query can drop superseded queries.
 *
 * These assertions target the *behaviour* (the caller can cancel), not the
 * plumbing. `request()` no longer hands the caller's signal straight to
 * `fetch` — it owns an internal controller so the timeout can abort too, and
 * chains the caller's signal onto it. Asserting object identity here would
 * lock in a mechanism the timeout work legitimately replaced.
 */
import { authSession } from "@/core/auth/session";
import { request } from "@/core/http/http-client";

jest.mock("@/core/auth/session", () => ({
  authSession: {
    getAccessToken: jest.fn(),
    notifyUnauthorized: jest.fn(),
  },
}));

jest.mock("@/core/config/env", () => ({
  env: {
    apiUrl: "http://default-api.test:3000",
    encyclopediaUrl: "http://default-encyclopedia.test:8000",
    encyclopediaUrlIsConfigured: true,
    useDemoData: false,
  },
}));

const mockGetAccessToken = authSession.getAccessToken as jest.MockedFunction<
  typeof authSession.getAccessToken
>;

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

beforeAll(() => {
  global.fetch = fetchMock as unknown as typeof fetch;
});

function buildOkResponse(): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve('{"x":1}'),
  } as unknown as Response;
}

/** The signal `request()` actually handed to `fetch` on its first call. */
function signalGivenToFetch(): AbortSignal {
  const init = fetchMock.mock.calls[0][1] as RequestInit;
  return init.signal as AbortSignal;
}

describe("http-client / request — caller cancellation", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockGetAccessToken.mockReset();
    mockGetAccessToken.mockReturnValue(null);
  });

  it("happy: aborting the caller's signal cancels the request while it is in flight", async () => {
    // Must be asserted mid-flight: `request()` detaches its abort listener once
    // the call settles (otherwise it would leak listeners on a caller signal
    // that outlives the request), so cancelling a finished request is a no-op.
    let forwarded: AbortSignal | undefined;
    fetchMock.mockImplementation(((_url: string, init?: RequestInit) => {
      forwarded = init?.signal as AbortSignal;
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const abortError = new Error("Aborted");
          abortError.name = "AbortError";
          reject(abortError);
        });
      });
    }) as unknown as typeof fetch);

    const controller = new AbortController();
    const pending = request("/p", { signal: controller.signal });
    const assertion = expect(pending).rejects.toThrow();

    expect(forwarded).toBeDefined();
    expect(forwarded?.aborted).toBe(false);

    controller.abort();
    expect(forwarded?.aborted).toBe(true);

    await assertion;
  });

  it("sad: without a caller signal, fetch still gets a live (non-aborted) signal for the timeout", async () => {
    fetchMock.mockResolvedValueOnce(buildOkResponse());

    await request("/p");

    const forwarded = signalGivenToFetch();
    expect(forwarded).toBeDefined();
    expect(forwarded.aborted).toBe(false);
  });

  it("edge: a caller signal that is already aborted cancels the request immediately", async () => {
    fetchMock.mockResolvedValueOnce(buildOkResponse());
    const controller = new AbortController();
    controller.abort();

    await request("/p", { signal: controller.signal });

    expect(signalGivenToFetch().aborted).toBe(true);
  });

  it("edge: cancellation support does not disturb pre-existing behavior — auth:false still adds no Authorization header", async () => {
    mockGetAccessToken.mockReturnValue("the-jwt");
    fetchMock.mockResolvedValueOnce(buildOkResponse());
    const controller = new AbortController();

    const result = await request<{ x: number }>("/beers", {
      auth: false,
      signal: controller.signal,
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
    // Payload parsing untouched.
    expect(result).toEqual({ x: 1 });
  });
});
