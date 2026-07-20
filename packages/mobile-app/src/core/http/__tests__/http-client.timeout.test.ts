/**
 * Per-request timeout in `request()`.
 *
 * `fetch` has no built-in timeout: before this, a hung connection left the
 * caller awaiting forever and the UI stuck on a spinner. The API's Fly.io
 * machine scales to zero and answers the first request in ~9-10s, so the
 * budget must be generous enough not to abort a legitimate cold start.
 */
import { authSession } from "@/core/auth/session";
import { request } from "@/core/http/http-client";
import { HttpTimeoutError } from "@/core/http/http-error";

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

/**
 * Stands in for a real hung connection: resolves only if the signal handed to
 * `fetch` is aborted, mirroring what the platform does on abort.
 */
function buildNeverResolvingFetch() {
  return (_url: string, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        const abortError = new Error("Aborted");
        abortError.name = "AbortError";
        reject(abortError);
      });
    });
}

describe("http-client / request — timeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock.mockReset();
    mockGetAccessToken.mockReset();
    mockGetAccessToken.mockReturnValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sad: a request that never settles rejects with HttpTimeoutError once the budget elapses", async () => {
    fetchMock.mockImplementation(
      buildNeverResolvingFetch() as unknown as typeof fetch,
    );

    const pending = request("/slow");
    const assertion = expect(pending).rejects.toBeInstanceOf(HttpTimeoutError);

    await jest.advanceTimersByTimeAsync(20_000);

    await assertion;
  });

  it("sad: a response whose body stalls after the headers still hits the timeout", async () => {
    // `fetch` resolves as soon as the headers arrive, so a server that then
    // stalls mid-body would escape a ceiling that stopped at the fetch call.
    fetchMock.mockImplementation(((_url: string, init?: RequestInit) =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        text: () =>
          new Promise<string>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              const abortError = new Error("Aborted");
              abortError.name = "AbortError";
              reject(abortError);
            });
          }),
      } as unknown as Response)) as unknown as typeof fetch);

    const pending = request("/stalled-body");
    const assertion = expect(pending).rejects.toBeInstanceOf(HttpTimeoutError);

    await jest.advanceTimersByTimeAsync(20_000);

    await assertion;
  });

  it("sad: the timeout error carries the budget it exceeded", async () => {
    fetchMock.mockImplementation(
      buildNeverResolvingFetch() as unknown as typeof fetch,
    );

    const pending = request("/slow", { timeoutMs: 5_000 });
    const assertion = expect(pending).rejects.toMatchObject({
      name: "HttpTimeoutError",
      timeoutMs: 5_000,
    });

    await jest.advanceTimersByTimeAsync(5_000);

    await assertion;
  });

  it("happy: a response that arrives within the budget resolves normally", async () => {
    fetchMock.mockResolvedValueOnce(buildOkResponse());

    await expect(request<{ x: number }>("/fast")).resolves.toEqual({ x: 1 });
  });

  it("edge: a cold start slower than 10s but inside the budget is not aborted", async () => {
    fetchMock.mockImplementation(
      ((_url: string, init?: RequestInit) =>
        new Promise<Response>((resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("aborted too early")),
          );
          setTimeout(() => resolve(buildOkResponse()), 10_000);
        })) as unknown as typeof fetch,
    );

    const pending = request<{ x: number }>("/cold-start");
    await jest.advanceTimersByTimeAsync(10_000);

    await expect(pending).resolves.toEqual({ x: 1 });
  });

  it("edge: a caller-driven abort surfaces as the original error, not a timeout", async () => {
    fetchMock.mockImplementation(
      buildNeverResolvingFetch() as unknown as typeof fetch,
    );
    const controller = new AbortController();

    const pending = request("/cancelled", { signal: controller.signal });
    const assertion =
      expect(pending).rejects.not.toBeInstanceOf(HttpTimeoutError);

    controller.abort();

    await assertion;
  });

  it("edge: a non-abort failure landing as the timer fires keeps its real cause", async () => {
    // Guards the timeout classification: our timer firing is not on its own
    // proof that the rejection came from it. A transport failure surfacing in
    // the same tick must not be relabelled a timeout, or its cause is lost.
    fetchMock.mockImplementation(
      ((_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new TypeError("Network request failed"));
          });
        })) as unknown as typeof fetch,
    );

    const pending = request("/transport-failure");
    const assertion = expect(pending).rejects.toThrow("Network request failed");

    await jest.advanceTimersByTimeAsync(20_000);

    await assertion;
  });

  it("edge: the timeout timer is cleared once the response lands, leaving nothing pending", async () => {
    fetchMock.mockResolvedValueOnce(buildOkResponse());

    await request("/fast");

    expect(jest.getTimerCount()).toBe(0);
  });
});
